import { trouverCooperative } from '../repositories/cooperative.repository';
import {
  listerMembres,
  trouverMembre,
  existeDoublonMembre,
  creerMembre,
  modifierMembre,
  desactiverMembre,
  type DonneesMembre,
} from '../repositories/membre.repository';
import { exigerPresident } from '../utils/acces';

export type Resultat<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string };

// "034 12 345 67" devient "0341234567"
function nettoyerTel(t: string | null | undefined): string | null {
  const propre = (t ?? '').replace(/\s/g, '');
  return propre === '' ? null : propre;
}

function valider(d: Partial<DonneesMembre>): string | null {
  if (!d.nomMembre?.trim() || !d.prenomMembre?.trim() || !d.fokotanyMembre?.trim()) {
    return 'Champs incomplets';
  }
  const tel = nettoyerTel(d.telephoneMembre);
  if (tel && !/^\+?\d{9,13}$/.test(tel)) return 'Téléphone invalide';
  return null;
}

// Liste des membres de la coopérative du président connecté
export async function lister(idUser: string): Promise<Resultat> {
  const a = await exigerPresident(idUser);
  if (!a.ok) return a;
  return { ok: true, status: 200, data: await listerMembres(a.idCoop) };
}

// Un membre, seulement s'il appartient à la coopérative du président
export async function trouver(idUser: string, idMembre: string): Promise<Resultat> {
  const a = await exigerPresident(idUser);
  if (!a.ok) return a;

  const membre = await trouverMembre(idMembre);
  if (!membre || membre.idCoop !== a.idCoop) {
    return { ok: false, status: 404, message: 'Membre introuvable' };
  }
  return { ok: true, status: 200, data: membre };
}

// La coopérative est imposée par le serveur : celle du président, pas celle envoyée
export async function ajouter(idUser: string, d: Partial<DonneesMembre>): Promise<Resultat> {
  const a = await exigerPresident(idUser);
  if (!a.ok) return a;

  const donnees: DonneesMembre = {
    nomMembre: d.nomMembre ?? '',
    prenomMembre: d.prenomMembre ?? '',
    telephoneMembre: nettoyerTel(d.telephoneMembre),
    fokotanyMembre: d.fokotanyMembre ?? '',
    idCoop: a.idCoop,
  };

  const erreur = valider(donnees);
  if (erreur) return { ok: false, status: 400, message: erreur };

  const coop = await trouverCooperative(a.idCoop);
  if (!coop) return { ok: false, status: 404, message: 'Coopérative introuvable' };
  if (coop.inscrite !== 'Oui') {
    return { ok: false, status: 400, message: "Cette coopérative n'est pas inscrite" };
  }

  if (await existeDoublonMembre(donnees.nomMembre, donnees.prenomMembre, a.idCoop)) {
    return { ok: false, status: 409, message: 'Ce membre existe déjà dans cette coopérative' };
  }

  const membre = await creerMembre(donnees);
  return { ok: true, status: 201, data: membre };
}

export async function modifier(
  idUser: string,
  idMembre: string,
  d: Partial<DonneesMembre>
): Promise<Resultat> {
  const a = await exigerPresident(idUser);
  if (!a.ok) return a;

  const existant = await trouverMembre(idMembre);
  if (!existant || existant.idCoop !== a.idCoop) {
    return { ok: false, status: 404, message: 'Membre introuvable' };
  }

  const donnees = {
    nomMembre: d.nomMembre ?? '',
    prenomMembre: d.prenomMembre ?? '',
    telephoneMembre: nettoyerTel(d.telephoneMembre),
    fokotanyMembre: d.fokotanyMembre ?? '',
  };

  const erreur = valider(donnees);
  if (erreur) return { ok: false, status: 400, message: erreur };

  if (await existeDoublonMembre(donnees.nomMembre, donnees.prenomMembre, a.idCoop, idMembre)) {
    return { ok: false, status: 409, message: 'Ce membre existe déjà dans cette coopérative' };
  }

  const membre = await modifierMembre(idMembre, donnees);
  return { ok: true, status: 200, data: membre };
}

export async function desactiver(idUser: string, idMembre: string): Promise<Resultat> {
  const a = await exigerPresident(idUser);
  if (!a.ok) return a;

  const existant = await trouverMembre(idMembre);
  if (!existant || existant.idCoop !== a.idCoop) {
    return { ok: false, status: 404, message: 'Membre introuvable' };
  }

  const membre = await desactiverMembre(idMembre);
  return { ok: true, status: 200, data: membre };
}