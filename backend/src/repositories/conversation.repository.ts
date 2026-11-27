import { pool } from '../config/db';
<<<<<<< HEAD

export type UtilisateurMini = {
  idUser: string;
  role: 'RESPONSABLE' | 'PRESIDENT';
  idCoop: string | null;
  actifUtilisateur: 'Oui' | 'Non';
};

export type ConversationMini = {
  idConversation: string;
  idCoop: string;
  nomCoop: string;
  idUser: string;
};

export type ConversationListe = {
  idConversation: string;
  idCoop: string;
  nomCoop: string;
  nbNonLus: number;
  dernierMessage: string | null;
};

export type MessageLigne = {
  idMessage: string;
  contenuMessage: string;
  dateEnvoi: string;
  luMessage: 'Oui' | 'Non';
  expediteur: string;
  estMoi: boolean;
};

=======
import type {
  Utilisateur,
  Conversation,
  ConversationListe,
  MessageAffiche,
} from '../models/conversation.model';

export async function trouverUtilisateur(idUser: string): Promise<Utilisateur | null> {
  const r = await pool.query(
    `SELECT "idUser", role, "idCoop", "actifUtilisateur"
       FROM utilisateur WHERE "idUser" = $1`,
    [idUser]
  );
  return r.rows[0] ?? null;
}

// Le responsable actif, utilisé quand un président ouvre sa conversation
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
export async function trouverResponsable(): Promise<{ idUser: string } | null> {
  const r = await pool.query(
    `SELECT "idUser" FROM utilisateur
      WHERE role = 'RESPONSABLE' AND "actifUtilisateur" = 'Oui'
      ORDER BY "idUser" LIMIT 1`
  );
  return r.rows[0] ?? null;
}

