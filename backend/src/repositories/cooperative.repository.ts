import { pool } from '../config/db';
import type { Cooperative } from '../models/cooperative.model';

export type FiltresCooperative = {
  district?: string;
  commune?: string;
  fokotany?: string;
};

export type DonneesCooperative = {
  nomCoop: string;
  districtCoop: string;
  communeCoop: string;
  fokotanyCoop: string;
  dateAdhesion: string;
};

export type CooperativeAvecMembres = Cooperative & { nombreMembres: number };

// La date est renvoyée en texte "AAAA-MM-JJ"
const COLONNES = `
  c."idCoop",
  c."nomCoop",
  c."districtCoop",
  c."communeCoop",
  c."fokotanyCoop",
  c."dateAdhesion"::text AS "dateAdhesion",
  c."inscrite"
`;

// nombreMembres est calculé à chaque lecture : il augmente quand un membre est ajouté
// et diminue quand il est désactivé. Il n'est stocké nulle part.
export async function listerCooperatives(
  filtres: FiltresCooperative = {}
): Promise<CooperativeAvecMembres[]> {
  const r = await pool.query(
    `SELECT ${COLONNES},
            (SELECT COUNT(*)::int FROM membre m
              WHERE m."idCoop" = c."idCoop" AND m."actifMembre" = 'Oui') AS "nombreMembres"
       FROM cooperative c
      WHERE ($1::text IS NULL OR LOWER(c."districtCoop") = LOWER($1))
        AND ($2::text IS NULL OR LOWER(c."communeCoop") = LOWER($2))
        AND ($3::text IS NULL OR LOWER(c."fokotanyCoop") = LOWER($3))
      ORDER BY c."nomCoop"`,
    [filtres.district ?? null, filtres.commune ?? null, filtres.fokotany ?? null]
  );
  return r.rows;
}

export async function trouverCooperative(idCoop: string): Promise<Cooperative | null> {
  const r = await pool.query(
    `SELECT ${COLONNES} FROM cooperative c WHERE c."idCoop" = $1`,
    [idCoop]
  );
  return r.rows[0] ?? null;
}

export async function listerLieux(): Promise<{
  districts: string[];
  communes: string[];
  fokotanys: string[];
}> {
  const r = await pool.query(
    `SELECT
       ARRAY(SELECT DISTINCT "districtCoop" FROM cooperative ORDER BY 1) AS districts,
       ARRAY(SELECT DISTINCT "communeCoop" FROM cooperative ORDER BY 1) AS communes,
       ARRAY(SELECT DISTINCT "fokotanyCoop" FROM cooperative ORDER BY 1) AS fokotanys`
  );
  return {
    districts: r.rows[0].districts,
    communes: r.rows[0].communes,
    fokotanys: r.rows[0].fokotanys,
  };
}

export async function existeDoublon(
  d: DonneesCooperative,
  idCoopExclu?: string
): Promise<boolean> {
  const r = await pool.query(
    `SELECT 1 FROM cooperative
      WHERE "nomCoop" = $1 AND "districtCoop" = $2
        AND "communeCoop" = $3 AND "fokotanyCoop" = $4
        AND ($5::text IS NULL OR "idCoop" <> $5)`,
    [d.nomCoop, d.districtCoop, d.communeCoop, d.fokotanyCoop, idCoopExclu ?? null]
  );
  return (r.rowCount ?? 0) > 0;
}

export async function creerCooperative(d: DonneesCooperative): Promise<Cooperative> {
  const r = await pool.query(
    `INSERT INTO cooperative ("nomCoop", "districtCoop", "communeCoop", "fokotanyCoop", "dateAdhesion", "inscrite")
     VALUES ($1, $2, $3, $4, $5, 'Oui')
     RETURNING "idCoop", "nomCoop", "districtCoop", "communeCoop", "fokotanyCoop",
               "dateAdhesion"::text AS "dateAdhesion", "inscrite"`,
    [d.nomCoop, d.districtCoop, d.communeCoop, d.fokotanyCoop, d.dateAdhesion]
  );
  return r.rows[0];
}

export async function modifierCooperative(
  idCoop: string,
  d: DonneesCooperative
): Promise<Cooperative | null> {
  const r = await pool.query(
    `UPDATE cooperative
        SET "nomCoop" = $2, "districtCoop" = $3, "communeCoop" = $4,
            "fokotanyCoop" = $5, "dateAdhesion" = $6
      WHERE "idCoop" = $1
      RETURNING "idCoop", "nomCoop", "districtCoop", "communeCoop", "fokotanyCoop",
                "dateAdhesion"::text AS "dateAdhesion", "inscrite"`,
    [idCoop, d.nomCoop, d.districtCoop, d.communeCoop, d.fokotanyCoop, d.dateAdhesion]
  );
  return r.rows[0] ?? null;
}

export async function supprimerCooperative(idCoop: string): Promise<boolean> {
  const r = await pool.query(`DELETE FROM cooperative WHERE "idCoop" = $1`, [idCoop]);
  return (r.rowCount ?? 0) > 0;
}