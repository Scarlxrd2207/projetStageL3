import { exigerUtilisateur } from '../utils/acces';
import {
  notificationsPresident,
  notificationsResponsable,
  compteursPresident,
  compteursResponsable,
  type NotificationBrute,
  type Compteurs,
} from '../repositories/notification.repository';

export type Resultat<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string };

export async function lister(
  idUser: string
): Promise<Resultat<{ notifications: NotificationBrute[]; nbNonLues: number }>> {
  const a = await exigerUtilisateur(idUser);
  if (!a.ok) return a;

  const liste =
    a.role === 'PRESIDENT' && a.idCoop
      ? await notificationsPresident(a.idCoop, a.idUser)
      : await notificationsResponsable(a.idUser);

  const triees = [...liste].sort((x, y) => y.date.localeCompare(x.date)).slice(0, 30);
  return { ok: true, status: 200, data: { notifications: triees, nbNonLues: liste.length } };
}

export async function compteurs(idUser: string): Promise<Resultat<Compteurs>> {
  const a = await exigerUtilisateur(idUser);
  if (!a.ok) return a;

  const c =
    a.role === 'PRESIDENT' && a.idCoop
      ? await compteursPresident(a.idCoop, a.idUser)
      : await compteursResponsable(a.idUser);
  return { ok: true, status: 200, data: c };
}