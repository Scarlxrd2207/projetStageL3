import { exigerUtilisateur, exigerResponsable } from '../utils/acces';
import {
  listerLivraisons,
  confirmerLivraisonTx,
  type LivraisonLigne,
} from '../repositories/livraison.repository';
import { trouverCommande } from '../repositories/commande.repository';
import { notifierCommande } from '../realtime';

export type Resultat<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string };

const STATUTS_AUTORISES = ['EN_COURS_LIVRAISON', 'LIVREE'];

// Responsable : toutes les livraisons. Président : celles de sa coopérative.
export async function lister(
  idUser: string,
  statut: string | undefined
): Promise<Resultat<LivraisonLigne[]>> {
  const a = await exigerUtilisateur(idUser);
  if (!a.ok) return a;

  if (statut && !STATUTS_AUTORISES.includes(statut)) {
    return { ok: false, status: 400, message: 'Statut de livraison inconnu' };
  }

  const idCoop = a.role === 'PRESIDENT' ? (a.idCoop ?? undefined) : undefined;
  const liste = await listerLivraisons({ idCoop, statut });
  return { ok: true, status: 200, data: liste };
}

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

  return { ok: true, status: 200, data: { idCommande } };
}