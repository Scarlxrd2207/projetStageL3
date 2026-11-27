import { pool } from '../config/db';
import type { Membre } from '../models/membre.model';

export type DonneesMembre = {
  nomMembre: string;
  prenomMembre: string;
  telephoneMembre: string | null;
  fokotanyMembre: string;
  idCoop: string;
};

<<<<<<< HEAD
// Colonnes communes, avec le nom de la coopérative (jointure)
const COLONNES = `
  m."idMembre", m."nomMembre", m."prenomMembre", m."telephoneMembre",
  m."districtMembre", m."communeMembre", m."fokotanyMembre",
  m."actifMembre", m."idCoop",
  (SELECT c."nomCoop" FROM cooperative c WHERE c."idCoop" = m."idCoop") AS "nomCoop"
=======
const COLONNES = `
  m."idMembre", m."nomMembre", m."prenomMembre", m."telephoneMembre",
  m."districtMembre", m."communeMembre", m."fokotanyMembre",
  m."actifMembre", m."idCoop"
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
`;

export async function listerMembres(idCoop?: string): Promise<Membre[]> {
  const r = await pool.query(
    `SELECT ${COLONNES}
       FROM membre m
      WHERE ($1::text IS NULL OR m."idCoop" = $1)
      ORDER BY m."nomMembre", m."prenomMembre"`,
    [idCoop ?? null]
  );
  return r.rows;
}

export async function trouverMembre(idMembre: string): Promise<Membre | null> {
  const r = await pool.query(
    `SELECT ${COLONNES} FROM membre m WHERE m."idMembre" = $1`,
    [idMembre]
  );
  return r.rows[0] ?? null;
}

export async function existeDoublonMembre(
  nomMembre: string,
  prenomMembre: string,
  idCoop: string,
  idExclu?: string
): Promise<boolean> {
  const r = await pool.query(
    `SELECT 1 FROM membre
      WHERE LOWER("nomMembre") = LOWER($1)
        AND LOWER("prenomMembre") = LOWER($2)
        AND "idCoop" = $3
        AND ($4::text IS NULL OR "idMembre" <> $4)`,
    [nomMembre, prenomMembre, idCoop, idExclu ?? null]
  );
  return (r.rowCount ?? 0) > 0;
}

<<<<<<< HEAD
// L'identifiant (M-0001...) est attribué par la base.
// District et commune sont copiés depuis la coopérative dans la même requête.
=======
// L'identifiant (M-0001...) est attribué par la base (valeur par défaut de la table).
// district et commune sont copiés depuis la coopérative dans la même requête.
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
export async function creerMembre(d: DonneesMembre): Promise<Membre | null> {
  const r = await pool.query(
    `INSERT INTO membre ("nomMembre", "prenomMembre", "telephoneMembre",
                         "districtMembre", "communeMembre", "fokotanyMembre",
                         "actifMembre", "idCoop")
     SELECT $1::text, $2::text, $3::text,
            c."districtCoop", c."communeCoop", $4::text,
            'Oui', c."idCoop"
       FROM cooperative c
      WHERE c."idCoop" = $5
     RETURNING "idMembre"`,
    [d.nomMembre, d.prenomMembre, d.telephoneMembre, d.fokotanyMembre, d.idCoop]
  );
  if (!r.rows[0]) return null;
  return trouverMembre(r.rows[0].idMembre);
}

// Seuls nom, prénom, téléphone et fokontany sont modifiables
export async function modifierMembre(
  idMembre: string,
  d: Omit<DonneesMembre, 'idCoop'>
): Promise<Membre | null> {
  const r = await pool.query(
    `UPDATE membre
        SET "nomMembre" = $2, "prenomMembre" = $3,
            "telephoneMembre" = $4, "fokotanyMembre" = $5
      WHERE "idMembre" = $1
      RETURNING "idMembre"`,
    [idMembre, d.nomMembre, d.prenomMembre, d.telephoneMembre, d.fokotanyMembre]
  );
  if (!r.rows[0]) return null;
  return trouverMembre(idMembre);
}

export async function desactiverMembre(idMembre: string): Promise<Membre | null> {
  const r = await pool.query(
    `UPDATE membre SET "actifMembre" = 'Non' WHERE "idMembre" = $1 RETURNING "idMembre"`,
    [idMembre]
  );
  if (!r.rows[0]) return null;
  return trouverMembre(idMembre);
}