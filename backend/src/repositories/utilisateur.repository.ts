import { pool } from '../config/db';

export type UtilisateurSession = {
  idUser: string;
  role: 'RESPONSABLE' | 'PRESIDENT';
  idCoop: string | null;
  actifUtilisateur: 'Oui' | 'Non';
};

export type CompteComplet = {
  idUser: string;
  email: string;
  role: 'RESPONSABLE' | 'PRESIDENT';
  idCoop: string | null;
  nomCoop: string | null;
  nom: string | null;
  prenom: string | null;
  adresse: string | null;
  dateNaissance: string | null;
  motDePasse: string;
  actifUtilisateur: 'Oui' | 'Non';
};

export type PresidentLigne = {
  idUser: string;
  email: string;
  nom: string | null;
  prenom: string | null;
  adresse: string | null;
  dateNaissance: string | null;
  idCoop: string | null;
  nomCoop: string | null;
  actifUtilisateur: 'Oui' | 'Non';
};

export type DonneesCreation = {
  email: string;
  motDePasseHache: string;
  idCoop: string;
  nom: string;
  prenom: string;
  adresse: string | null;
  dateNaissance: string | null;
};

const COLONNES_COMPTE = `
  u."idUser", u.email, u.role, u."idCoop", c."nomCoop",
  u.nom, u.prenom, u.adresse,
  to_char(u."dateNaissance", 'YYYY-MM-DD') AS "dateNaissance",
  u."motDePasse", u."actifUtilisateur"
`;

const COLONNES_PRESIDENT = `
  u."idUser", u.email, u.nom, u.prenom, u.adresse,
  to_char(u."dateNaissance", 'YYYY-MM-DD') AS "dateNaissance",
  u."idCoop", c."nomCoop", u."actifUtilisateur"
`;

export async function trouverParEmail(email: string): Promise<CompteComplet | null> {
  const r = await pool.query(
    `SELECT ${COLONNES_COMPTE}
       FROM utilisateur u
       LEFT JOIN cooperative c ON c."idCoop" = u."idCoop"
      WHERE u.email = $1`,
    [email]
  );
  return r.rows[0] ?? null;
}

export async function trouverCompte(idUser: string): Promise<CompteComplet | null> {
  const r = await pool.query(
    `SELECT ${COLONNES_COMPTE}
       FROM utilisateur u
       LEFT JOIN cooperative c ON c."idCoop" = u."idCoop"
      WHERE u."idUser" = $1`,
    [idUser]
  );
  return r.rows[0] ?? null;
}

export async function trouverUtilisateurSession(idUser: string): Promise<UtilisateurSession | null> {
  const r = await pool.query(
    `SELECT "idUser", role, "idCoop", "actifUtilisateur"
       FROM utilisateur
      WHERE "idUser" = $1`,
    [idUser]
  );
  return r.rows[0] ?? null;
}

export async function emailExiste(email: string, idExclu?: string): Promise<boolean> {
  const r = await pool.query(
    `SELECT 1 FROM utilisateur
      WHERE email = $1 AND ($2::text IS NULL OR "idUser" <> $2)`,
    [email, idExclu ?? null]
  );
  return (r.rowCount ?? 0) > 0;
}

export async function presidentDeCoop(idCoop: string): Promise<boolean> {
  const r = await pool.query(
    `SELECT 1 FROM utilisateur WHERE role = 'PRESIDENT' AND "idCoop" = $1`,
    [idCoop]
  );
  return (r.rowCount ?? 0) > 0;
}

// Création du président avec un identifiant PRE-001... sous verrou
export async function creerPresident(p: DonneesCreation): Promise<{ idUser: string; email: string; idCoop: string }> {
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
      `INSERT INTO utilisateur
         ("idUser", email, "motDePasse", role, "actifUtilisateur", "idCoop",
          nom, prenom, adresse, "dateNaissance")
       VALUES ($1, $2, $3, 'PRESIDENT', 'Oui', $4, $5, $6, $7, $8::date)
       RETURNING "idUser", email, "idCoop"`,
      [idUser, p.email, p.motDePasseHache, p.idCoop, p.nom, p.prenom, p.adresse, p.dateNaissance]
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

export async function modifierIdentite(
  idUser: string,
  d: { email: string; nom: string; prenom: string; adresse: string | null; dateNaissance: string | null }
): Promise<void> {
  await pool.query(
    `UPDATE utilisateur
        SET email = $2, nom = $3, prenom = $4, adresse = $5, "dateNaissance" = $6::date
      WHERE "idUser" = $1`,
    [idUser, d.email, d.nom, d.prenom, d.adresse, d.dateNaissance]
  );
}

export async function modifierMotDePasse(idUser: string, motDePasseHache: string): Promise<void> {
  await pool.query(`UPDATE utilisateur SET "motDePasse" = $2 WHERE "idUser" = $1`, [idUser, motDePasseHache]);
}

// Liste de tous les présidents, avec leur coopérative et leur statut
export async function listerPresidents(): Promise<PresidentLigne[]> {
  const r = await pool.query(
    `SELECT ${COLONNES_PRESIDENT}
       FROM utilisateur u
       LEFT JOIN cooperative c ON c."idCoop" = u."idCoop"
      WHERE u.role = 'PRESIDENT'
      ORDER BY c."nomCoop"`
  );
  return r.rows;
}

// Un président précis (le rôle est vérifié dans la requête)
export async function trouverPresident(idUser: string): Promise<PresidentLigne | null> {
  const r = await pool.query(
    `SELECT ${COLONNES_PRESIDENT}
       FROM utilisateur u
       LEFT JOIN cooperative c ON c."idCoop" = u."idCoop"
      WHERE u."idUser" = $1 AND u.role = 'PRESIDENT'`,
    [idUser]
  );
  return r.rows[0] ?? null;
}

// Active ou désactive le compte d'un président
export async function changerActif(idUser: string, actif: 'Oui' | 'Non'): Promise<void> {
  await pool.query(
    `UPDATE utilisateur SET "actifUtilisateur" = $2 WHERE "idUser" = $1 AND role = 'PRESIDENT'`,
    [idUser, actif]
  );
}