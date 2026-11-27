import bcrypt from 'bcryptjs';
import { trouverParEmail } from '../repositories/utilisateur.repository';

export type ResultatLogin =
  | { ok: false; message: string }
  | {
      ok: true;
      utilisateur: {
        idUser: string;
        email: string;
        role: string;
        idCoop: string | null;
        nomCoop: string | null;
      };
    };

export async function login(email: string, motDePasse: string): Promise<ResultatLogin> {
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
      nomCoop: u.nomCoop ?? null,
    },
  };
}