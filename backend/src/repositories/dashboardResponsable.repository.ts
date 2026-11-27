import { pool } from '../config/db';

export type IndicateursResponsable = {
  cooperatives: number;
  commandesAttente: number;
  stockKg: number;
  paiementsAttente: number;
  livraisonsEnCours: number;
};

export type MoisCommandes = { mois: string; nb: number };
export type StockProduit = { nomProduit: string; quantiteStock: number };
export type CommandeResume = {
  idCommande: string;
  dateCommande: string;
  nomCoop: string;
  statutCommande: string;
  statutPaiement: string;
  quantiteTotale: number;
};

export async function indicateurs(): Promise<IndicateursResponsable> {
  const r = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM cooperative WHERE "inscrite" = 'Oui') AS "cooperatives",
       (SELECT COUNT(*)::int FROM commande WHERE "statutCommande" = 'EN_ATTENTE') AS "commandesAttente",
       (SELECT COALESCE(SUM("quantiteStock"), 0)::float8 FROM stock WHERE "typeStock" = 'SOAM') AS "stockKg",
       (SELECT COUNT(*)::int FROM commande
         WHERE "statutPaiement" = 'NON_PAYE' AND "statutCommande" <> 'REFUSEE') AS "paiementsAttente",
       (SELECT COUNT(*)::int FROM commande WHERE "statutCommande" = 'EN_COURS_LIVRAISON') AS "livraisonsEnCours"`
  );
  return r.rows[0];
}

// Nombre de commandes par mois, sur les six derniers mois
export async function commandesParMois(): Promise<MoisCommandes[]> {
  const r = await pool.query(
    `SELECT to_char(date_trunc('month', "dateCommande"), 'YYYY-MM') AS mois, COUNT(*)::int AS nb
       FROM commande
      WHERE "dateCommande" >= date_trunc('month', CURRENT_DATE) - INTERVAL '5 months'
      GROUP BY 1
      ORDER BY 1`
  );
  return r.rows;
}

// Stock central SOAM, par produit
export async function stockParProduit(): Promise<StockProduit[]> {
  const r = await pool.query(
    `SELECT p."nomProduit", s."quantiteStock"::float8 AS "quantiteStock"
       FROM stock s
       JOIN produit p ON p."idProduit" = s."idProduit"
      WHERE s."typeStock" = 'SOAM'
      ORDER BY s."quantiteStock" DESC`
  );
  return r.rows;
}

export async function dernieresCommandes(): Promise<CommandeResume[]> {
  const r = await pool.query(
    `SELECT co."idCommande",
            co."dateCommande"::text AS "dateCommande",
            c."nomCoop",
            co."statutCommande",
            co."statutPaiement",
            (SELECT COALESCE(SUM(lc."quantiteDemandee"), 0)::float8
               FROM ligne_commande lc WHERE lc."idCommande" = co."idCommande") AS "quantiteTotale"
       FROM commande co
       JOIN cooperative c ON c."idCoop" = co."idCoop"
      ORDER BY co."dateCommande" DESC, co."idCommande" DESC
      LIMIT 6`
  );
  return r.rows;
}