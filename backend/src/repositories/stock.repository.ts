import { pool } from '../config/db';
import type { StockCooperative, StockSoam, DetailRecolteStock } from '../models/stock.model';

// Stock par coopérative et par produit : somme des quantités restantes des récoltes
export async function stockParCooperative(idCoop?: string): Promise<StockCooperative[]> {
  const r = await pool.query(
    `SELECT c."idCoop", c."nomCoop",
            p."idProduit", p."nomProduit",
            SUM(r."quantiteRestante")::float8 AS "quantiteRestante",
            COUNT(r."idRecolte")::int AS "nbRecoltes"
       FROM recolte r
       JOIN membre m      ON m."idMembre" = r."idMembre"
       JOIN cooperative c ON c."idCoop" = m."idCoop"
       JOIN produit p     ON p."idProduit" = r."idProduit"
      WHERE ($1::text IS NULL OR c."idCoop" = $1)
      GROUP BY c."idCoop", c."nomCoop", p."idProduit", p."nomProduit"
      ORDER BY c."nomCoop", p."nomProduit"`,
    [idCoop ?? null]
  );
  return r.rows;
}

// Stock central SOAM, lu dans la table stock
export async function stockSoam(): Promise<StockSoam[]> {
  const r = await pool.query(
    `SELECT p."idProduit", p."nomProduit", s."quantiteStock"::float8 AS "quantiteStock"
       FROM stock s
       JOIN produit p ON p."idProduit" = s."idProduit"
      WHERE s."typeStock" = 'SOAM'
      ORDER BY p."nomProduit"`
  );
  return r.rows;
}

// Récoltes d'une coopérative pour un produit, avec les infos du membre
// idCoop et idProduit ne sont pas renvoyés : ce sont des clés, on ne les affiche pas
export async function detailRecoltesStock(
  idCoop: string,
  idProduit: string
): Promise<DetailRecolteStock[]> {
  const r = await pool.query(
    `SELECT r."dateRecolte"::text AS "dateRecolte",
            m."nomMembre", m."prenomMembre",
            m."districtMembre", m."communeMembre", m."fokotanyMembre",
            r."quantiteDeclaree"::float8 AS "quantiteDeclaree",
            r."quantiteRestante"::float8 AS "quantiteRestante"
       FROM recolte r
       JOIN membre m ON m."idMembre" = r."idMembre"
      WHERE m."idCoop" = $1 AND r."idProduit" = $2
      ORDER BY r."dateRecolte" DESC, r."idRecolte" DESC`,
    [idCoop, idProduit]
  );
  return r.rows;
}