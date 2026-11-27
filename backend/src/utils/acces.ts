import { trouverUtilisateurSession } from '../repositories/utilisateur.repository';

type Refus = { ok: false; status: number; message: string };

export type SessionOk = {
  ok: true;
  idUser: string;
  role: 'RESPONSABLE' | 'PRESIDENT';
  idCoop: string | null;
};

function refus(status: number, message: string): Refus {
  return { ok: false, status, message };
}

// Vérifiee qu'un utilisateur est connecté et actif. Le rôle est relu dans la base.
export async function exigerUtilisateur(idUser: string): Promise<SessionOk | Refus> {
  if (!idUser) return refus(401, 'Utilisateur non identifié, reconnectez-vous');

  const u = await trouverUtilisateurSession(idUser);
  if (!u || u.actifUtilisateur !== 'Oui') return refus(401, 'Compte introuvable ou désactivé');
  if (u.role === 'PRESIDENT' && !u.idCoop) {
    return refus(403, 'Aucune coopérative rattachée à ce compte');
  }

  return { ok: true, idUser: u.idUser, role: u.role, idCoop: u.idCoop };
}

// Réservé au responsable SOAM
export async function exigerResponsable(idUser: string): Promise<{ ok: true; idUser: string } | Refus> {
  const s = await exigerUtilisateur(idUser);
  if (!s.ok) return s;
  if (s.role !== 'RESPONSABLE') return refus(403, 'Réservé au responsable SOAM');
  return { ok: true, idUser: s.idUser };
}

// Réservé au président de coopérative ; renvoie sa coopérative
export async function exigerPresident(idUser: string): Promise<{ ok: true; idCoop: string } | Refus> {
  const s = await exigerUtilisateur(idUser);
  if (!s.ok) return s;
  if (s.role !== 'PRESIDENT' || !s.idCoop) return refus(403, 'Réservé au président de coopérative');
  return { ok: true, idCoop: s.idCoop };
}