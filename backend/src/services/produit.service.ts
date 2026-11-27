<<<<<<< HEAD
import { exigerUtilisateur, exigerResponsable } from '../utils/acces';
import {
  listerProduits,
  trouverProduit,
  creerProduit,
  modifierProduit,
  supprimerProduit,
  type DonneesProduit,
} from '../repositories/produit.repository';

export type Resultat<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string };

// Contrôle commun : nom obligatoire, prix numérique positif ou nul.
// La valeur peut arriver en nombre ou en texte (virgule acceptée).
function valider(d: { nomProduit?: unknown; prixUnitaire?: unknown }): {
  donnees?: DonneesProduit;
  erreur?: string;
} {
  const nom = typeof d.nomProduit === 'string' ? d.nomProduit.trim() : '';
  if (nom === '') return { erreur: 'Le nom du produit est obligatoire' };

  if (d.prixUnitaire === undefined || d.prixUnitaire === null) {
    return { erreur: 'Le prix unitaire est obligatoire' };
  }

  const texteBrut = String(d.prixUnitaire).trim().replace(',', '.');
  if (texteBrut === '') return { erreur: 'Le prix unitaire est obligatoire' };

  const prix = Number(texteBrut);
  if (!Number.isFinite(prix) || prix < 0) {
    return { erreur: 'Le prix unitaire doit être un nombre positif ou nul' };
  }

  return { donnees: { nomProduit: nom, prixUnitaire: prix } };
}

// Lecture : tout utilisateur connecté (le président voit les prix pour la facturation)
export async function lister(idUser: string): Promise<Resultat> {
  const a = await exigerUtilisateur(idUser);
  if (!a.ok) return a;
  return { ok: true, status: 200, data: await listerProduits() };
}

export async function trouver(idUser: string, idProduit: string): Promise<Resultat> {
  const a = await exigerUtilisateur(idUser);
  if (!a.ok) return a;

  const produit = await trouverProduit(idProduit);
  if (!produit) return { ok: false, status: 404, message: 'Produit introuvable' };
  return { ok: true, status: 200, data: produit };
}

// Écriture : responsable SOAM uniquement
export async function ajouter(idUser: string, d: Record<string, unknown>): Promise<Resultat> {
  const a = await exigerResponsable(idUser);
  if (!a.ok) return a;

  const v = valider(d);
  if (!v.donnees) return { ok: false, status: 400, message: v.erreur ?? 'Données invalides' };

  const produit = await creerProduit(v.donnees);
  return { ok: true, status: 201, data: produit };
}

export async function modifier(
  idUser: string,
  idProduit: string,
  d: Record<string, unknown>
): Promise<Resultat> {
  const a = await exigerResponsable(idUser);
  if (!a.ok) return a;

  const v = valider(d);
  if (!v.donnees) return { ok: false, status: 400, message: v.erreur ?? 'Données invalides' };

  const produit = await modifierProduit(idProduit, v.donnees);
  if (!produit) return { ok: false, status: 404, message: 'Produit introuvable' };
  return { ok: true, status: 200, data: produit };
}

export async function supprimer(idUser: string, idProduit: string): Promise<Resultat> {
  const a = await exigerResponsable(idUser);
  if (!a.ok) return a;

  try {
    const supprime = await supprimerProduit(idProduit);
    if (!supprime) return { ok: false, status: 404, message: 'Produit introuvable' };
    return { ok: true, status: 204, data: null };
  } catch (err: any) {
    // 23503 : le produit est utilisé dans une récolte ou dans le stock
=======
import {
  listerProduits,
  trouverProduit,
  nomExiste,
  creerProduit,
  modifierProduit,
  supprimerProduit,
} from '../repositories/produit.repository';
import type { Produit } from '../models/produit.model';

export type Resultat = {
  ok: boolean;
  status: number;
  message?: string;
  produit?: Produit | null;
};

// Espaces superflus supprimés, première lettre en majuscule
function nettoyerNom(nom: string | undefined): string {
  const propre = (nom ?? '').trim().replace(/\s+/g, ' ');
  return propre.charAt(0).toUpperCase() + propre.slice(1);
}

export async function lister(): Promise<Produit[]> {
  return listerProduits();
}

export async function trouver(idProduit: string): Promise<Produit | null> {
  return trouverProduit(idProduit);
}

export async function ajouter(nom: string | undefined): Promise<Resultat> {
  const nomPropre = nettoyerNom(nom);
  if (!nomPropre) return { ok: false, status: 400, message: 'Le nom du produit est obligatoire' };

  if (await nomExiste(nomPropre)) {
    return { ok: false, status: 409, message: 'Ce produit existe déjà' };
  }

  const produit = await creerProduit(nomPropre);
  return { ok: true, status: 201, produit };
}

export async function modifier(idProduit: string, nom: string | undefined): Promise<Resultat> {
  if (!(await trouverProduit(idProduit))) {
    return { ok: false, status: 404, message: 'Produit introuvable' };
  }

  const nomPropre = nettoyerNom(nom);
  if (!nomPropre) return { ok: false, status: 400, message: 'Le nom du produit est obligatoire' };

  if (await nomExiste(nomPropre, idProduit)) {
    return { ok: false, status: 409, message: 'Ce produit existe déjà' };
  }

  const produit = await modifierProduit(idProduit, nomPropre);
  return { ok: true, status: 200, produit };
}

export async function supprimer(idProduit: string): Promise<Resultat> {
  if (!(await trouverProduit(idProduit))) {
    return { ok: false, status: 404, message: 'Produit introuvable' };
  }

  try {
    await supprimerProduit(idProduit);
    return { ok: true, status: 204 };
  } catch (err: any) {
    // 23503 : le produit est utilisé par des récoltes ou des stocks
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
    if (err.code === '23503') {
      return {
        ok: false,
        status: 409,
<<<<<<< HEAD
        message: 'Suppression impossible : ce produit est utilisé dans des récoltes ou du stock',
=======
        message: 'Suppression impossible : ce produit est utilisé par des récoltes ou des stocks',
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
      };
    }
    throw err;
  }
}