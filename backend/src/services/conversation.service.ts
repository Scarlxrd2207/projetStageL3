import { trouverCooperative } from '../repositories/cooperative.repository';
import {
  trouverUtilisateur,
  trouverResponsable,
  trouverConversation,
  trouverOuCreerConversation,
  listerConversations,
  listerMessages,
  marquerLus,
  ajouterMessage,
} from '../repositories/conversation.repository';
import type {
  Utilisateur,
  Conversation,
  ConversationListe,
  DetailConversation,
} from '../models/conversation.model';

export type Resultat<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string };

const MAX_CARACTERES = 500;

// Vérifie que l'utilisateur existe et est actif
async function lecteur(idUser: string): Promise<Resultat<Utilisateur>> {
  if (!idUser) {
    return { ok: false, status: 401, message: 'Utilisateur non identifié, reconnectez-vous' };
  }
  const u = await trouverUtilisateur(idUser);
  if (!u || u.actifUtilisateur !== 'Oui') {
    return { ok: false, status: 401, message: 'Compte introuvable ou désactivé' };
  }
  return { ok: true, status: 200, data: u };
}

// Responsable : toutes les conversations. Président : seulement celle de sa coopérative.
function peutVoir(u: Utilisateur, conv: Conversation): boolean {
  return u.role === 'RESPONSABLE' || (u.role === 'PRESIDENT' && u.idCoop === conv.idCoop);
}

// Liste réservée au responsable
export async function lister(idUser: string): Promise<Resultat<ConversationListe[]>> {
  const l = await lecteur(idUser);
  if (!l.ok) return l;
  if (l.data.role !== 'RESPONSABLE') {
    return { ok: false, status: 403, message: 'Accès réservé au responsable SOAM' };
  }
  return { ok: true, status: 200, data: await listerConversations(idUser) };
}

// Ouvre (et crée si besoin) la conversation d'une coopérative.
// Le président ne peut ouvrir que la sienne : l'identifiant envoyé est ignoré.
export async function ouvrir(
  idUser: string,
  idCoopDemandee: string | undefined
): Promise<Resultat<{ idConversation: string }>> {
  const l = await lecteur(idUser);
  if (!l.ok) return l;
  const u = l.data;

  const idCoop = u.role === 'PRESIDENT' ? (u.idCoop ?? undefined) : idCoopDemandee;
  if (!idCoop) return { ok: false, status: 400, message: 'Coopérative obligatoire' };

  const coop = await trouverCooperative(idCoop);
  if (!coop) return { ok: false, status: 404, message: 'Coopérative introuvable' };

  let idResponsable = u.idUser;
  if (u.role === 'PRESIDENT') {
    const resp = await trouverResponsable();
    if (!resp) return { ok: false, status: 500, message: 'Aucun responsable SOAM actif' };
    idResponsable = resp.idUser;
  }

  const idConversation = await trouverOuCreerConversation(idCoop, idResponsable);
  return { ok: true, status: 200, data: { idConversation } };
}

// Messages d'une conversation, puis marquage comme lus
export async function messages(
  idConversation: string,
  idUser: string
): Promise<Resultat<DetailConversation>> {
  const l = await lecteur(idUser);
  if (!l.ok) return l;

  const conv = await trouverConversation(idConversation);
  if (!conv || !peutVoir(l.data, conv)) {
    return { ok: false, status: 404, message: 'Conversation introuvable' };
  }

  const liste = await listerMessages(idConversation, idUser);
  await marquerLus(idConversation, idUser);

  return {
    ok: true,
    status: 200,
    data: { idConversation, nomCoop: conv.nomCoop, messages: liste },
  };
}

export async function envoyer(
  idConversation: string,
  idUser: string,
  contenu: unknown
): Promise<Resultat<{ idMessage: string }>> {
  const l = await lecteur(idUser);
  if (!l.ok) return l;

  if (typeof contenu !== 'string' || contenu.trim() === '') {
    return { ok: false, status: 400, message: 'Le message est vide' };
  }
  const texte = contenu.trim();
  if (texte.length > MAX_CARACTERES) {
    return { ok: false, status: 400, message: `Message trop long (${MAX_CARACTERES} caractères maximum)` };
  }

  const conv = await trouverConversation(idConversation);
  if (!conv || !peutVoir(l.data, conv)) {
    return { ok: false, status: 404, message: 'Conversation introuvable' };
  }

  const idMessage = await ajouterMessage(idConversation, idUser, texte);
  return { ok: true, status: 201, data: { idMessage } };
}