import { pool } from '../config/db';

export type UtilisateurSession = {
  idUser: string;
  role: 'RESPONSABLE' | 'PRESIDENT';
  idCoop: string | null;
  actifUtilisateur: 'Oui' | 'Non';
};

// Utilisé par la connexion (auth.service)
export async function trouverParEmail(email: string) {
  const r = await pool.query(
    `SELECT "idUser", email, "motDePasse", role, "actifUtilisateur", "idCoop"
       FROM utilisateur
      WHERE email = $1`,
    [email]
  );
  return r.rows[0] ?? null;
}

// Relit le demandeur dans la base : son rôle ne vient jamais du navigateur
export async function trouverUtilisateurSession(idUser: string): Promise<UtilisateurSession | null> {
  const r = await pool.query(
    `SELECT "idUser", role, "idCoop", "actifUtilisateur"
       FROM utilisateur
      WHERE "idUser" = $1`,
    [idUser]
  );
  return r.rows[0] ?? null;
}

export async function emailExiste(email: string): Promise<boolean> {
  const r = await pool.query(`SELECT 1 FROM utilisateur WHERE email = $1`, [email]);
  return (r.rowCount ?? 0) > 0;
}

// Vrai si la coopérative a déjà un président
export async function presidentDeCoop(idCoop: string): Promise<boolean> {
  const r = await pool.query(
    `SELECT 1 FROM utilisateur WHERE role = 'PRESIDENT' AND "idCoop" = $1`,
    [idCoop]
  );
  return (r.rowCount ?? 0) > 0;
}

// Création du président dans une transaction avec verrou : deux créations simultanées
// ne peuvent pas obtenir le même numéro (PRE-001, PRE-002...)
export async function creerPresident(params: {
  email: string;
  motDePasseHache: string;
  idCoop: string;
}): Promise<{ idUser: string; email: string; idCoop: string }> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SELECT pg_advisory_xact_lock(hashtext('PRESIDENT'))`);

    const suivant = await client.query(
      `SELECT COALESCE(MAX(CAST(SUBSTRING("idUser" FROM '[0-9]+$') AS INTEGER)), 0) + 1 AS n
         FROM utilisateur
        WHERE role = 'PRESIDENT'`
    );
    const idUser = `PRE-${String(suivant.rows[0].n).padStart(3, '0')}`;

    const r = await client.query(
      `INSERT INTO utilisateur ("idUser", email, "motDePasse", role, "actifUtilisateur", "idCoop")
       VALUES ($1, $2, $3, 'PRESIDENT', 'Oui', $4)
       RETURNING "idUser", email, "idCoop"`,
      [idUser, params.email, params.motDePasseHache, params.idCoop]
    );

    await client.query('COMMIT');
    return r.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}