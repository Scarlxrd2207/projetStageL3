import { api } from './api';
<<<<<<< HEAD
import { lireSession } from '../utils/session';
=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

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

<<<<<<< HEAD
function idUser(): string {
  return lireSession()?.idUser ?? '';
}

// Le responsable voit toutes les coopératives, le président seulement la sienne
export async function getCooperativesFiltrees(filtres: Filtres): Promise<Cooperative[]> {
  const params = Object.fromEntries(Object.entries(filtres).filter(([, valeur]) => valeur));
  const { data } = await api.get<Cooperative[]>('/cooperatives', {
    params: { ...params, idUser: idUser() },
  });
=======
export async function getCooperativesFiltrees(filtres: Filtres): Promise<Cooperative[]> {
  const params = Object.fromEntries(
    Object.entries(filtres).filter(([, valeur]) => valeur)
  );
  const { data } = await api.get<Cooperative[]>('/cooperatives', { params });
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return data;
}

export async function getCooperative(idCoop: string): Promise<Cooperative> {
<<<<<<< HEAD
  const { data } = await api.get<Cooperative>(`/cooperatives/${idCoop}`, {
    params: { idUser: idUser() },
  });
  return data;
}

export async function getLieux(): Promise<{ districts: string[]; communes: string[]; fokotanys: string[] }> {
  const { data } = await api.get('/cooperatives/lieux');
=======
  const { data } = await api.get<Cooperative>(`/cooperatives/${idCoop}`);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return data;
}

export async function creerCooperative(d: DonneesCooperative): Promise<Cooperative> {
<<<<<<< HEAD
  const { data } = await api.post<Cooperative>('/cooperatives', { ...d, idUser: idUser() });
=======
  const { data } = await api.post<Cooperative>('/cooperatives', d);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return data;
}

export async function modifierCooperative(idCoop: string, d: DonneesCooperative): Promise<Cooperative> {
<<<<<<< HEAD
  const { data } = await api.put<Cooperative>(`/cooperatives/${idCoop}`, { ...d, idUser: idUser() });
=======
  const { data } = await api.put<Cooperative>(`/cooperatives/${idCoop}`, d);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return data;
}

export async function supprimerCooperative(idCoop: string): Promise<void> {
<<<<<<< HEAD
  await api.delete(`/cooperatives/${idCoop}`, { params: { idUser: idUser() } });
=======
  await api.delete(`/cooperatives/${idCoop}`);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
}