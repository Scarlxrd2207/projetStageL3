import { api } from './api';
import { lireSession } from '../utils/session';

export type Kpis = {
  totalLivre: number;
  totalDu: number;
  totalPaye: number;
  commandesEnCours: number;
};

export type ParCoop = { idCoop: string; nomCoop: string; quantiteLivree: number };
export type ParMois = { mois: string; libelle: string; quantiteLivree: number };

export type TableauStats = {
  role: 'RESPONSABLE' | 'PRESIDENT';
  periode: { du: string | null; au: string | null };
  kpis: Kpis;
  parCoop: ParCoop[];
  parMois: ParMois[];
};

// Message lisible : celui du serveur, sinon le code HTTP, sinon l'absence de réponse
export function messageErreur(err: unknown, defaut: string): string {
  const e = err as { response?: { status?: number; data?: { message?: string } } };
  if (e.response?.data?.message) return e.response.data.message;
  if (e.response?.status) return `${defaut} (erreur HTTP ${e.response.status})`;
  return `${defaut} : le serveur ne répond pas, vérifiez qu'il est lancé`;
}

export async function getTableau(du?: string, au?: string): Promise<TableauStats> {
  const { data } = await api.get<TableauStats>('/statistiques', {
    params: {
      idUser: lireSession()?.idUser ?? '',
      ...(du ? { du } : {}),
      ...(au ? { au } : {}),
    },
  });
  return data;
}