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
    if (err.code === '23503') {
      return {
        ok: false,
        status: 409,
        message: 'Suppression impossible : ce produit est utilisé par des récoltes ou des stocks',
      };
    }
    throw err;
  }
}