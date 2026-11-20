import { api } from './api';

export type ConversationListe = {
  idConversation: string;
  idCoop: string;
  nomCoop: string;
  nbNonLus: number;
  dernierMessage: string | null;
};

export type MessageAffiche = {
  idMessage: string;
  contenuMessage: string;
  dateEnvoi: string;
  luMessage: 'Oui' | 'Non';
  expediteur: string;
  estMoi: boolean;
};

export type DetailConversation = {
  idConversation: string;
  nomCoop: string;
  messages: MessageAffiche[];
};

export async function getConversations(idUser: string): Promise<ConversationListe[]> {
  const { data } = await api.get<ConversationListe[]>('/conversations', { params: { idUser } });
  return data;
}

export async function ouvrirConversation(idUser: string, idCoop?: string): Promise<{ idConversation: string }> {
  const { data } = await api.post('/conversations/ouvrir', { idUser, idCoop });
  return data;
}

export async function getMessages(idConversation: string, idUser: string): Promise<DetailConversation> {
  const { data } = await api.get<DetailConversation>(
    `/conversations/${idConversation}/messages`,
    { params: { idUser } }
  );
  return data;
}

export async function envoyerMessage(
  idConversation: string,
  idUser: string,
  contenu: string
): Promise<{ idMessage: string }> {
  const { data } = await api.post(`/conversations/${idConversation}/messages`, { idUser, contenu });
  return data;
}