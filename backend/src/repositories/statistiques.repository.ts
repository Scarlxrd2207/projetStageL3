import { pool } from '../config/db';

export type Periode = { du: string | null; au: string | null };

export type Kpis = {
  totalLivre: number;
  totalDu: number;
  totalPaye: number;
  commandesEnCours: number;
};

export type ParCoop = { idCoop: string; nomCoop: string; quantiteLivree: number };
export type ParMois = { mois: string; quantiteLivree: number };

// Filtre de période sur la date de commande ($2 = début, $3 = fin)
const FILTRE_PERIODE = `
  AND ($2::date IS NULL OR co."dateCommande"::date >= $2::date)
  AND ($3::date IS NULL OR co."dateCommande"::date <= $3::date)`;

// $1 = identifiant de coopérative, ou NULL pour toutes les coopératives
export async function kpis(idCoop: string | null, p: Periode): Promise<Kpis> {
  const r = await pool.query(
    `SELECT
       COALESCE(SUM(lc."quantiteConfirmee") FILTER (
         WHERE co."statutCommande" = 'LIVREE'), 0)::float8 AS "totalLivre",
       COALESCE(SUM(lc."quantiteConfirmee" * p."prixUnitaire") FILTER (
         WHERE co."statutCommande" IN ('EN_COURS_LIVRAISON', 'LIVREE')
           AND co."statutPaiement" = 'NON_PAYE'), 0)::float8 AS "totalDu",
       COALESCE(SUM(lc."quantiteConfirmee" * p."prixUnitaire") FILTER (
         WHERE co."statutCommande" IN ('EN_COURS_LIVRAISON', 'LIVREE')
           AND co."statutPaiement" = 'PAYE'), 0)::float8 AS "totalPaye"
     FROM commande co
     LEFT JOIN ligne_commande lc ON lc."idCommande" = co."idCommande"
     LEFT JOIN recolte r ON r."idRecolte" = lc."idRecolte"
     LEFT JOIN produit p ON p."idProduit" = r."idProduit"
     WHERE ($1::text IS NULL OR co."idCoop" = $1) ${FILTRE_PERIODE}`,
    [idCoop, p.du, p.au]
  );

  const enCours = await pool.query(
    `SELECT COUNT(*)::int AS n
       FROM commande co
      WHERE co."statutCommande" = 'EN_COURS_LIVRAISON'
        AND ($1::text IS NULL OR co."idCoop" = $1) ${FILTRE_PERIODE}`,
    [idCoop, p.du, p.au]
  );

  return {
    totalLivre: r.rows[0].totalLivre,
    totalDu: r.rows[0].totalDu,
    totalPaye: r.rows[0].totalPaye,
    commandesEnCours: enCours.rows[0].n,
  };
}

// Quantité livrée par coopérative (toutes les coopératives, ou une seule)
export async function parCoop(idCoop: string | null, p: Periode): Promise<ParCoop[]> {
  const r = await pool.query(
    `SELECT c."idCoop", c."nomCoop",
            COALESCE(SUM(lc."quantiteConfirmee"), 0)::float8 AS "quantiteLivree"
       FROM cooperative c
       LEFT JOIN commande co ON co."idCoop" = c."idCoop"
            AND co."statutCommande" = 'LIVREE' ${FILTRE_PERIODE}
       LEFT JOIN ligne_commande lc ON lc."idCommande" = co."idCommande"
      WHERE ($1::text IS NULL OR c."idCoop" = $1)
      GROUP BY c."idCoop", c."nomCoop"
      ORDER BY "quantiteLivree" DESC, c."nomCoop"`,
    [idCoop, p.du, p.au]
  );
  return r.rows;
}

// Quantité livrée par mois : les mois sans livraison sont complétés par le service
export async function parMois(idCoop: string | null, p: Periode): Promise<ParMois[]> {
  const r = await pool.query(
    `SELECT to_char(date_trunc('month', co."dateCommande"), 'YYYY-MM') AS mois,
            COALESCE(SUM(lc."quantiteConfirmee"), 0)::float8 AS "quantiteLivree"
       FROM commande co
       JOIN ligne_commande lc ON lc."idCommande" = co."idCommande"
      WHERE co."statutCommande" = 'LIVREE'
        AND ($1::text IS NULL OR co."idCoop" = $1) ${FILTRE_PERIODE}
      GROUP BY 1
      ORDER BY 1`,
    [idCoop, p.du, p.au]
  );
  return r.rows;
}