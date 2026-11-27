import { trouverMembre } from '../repositories/membre.repository';
import { trouverProduit } from '../repositories/produit.repository';
import {
  listerRecoltes,
  trouverRecolte,
  creerRecolte,
  modifierRecolte,
  supprimerRecolte,
} from '../repositories/recolte.repository';
import { exigerPresident, exigerResponsable } from '../utils/acces';

export type Resultat<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string };

export type DonneesRecolte = {
  idMembre: string;
  idProduit: string;
  dateRecolte: string;
  quantiteDeclaree: number;
};

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

// Président : récoltes de sa coopérative
export async function lister(idUser: string): Promise<Resultat> {
  const a = await exigerPresident(idUser);
  if (!a.ok) return a;
  return { ok: true, status: 200, data: await listerRecoltes(a.idCoop) };
}

// Responsable : récoltes encore disponibles d'une coopérative, pour préparer une commande
export async function disponibles(idUser: string, idCoop: string): Promise<Resultat> {
  const a = await exigerResponsable(idUser);
  if (!a.ok) return a;

  if (!idCoop) return { ok: false, status: 400, message: 'Coopérative obligatoire' };

  const toutes = await listerRecoltes(idCoop);
  const restantes = toutes.filter((r) => r.quantiteRestante > 0);
  return { ok: true, status: 200, data: restantes };
}

export async function trouver(idUser: string, idRecolte: string): Promise<Resultat> {
  const a = await exigerPresident(idUser);
  if (!a.ok) return a;

  const recolte = await trouverRecolte(idRecolte);
  if (!recolte || recolte.idCoop !== a.idCoop) {
    return { ok: false, status: 404, message: 'Récolte introuvable' };
  }
  return { ok: true, status: 200, data: recolte };
}

export async function ajouter(idUser: string, d: Partial<DonneesRecolte>): Promise<Resultat> {
  const a = await exigerPresident(idUser);
  if (!a.ok) return a;

  if (!d.idMembre || !d.idProduit) {
    return { ok: false, status: 400, message: 'Membre et produit obligatoires' };
  }
  const erreur = validerDate(d.dateRecolte) ?? validerQuantite(d.quantiteDeclaree);
  if (erreur) return { ok: false, status: 400, message: erreur };

  const membre = await trouverMembre(d.idMembre);
  if (!membre || membre.idCoop !== a.idCoop) {
    return { ok: false, status: 403, message: "Ce membre n'appartient pas à votre coopérative" };
  }
  if (membre.actifMembre !== 'Oui') {
    return { ok: false, status: 400, message: 'Ce membre est inactif' };
  }

  if (!(await trouverProduit(d.idProduit))) {
    return { ok: false, status: 404, message: 'Produit introuvable' };
  }

  const recolte = await creerRecolte({
    idMembre: d.idMembre,
    idProduit: d.idProduit,
    dateRecolte: d.dateRecolte!,
    quantiteDeclaree: d.quantiteDeclaree!,
  });
  return { ok: true, status: 201, data: recolte };
}

export async function modifier(
  idUser: string,
  idRecolte: string,
  d: Partial<DonneesRecolte>
): Promise<Resultat> {
  const a = await exigerPresident(idUser);
  if (!a.ok) return a;

  const existante = await trouverRecolte(idRecolte);
  if (!existante || existante.idCoop !== a.idCoop) {
    return { ok: false, status: 404, message: 'Récolte introuvable' };
  }

  const erreur = validerDate(d.dateRecolte) ?? validerQuantite(d.quantiteDeclaree);
  if (erreur) return { ok: false, status: 400, message: erreur };

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
  return { ok: true, status: 200, data: recolte };
}

export async function supprimer(idUser: string, idRecolte: string): Promise<Resultat> {
  const a = await exigerPresident(idUser);
  if (!a.ok) return a;

  const existante = await trouverRecolte(idRecolte);
  if (!existante || existante.idCoop !== a.idCoop) {
    return { ok: false, status: 404, message: 'Récolte introuvable' };
  }

  try {
    await supprimerRecolte(idRecolte);
    return { ok: true, status: 204, data: null };
  } catch (err: any) {
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