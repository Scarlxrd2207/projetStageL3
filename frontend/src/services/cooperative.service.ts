import { api } from './api';
import { lireSession } from '../utils/session';

export type Cooperative = {
  idCoop: string;
  nomCoop: string;
  districtCoop: string;
  communeCoop: string;
  fokotanyCoop: string;
  dateAdhesion: string;
  inscrite: 'Oui' | 'Non';
  nombreMembres?: number;
};

export type DonneesCooperative = {
  nomCoop: string;
  districtCoop: string;
  communeCoop: string;
  fokotanyCoop: string;
  dateAdhesion: string;
};

export type Filtres = {
  district?: string;
  commune?: string;
  fokotany?: string;
};

function idUser(): string {
  return lireSession()?.idUser ?? '';
}

// Le responsable voit toutes les coopératives, le président seulement la sienne
export async function getCooperativesFiltrees(filtres: Filtres): Promise<Cooperative[]> {
  const params = Object.fromEntries(Object.entries(filtres).filter(([, valeur]) => valeur));
  const { data } = await api.get<Cooperative[]>('/cooperatives', {
    params: { ...params, idUser: idUser() },
  });
  return data;
}

export async function getCooperative(idCoop: string): Promise<Cooperative> {
  const { data } = await api.get<Cooperative>(`/cooperatives/${idCoop}`, {
    params: { idUser: idUser() },
  });
  return data;
}

export async function getLieux(): Promise<{ districts: string[]; communes: string[]; fokotanys: string[] }> {
  const { data } = await api.get('/cooperatives/lieux');
  return data;
}

export async function creerCooperative(d: DonneesCooperative): Promise<Cooperative> {
  const { data } = await api.post<Cooperative>('/cooperatives', { ...d, idUser: idUser() });
  return data;
}

export async function modifierCooperative(idCoop: string, d: DonneesCooperative): Promise<Cooperative> {
  const { data } = await api.put<Cooperative>(`/cooperatives/${idCoop}`, { ...d, idUser: idUser() });
  return data;
}

export async function supprimerCooperative(idCoop: string): Promise<void> {
  await api.delete(`/cooperatives/${idCoop}`, { params: { idUser: idUser() } });
}