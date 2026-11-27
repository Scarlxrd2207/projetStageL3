import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { pool } from './config/db';

// Événement envoyé au navigateur : il dit quoi rafraîchir, ou quoi afficher
export type Maj = {
  type: 'commande' | 'message' | 'livraison' | 'paiement' | 'stock';
  idCoop?: string;
  idCommande?: string;
  idConversation?: string;
  message?: string;
};

export type EnLigne = {
  idUser: string;
  email: string;
  idCoop: string | null;
  nomCoop: string | null;
};

let io: Server | null = null;

// Nombre de connexions ouvertes par utilisateur (un compte peut avoir plusieurs onglets)
const connexions = new Map<string, number>();

export function initTempsReel(serveur: HttpServer): void {
  io = new Server(serveur, {
    cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] },
  });

  // Chaque connexion est vérifiée dans la base avant d'être acceptée
  io.use(async (socket, next) => {
    try {
      const idUser = String(socket.handshake.auth?.idUser ?? '');
      const r = await pool.query(
        `SELECT "idUser", email, role, "idCoop", "actifUtilisateur"
           FROM utilisateur WHERE "idUser" = $1`,
        [idUser]
      );
      const u = r.rows[0];
      if (!u || u.actifUtilisateur !== 'Oui') return next(new Error('Non autorisé'));
      socket.data.utilisateur = u;
      next();
    } catch {
      next(new Error('Erreur de connexion'));
    }
  });

  io.on('connection', (socket) => {
    const u = socket.data.utilisateur;

    socket.join(`user:${u.idUser}`);
    if (u.role === 'RESPONSABLE') socket.join('responsables');
    if (u.idCoop) socket.join(`coop:${u.idCoop}`);

    connexions.set(u.idUser, (connexions.get(u.idUser) ?? 0) + 1);
    diffuserPresence();

    socket.on('disconnect', () => {
      const restantes = (connexions.get(u.idUser) ?? 1) - 1;
      if (restantes <= 0) connexions.delete(u.idUser);
      else connexions.set(u.idUser, restantes);
      diffuserPresence();
    });
  });
}

// Présidents actuellement connectés (pour le point vert)
export async function presidentsEnLigne(): Promise<EnLigne[]> {
  const ids = [...connexions.keys()];
  if (ids.length === 0) return [];
  const r = await pool.query(
    `SELECT u."idUser", u.email, u."idCoop", c."nomCoop"
       FROM utilisateur u
       LEFT JOIN cooperative c ON c."idCoop" = u."idCoop"
      WHERE u.role = 'PRESIDENT' AND u."idUser" = ANY($1::text[])`,
    [ids]
  );
  return r.rows;
}

async function diffuserPresence(): Promise<void> {
  if (!io) return;
  io.emit('presence', await presidentsEnLigne());
}

// Destinataires
export function notifierResponsables(p: Maj): void {
  io?.to('responsables').emit('maj', p);
}

export function notifierCoop(idCoop: string, p: Maj): void {
  io?.to(`coop:${idCoop}`).emit('maj', p);
}

// Une commande ou une livraison concerne les deux côtés
export function notifierCommande(idCoop: string, p: Maj): void {
  notifierResponsables(p);
  notifierCoop(idCoop, p);
}

// Un message concerne aussi les deux côtés
export function notifierConversation(idCoop: string, p: Maj): void {
  notifierResponsables(p);
  notifierCoop(idCoop, p);
}