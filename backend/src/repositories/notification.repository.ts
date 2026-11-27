import { pool } from '../config/db';

export type NotificationBrute = {
  id: string;
  type: 'MESSAGE' | 'COMMANDE' | 'LIVRAISON';
  titre: string;
  contenu: string;
  lien: string;
  date: string;
};

// Compteurs affichés en rouge dans la barre latérale
export type Compteurs = {
  commandes: number;
  messages: number;
  livraisons: number;
};

// Un fichier est annoncé, pas affiché
function apercu(contenu: string): string {
  return contenu.startsWith('FICHIER|') ? 'Fichier envoyé' : contenu.slice(0, 80);
}

// ---------- Liste des notifications (cloche) ----------

export async function notificationsPresident(idCoop: string, idUser: string): Promise<NotificationBrute[]> {
  const msgs = await pool.query(
    `SELECT m."idMessage", cv."idConversation", m."contenuMessage",
            to_char(m."dateEnvoi", 'YYYY-MM-DD"T"HH24:MI:SS') AS date
       FROM message m
       JOIN conversation cv ON cv."idConversation" = m."idConversation"
      WHERE cv."idCoop" = $1 AND m."luMessage" = 'Non' AND m."idUser" <> $2
      ORDER BY m."dateEnvoi" DESC LIMIT 20`,
    [idCoop, idUser]
  );
  const aTraiter = await pool.query(
    `SELECT co."idCommande", to_char(co."dateCommande", 'YYYY-MM-DD"T"HH24:MI:SS') AS date
       FROM commande co
      WHERE co."idCoop" = $1 AND co."statutCommande" = 'EN_ATTENTE'
      ORDER BY co."dateCommande" DESC LIMIT 20`,
    [idCoop]
  );
  const livrees = await pool.query(
    `SELECT co."idCommande", co."dateLivraison"::text || 'T00:00:00' AS date
       FROM commande co
      WHERE co."idCoop" = $1 AND co."statutCommande" = 'LIVREE'
        AND co."dateLivraison" >= CURRENT_DATE - 30
      ORDER BY co."dateLivraison" DESC LIMIT 10`,
    [idCoop]
  );

  return [
    ...msgs.rows.map((r): NotificationBrute => ({
      id: `m-${r.idMessage}`, type: 'MESSAGE', titre: 'Message du responsable SOAM',
      contenu: apercu(r.contenuMessage), lien: `/messages/${r.idConversation}`, date: r.date,
    })),
    ...aTraiter.rows.map((r): NotificationBrute => ({
      id: `c-${r.idCommande}`, type: 'COMMANDE', titre: 'Nouvelle commande à traiter',
      contenu: r.idCommande, lien: `/commandes/${r.idCommande}`, date: r.date,
    })),
    ...livrees.rows.map((r): NotificationBrute => ({
      id: `l-${r.idCommande}`, type: 'LIVRAISON', titre: 'Livraison confirmée',
      contenu: r.idCommande, lien: `/commandes/${r.idCommande}`, date: r.date,
    })),
  ];
}

export async function notificationsResponsable(idUser: string): Promise<NotificationBrute[]> {
  const msgs = await pool.query(
    `SELECT m."idMessage", cv."idConversation", c."nomCoop", m."contenuMessage",
            to_char(m."dateEnvoi", 'YYYY-MM-DD"T"HH24:MI:SS') AS date
       FROM message m
       JOIN conversation cv ON cv."idConversation" = m."idConversation"
       JOIN cooperative c ON c."idCoop" = cv."idCoop"
      WHERE cv."idUser" = $1 AND m."luMessage" = 'Non' AND m."idUser" <> $1
      ORDER BY m."dateEnvoi" DESC LIMIT 20`,
    [idUser]
  );
  const aConfirmer = await pool.query(
    `SELECT co."idCommande", to_char(co."dateAcceptation", 'YYYY-MM-DD"T"HH24:MI:SS') AS date
       FROM commande co
      WHERE co."statutCommande" = 'EN_COURS_LIVRAISON'
      ORDER BY co."dateAcceptation" DESC NULLS LAST LIMIT 20`
  );
  const refusees = await pool.query(
    `SELECT co."idCommande", to_char(co."dateCommande", 'YYYY-MM-DD"T"HH24:MI:SS') AS date
       FROM commande co
      WHERE co."statutCommande" = 'REFUSEE' AND co."dateCommande" >= CURRENT_DATE - 30
      ORDER BY co."dateCommande" DESC LIMIT 10`
  );

  return [
    ...msgs.rows.map((r): NotificationBrute => ({
      id: `m-${r.idMessage}`, type: 'MESSAGE', titre: `Message de ${r.nomCoop}`,
      contenu: apercu(r.contenuMessage), lien: `/messages/${r.idConversation}`, date: r.date,
    })),
    ...aConfirmer.rows.map((r): NotificationBrute => ({
      id: `l-${r.idCommande}`, type: 'LIVRAISON', titre: 'Livraison à confirmer',
      contenu: r.idCommande, lien: '/livraisons', date: r.date ?? '1970-01-01T00:00:00',
    })),
    ...refusees.rows.map((r): NotificationBrute => ({
      id: `c-${r.idCommande}`, type: 'COMMANDE', titre: 'Commande refusée',
      contenu: r.idCommande, lien: `/commandes/${r.idCommande}`, date: r.date,
    })),
  ];
}

// ---------- Compteurs (pastilles rouges) ----------

// Président : ce qui attend sa réponse dans sa coopérative
export async function compteursPresident(idCoop: string, idUser: string): Promise<Compteurs> {
  const r = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM commande WHERE "idCoop" = $1 AND "statutCommande" = 'EN_ATTENTE') AS commandes,
       (SELECT COUNT(*)::int FROM message m
          JOIN conversation cv ON cv."idConversation" = m."idConversation"
         WHERE cv."idCoop" = $1 AND m."luMessage" = 'Non' AND m."idUser" <> $2) AS messages,
       (SELECT COUNT(*)::int FROM commande WHERE "idCoop" = $1 AND "statutCommande" = 'EN_COURS_LIVRAISON') AS livraisons`,
    [idCoop, idUser]
  );
  return r.rows[0];
}

// Responsable : réponses des présidents des 7 derniers jours, messages non lus, livraisons à confirmer
export async function compteursResponsable(idUser: string): Promise<Compteurs> {
  const r = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM commande
         WHERE "statutCommande" IN ('EN_COURS_LIVRAISON', 'REFUSEE')
           AND COALESCE("dateAcceptation", "dateCommande") >= NOW() - INTERVAL '7 days') AS commandes,
       (SELECT COUNT(*)::int FROM message m
          JOIN conversation cv ON cv."idConversation" = m."idConversation"
         WHERE cv."idUser" = $1 AND m."luMessage" = 'Non' AND m."idUser" <> $1) AS messages,
       (SELECT COUNT(*)::int FROM commande WHERE "statutCommande" = 'EN_COURS_LIVRAISON') AS livraisons`,
    [idUser]
  );
  return r.rows[0];
}