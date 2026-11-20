import { pool } from '../config/db';
import type { PoolClient } from 'pg';

export type ResultatTx = { ok: true } | { ok: false; status: number; message: string };

export type LigneConfirmee = { idLigneCommande: string; quantiteConfirmee: number };

// Liste des commandes avec le nom de la coopérative et l'e-mail du responsable
const SELECT_LISTE = `
  SELECT co."idCommande",
         co."dateCommande"::text AS "dateCommande",
         co."dateAcceptation"::text AS "dateAcceptation",
         co."dateLivraison"::text AS "dateLivraison",
         co."statutCommande",
         co."statutPaiement",
         co."idCoop",
         c."nomCoop",
         co."idUser",
         u.email AS "emailResponsable",
         (SELECT COUNT(*)::int
            FROM ligne_commande lc
           WHERE lc."idCommande" = co."idCommande") AS "nbLignes",
         (SELECT COALESCE(SUM(lc."quantiteDemandee"), 0)::float8
            FROM ligne_commande lc
           WHERE lc."idCommande" = co."idCommande") AS "quantiteTotale"
    FROM commande co
    JOIN cooperative c ON c."idCoop" = co."idCoop"
    JOIN utilisateur u ON u."idUser" = co."idUser"
`;

export async function listerCommandes(filtres: {
  idCoop?: string;
  idUser?: string;
}): Promise<unknown[]> {
  const r = await pool.query(
    `${SELECT_LISTE}
      WHERE ($1::text IS NULL OR co."idCoop" = $1)
        AND ($2::text IS NULL OR co."idUser" = $2)
      ORDER BY co."dateCommande" DESC, co."idCommande" DESC`,
    [filtres.idCoop ?? null, filtres.idUser ?? null]
  );
  return r.rows;
}

export async function trouverCommande(idCommande: string): Promise<unknown | null> {
  const r = await pool.query(`${SELECT_LISTE} WHERE co."idCommande" = $1`, [idCommande]);
  return r.rows[0] ?? null;
}

// Lignes d'une commande, avec le produit et le membre producteur
export async function lignesCommande(idCommande: string): Promise<unknown[]> {
  const r = await pool.query(
    `SELECT lc."idLigneCommande",
            p."nomProduit",
            m."nomMembre",
            m."prenomMembre",
            m."districtMembre",
            m."communeMembre",
            m."fokotanyMembre",
            r."dateRecolte"::text AS "dateRecolte",
            lc."quantiteDemandee"::float8 AS "quantiteDemandee",
            lc."quantiteConfirmee"::float8 AS "quantiteConfirmee",
            r."quantiteRestante"::float8 AS "quantiteRestanteRecolte"
       FROM ligne_commande lc
       JOIN recolte r ON r."idRecolte" = lc."idRecolte"
       JOIN produit p ON p."idProduit" = r."idProduit"
       JOIN membre m ON m."idMembre" = r."idMembre"
      WHERE lc."idCommande" = $1
      ORDER BY p."nomProduit", m."nomMembre"`,
    [idCommande]
  );
  return r.rows;
}

