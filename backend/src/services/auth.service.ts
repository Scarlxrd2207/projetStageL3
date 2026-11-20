import bcrypt from 'bcryptjs';
import { trouverParEmail } from '../repositories/utilisateur.repository';

export async function login(email: string, motDePasse: string) {
  const u = await trouverParEmail(email);

  if (!u) return { ok: false, message: 'Identifiants incorrects' };
  if (u.actifUtilisateur !== 'Oui') return { ok: false, message: 'Compte désactivé' };

  const valide = await bcrypt.compare(motDePasse, u.motDePasse);
  if (!valide) return { ok: false, message: 'Identifiants incorrects' };

  return {
    ok: true,
    utilisateur: {
      idUser: u.idUser,
      email: u.email,
      role: u.role,
      idCoop: u.idCoop,
    },
  };
}