import { trouverMembre } from '../repositories/membre.repository';
import { trouverProduit } from '../repositories/produit.repository';
import {
  listerRecoltes,
  trouverRecolte,
  creerRecolte,
  modifierRecolte,
  supprimerRecolte,
} from '../repositories/recolte.repository';
import type { RecolteDetail } from '../models/recolte.model';

export type Resultat = {
  ok: boolean;
  status: number;
  message?: string;
  recolte?: RecolteDetail | null;
};

export type DonneesRecolte = {
  idMembre: string;
  idProduit: string;
  dateRecolte: string;
  quantiteDeclaree: number;
};

// Date du jour au format AAAA-MM-JJ
function aujourdhui(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function validerDate(date: string | undefined): string | null {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Date invalide (format AAAA-MM-JJ)';
  if (date > aujourdhui()) return 'La date de récolte ne peut pas être dans le futur';
  return null;
}

function validerQuantite(q: unknown): string | null {
  if (typeof q !== 'number' || !(q > 0)) return 'La quantité doit être un nombre supérieur à 0';
  return null;
}

export async function lister(idCoop?: string) {
  return listerRecoltes(idCoop);
}

export async function trouver(idRecolte: string) {
  return trouverRecolte(idRecolte);
}

export async function ajouter(d: Partial<DonneesRecolte>): Promise<Resultat> {
  if (!d.idMembre || !d.idProduit) {
    return { ok: false, status: 400, message: 'Membre et produit obligatoires' };
  }
  const erreur = validerDate(d.dateRecolte) ?? validerQuantite(d.quantiteDeclaree);
  if (erreur) return { ok: false, status: 400, message: erreur };

  const membre = await trouverMembre(d.idMembre);
  if (!membre) return { ok: false, status: 404, message: 'Membre introuvable' };
  if (membre.actifMembre !== 'Oui') return { ok: false, status: 400, message: 'Ce membre est inactif' };

  if (!(await trouverProduit(d.idProduit))) {
    return { ok: false, status: 404, message: 'Produit introuvable' };
  }

  const recolte = await creerRecolte({
    idMembre: d.idMembre,
    idProduit: d.idProduit,
    dateRecolte: d.dateRecolte!,
    quantiteDeclaree: d.quantiteDeclaree!,
  });
  return { ok: true, status: 201, recolte };
}

export async function modifier(idRecolte: string, d: Partial<DonneesRecolte>): Promise<Resultat> {
  const existante = await trouverRecolte(idRecolte);
  if (!existante) return { ok: false, status: 404, message: 'Récolte introuvable' };

  const erreur = validerDate(d.dateRecolte) ?? validerQuantite(d.quantiteDeclaree);
  if (erreur) return { ok: false, status: 400, message: erreur };

  // on ne peut pas descendre sous ce qui a déjà été commandé
  const dejaCommande = existante.quantiteDeclaree - existante.quantiteRestante;
  if (d.quantiteDeclaree! < dejaCommande) {
    return {
      ok: false,
      status: 409,
      message: `La quantité ne peut pas être inférieure à ${dejaCommande} kg déjà commandés`,
    };
  }

  const recolte = await modifierRecolte(idRecolte, {
    dateRecolte: d.dateRecolte!,
    quantiteDeclaree: d.quantiteDeclaree!,
  });
  return { ok: true, status: 200, recolte };
}

export async function supprimer(idRecolte: string): Promise<Resultat> {
  if (!(await trouverRecolte(idRecolte))) {
    return { ok: false, status: 404, message: 'Récolte introuvable' };
  }
  try {
    await supprimerRecolte(idRecolte);
    return { ok: true, status: 204 };
  } catch (err: any) {
    // 23503 : la récolte est utilisée dans une commande
    if (err.code === '23503') {
      return {
        ok: false,
        status: 409,
        message: 'Suppression impossible : cette récolte est utilisée dans une commande',
      };
    }
    throw err;
  }
}