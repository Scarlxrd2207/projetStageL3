import { pool } from '../config/db';
import type { RecolteDetail } from '../models/recolte.model';

// Les quantités sont converties en nombres (float8) : PostgreSQL les renvoie sinon en texte
const SELECT_DETAIL = `
  SELECT r."idRecolte",
         r."dateRecolte"::text AS "dateRecolte",
         r."quantiteDeclaree"::float8 AS "quantiteDeclaree",
         r."quantiteRestante"::float8 AS "quantiteRestante",
         r."idMembre",
         r."idProduit",
         p."nomProduit",
         m."nomMembre",
         m."prenomMembre",
         m."districtMembre",
         m."communeMembre",
         m."fokotanyMembre",
         c."idCoop",
         c."nomCoop"
    FROM recolte r
    JOIN membre m ON m."idMembre" = r."idMembre"
    JOIN produit p ON p."idProduit" = r."idProduit"
    JOIN cooperative c ON c."idCoop" = m."idCoop"
`;

// Toutes les récoltes, ou seulement celles d'une coopérative
export async function listerRecoltes(idCoop?: string): Promise<RecolteDetail[]> {
  const r = await pool.query(
    `${SELECT_DETAIL}
      WHERE ($1::text IS NULL OR c."idCoop" = $1)
      ORDER BY r."dateRecolte" DESC, r."idRecolte" DESC`,
    [idCoop ?? null]
  );
  return r.rows;
}

export async function trouverRecolte(idRecolte: string): Promise<RecolteDetail | null> {
  const r = await pool.query(`${SELECT_DETAIL} WHERE r."idRecolte" = $1`, [idRecolte]);
  return r.rows[0] ?? null;
}

// La quantité restante démarre à la quantité déclarée
export async function creerRecolte(d: {
  idMembre: string;
  idProduit: string;
  dateRecolte: string;
  quantiteDeclaree: number;
}): Promise<RecolteDetail | null> {
  const r = await pool.query(
    `INSERT INTO recolte ("idMembre", "idProduit", "dateRecolte", "quantiteDeclaree", "quantiteRestante")
     VALUES ($1, $2, $3, $4::numeric, $4::numeric)
     RETURNING "idRecolte"`,
    [d.idMembre, d.idProduit, d.dateRecolte, d.quantiteDeclaree]
  );
  return trouverRecolte(r.rows[0].idRecolte);
}

// La quantité restante change du même écart que la quantité déclarée :
// ce qui a déjà été commandé reste compté
export async function modifierRecolte(
  idRecolte: string,
  d: { dateRecolte: string; quantiteDeclaree: number }
): Promise<RecolteDetail | null> {
  const r = await pool.query(
    `UPDATE recolte
        SET "dateRecolte" = $2,
            "quantiteRestante" = "quantiteRestante" + ($3::numeric - "quantiteDeclaree"),
            "quantiteDeclaree" = $3::numeric
      WHERE "idRecolte" = $1
      RETURNING "idRecolte"`,
    [idRecolte, d.dateRecolte, d.quantiteDeclaree]
  );
  if (!r.rows[0]) return null;
  return trouverRecolte(idRecolte);
}

// Renvoie une erreur 23503 si la récolte est utilisée dans une commande
export async function supprimerRecolte(idRecolte: string): Promise<boolean> {
  const r = await pool.query(`DELETE FROM recolte WHERE "idRecolte" = $1`, [idRecolte]);
  return (r.rowCount ?? 0) > 0;
}