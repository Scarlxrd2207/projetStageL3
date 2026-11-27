import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { lireSession } from '../utils/session';

// Événement "maj" : indique quoi rafraîchir, ou quoi afficher
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

let socket: Socket | null = null;
let connecteA = '';

// Une connexion par compte : recréée si le compte change dans l'onglet
export function getSocket(): Socket | null {
  const session = lireSession();
  if (!session) return null;

  if (socket && connecteA === session.idUser) return socket;

  socket?.disconnect();
  const base =
    String(import.meta.env.VITE_API_URL ?? '').replace(/\/api\/?$/, '') || 'http://localhost:3000';

  socket = io(base, {
    auth: { idUser: session.idUser },
    transports: ['websocket', 'polling'],
    reconnection: true,
  });
  connecteA = session.idUser;
  return socket;
}

export function deconnecterTempsReel(): void {
  socket?.disconnect();
  socket = null;
  connecteA = '';
}