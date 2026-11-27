import bcrypt from 'bcryptjs';
import { trouverCooperative } from '../repositories/cooperative.repository';
import {
  trouverUtilisateurSession,
<<<<<<< HEAD
  trouverCompte,
  trouverPresident,
  listerPresidents,
  changerActif,
  emailExiste,
  presidentDeCoop,
  creerPresident,
  modifierIdentite,
  modifierMotDePasse,
  type PresidentLigne,
} from '../repositories/utilisateur.repository';
import { exigerResponsable } from '../utils/acces';
=======
  emailExiste,
  presidentDeCoop,
  creerPresident,
} from '../repositories/utilisateur.repository';
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

export type Resultat<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string };

<<<<<<< HEAD
export type Identite = {
  nom: string;
  prenom: string;
  adresse: string | null;
  dateNaissance: string | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Valeur vide = absente
function texteOuNull(v: unknown): string | null {
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null;
}

// Contrôle commun aux créations et modifications
function lireIdentite(d: Record<string, unknown>): { identite?: Identite; erreur?: string } {
  const nom = texteOuNull(d.nom);
  const prenom = texteOuNull(d.prenom);
  if (!nom || !prenom) return { erreur: 'Le nom et le prénom sont obligatoires' };
  if (nom.length > 100 || prenom.length > 100) return { erreur: 'Nom ou prénom trop long (100 caractères maximum)' };

  const adresse = texteOuNull(d.adresse);
  if (adresse && adresse.length > 200) return { erreur: "L'adresse est trop longue (200 caractères maximum)" };

  const dateNaissance = texteOuNull(d.dateNaissance);
  if (dateNaissance) {
    if (!DATE_RE.test(dateNaissance)) return { erreur: 'Date de naissance invalide (AAAA-MM-JJ)' };
    const date = new Date(dateNaissance);
    const aujourdhui = new Date().toISOString().slice(0, 10);
    if (Number.isNaN(date.getTime())) return { erreur: 'Date de naissance invalide' };
    if (dateNaissance > aujourdhui) return { erreur: 'La date de naissance ne peut pas être dans le futur' };
    if (date.getUTCFullYear() < 1900) return { erreur: 'Date de naissance invalide' };
  }

  return { identite: { nom, prenom, adresse, dateNaissance } };
}

// Le responsable confirme chaque action sensible par son propre mot de passe
async function confirmerMotDePasseResponsable(idUser: string, motDePasse: unknown): Promise<Resultat<null>> {
  if (typeof motDePasse !== 'string' || motDePasse === '') {
    return { ok: false, status: 400, message: 'Saisissez votre mot de passe pour confirmer' };
  }
  const c = await trouverCompte(idUser);
  if (!c) return { ok: false, status: 404, message: 'Compte introuvable' };

  const correct = await bcrypt.compare(motDePasse, c.motDePasse);
  if (!correct) return { ok: false, status: 403, message: 'Mot de passe incorrect : action annulée' };

  return { ok: true, status: 200, data: null };
}

// Création du président : seul le responsable SOAM actif peut le faire
export async function creerComptePresident(
  idUserDemandeur: string,
  d: Record<string, unknown>
): Promise<Resultat<{ idUser: string; email: string; idCoop: string }>> {
=======
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Crée le compte d'un président. Seul un responsable SOAM actif peut le faire.
export async function creerComptePresident(
  idUserDemandeur: string,
  d: { email: string; motDePasse: string; idCoop: string }
): Promise<Resultat<{ idUser: string; email: string; idCoop: string }>> {
  // 1. Le demandeur est relu dans la base
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
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

<<<<<<< HEAD
  const email = texteOuNull(d.email);
  const motDePasse = typeof d.motDePasse === 'string' ? d.motDePasse : '';
  const idCoop = texteOuNull(d.idCoop);
  if (!email || !motDePasse || !idCoop) return { ok: false, status: 400, message: 'Champs incomplets' };
  if (!EMAIL_RE.test(email)) return { ok: false, status: 400, message: 'Adresse e-mail invalide' };
  if (motDePasse.length < 6) {
    return { ok: false, status: 400, message: 'Le mot de passe doit contenir au moins 6 caractères' };
  }

  const v = lireIdentite(d);
  if (!v.identite) return { ok: false, status: 400, message: v.erreur ?? 'Données invalides' };

  const coop = await trouverCooperative(idCoop);
=======
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
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  if (!coop) return { ok: false, status: 404, message: 'Coopérative introuvable' };
  if (coop.inscrite !== 'Oui') {
    return { ok: false, status: 400, message: "Cette coopérative n'est pas inscrite" };
  }
<<<<<<< HEAD
  if (await presidentDeCoop(idCoop)) {
=======
  if (await presidentDeCoop(d.idCoop)) {
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
    return { ok: false, status: 409, message: 'Cette coopérative a déjà un président' };
  }
  if (await emailExiste(email)) {
    return { ok: false, status: 409, message: 'Adresse e-mail déjà utilisée' };
  }

<<<<<<< HEAD
  try {
    const u = await creerPresident({
      email,
      motDePasseHache: await bcrypt.hash(motDePasse, 10),
      idCoop,
      ...v.identite,
    });
    return { ok: true, status: 201, data: u };
  } catch (err: any) {
    if (err.code === '23505') {
      return { ok: false, status: 409, message: 'Cette coopérative a déjà un président ou e-mail déjà utilisé' };
    }
    throw err;
  }
}

// Profil de l'utilisateur connecté, sans mot de passe
export async function profil(idUser: string): Promise<Resultat> {
  if (!idUser) return { ok: false, status: 401, message: 'Utilisateur non identifié, reconnectez-vous' };

  const c = await trouverCompte(idUser);
  if (!c) return { ok: false, status: 404, message: 'Compte introuvable' };

  return {
    ok: true,
    status: 200,
    data: {
      idUser: c.idUser,
      email: c.email,
      role: c.role,
      idCoop: c.idCoop,
      nomCoop: c.nomCoop,
      nom: c.nom,
      prenom: c.prenom,
      adresse: c.adresse,
      dateNaissance: c.dateNaissance,
    },
  };
}

// Modification par l'utilisateur lui-même : identité et e-mail
export async function modifierProfil(idUser: string, d: Record<string, unknown>): Promise<Resultat> {
  if (!idUser) return { ok: false, status: 401, message: 'Utilisateur non identifié, reconnectez-vous' };

  const actuel = await trouverCompte(idUser);
  if (!actuel) return { ok: false, status: 404, message: 'Compte introuvable' };

  const email = texteOuNull(d.email) ?? actuel.email;
  if (!EMAIL_RE.test(email)) return { ok: false, status: 400, message: 'Adresse e-mail invalide' };
  if (email !== actuel.email && (await emailExiste(email, idUser))) {
    return { ok: false, status: 409, message: 'Adresse e-mail déjà utilisée' };
  }

  const v = lireIdentite(d);
  if (!v.identite) return { ok: false, status: 400, message: v.erreur ?? 'Données invalides' };

  await modifierIdentite(idUser, { email, ...v.identite });
  return profil(idUser);
}

// Changement du mot de passe par l'utilisateur lui-même
export async function changerMotDePasse(idUser: string, ancien: string, nouveau: string): Promise<Resultat<null>> {
  if (!idUser) return { ok: false, status: 401, message: 'Utilisateur non identifié, reconnectez-vous' };
  if (!ancien || !nouveau) return { ok: false, status: 400, message: 'Champs incomplets' };
  if (nouveau.length < 6) {
    return { ok: false, status: 400, message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' };
  }

  const c = await trouverCompte(idUser);
  if (!c) return { ok: false, status: 404, message: 'Compte introuvable' };

  const correct = await bcrypt.compare(ancien, c.motDePasse);
  if (!correct) return { ok: false, status: 403, message: 'Mot de passe actuel incorrect' };

  await modifierMotDePasse(idUser, await bcrypt.hash(nouveau, 10));
  return { ok: true, status: 200, data: null };
}

// ---------- Gestion des présidents par le responsable ----------

// Liste des présidents : responsable uniquement
export async function listerPresidentsService(idUser: string): Promise<Resultat<PresidentLigne[]>> {
  const a = await exigerResponsable(idUser);
  if (!a.ok) return a;
  return { ok: true, status: 200, data: await listerPresidents() };
}

export async function detailPresident(idUser: string, idPresident: string): Promise<Resultat<PresidentLigne>> {
  const a = await exigerResponsable(idUser);
  if (!a.ok) return a;

  const p = await trouverPresident(idPresident);
  if (!p) return { ok: false, status: 404, message: 'Président introuvable' };
  return { ok: true, status: 200, data: p };
}

// Activation ou désactivation du compte d'un président, avec confirmation par mot de passe
export async function changerActifPresident(
  idUser: string,
  idPresident: string,
  actif: unknown,
  motDePasseResponsable: unknown
): Promise<Resultat<{ idUser: string; actif: 'Oui' | 'Non' }>> {
  const a = await exigerResponsable(idUser);
  if (!a.ok) return a;

  if (typeof actif !== 'boolean') return { ok: false, status: 400, message: 'Valeur d\'activation invalide' };

  const confirme = await confirmerMotDePasseResponsable(a.idUser, motDePasseResponsable);
  if (!confirme.ok) return confirme;

  const p = await trouverPresident(idPresident);
  if (!p) return { ok: false, status: 404, message: 'Président introuvable' };

  const nouvelEtat = actif ? 'Oui' : 'Non';
  await changerActif(idPresident, nouvelEtat);
  return { ok: true, status: 200, data: { idUser: idPresident, actif: nouvelEtat } };
}

// Modification des informations d'un président (et de son mot de passe si renseigné)
export async function modifierPresident(
  idUser: string,
  idPresident: string,
  d: Record<string, unknown>
): Promise<Resultat<PresidentLigne>> {
  const a = await exigerResponsable(idUser);
  if (!a.ok) return a;

  const confirme = await confirmerMotDePasseResponsable(a.idUser, d.motDePasseResponsable);
  if (!confirme.ok) return confirme;

  const actuel = await trouverPresident(idPresident);
  if (!actuel) return { ok: false, status: 404, message: 'Président introuvable' };

  const email = texteOuNull(d.email) ?? actuel.email;
  if (!EMAIL_RE.test(email)) return { ok: false, status: 400, message: 'Adresse e-mail invalide' };
  if (email !== actuel.email && (await emailExiste(email, idPresident))) {
    return { ok: false, status: 409, message: 'Adresse e-mail déjà utilisée' };
  }

  const v = lireIdentite(d);
  if (!v.identite) return { ok: false, status: 400, message: v.erreur ?? 'Données invalides' };

  await modifierIdentite(idPresident, { email, ...v.identite });

  const nouveau = typeof d.nouveauMotDePasse === 'string' ? d.nouveauMotDePasse : '';
  if (nouveau !== '') {
    if (nouveau.length < 6) {
      return { ok: false, status: 400, message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' };
    }
    await modifierMotDePasse(idPresident, await bcrypt.hash(nouveau, 10));
  }

  return { ok: true, status: 200, data: (await trouverPresident(idPresident)) as PresidentLigne };
=======
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
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
}