<<<<<<< HEAD
export async function trouverConversation(idConversation: string): Promise<ConversationMini | null> {
=======
export async function trouverConversation(idConversation: string): Promise<Conversation | null> {
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  const r = await pool.query(
    `SELECT cv."idConversation", cv."idCoop", c."nomCoop", cv."idUser"
       FROM conversation cv
       JOIN cooperative c ON c."idCoop" = cv."idCoop"
      WHERE cv."idConversation" = $1`,
    [idConversation]
  );
  return r.rows[0] ?? null;
}

<<<<<<< HEAD
// Renvoie la conversation existante, ou la crée avec un identifiant CV-0001...
export async function trouverOuCreerConversation(idCoop: string, idResponsable: string): Promise<string> {
  const existante = await pool.query(
    `SELECT "idConversation" FROM conversation WHERE "idCoop" = $1 AND "idUser" = $2`,
    [idCoop, idResponsable]
  );
  if (existante.rows[0]) return existante.rows[0].idConversation;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SELECT pg_advisory_xact_lock(hashtext('conversation'))`);

    const deja = await client.query(
      `SELECT "idConversation" FROM conversation WHERE "idCoop" = $1 AND "idUser" = $2`,
      [idCoop, idResponsable]
    );
    if (deja.rows[0]) {
      await client.query('COMMIT');
      return deja.rows[0].idConversation;
    }

    const suivant = await client.query(
      `SELECT COALESCE(MAX(CAST(SUBSTRING("idConversation" FROM '[0-9]+$') AS INTEGER)), 0) + 1 AS n
         FROM conversation`
    );
    const id = `CV-${String(suivant.rows[0].n).padStart(4, '0')}`;

    await client.query(
      `INSERT INTO conversation ("idConversation", "idCoop", "idUser") VALUES ($1, $2, $3)`,
      [id, idCoop, idResponsable]
    );

    await client.query('COMMIT');
    return id;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Conversations visibles par l'utilisateur, avec le nombre de messages non lus
=======
// Renvoie la conversation de la coopérative avec ce responsable, en la créant si besoin
export async function trouverOuCreerConversation(idCoop: string, idResponsable: string): Promise<string> {
  await pool.query(
    `INSERT INTO conversation ("idCoop", "idUser") VALUES ($1, $2)
     ON CONFLICT ("idCoop", "idUser") DO NOTHING`,
    [idCoop, idResponsable]
  );
  const r = await pool.query(
    `SELECT "idConversation" FROM conversation
      WHERE "idCoop" = $1 AND "idUser" = $2`,
    [idCoop, idResponsable]
  );
  return r.rows[0].idConversation;
}

// Liste des conversations avec le nombre de messages non lus pour le lecteur
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
export async function listerConversations(idLecteur: string): Promise<ConversationListe[]> {
  const r = await pool.query(
    `SELECT cv."idConversation",
            cv."idCoop",
            c."nomCoop",
<<<<<<< HEAD
            (SELECT COUNT(*)::int FROM message m
              WHERE m."idConversation" = cv."idConversation"
                AND m."luMessage" = 'Non'
                AND m."idUser" <> $1) AS "nbNonLus",
            (SELECT to_char(MAX(m."dateEnvoi"), 'DD/MM/YYYY HH24:MI') FROM message m
              WHERE m."idConversation" = cv."idConversation") AS "dernierMessage"
       FROM conversation cv
       JOIN cooperative c ON c."idCoop" = cv."idCoop"
      WHERE cv."idUser" = $1 OR cv."idCoop" IN (
              SELECT u."idCoop" FROM utilisateur u WHERE u."idUser" = $1 AND u."idCoop" IS NOT NULL)
=======
            (SELECT COUNT(*)::int
               FROM message m
              WHERE m."idConversation" = cv."idConversation"
                AND m."luMessage" = 'Non'
                AND m."idUser" <> $1) AS "nbNonLus",
            (SELECT to_char(MAX(m."dateEnvoi"), 'DD/MM/YYYY HH24:MI')
               FROM message m
              WHERE m."idConversation" = cv."idConversation") AS "dernierMessage"
       FROM conversation cv
       JOIN cooperative c ON c."idCoop" = cv."idCoop"
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
      ORDER BY c."nomCoop"`,
    [idLecteur]
  );
  return r.rows;
}

<<<<<<< HEAD
export async function listerMessages(idConversation: string, idLecteur: string): Promise<MessageLigne[]> {
=======
// Messages d'une conversation. "estMoi" indique si l'expéditeur est le lecteur.
export async function listerMessages(idConversation: string, idLecteur: string): Promise<MessageAffiche[]> {
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  const r = await pool.query(
    `SELECT m."idMessage",
            m."contenuMessage",
            to_char(m."dateEnvoi", 'DD/MM/YYYY HH24:MI') AS "dateEnvoi",
            m."luMessage",
            CASE WHEN u.role = 'RESPONSABLE' THEN 'Responsable SOAM' ELSE 'Président' END AS expediteur,
            (m."idUser" = $2) AS "estMoi"
       FROM message m
       JOIN utilisateur u ON u."idUser" = m."idUser"
      WHERE m."idConversation" = $1
      ORDER BY m."dateEnvoi", m."idMessage"`,
    [idConversation, idLecteur]
  );
  return r.rows;
}

<<<<<<< HEAD
export async function marquerLus(idConversation: string, idLecteur: string): Promise<void> {
  await pool.query(
    `UPDATE message SET "luMessage" = 'Oui'
      WHERE "idConversation" = $1 AND "idUser" <> $2 AND "luMessage" = 'Non'`,
=======
// Marque comme lus les messages reçus par le lecteur
export async function marquerLus(idConversation: string, idLecteur: string): Promise<void> {
  await pool.query(
    `UPDATE message SET "luMessage" = 'Oui'
      WHERE "idConversation" = $1
        AND "idUser" <> $2
        AND "luMessage" = 'Non'`,
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
    [idConversation, idLecteur]
  );
}

<<<<<<< HEAD
// Ajout d'un message avec un identifiant MSG-0001... généré par le code
export async function ajouterMessage(idConversation: string, idUser: string, contenu: string): Promise<string> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SELECT pg_advisory_xact_lock(hashtext('message'))`);

    const suivant = await client.query(
      `SELECT COALESCE(MAX(CAST(SUBSTRING("idMessage" FROM '[0-9]+$') AS INTEGER)), 0) + 1 AS n
         FROM message`
    );
    const id = `MSG-${String(suivant.rows[0].n).padStart(4, '0')}`;

    await client.query(
      `INSERT INTO message ("idMessage", "idConversation", "idUser", "contenuMessage", "luMessage")
       VALUES ($1, $2, $3, $4, 'Non')`,
      [id, idConversation, idUser, contenu]
    );

    await client.query('COMMIT');
    return id;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
=======
export async function ajouterMessage(idConversation: string, idUser: string, contenu: string): Promise<string> {
  const r = await pool.query(
    `INSERT INTO message ("idConversation", "idUser", "contenuMessage")
     VALUES ($1, $2, $3)
     RETURNING "idMessage"`,
    [idConversation, idUser, contenu]
  );
  return r.rows[0].idMessage;
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
}