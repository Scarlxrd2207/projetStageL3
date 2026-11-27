<<<<<<< HEAD
import { exigerUtilisateur, exigerResponsable } from '../utils/acces';
import {
  listerLivraisons,
  confirmerLivraisonTx,
  type LivraisonLigne,
} from '../repositories/livraison.repository';
import { trouverCommande } from '../repositories/commande.repository';
import { notifierCommande } from '../realtime';
=======
import {
  trouverUtilisateur,
  listerLivraisons,
  confirmerLivraisonTx,
  type LivraisonLigne,
  type UtilisateurSession,
} from '../repositories/livraison.repository';
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

export type Resultat<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string };

const STATUTS_AUTORISES = ['EN_COURS_LIVRAISON', 'LIVREE'];

<<<<<<< HEAD
// Responsable : toutes les livraisons. Président : celles de sa coopérative.
=======
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
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
export async function lister(
  idUser: string,
  statut: string | undefined
): Promise<Resultat<LivraisonLigne[]>> {
<<<<<<< HEAD
  const a = await exigerUtilisateur(idUser);
  if (!a.ok) return a;
=======
  const u = await identifier(idUser);
  if (!u.ok) return u;
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

  if (statut && !STATUTS_AUTORISES.includes(statut)) {
    return { ok: false, status: 400, message: 'Statut de livraison inconnu' };
  }

<<<<<<< HEAD
  const idCoop = a.role === 'PRESIDENT' ? (a.idCoop ?? undefined) : undefined;
=======
  const idCoop = u.data.role === 'PRESIDENT' ? (u.data.idCoop ?? undefined) : undefined;
  if (u.data.role === 'PRESIDENT' && !idCoop) {
    return { ok: false, status: 403, message: 'Aucune coopérative rattachée à ce compte' };
  }

>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  const liste = await listerLivraisons({ idCoop, statut });
  return { ok: true, status: 200, data: liste };
}

<<<<<<< HEAD
// Confirmation de réception : responsable SOAM uniquement, sans toucher au stock
export async function confirmer(
  idCommande: string,
  idUser: string
): Promise<Resultat<{ idCommande: string }>> {
  const a = await exigerResponsable(idUser);
  if (!a.ok) return a;

  const t = await confirmerLivraisonTx(idCommande);
  if (!t.ok) return { ok: false, status: t.status, message: t.message };

  const cmd = (await trouverCommande(idCommande)) as { idCoop: string } | null;
  if (cmd) notifierCommande(cmd.idCoop, { type: 'livraison', idCoop: cmd.idCoop, idCommande });

=======
// Confirmation réservée au responsable SOAM
export async function confirmer(idCommande: string, idUser: string): Promise<Resultat<{ idCommande: string }>> {
  const u = await identifier(idUser);
  if (!u.ok) return u;

  if (u.data.role !== 'RESPONSABLE') {
    return { ok: false, status: 403, message: 'Seul le responsable SOAM peut confirmer une réception' };
  }

  const t = await confirmerLivraisonTx(idCommande);
  if (!t.ok) return { ok: false, status: t.status, message: t.message };
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return { ok: true, status: 200, data: { idCommande } };
}