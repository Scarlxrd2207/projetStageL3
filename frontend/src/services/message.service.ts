import { api } from './api';
import { lireSession } from '../utils/session';

export type ConversationListe = {
  idConversation: string;
  idCoop: string;
  nomCoop: string;
  nbNonLus: number;
  dernierMessage: string | null;
};

export type FichierMessage = { nom: string; url: string };

export type MessageAffiche = {
  idMessage: string;
  contenuMessage: string;
  dateEnvoi: string;
  luMessage: 'Oui' | 'Non';
  expediteur: string;
  estMoi: boolean;
  fichier: FichierMessage | null;
};

export type DetailConversation = {
  idConversation: string;
  nomCoop: string;
  messages: MessageAffiche[];
};

function idUser(): string {
  return lireSession()?.idUser ?? '';
}

// Adresse complète d'un fichier : le serveur est à la racine de l'API
export function urlFichier(url: string): string {
  const base = String(import.meta.env.VITE_API_URL ?? '').replace(/\/api\/?$/, '') || 'http://localhost:3000';
  return `${base}${url}`;
}

export async function getConversations(): Promise<ConversationListe[]> {
  const { data } = await api.get<ConversationListe[]>('/conversations', {
    params: { idUser: idUser() },
  });
  return data;
}

// Responsable : idCoop obligatoire. Président : idCoop omis.
export async function ouvrirConversation(idCoop?: string): Promise<{ idConversation: string }> {
  const { data } = await api.post<{ idConversation: string }>('/conversations/ouvrir', {
    idUser: idUser(),
    idCoop,
  });
  return data;
}

export async function getMessages(idConversation: string): Promise<DetailConversation> {
  const { data } = await api.get<DetailConversation>(`/conversations/${idConversation}/messages`, {
    params: { idUser: idUser() },
  });
  return data;
}

export async function envoyerMessage(idConversation: string, contenu: string): Promise<void> {
  await api.post(`/conversations/${idConversation}/messages`, { idUser: idUser(), contenu });
}

export async function envoyerFichier(idConversation: string, fichier: File): Promise<void> {
  const formulaire = new FormData();
  formulaire.append('idUser', idUser());
  formulaire.append('fichier', fichier);
  await api.post(`/conversations/${idConversation}/fichiers`, formulaire);
}

// Téléchargement réel du fichier : le navigateur l'enregistre au lieu de l'ouvrir
export async function telechargerFichier(url: string, nom: string): Promise<void> {
  const reponse = await fetch(urlFichier(url));
  if (!reponse.ok) throw new Error('Téléchargement impossible');

  const blob = await reponse.blob();
  const adresse = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = adresse;
  lien.download = nom;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  URL.revokeObjectURL(adresse);
}