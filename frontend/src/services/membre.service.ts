import { api } from './api';

export type Membre = {
  idMembre: string;
  nomMembre: string;
  prenomMembre: string;
  telephoneMembre: string | null;
  districtMembre: string;
  communeMembre: string;
  fokotanyMembre: string;
  actifMembre: 'Oui' | 'Non';
  idCoop: string;
};

export type DonneesMembre = {
  nomMembre: string;
  prenomMembre: string;
  telephoneMembre: string;
  fokotanyMembre: string;
  idCoop: string;
};

export async function getMembres(idCoop?: string): Promise<Membre[]> {
  const { data } = await api.get<Membre[]>('/membres', { params: idCoop ? { idCoop } : {} });
  return data;
}

export async function getMembre(idMembre: string): Promise<Membre> {
  const { data } = await api.get<Membre>(`/membres/${idMembre}`);
  return data;
}

export async function creerMembre(d: DonneesMembre): Promise<Membre> {
  const { data } = await api.post<Membre>('/membres', d);
  return data;
}

export async function modifierMembre(idMembre: string, d: DonneesMembre): Promise<Membre> {
  const { data } = await api.put<Membre>(`/membres/${idMembre}`, d);
  return data;
}

export async function desactiverMembre(idMembre: string): Promise<Membre> {
  const { data } = await api.put<Membre>(`/membres/${idMembre}/desactiver`);
  return data;
}