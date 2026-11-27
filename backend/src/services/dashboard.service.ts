import { exigerPresident } from '../utils/acces';
import { indicateursPresident, commandesRecentes } from '../repositories/dashboard.repository';

export type ResultatDashboard =
  | { ok: true; status: number; data: unknown }
  | { ok: false; status: number; message: string };

// Tableau de bord du président : uniquement les chiffres de sa coopérative
export async function presidentDashboard(idUser: string): Promise<ResultatDashboard> {
  const a = await exigerPresident(idUser);
  if (!a.ok) return a;

  const [indicateurs, commandes] = await Promise.all([
    indicateursPresident(a.idCoop),
    commandesRecentes(a.idCoop),
  ]);

  return { ok: true, status: 200, data: { indicateurs, commandes } };
}