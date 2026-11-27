import { pool } from '../config/db';

export type ResultatTransformation =
  | { ok: true; restant: number; nomProduit: string }
  | { ok: false; status: number; message: string };

// Sortie du stock central SOAM, dans une seule transaction avec verrou.
// Le stock ne peut jamais devenir négatif, même si deux sorties arrivent en même temps.
export async function transformerStockSoam(p: {
  idProduit: string;
  quantite: number;
}): Promise<ResultatTransformation> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SELECT pg_advisory_xact_lock(hashtext('stock_soam'))`);

    const stock = await client.query(
      `SELECT s."idStock", s."quantiteStock"::float8 AS quantite, p."nomProduit"
         FROM stock s
         JOIN produit p ON p."idProduit" = s."idProduit"
        WHERE s."idProduit" = $1 AND s."typeStock" = 'SOAM' AND s."idCoop" IS NULL
        FOR UPDATE OF s`,
      [p.idProduit]
    );
    const ligne = stock.rows[0];

    if (!ligne) {
      await client.query('ROLLBACK');
      return { ok: false, status: 404, message: 'Aucun stock SOAM pour ce produit' };
    }
    if (ligne.quantite < p.quantite) {
      await client.query('ROLLBACK');
      return { ok: false, status: 409, message: `Stock insuffisant : ${ligne.quantite} kg disponibles` };
    }

    const maj = await client.query(
      `UPDATE stock
          SET "quantiteStock" = "quantiteStock" - $2::numeric
        WHERE "idStock" = $1
        RETURNING "quantiteStock"::float8 AS restant`,
      [ligne.idStock, p.quantite]
    );

    await client.query('COMMIT');
    return { ok: true, restant: maj.rows[0].restant, nomProduit: ligne.nomProduit };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}