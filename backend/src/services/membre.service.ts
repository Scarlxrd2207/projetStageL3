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
import type { Membre } from '../models/membre.model';

export type Resultat = {
  ok: boolean;
  status: number;
  message?: string;
  membre?: Membre | null;
};

// "034 12 345 67" devient "0341234567"
function nettoyerTel(t: string | null | undefined): string | null {
  const propre = (t ?? '').replace(/\s/g, '');
  return propre === '' ? null : propre;
}

function valider(d: Partial<DonneesMembre>, avecCoop: boolean): string | null {
  if (!d.nomMembre?.trim() || !d.prenomMembre?.trim() || !d.fokotanyMembre?.trim()) {
    return 'Champs incomplets';
  }
  if (avecCoop && !d.idCoop) return 'Champs incomplets';
  const tel = nettoyerTel(d.telephoneMembre);
  if (tel && !/^\+?\d{9,13}$/.test(tel)) return 'Téléphone invalide';
  return null;
}

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
  if (!coop) return { ok: false, status: 404, message: 'Coopérative introuvable' };
  if (coop.inscrite !== 'Oui') {
    return { ok: false, status: 400, message: "Cette coopérative n'est pas inscrite" };
  }

  if (await existeDoublonMembre(donnees.nomMembre, donnees.prenomMembre, donnees.idCoop)) {
    return { ok: false, status: 409, message: 'Ce membre existe déjà dans cette coopérative' };
  }

  const membre = await creerMembre(donnees);
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
    return { ok: false, status: 409, message: 'Ce membre existe déjà dans cette coopérative' };
  }

  const membre = await modifierMembre(idMembre, donnees);
  return { ok: true, status: 200, membre };
}

export async function desactiver(idMembre: string): Promise<Resultat> {
  if (!(await trouverMembre(idMembre))) {
    return { ok: false, status: 404, message: 'Membre introuvable' };
  }
  const membre = await desactiverMembre(idMembre);
  return { ok: true, status: 200, membre };
}