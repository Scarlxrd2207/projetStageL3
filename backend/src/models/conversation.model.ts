export interface Utilisateur {
  idUser: string;
  role: 'RESPONSABLE' | 'PRESIDENT';
  idCoop: string | null;
  actifUtilisateur: 'Oui' | 'Non';
}

export interface Conversation {
  idConversation: string;
  idCoop: string;
  nomCoop: string;
  idUser: string;
}

export interface ConversationListe {
  idConversation: string;
  idCoop: string;
  nomCoop: string;
  nbNonLus: number;
  dernierMessage: string | null;
}

export interface MessageAffiche {
  idMessage: string;
  contenuMessage: string;
  dateEnvoi: string;
  luMessage: 'Oui' | 'Non';
  expediteur: string;
  estMoi: boolean;
}

export interface DetailConversation {
  idConversation: string;
  nomCoop: string;
  messages: MessageAffiche[];
}