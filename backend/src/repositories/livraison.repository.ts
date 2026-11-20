import { pool } from '../config/db';

export type LivraisonLigne = {
  idCommande: string;
  dateAcceptation: string | null;
  dateLivraison: string | null;
  statutCommande: 'EN_COURS_LIVRAISON' | 'LIVREE';
  statutPaiement: 'PAYE' | 'NON_PAYE';
  idCoop: string;
  nomCoop: string;
  nbLignes: number;
  quantiteLivree: number;
};

export type UtilisateurSession = {
  idUser: string;
  role: 'RESPONSABLE' | 'PRESIDENT';
  idCoop: string | null;
  actifUtilisateur: 'Oui' | 'Non';
};

export async function trouverUtilisateur(idUser: string): Promise<UtilisateurSession | null> {
  const r = await pool.query(
    `SELECT "idUser", role, "idCoop", "actifUtilisateur" FROM utilisateur WHERE "idUser" = $1`,
    [idUser]
  );
  return r.rows[0] ?? null;
}

// Commandes en cours de livraison ou livrées, avec leur coopérative
export async function listerLivraisons(filtres: {
  idCoop?: string;
  statut?: string;
}): Promise<LivraisonLigne[]> {
  const r = await pool.query(
    `SELECT co."idCommande",
            co."dateAcceptation"::text AS "dateAcceptation",
            co."dateLivraison"::text AS "dateLivraison",
            co."statutCommande",
            co."statutPaiement",
            co."idCoop",
            c."nomCoop",
            (SELECT COUNT(*)::int
               FROM ligne_commande lc
              WHERE lc."idCommande" = co."idCommande") AS "nbLignes",
            (SELECT COALESCE(SUM(lc."quantiteConfirmee"), 0)::float8
               FROM ligne_commande lc
              WHERE lc."idCommande" = co."idCommande") AS "quantiteLivree"
       FROM commande co
       JOIN cooperative c ON c."idCoop" = co."idCoop"
      WHERE co."statutCommande" IN ('EN_COURS_LIVRAISON', 'LIVREE')
        AND ($1::text IS NULL OR co."idCoop" = $1)
        AND ($2::text IS NULL OR co."statutCommande" = $2)
      ORDER BY co."dateAcceptation" DESC NULLS LAST, co."idCommande" DESC`,
    [filtres.idCoop ?? null, filtres.statut ?? null]
  );
  return r.rows;
}

export type ResultatTx = { ok: true } | { ok: false; status: number; message: string };

// Confirmation de réception : EN_COURS_LIVRAISON -> LIVREE, sans toucher au stock
export async function confirmerLivraisonTx(idCommande: string): Promise<ResultatTx> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cmd = await client.query(
      `SELECT "statutCommande" FROM commande WHERE "idCommande" = $1 FOR UPDATE`,
      [idCommande]
    );

    if (!cmd.rows[0]) {
      await client.query('ROLLBACK');
      return { ok: false, status: 404, message: 'Commande introuvable' };
    }
    if (cmd.rows[0].statutCommande !== 'EN_COURS_LIVRAISON') {
      await client.query('ROLLBACK');
      return {
        ok: false,
        status: 409,
        message: 'Seule une commande en cours de livraison peut être confirmée',
      };
    }

    await client.query(
      `UPDATE commande
          SET "statutCommande" = 'LIVREE',
              "dateLivraison" = CURRENT_DATE
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