// Crée l'en-tête et les lignes dans une seule transaction.
// Les quantités ne sont pas déduites ici : la commande reste "En attente".
export async function creerCommandeAvecLignes(params: {
  idCoop: string;
  idUser: string;
  lignes: { idRecolte: string; quantiteDemandee: number }[];
}): Promise<string> {
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');

    const entete = await client.query(
      `INSERT INTO commande ("idCoop", "idUser", "statutCommande", "statutPaiement")
       VALUES ($1, $2, 'EN_ATTENTE', 'NON_PAYE')
       RETURNING "idCommande"`,
      [params.idCoop, params.idUser]
    );
    const idCommande: string = entete.rows[0].idCommande;

    for (const l of params.lignes) {
      await client.query(
        `INSERT INTO ligne_commande ("idCommande", "idRecolte", "quantiteDemandee")
         VALUES ($1, $2, $3::numeric)`,
        [idCommande, l.idRecolte, l.quantiteDemandee]
      );
    }

    await client.query('COMMIT');
    return idCommande;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Quantité disponible sur chaque récolte demandée, avec la coopérative et le produit
export async function quantitesRestantes(
  idRecoltes: string[]
): Promise<Map<string, { restante: number; idCoop: string; nomProduit: string }>> {
  const r = await pool.query(
    `SELECT r."idRecolte",
            r."quantiteRestante"::float8 AS "quantiteRestante",
            m."idCoop",
            p."nomProduit"
       FROM recolte r
       JOIN membre m ON m."idMembre" = r."idMembre"
       JOIN produit p ON p."idProduit" = r."idProduit"
      WHERE r."idRecolte" = ANY($1::text[])`,
    [idRecoltes]
  );

  const carte = new Map<string, { restante: number; idCoop: string; nomProduit: string }>();
  for (const row of r.rows) {
    carte.set(row.idRecolte, {
      restante: row.quantiteRestante,
      idCoop: row.idCoop,
      nomProduit: row.nomProduit,
    });
  }
  return carte;
}

// Utilisateur lu dans la base (le rôle et la coopérative ne viennent pas du client)
export async function trouverUtilisateur(
  idUser: string
): Promise<{ idUser: string; role: string; idCoop: string | null; actifUtilisateur: string } | null> {
  const r = await pool.query(
    `SELECT "idUser", role, "idCoop", "actifUtilisateur" FROM utilisateur WHERE "idUser" = $1`,
    [idUser]
  );
  return r.rows[0] ?? null;
}

// ACCEPTATION : une seule transaction.
// 1. verrouille la commande et vérifie qu'elle est "En attente" et à la bonne coopérative
// 2. vérifie chaque quantité confirmée, et verrouille les récoltes
// 3. déduit les quantités des récoltes et enregistre la quantité confirmée
// 4. ajoute les quantités au stock SOAM (une ligne par produit)
// 5. passe la commande à "En cours de livraison"
// Si une étape échoue, tout est annulé.
export async function accepterCommandeTx(
  idCommande: string,
  idCoop: string,
  lignes: LigneConfirmee[]
): Promise<ResultatTx> {
  const client = await pool.connect();

  const annuler = async (resultat: ResultatTx): Promise<ResultatTx> => {
    await client.query('ROLLBACK');
    return resultat;
  };

  try {
    await client.query('BEGIN');

    // verrou sur la commande : deux traitements simultanés ne passent pas tous les deux
    const cmd = await client.query(
      `SELECT "statutCommande" FROM commande
        WHERE "idCommande" = $1 AND "idCoop" = $2
        FOR UPDATE`,
      [idCommande, idCoop]
    );
    if (!cmd.rows[0]) return annuler({ ok: false, status: 404, message: 'Commande introuvable' });
    if (cmd.rows[0].statutCommande !== 'EN_ATTENTE') {
      return annuler({ ok: false, status: 409, message: 'Cette commande a déjà été traitée' });
    }

    const existantes = await client.query(
      `SELECT lc."idLigneCommande",
              lc."idRecolte",
              lc."quantiteDemandee"::float8 AS "quantiteDemandee",
              r."idProduit",
              r."quantiteRestante"::float8 AS "quantiteRestante",
              p."nomProduit"
         FROM ligne_commande lc
         JOIN recolte r ON r."idRecolte" = lc."idRecolte"
         JOIN produit p ON p."idProduit" = r."idProduit"
        WHERE lc."idCommande" = $1
        FOR UPDATE OF r`,
      [idCommande]
    );

    const parLigne = new Map(lignes.map((l) => [l.idLigneCommande, l.quantiteConfirmee]));
    if (parLigne.size !== existantes.rows.length) {
      return annuler({ ok: false, status: 400, message: 'Toutes les lignes doivent être confirmées' });
    }

    // Contrôle complet avant toute écriture
    const parProduit = new Map<string, number>();
    for (const l of existantes.rows) {
      const q = parLigne.get(l.idLigneCommande);
      if (q === undefined) {
        return annuler({ ok: false, status: 400, message: 'Toutes les lignes doivent être confirmées' });
      }
      if (!(q > 0) || q > l.quantiteDemandee) {
        return annuler({
          ok: false,
          status: 400,
          message: `Quantité confirmée invalide pour ${l.nomProduit}`,
        });
      }
      if (q > l.quantiteRestante) {
        return annuler({
          ok: false,
          status: 409,
          message: `Récolte insuffisante pour ${l.nomProduit} : ${l.quantiteRestante} kg disponibles`,
        });
      }
    }

    // Écritures, une fois tous les contrôles passés
    for (const l of existantes.rows) {
      const q = parLigne.get(l.idLigneCommande) as number;

      await client.query(
        `UPDATE ligne_commande SET "quantiteConfirmee" = $2::numeric
          WHERE "idLigneCommande" = $1`,
        [l.idLigneCommande, q]
      );

      await client.query(
        `UPDATE recolte SET "quantiteRestante" = "quantiteRestante" - $2::numeric
          WHERE "idRecolte" = $1`,
        [l.idRecolte, q]
      );

      parProduit.set(l.idProduit, (parProduit.get(l.idProduit) ?? 0) + q);
    }

    // Stock central SOAM : une seule ligne par produit (index partiel uq_stock_soam)
    for (const [idProduit, quantite] of parProduit) {
      await client.query(
        `INSERT INTO stock ("idProduit", "typeStock", "quantiteStock")
         VALUES ($1, 'SOAM', $2::numeric)
         ON CONFLICT ("idProduit") WHERE "idCoop" IS NULL
         DO UPDATE SET "quantiteStock" = stock."quantiteStock" + EXCLUDED."quantiteStock"`,
        [idProduit, quantite]
      );
    }

    await client.query(
      `UPDATE commande
          SET "statutCommande" = 'EN_COURS_LIVRAISON',
              "dateAcceptation" = CURRENT_TIMESTAMP
        WHERE "idCommande" = $1`,
      [idCommande]
    );

    await client.query('COMMIT');
    return { ok: true };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// REFUS : aucun stock n'est modifié
export async function refuserCommandeTx(idCommande: string, idCoop: string): Promise<ResultatTx> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cmd = await client.query(
      `SELECT "statutCommande" FROM commande
        WHERE "idCommande" = $1 AND "idCoop" = $2
        FOR UPDATE`,
      [idCommande, idCoop]
    );

    if (!cmd.rows[0]) {
      await client.query('ROLLBACK');
      return { ok: false, status: 404, message: 'Commande introuvable' };
    }
    if (cmd.rows[0].statutCommande !== 'EN_ATTENTE') {
      await client.query('ROLLBACK');
      return { ok: false, status: 409, message: 'Cette commande a déjà été traitée' };
    }

    await client.query(
      `UPDATE commande SET "statutCommande" = 'REFUSEE' WHERE "idCommande" = $1`,
      [idCommande]
    );

    await client.query('COMMIT');
    return { ok: true };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}