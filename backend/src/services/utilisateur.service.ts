import bcrypt from 'bcryptjs';
import { trouverCooperative } from '../repositories/cooperative.repository';
import {
  trouverUtilisateurSession,
  emailExiste,
  presidentDeCoop,
  creerPresident,
} from '../repositories/utilisateur.repository';

export type Resultat<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Crée le compte d'un président. Seul un responsable SOAM actif peut le faire.
export async function creerComptePresident(
  idUserDemandeur: string,
  d: { email: string; motDePasse: string; idCoop: string }
): Promise<Resultat<{ idUser: string; email: string; idCoop: string }>> {
  // 1. Le demandeur est relu dans la base
  if (!idUserDemandeur) {
    return { ok: false, status: 401, message: 'Utilisateur non identifié, reconnectez-vous' };
  }
  const demandeur = await trouverUtilisateurSession(idUserDemandeur);
  if (!demandeur || demandeur.actifUtilisateur !== 'Oui') {
    return { ok: false, status: 401, message: 'Compte introuvable ou désactivé' };
  }
  if (demandeur.role !== 'RESPONSABLE') {
    return { ok: false, status: 403, message: 'Seul le responsable SOAM peut créer un compte président' };
  }

  // 2. Contrôle des champs
  const email = d.email.trim();
  if (!email || !d.motDePasse || !d.idCoop) {
    return { ok: false, status: 400, message: 'Champs incomplets' };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, status: 400, message: 'Adresse e-mail invalide' };
  }
  if (d.motDePasse.length < 6) {
    return { ok: false, status: 400, message: 'Le mot de passe doit contenir au moins 6 caractères' };
  }

  // 3. Règles métier : coopérative inscrite, un seul président, e-mail libre
  const coop = await trouverCooperative(d.idCoop);
  if (!coop) return { ok: false, status: 404, message: 'Coopérative introuvable' };
  if (coop.inscrite !== 'Oui') {
    return { ok: false, status: 400, message: "Cette coopérative n'est pas inscrite" };
  }
  if (await presidentDeCoop(d.idCoop)) {
    return { ok: false, status: 409, message: 'Cette coopérative a déjà un président' };
  }
  if (await emailExiste(email)) {
    return { ok: false, status: 409, message: 'Adresse e-mail déjà utilisée' };
  }

  // 4. Le mot de passe n'est jamais stocké en clair
  const motDePasseHache = await bcrypt.hash(d.motDePasse, 10);

  // 5. Création ; la base peut encore refuser si deux demandes arrivent en même temps
  try {
    const u = await creerPresident({ email, motDePasseHache, idCoop: d.idCoop });
    return { ok: true, status: 201, data: u };
  } catch (err: any) {
    // 23505 : contrainte d'unicité violée
    if (err.code === '23505') {
      return {
        ok: false,
        status: 409,
        message: 'Cette coopérative a déjà un président ou e-mail déjà utilisé',
      };
    }
    throw err;
  }
}