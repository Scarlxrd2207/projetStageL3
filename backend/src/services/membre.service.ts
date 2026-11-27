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
<<<<<<< HEAD
import { exigerPresident } from '../utils/acces';

export type Resultat<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string };
=======
import type { Membre } from '../models/membre.model';

export type Resultat = {
  ok: boolean;
  status: number;
  message?: string;
  membre?: Membre | null;
};
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

// "034 12 345 67" devient "0341234567"
function nettoyerTel(t: string | null | undefined): string | null {
  const propre = (t ?? '').replace(/\s/g, '');
  return propre === '' ? null : propre;
}

<<<<<<< HEAD
function valider(d: Partial<DonneesMembre>): string | null {
  if (!d.nomMembre?.trim() || !d.prenomMembre?.trim() || !d.fokotanyMembre?.trim()) {
    return 'Champs incomplets';
  }
=======
function valider(d: Partial<DonneesMembre>, avecCoop: boolean): string | null {
  if (!d.nomMembre?.trim() || !d.prenomMembre?.trim() || !d.fokotanyMembre?.trim()) {
    return 'Champs incomplets';
  }
  if (avecCoop && !d.idCoop) return 'Champs incomplets';
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  const tel = nettoyerTel(d.telephoneMembre);
  if (tel && !/^\+?\d{9,13}$/.test(tel)) return 'Téléphone invalide';
  return null;
}

<<<<<<< HEAD
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
=======
export async function lister(idCoop?: string) {
  return listerMembres(idCoop);
}

export async function trouver(idMembre: string) {
  return trouverMembre(idMembre);
}

export async function ajouter(d: DonneesMembre): Promise<Resultat> {
  const donnees: DonneesMembre = { ...d, telephoneMembre: nettoyerTel(d.telephoneMembre) };

  const erreur = valider(donnees, true);
  if (erreur) return { ok: false, status: 400, message: erreur };

  const coop = await trouverCooperative(donnees.idCoop);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  if (!coop) return { ok: false, status: 404, message: 'Coopérative introuvable' };
  if (coop.inscrite !== 'Oui') {
    return { ok: false, status: 400, message: "Cette coopérative n'est pas inscrite" };
  }

<<<<<<< HEAD
  if (await existeDoublonMembre(donnees.nomMembre, donnees.prenomMembre, a.idCoop)) {
=======
  if (await existeDoublonMembre(donnees.nomMembre, donnees.prenomMembre, donnees.idCoop)) {
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
    return { ok: false, status: 409, message: 'Ce membre existe déjà dans cette coopérative' };
  }

  const membre = await creerMembre(donnees);
<<<<<<< HEAD
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
=======
  return { ok: true, status: 201, membre };
}

export async function modifier(
  idMembre: string,
  d: Omit<DonneesMembre, 'idCoop'>
): Promise<Resultat> {
  const existant = await trouverMembre(idMembre);
  if (!existant) return { ok: false, status: 404, message: 'Membre introuvable' };

  const donnees = { ...d, telephoneMembre: nettoyerTel(d.telephoneMembre) };

  const erreur = valider(donnees, false);
  if (erreur) return { ok: false, status: 400, message: erreur };

  if (await existeDoublonMembre(donnees.nomMembre, donnees.prenomMembre, existant.idCoop, idMembre)) {
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
    return { ok: false, status: 409, message: 'Ce membre existe déjà dans cette coopérative' };
  }

  const membre = await modifierMembre(idMembre, donnees);
<<<<<<< HEAD
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
=======
  return { ok: true, status: 200, membre };
}

export async function desactiver(idMembre: string): Promise<Resultat> {
  if (!(await trouverMembre(idMembre))) {
    return { ok: false, status: 404, message: 'Membre introuvable' };
  }
  const membre = await desactiverMembre(idMembre);
  return { ok: true, status: 200, membre };
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
}