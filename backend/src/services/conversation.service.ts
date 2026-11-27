import { trouverCooperative } from '../repositories/cooperative.repository';
<<<<<<< HEAD
import { exigerUtilisateur } from '../utils/acces';
import {
=======
import {
  trouverUtilisateur,
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  trouverResponsable,
  trouverConversation,
  trouverOuCreerConversation,
  listerConversations,
  listerMessages,
  marquerLus,
  ajouterMessage,
<<<<<<< HEAD
  type ConversationListe,
  type ConversationMini,
  type MessageLigne,
} from '../repositories/conversation.repository';
import { notifierConversation } from '../realtime';
=======
} from '../repositories/conversation.repository';
import type {
  Utilisateur,
  Conversation,
  ConversationListe,
  DetailConversation,
} from '../models/conversation.model';
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

export type Resultat<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string };

<<<<<<< HEAD
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
=======
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
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
export async function ouvrir(
  idUser: string,
  idCoopDemandee: string | undefined
): Promise<Resultat<{ idConversation: string }>> {
<<<<<<< HEAD
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
=======
  const l = await lecteur(idUser);
  if (!l.ok) return l;
  const u = l.data;

  const idCoop = u.role === 'PRESIDENT' ? (u.idCoop ?? undefined) : idCoopDemandee;
  if (!idCoop) return { ok: false, status: 400, message: 'Coopérative obligatoire' };
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

  const coop = await trouverCooperative(idCoop);
  if (!coop) return { ok: false, status: 404, message: 'Coopérative introuvable' };

<<<<<<< HEAD
=======
  let idResponsable = u.idUser;
  if (u.role === 'PRESIDENT') {
    const resp = await trouverResponsable();
    if (!resp) return { ok: false, status: 500, message: 'Aucun responsable SOAM actif' };
    idResponsable = resp.idUser;
  }

>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  const idConversation = await trouverOuCreerConversation(idCoop, idResponsable);
  return { ok: true, status: 200, data: { idConversation } };
}

<<<<<<< HEAD
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
=======
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
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

  return {
    ok: true,
    status: 200,
<<<<<<< HEAD
    data: { idConversation, nomCoop: conv.nomCoop, messages: liste.map(rendre) },
=======
    data: { idConversation, nomCoop: conv.nomCoop, messages: liste },
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  };
}

export async function envoyer(
  idConversation: string,
  idUser: string,
  contenu: unknown
): Promise<Resultat<{ idMessage: string }>> {
<<<<<<< HEAD
  const s = await exigerUtilisateur(idUser);
  if (!s.ok) return s;
=======
  const l = await lecteur(idUser);
  if (!l.ok) return l;
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

  if (typeof contenu !== 'string' || contenu.trim() === '') {
    return { ok: false, status: 400, message: 'Le message est vide' };
  }
  const texte = contenu.trim();
  if (texte.length > MAX_CARACTERES) {
    return { ok: false, status: 400, message: `Message trop long (${MAX_CARACTERES} caractères maximum)` };
  }

  const conv = await trouverConversation(idConversation);
<<<<<<< HEAD
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
=======
  if (!conv || !peutVoir(l.data, conv)) {
    return { ok: false, status: 404, message: 'Conversation introuvable' };
  }

  const idMessage = await ajouterMessage(idConversation, idUser, texte);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return { ok: true, status: 201, data: { idMessage } };
}