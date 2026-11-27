import { pool } from '../config/db';

export type EnteteFacture = {
  idCommande: string;
  idCoop: string;
  nomCoop: string;
  statutCommande: string;
  dateCommande: string;
  dateAcceptation: string | null;
  idUserResponsable: string;
  emailResponsable: string;
};

export type LigneFacture = {
  nomProduit: string;
  quantite: number;
  prixUnitaire: number;
};

export async function enteteFacture(idCommande: string): Promise<EnteteFacture | null> {
  const r = await pool.query(
    `SELECT co."idCommande",
            co."idCoop",
            c."nomCoop",
            co."statutCommande",
            to_char(co."dateCommande", 'DD/MM/YYYY') AS "dateCommande",
            to_char(co."dateAcceptation", 'DD/MM/YYYY') AS "dateAcceptation",
            co."idUser" AS "idUserResponsable",
            u.email AS "emailResponsable"
       FROM commande co
       JOIN cooperative c ON c."idCoop" = co."idCoop"
       JOIN utilisateur u ON u."idUser" = co."idUser"
      WHERE co."idCommande" = $1`,
    [idCommande]
  );
  return r.rows[0] ?? null;
}

// Une ligne par récolte livrée, quantité confirmée et prix du produit
export async function lignesFacture(idCommande: string): Promise<LigneFacture[]> {
  const r = await pool.query(
    `SELECT p."nomProduit",
            COALESCE(lc."quantiteConfirmee", 0)::float8 AS quantite,
            p."prixUnitaire"::float8 AS "prixUnitaire"
       FROM ligne_commande lc
       JOIN recolte r ON r."idRecolte" = lc."idRecolte"
       JOIN produit p ON p."idProduit" = r."idProduit"
      WHERE lc."idCommande" = $1 AND lc."quantiteConfirmee" > 0
      ORDER BY p."nomProduit"`,
    [idCommande]
  );
  return r.rows;
}