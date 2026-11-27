import { trouverCooperative } from '../repositories/cooperative.repository';
import {
  listerCommandes,
  trouverCommande,
  lignesCommande,
  creerCommandeAvecLignes,
  quantitesRestantes,
  accepterCommandeTx,
  refuserCommandeTx,
  modifierStatutPaiement,
  type LigneConfirmee,
} from '../repositories/commande.repository';
import { exigerPresident, exigerResponsable } from '../utils/acces';
import { notifierCommande } from '../realtime';

export type Resultat<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string };

export type LigneSaisie = { idRecolte: string; quantiteDemandee: number };

type CommandeMini = {
  idCoop: string;
  idUser: string;
  statutCommande: string;
  statutPaiement: string;
};

export async function lister(filtres: { idCoop?: string; idUser?: string }) {
  return listerCommandes(filtres);
}

// Un président ne voit que les commandes de sa coopérative
export async function detail(idCommande: string, idCoop?: string): Promise<Resultat> {
  const commande = (await trouverCommande(idCommande)) as CommandeMini | null;
  if (!commande || (idCoop && commande.idCoop !== idCoop)) {
    return { ok: false, status: 404, message: 'Commande introuvable' };
  }
  const lignes = await lignesCommande(idCommande);
  return { ok: true, status: 200, data: { commande, lignes } };
}

// Création : responsable SOAM uniquement (le contrôle du rôle est fait par le contrôleur)
export async function creer(idCoop: string, idUser: string, lignes: LigneSaisie[]): Promise<Resultat> {
  if (!idCoop) return { ok: false, status: 400, message: 'Coopérative obligatoire' };

  const coop = await trouverCooperative(idCoop);
  if (!coop) return { ok: false, status: 404, message: 'Coopérative introuvable' };
  if (coop.inscrite !== 'Oui') {
    return { ok: false, status: 400, message: "Cette coopérative n'est pas inscrite" };
  }

  if (!Array.isArray(lignes) || lignes.length === 0) {
    return { ok: false, status: 400, message: 'Ajoutez au moins une récolte à la commande' };
  }

  const ids = lignes.map((l) => l.idRecolte);
  if (new Set(ids).size !== ids.length) {
    return { ok: false, status: 400, message: "Une récolte ne peut être ajoutée qu'une seule fois" };
  }

  for (const l of lignes) {
    if (typeof l.quantiteDemandee !== 'number' || !(l.quantiteDemandee > 0)) {
      return { ok: false, status: 400, message: 'Chaque quantité doit être supérieure à 0' };
    }
  }

  const restantes = await quantitesRestantes(ids);
  for (const l of lignes) {
    const r = restantes.get(l.idRecolte);
    if (!r) return { ok: false, status: 404, message: 'Récolte introuvable' };
    if (r.idCoop !== idCoop) {
      return { ok: false, status: 400, message: "Une récolte n'appartient pas à cette coopérative" };
    }
    if (l.quantiteDemandee > r.restante) {
      return {
        ok: false,
        status: 409,
        message: `Stock insuffisant pour ${r.nomProduit} : ${r.restante} kg disponibles`,
      };
    }
  }

  const idCommande = await creerCommandeAvecLignes({ idCoop, idUser, lignes });
  notifierCommande(idCoop, { type: 'commande', idCoop, idCommande });
  return { ok: true, status: 201, data: { idCommande } };
}

// Lecture et contrôle des lignes confirmées envoyées par le client
function lireLignes(brut: unknown): { lignes?: LigneConfirmee[]; erreur?: string } {
  if (!Array.isArray(brut) || brut.length === 0) {
    return { erreur: 'Aucune ligne à confirmer' };
  }
  const lignes: LigneConfirmee[] = [];
  for (const l of brut as Array<Record<string, unknown>>) {
    if (typeof l.idLigneCommande !== 'string' || typeof l.quantiteConfirmee !== 'number') {
      return { erreur: 'Données de confirmation incorrectes' };
    }
    lignes.push({ idLigneCommande: l.idLigneCommande, quantiteConfirmee: l.quantiteConfirmee });
  }
  return { lignes };
}

// Acceptation : président de la coopérative de la commande uniquement
export async function accepter(idCommande: string, idUser: string, brut: unknown): Promise<Resultat> {
  const pres = await exigerPresident(idUser);
  if (!pres.ok) return pres;

  const cmd = (await trouverCommande(idCommande)) as CommandeMini | null;
  if (!cmd || cmd.idCoop !== pres.idCoop) {
    return { ok: false, status: 404, message: 'Commande introuvable' };
  }

  const { lignes, erreur } = lireLignes(brut);
  if (!lignes) return { ok: false, status: 400, message: erreur ?? 'Données invalides' };

  const t = await accepterCommandeTx(idCommande, pres.idCoop, lignes);
  if (!t.ok) return { ok: false, status: t.status, message: t.message };

  notifierCommande(pres.idCoop, { type: 'commande', idCoop: pres.idCoop, idCommande });
  return { ok: true, status: 200, data: { idCommande } };
}

// Refus : président de la coopérative de la commande uniquement
export async function refuser(idCommande: string, idUser: string): Promise<Resultat> {
  const pres = await exigerPresident(idUser);
  if (!pres.ok) return pres;

  const cmd = (await trouverCommande(idCommande)) as CommandeMini | null;
  if (!cmd || cmd.idCoop !== pres.idCoop) {
    return { ok: false, status: 404, message: 'Commande introuvable' };
  }

  const t = await refuserCommandeTx(idCommande, pres.idCoop);
  if (!t.ok) return { ok: false, status: t.status, message: t.message };

  notifierCommande(pres.idCoop, { type: 'commande', idCoop: pres.idCoop, idCommande });
  return { ok: true, status: 200, data: { idCommande } };
}

// Statut de paiement : responsable SOAM uniquement, commande non refusée
export async function changerPaiement(idCommande: string, idUser: string, statut: unknown): Promise<Resultat> {
  const a = await exigerResponsable(idUser);
  if (!a.ok) return a;

  if (statut !== 'PAYE' && statut !== 'NON_PAYE') {
    return { ok: false, status: 400, message: 'Statut de paiement invalide' };
  }

  const cmd = (await trouverCommande(idCommande)) as CommandeMini | null;
  if (!cmd) return { ok: false, status: 404, message: 'Commande introuvable' };
  if (cmd.statutCommande === 'REFUSEE') {
    return { ok: false, status: 409, message: 'Une commande refusée ne peut pas être payée' };
  }

  await modifierStatutPaiement(idCommande, statut);
  notifierCommande(cmd.idCoop, { type: 'paiement', idCoop: cmd.idCoop, idCommande });
  return { ok: true, status: 200, data: { idCommande, statutPaiement: statut } };
}