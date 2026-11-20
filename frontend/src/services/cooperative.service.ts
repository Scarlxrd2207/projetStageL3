import { api } from './api';

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

export async function getCooperativesFiltrees(filtres: Filtres): Promise<Cooperative[]> {
  const params = Object.fromEntries(
    Object.entries(filtres).filter(([, valeur]) => valeur)
  );
  const { data } = await api.get<Cooperative[]>('/cooperatives', { params });
  return data;
}

export async function getCooperative(idCoop: string): Promise<Cooperative> {
  const { data } = await api.get<Cooperative>(`/cooperatives/${idCoop}`);
  return data;
}

export async function creerCooperative(d: DonneesCooperative): Promise<Cooperative> {
  const { data } = await api.post<Cooperative>('/cooperatives', d);
  return data;
}

export async function modifierCooperative(idCoop: string, d: DonneesCooperative): Promise<Cooperative> {
  const { data } = await api.put<Cooperative>(`/cooperatives/${idCoop}`, d);
  return data;
}

export async function supprimerCooperative(idCoop: string): Promise<void> {
  await api.delete(`/cooperatives/${idCoop}`);
}