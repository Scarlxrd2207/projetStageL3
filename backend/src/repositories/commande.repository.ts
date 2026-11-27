import { pool } from '../config/db';
import type { PoolClient } from 'pg';

export type ResultatTx = { ok: true } | { ok: false; status: number; message: string };

export type LigneConfirmee = { idLigneCommande: string; quantiteConfirmee: number };

// Montant estimé (quantités demandées) et confirmé (quantités acceptées) par commande.
// montantTotal suit le statut : estimé en attente, confirmé ensuite, 0 si refusée.
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
           WHERE lc."idCommande" = co."idCommande") AS "quantiteTotale",
         m."montantEstime",
         m."montantConfirme",
         (CASE
            WHEN co."statutCommande" = 'EN_ATTENTE' THEN m."montantEstime"
            WHEN co."statutCommande" = 'REFUSEE' THEN 0
            ELSE m."montantConfirme"
          END)::float8 AS "montantTotal"
    FROM commande co
    JOIN cooperative c ON c."idCoop" = co."idCoop"
    JOIN utilisateur u ON u."idUser" = co."idUser"
    JOIN LATERAL (
      SELECT COALESCE(SUM(lc."quantiteDemandee" * p."prixUnitaire"), 0)::float8 AS "montantEstime",
             COALESCE(SUM(COALESCE(lc."quantiteConfirmee", 0) * p."prixUnitaire"), 0)::float8 AS "montantConfirme"
        FROM ligne_commande lc
        JOIN recolte r ON r."idRecolte" = lc."idRecolte"
        JOIN produit p ON p."idProduit" = r."idProduit"
       WHERE lc."idCommande" = co."idCommande"
    ) m ON TRUE
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

// Lignes avec prix unitaire et montant de ligne, cohérents avec le statut de la commande
export async function lignesCommande(idCommande: string): Promise<unknown[]> {
  const r = await pool.query(
    `SELECT lc."idLigneCommande",
            p."nomProduit",
            p."prixUnitaire"::float8 AS "prixUnitaire",
            m."nomMembre",
            m."prenomMembre",
            m."districtMembre",
            m."communeMembre",
            m."fokotanyMembre",
            r."dateRecolte"::text AS "dateRecolte",
            lc."quantiteDemandee"::float8 AS "quantiteDemandee",
            lc."quantiteConfirmee"::float8 AS "quantiteConfirmee",
            r."quantiteRestante"::float8 AS "quantiteRestanteRecolte",
            (CASE
               WHEN co."statutCommande" = 'EN_ATTENTE' THEN lc."quantiteDemandee" * p."prixUnitaire"
               WHEN co."statutCommande" = 'REFUSEE' THEN 0
               ELSE COALESCE(lc."quantiteConfirmee", 0) * p."prixUnitaire"
             END)::float8 AS "montantLigne"
       FROM ligne_commande lc
       JOIN commande co ON co."idCommande" = lc."idCommande"
       JOIN recolte r ON r."idRecolte" = lc."idRecolte"
       JOIN produit p ON p."idProduit" = r."idProduit"
       JOIN membre m ON m."idMembre" = r."idMembre"
      WHERE lc."idCommande" = $1
      ORDER BY p."nomProduit", m."nomMembre"`,
    [idCommande]
  );
  return r.rows;
}

// En-tête et lignes dans une seule transaction. Le stock n'est pas modifié ici.
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

// ACCEPTATION : une seule transaction avec verrous
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

    const parProduit = new Map<string, number>();
    for (const l of existantes.rows) {
      const q = parLigne.get(l.idLigneCommande);
      if (q === undefined) {
        return annuler({ ok: false, status: 400, message: 'Toutes les lignes doivent être confirmées' });
      }
      if (!(q > 0) || q > l.quantiteDemandee) {
        return annuler({ ok: false, status: 400, message: `Quantité confirmée invalide pour ${l.nomProduit}` });
      }
      if (q > l.quantiteRestante) {
        return annuler({
          ok: false,
          status: 409,
          message: `Récolte insuffisante pour ${l.nomProduit} : ${l.quantiteRestante} kg disponibles`,
        });
      }
    }

    for (const l of existantes.rows) {
      const q = parLigne.get(l.idLigneCommande) as number;

      await client.query(
        `UPDATE ligne_commande SET "quantiteConfirmee" = $2::numeric WHERE "idLigneCommande" = $1`,
        [l.idLigneCommande, q]
      );
      await client.query(
        `UPDATE recolte SET "quantiteRestante" = "quantiteRestante" - $2::numeric WHERE "idRecolte" = $1`,
        [l.idRecolte, q]
      );
      parProduit.set(l.idProduit, (parProduit.get(l.idProduit) ?? 0) + q);
    }

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

export async function modifierStatutPaiement(idCommande: string, statut: string): Promise<void> {
  await pool.query(
    `UPDATE commande SET "statutPaiement" = $2 WHERE "idCommande" = $1`,
    [idCommande, statut]
  );
}