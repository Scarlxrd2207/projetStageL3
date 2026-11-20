import {
  listerCooperatives,
  listerLieux,
  trouverCooperative,
  existeDoublon,
  creerCooperative,
  modifierCooperative,
  supprimerCooperative,
  type FiltresCooperative,
  type DonneesCooperative,
} from '../repositories/cooperative.repository';
import { NOMS_DISTRICTS, communesDe } from '../utils/localites';

const CHAMPS_OBLIGATOIRES = [
  'nomCoop', 'districtCoop', 'communeCoop', 'fokotanyCoop', 'dateAdhesion',
] as const;

// Renvoie un message d'erreur, ou null si les données sont correctes
function valider(d: Partial<DonneesCooperative>): string | null {
  for (const champ of CHAMPS_OBLIGATOIRES) {
    const valeur = d[champ];
    if (!valeur || !String(valeur).trim()) return 'Champs incomplets';
  }
  if (!NOMS_DISTRICTS.includes(d.districtCoop!)) {
    return 'District non reconnu';
  }
  if (!communesDe(d.districtCoop!).includes(d.communeCoop!)) {
    return "Cette commune n'appartient pas au district choisi";
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.dateAdhesion!)) {
    return 'Date invalide (format AAAA-MM-JJ attendu)';
  }
  return null;
}

export async function lister(filtres: FiltresCooperative) {
  return listerCooperatives(filtres);
}

export async function lieux() {
  return listerLieux();
}

export async function trouver(idCoop: string) {
  return trouverCooperative(idCoop);
}

export async function inscrire(d: DonneesCooperative) {
  const erreur = valider(d);
  if (erreur) return { ok: false, message: erreur, status: 400 };

  if (await existeDoublon(d)) {
    return { ok: false, message: 'Cette coopérative existe déjà dans ce fokotany', status: 409 };
  }

  const cooperative = await creerCooperative(d);
  return { ok: true, cooperative, status: 201 };
}

export async function modifier(idCoop: string, d: DonneesCooperative) {
  const erreur = valider(d);
  if (erreur) return { ok: false, message: erreur, status: 400 };

  if (!(await trouverCooperative(idCoop))) {
    return { ok: false, message: 'Coopérative introuvable', status: 404 };
  }
  if (await existeDoublon(d, idCoop)) {
    return { ok: false, message: 'Cette coopérative existe déjà dans ce fokotany', status: 409 };
  }

  const cooperative = await modifierCooperative(idCoop, d);
  return { ok: true, cooperative, status: 200 };
}

export async function supprimer(idCoop: string) {
  if (!(await trouverCooperative(idCoop))) {
    return { ok: false, message: 'Coopérative introuvable', status: 404 };
  }
  try {
    await supprimerCooperative(idCoop);
    return { ok: true, status: 204 };
  } catch (err: any) {
    // 23503 : la coopérative a des membres ou des commandes
    if (err.code === '23503') {
      return {
        ok: false,
        message: 'Suppression impossible : la coopérative a des membres ou des commandes. Désactivez-la plutôt.',
        status: 409,
      };
    }
    throw err;
  }
}