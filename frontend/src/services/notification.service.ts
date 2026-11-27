import { api } from './api';
import { lireSession } from '../utils/session';

export type NotificationItem = {
  id: string;
  type: 'MESSAGE' | 'COMMANDE' | 'LIVRAISON' | 'STOCK';
  titre: string;
  contenu: string;
  lien: string;
  date: string;
};

// Compteurs des pastilles rouges de la barre latérale
export type Compteurs = {
  commandes: number;
  messages: number;
  livraisons: number;
};

function idUser(): string {
  return lireSession()?.idUser ?? '';
}

// Liste des notifications (cloche)
export async function getNotifications(): Promise<{
  notifications: NotificationItem[];
  nbNonLues: number;
}> {
  const { data } = await api.get('/notifications', { params: { idUser: idUser() } });
  return data;
}

// Compteurs des pastilles de la barre latérale
export async function getCompteurs(): Promise<Compteurs> {
  const { data } = await api.get<Compteurs>('/notifications/compteurs', {
    params: { idUser: idUser() },
  });
  return data;
}