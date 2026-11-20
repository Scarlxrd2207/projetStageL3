import { pool } from '../config/db';
import type { Produit } from '../models/produit.model';

export async function listerProduits(): Promise<Produit[]> {
  const r = await pool.query(
    `SELECT "idProduit", "nomProduit" FROM produit ORDER BY "nomProduit"`
  );
  return r.rows;
}

export async function trouverProduit(idProduit: string): Promise<Produit | null> {
  const r = await pool.query(
    `SELECT "idProduit", "nomProduit" FROM produit WHERE "idProduit" = $1`,
    [idProduit]
  );
  return r.rows[0] ?? null;
}

// Vérifie si le nom existe déjà, sans tenir compte de la casse
export async function nomExiste(nomProduit: string, idExclu?: string): Promise<boolean> {
  const r = await pool.query(
    `SELECT 1 FROM produit
      WHERE LOWER("nomProduit") = LOWER($1)
        AND ($2::text IS NULL OR "idProduit" <> $2)`,
    [nomProduit, idExclu ?? null]
  );
  return (r.rowCount ?? 0) > 0;
}

// L'identifiant (P-0001...) est attribué par la base
export async function creerProduit(nomProduit: string): Promise<Produit> {
  const r = await pool.query(
    `INSERT INTO produit ("nomProduit") VALUES ($1)
     RETURNING "idProduit", "nomProduit"`,
    [nomProduit]
  );
  return r.rows[0];
}

export async function modifierProduit(idProduit: string, nomProduit: string): Promise<Produit | null> {
  const r = await pool.query(
    `UPDATE produit SET "nomProduit" = $2
      WHERE "idProduit" = $1
      RETURNING "idProduit", "nomProduit"`,
    [idProduit, nomProduit]
  );
  return r.rows[0] ?? null;
}

export async function supprimerProduit(idProduit: string): Promise<boolean> {
  const r = await pool.query(`DELETE FROM produit WHERE "idProduit" = $1`, [idProduit]);
  return (r.rowCount ?? 0) > 0;
}