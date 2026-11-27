import 'dotenv/config';
import { Pool, PoolClient, types } from 'pg';

// NUMERIC (quantités) -> nombre JavaScript, au lieu d'un texte
types.setTypeParser(1700, (v) => parseFloat(v));
// DATE -> texte "AAAA-MM-JJ", sans décalage de fuseau horaire
types.setTypeParser(1082, (v) => v);
// COUNT(*) -> nombre
types.setTypeParser(20, (v) => parseInt(v, 10));

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export type Db = Pool | PoolClient;

// Exécute plusieurs requêtes dans une transaction (tout ou rien)
export async function withTransaction<T>(
  fn: (db: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}