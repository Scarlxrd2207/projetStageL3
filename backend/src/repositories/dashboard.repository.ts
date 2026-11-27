import { pool } from '../config/db';

export type Indicateurs = {
  membresActifs: number;
  recoltes: number;
  stockKg: number;
  commandesAttente: number;
  livraisonsEnCours: number;
  paiementsEnAttente: number;
};

export type CommandeRecente = {
  idCommande: string;
  dateCommande: string;
  statutCommande: 'EN_ATTENTE' | 'EN_COURS_LIVRAISON' | 'LIVREE' | 'REFUSEE';
  statutPaiement: 'PAYE' | 'NON_PAYE';
  quantiteTotale: number;
};

// Chiffres de la seule coopérative passée en paramètre
export async function indicateursPresident(idCoop: string): Promise<Indicateurs> {
  const r = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM membre m
         WHERE m."idCoop" = $1 AND m."actifMembre" = 'Oui') AS "membresActifs",
       (SELECT COUNT(*)::int FROM recolte r
          JOIN membre m ON m."idMembre" = r."idMembre"
         WHERE m."idCoop" = $1) AS "recoltes",
       (SELECT COALESCE(SUM(r."quantiteRestante"), 0)::float8 FROM recolte r
          JOIN membre m ON m."idMembre" = r."idMembre"
         WHERE m."idCoop" = $1) AS "stockKg",
       (SELECT COUNT(*)::int FROM commande c
         WHERE c."idCoop" = $1 AND c."statutCommande" = 'EN_ATTENTE') AS "commandesAttente",
       (SELECT COUNT(*)::int FROM commande c
         WHERE c."idCoop" = $1 AND c."statutCommande" = 'EN_COURS_LIVRAISON') AS "livraisonsEnCours",
       (SELECT COUNT(*)::int FROM commande c
         WHERE c."idCoop" = $1 AND c."statutPaiement" = 'NON_PAYE') AS "paiementsEnAttente"`,
    [idCoop]
  );
  return r.rows[0];
}

export async function commandesRecentes(idCoop: string, limite = 5): Promise<CommandeRecente[]> {
  const r = await pool.query(
    `SELECT co."idCommande",
            co."dateCommande"::text AS "dateCommande",
            co."statutCommande",
            co."statutPaiement",
            (SELECT COALESCE(SUM(lc."quantiteDemandee"), 0)::float8
               FROM ligne_commande lc
              WHERE lc."idCommande" = co."idCommande") AS "quantiteTotale"
       FROM commande co
      WHERE co."idCoop" = $1
      ORDER BY co."dateCommande" DESC, co."idCommande" DESC
      LIMIT $2`,
    [idCoop, limite]
  );
  return r.rows;
}