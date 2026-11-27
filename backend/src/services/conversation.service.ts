import { trouverCooperative } from '../repositories/cooperative.repository';
import { exigerUtilisateur } from '../utils/acces';
import {
  trouverResponsable,
  trouverConversation,
  trouverOuCreerConversation,
  listerConversations,
  listerMessages,
  marquerLus,
  ajouterMessage,
  type ConversationListe,
  type ConversationMini,
  type MessageLigne,
} from '../repositories/conversation.repository';
import { notifierConversation } from '../realtime';

export type Resultat<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string };

export type FichierMessage = { nom: string; url: string };
export type MessageRendu = MessageLigne & { fichier: FichierMessage | null };

const MAX_CARACTERES = 500;

type Session = { idUser: string; role: 'RESPONSABLE' | 'PRESIDENT'; idCoop: string | null };

// Responsable : toutes les conversations. Président : seulement celle de sa coopérative.
function peutVoir(s: Session, conv: ConversationMini): boolean {
  return s.role === 'RESPONSABLE' || (s.role === 'PRESIDENT' && s.idCoop === conv.idCoop);
}

// Les fichiers sont stockés sous la forme "FICHIER|nom|url"
function rendre(m: MessageLigne): MessageRendu {
  if (m.contenuMessage.startsWith('FICHIER|')) {
    const [, nom, url] = m.contenuMessage.split('|');
    return { ...m, contenuMessage: '', fichier: { nom, url } };
  }
  return { ...m, fichier: null };
}

export async function lister(idUser: string): Promise<Resultat<ConversationListe[]>> {
  const s = await exigerUtilisateur(idUser);
  if (!s.ok) return s;

  const liste = await listerConversations(s.idUser);
  const filtree = s.role === 'PRESIDENT' ? liste.filter((c) => c.idCoop === s.idCoop) : liste;
  return { ok: true, status: 200, data: filtree };
}

// Responsable : ouvre (ou crée) la conversation avec la coopérative choisie.
// Président : ouvre la conversation avec le responsable SOAM.
export async function ouvrir(
  idUser: string,
  idCoopDemandee: string | undefined
): Promise<Resultat<{ idConversation: string }>> {
  const s = await exigerUtilisateur(idUser);
  if (!s.ok) return s;

  let idCoop: string | undefined;
  let idResponsable: string;

  if (s.role === 'PRESIDENT') {
    if (!s.idCoop) return { ok: false, status: 403, message: 'Aucune coopérative rattachée à ce compte' };
    idCoop = s.idCoop;
    const resp = await trouverResponsable();
    if (!resp) return { ok: false, status: 500, message: 'Aucun responsable SOAM actif' };
    idResponsable = resp.idUser;
  } else {
    idCoop = idCoopDemandee;
    if (!idCoop) return { ok: false, status: 400, message: 'Choisissez une coopérative' };
    idResponsable = s.idUser;
  }

  const coop = await trouverCooperative(idCoop);
  if (!coop) return { ok: false, status: 404, message: 'Coopérative introuvable' };

  const idConversation = await trouverOuCreerConversation(idCoop, idResponsable);
  return { ok: true, status: 200, data: { idConversation } };
}

export async function messages(
  idConversation: string,
  idUser: string
): Promise<Resultat<{ idConversation: string; nomCoop: string; messages: MessageRendu[] }>> {
  const s = await exigerUtilisateur(idUser);
  if (!s.ok) return s;

  const conv = await trouverConversation(idConversation);
  if (!conv || !peutVoir(s, conv)) {
    return { ok: false, status: 404, message: 'Conversation introuvable' };
  }

  const liste = await listerMessages(idConversation, s.idUser);
  await marquerLus(idConversation, s.idUser);

  return {
    ok: true,
    status: 200,
    data: { idConversation, nomCoop: conv.nomCoop, messages: liste.map(rendre) },
  };
}

export async function envoyer(
  idConversation: string,
  idUser: string,
  contenu: unknown
): Promise<Resultat<{ idMessage: string }>> {
  const s = await exigerUtilisateur(idUser);
  if (!s.ok) return s;

  if (typeof contenu !== 'string' || contenu.trim() === '') {
    return { ok: false, status: 400, message: 'Le message est vide' };
  }
  const texte = contenu.trim();
  if (texte.length > MAX_CARACTERES) {
    return { ok: false, status: 400, message: `Message trop long (${MAX_CARACTERES} caractères maximum)` };
  }

  const conv = await trouverConversation(idConversation);
  if (!conv || !peutVoir(s, conv)) {
    return { ok: false, status: 404, message: 'Conversation introuvable' };
  }

  const idMessage = await ajouterMessage(idConversation, s.idUser, texte);
  notifierConversation(conv.idCoop, { type: 'message', idCoop: conv.idCoop, idConversation });
  return { ok: true, status: 201, data: { idMessage } };
}

export async function envoyerFichier(
  idConversation: string,
  idUser: string,
  fichier: { originalname: string; filename: string } | undefined
): Promise<Resultat<{ idMessage: string }>> {
  const s = await exigerUtilisateur(idUser);
  if (!s.ok) return s;

  if (!fichier) return { ok: false, status: 400, message: 'Aucun fichier reçu' };

  const conv = await trouverConversation(idConversation);
  if (!conv || !peutVoir(s, conv)) {
    return { ok: false, status: 404, message: 'Conversation introuvable' };
  }

  const nom = fichier.originalname.replace(/[|\r\n]/g, '_').slice(0, 100);
  const url = `/uploads/messages/${fichier.filename}`;
  const idMessage = await ajouterMessage(idConversation, s.idUser, `FICHIER|${nom}|${url}`);
  notifierConversation(conv.idCoop, { type: 'message', idCoop: conv.idCoop, idConversation });
  return { ok: true, status: 201, data: { idMessage } };
}