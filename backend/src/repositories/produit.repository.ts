import { pool } from '../config/db';
import type { Produit } from '../models/produit.model';

<<<<<<< HEAD
export type DonneesProduit = {
  nomProduit: string;
  prixUnitaire: number;
};

// Le prix est renvoyé en nombre (et non en texte), pour les calculs et l'affichage
const COLONNES = `
  p."idProduit",
  p."nomProduit",
  p."prixUnitaire"::float8 AS "prixUnitaire"
`;

export async function listerProduits(): Promise<Produit[]> {
  const r = await pool.query(
    `SELECT ${COLONNES} FROM produit p ORDER BY p."nomProduit"`
=======
export async function listerProduits(): Promise<Produit[]> {
  const r = await pool.query(
    `SELECT "idProduit", "nomProduit" FROM produit ORDER BY "nomProduit"`
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  );
  return r.rows;
}

export async function trouverProduit(idProduit: string): Promise<Produit | null> {
  const r = await pool.query(
<<<<<<< HEAD
    `SELECT ${COLONNES} FROM produit p WHERE p."idProduit" = $1`,
=======
    `SELECT "idProduit", "nomProduit" FROM produit WHERE "idProduit" = $1`,
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
    [idProduit]
  );
  return r.rows[0] ?? null;
}

<<<<<<< HEAD
// L'identifiant (P-0001...) est généré par la séquence de la base
export async function creerProduit(d: DonneesProduit): Promise<Produit | null> {
  const r = await pool.query(
    `INSERT INTO produit ("nomProduit", "prixUnitaire")
     VALUES ($1, $2::numeric)
     RETURNING "idProduit"`,
    [d.nomProduit, d.prixUnitaire]
  );
  return trouverProduit(r.rows[0].idProduit);
}

export async function modifierProduit(idProduit: string, d: DonneesProduit): Promise<Produit | null> {
  const r = await pool.query(
    `UPDATE produit
        SET "nomProduit" = $2, "prixUnitaire" = $3::numeric
      WHERE "idProduit" = $1
      RETURNING "idProduit"`,
    [idProduit, d.nomProduit, d.prixUnitaire]
  );
  if (!r.rows[0]) return null;
  return trouverProduit(idProduit);
}

// Renvoie false si aucune ligne n'est supprimée.
// Lève une erreur 23503 si le produit est utilisé par une récolte ou un stock.
=======
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

>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
export async function supprimerProduit(idProduit: string): Promise<boolean> {
  const r = await pool.query(`DELETE FROM produit WHERE "idProduit" = $1`, [idProduit]);
  return (r.rowCount ?? 0) > 0;
}