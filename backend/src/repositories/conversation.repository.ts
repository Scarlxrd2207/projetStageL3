import { pool } from '../config/db';
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
export async function trouverResponsable(): Promise<{ idUser: string } | null> {
  const r = await pool.query(
    `SELECT "idUser" FROM utilisateur
      WHERE role = 'RESPONSABLE' AND "actifUtilisateur" = 'Oui'
      ORDER BY "idUser" LIMIT 1`
  );
  return r.rows[0] ?? null;
}

export async function trouverConversation(idConversation: string): Promise<Conversation | null> {
  const r = await pool.query(
    `SELECT cv."idConversation", cv."idCoop", c."nomCoop", cv."idUser"
       FROM conversation cv
       JOIN cooperative c ON c."idCoop" = cv."idCoop"
      WHERE cv."idConversation" = $1`,
    [idConversation]
  );
  return r.rows[0] ?? null;
}

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
export async function listerConversations(idLecteur: string): Promise<ConversationListe[]> {
  const r = await pool.query(
    `SELECT cv."idConversation",
            cv."idCoop",
            c."nomCoop",
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
      ORDER BY c."nomCoop"`,
    [idLecteur]
  );
  return r.rows;
}

// Messages d'une conversation. "estMoi" indique si l'expéditeur est le lecteur.
export async function listerMessages(idConversation: string, idLecteur: string): Promise<MessageAffiche[]> {
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

// Marque comme lus les messages reçus par le lecteur
export async function marquerLus(idConversation: string, idLecteur: string): Promise<void> {
  await pool.query(
    `UPDATE message SET "luMessage" = 'Oui'
      WHERE "idConversation" = $1
        AND "idUser" <> $2
        AND "luMessage" = 'Non'`,
    [idConversation, idLecteur]
  );
}

export async function ajouterMessage(idConversation: string, idUser: string, contenu: string): Promise<string> {
  const r = await pool.query(
    `INSERT INTO message ("idConversation", "idUser", "contenuMessage")
     VALUES ($1, $2, $3)
     RETURNING "idMessage"`,
    [idConversation, idUser, contenu]
  );
  return r.rows[0].idMessage;
}