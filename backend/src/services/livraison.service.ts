import {
  trouverUtilisateur,
  listerLivraisons,
  confirmerLivraisonTx,
  type LivraisonLigne,
  type UtilisateurSession,
} from '../repositories/livraison.repository';

export type Resultat<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string };

const STATUTS_AUTORISES = ['EN_COURS_LIVRAISON', 'LIVREE'];

// Vérifie que l'utilisateur existe et est actif
async function identifier(idUser: string): Promise<Resultat<UtilisateurSession>> {
  if (!idUser) {
    return { ok: false, status: 401, message: 'Utilisateur non identifié, reconnectez-vous' };
  }
  const u = await trouverUtilisateur(idUser);
  if (!u || u.actifUtilisateur !== 'Oui') {
    return { ok: false, status: 401, message: 'Compte introuvable ou désactivé' };
  }
  return { ok: true, status: 200, data: u };
}

// Responsable : toutes les livraisons (filtre facultatif). Président : celles de sa coopérative.
export async function lister(
  idUser: string,
  statut: string | undefined
): Promise<Resultat<LivraisonLigne[]>> {
  const u = await identifier(idUser);
  if (!u.ok) return u;

  if (statut && !STATUTS_AUTORISES.includes(statut)) {
    return { ok: false, status: 400, message: 'Statut de livraison inconnu' };
  }

  const idCoop = u.data.role === 'PRESIDENT' ? (u.data.idCoop ?? undefined) : undefined;
  if (u.data.role === 'PRESIDENT' && !idCoop) {
    return { ok: false, status: 403, message: 'Aucune coopérative rattachée à ce compte' };
  }

  const liste = await listerLivraisons({ idCoop, statut });
  return { ok: true, status: 200, data: liste };
}

// Confirmation réservée au responsable SOAM
export async function confirmer(idCommande: string, idUser: string): Promise<Resultat<{ idCommande: string }>> {
  const u = await identifier(idUser);
  if (!u.ok) return u;

  if (u.data.role !== 'RESPONSABLE') {
    return { ok: false, status: 403, message: 'Seul le responsable SOAM peut confirmer une réception' };
  }

  const t = await confirmerLivraisonTx(idCommande);
  if (!t.ok) return { ok: false, status: t.status, message: t.message };
  return { ok: true, status: 200, data: { idCommande } };
}