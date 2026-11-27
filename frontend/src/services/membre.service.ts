import { api } from './api';
<<<<<<< HEAD
import { lireSession } from '../utils/session';
=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

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
<<<<<<< HEAD
  nomCoop?: string | null;
=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
};

export type DonneesMembre = {
  nomMembre: string;
  prenomMembre: string;
  telephoneMembre: string;
  fokotanyMembre: string;
  idCoop: string;
};

<<<<<<< HEAD
function idUser(): string {
  return lireSession()?.idUser ?? '';
}

// Président : ses membres. Responsable : les membres d'une coopérative (lecture seule).
export async function getMembres(idCoop?: string): Promise<Membre[]> {
  const { data } = await api.get<Membre[]>('/membres', {
    params: { idUser: idUser(), ...(idCoop ? { idCoop } : {}) },
  });
=======
export async function getMembres(idCoop?: string): Promise<Membre[]> {
  const { data } = await api.get<Membre[]>('/membres', { params: idCoop ? { idCoop } : {} });
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return data;
}

export async function getMembre(idMembre: string): Promise<Membre> {
<<<<<<< HEAD
  const { data } = await api.get<Membre>(`/membres/${idMembre}`, { params: { idUser: idUser() } });
=======
  const { data } = await api.get<Membre>(`/membres/${idMembre}`);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return data;
}

export async function creerMembre(d: DonneesMembre): Promise<Membre> {
<<<<<<< HEAD
  const { data } = await api.post<Membre>('/membres', { ...d, idUser: idUser() });
=======
  const { data } = await api.post<Membre>('/membres', d);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return data;
}

export async function modifierMembre(idMembre: string, d: DonneesMembre): Promise<Membre> {
<<<<<<< HEAD
  const { data } = await api.put<Membre>(`/membres/${idMembre}`, { ...d, idUser: idUser() });
=======
  const { data } = await api.put<Membre>(`/membres/${idMembre}`, d);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return data;
}

export async function desactiverMembre(idMembre: string): Promise<Membre> {
<<<<<<< HEAD
  const { data } = await api.put<Membre>(`/membres/${idMembre}/desactiver`, { idUser: idUser() });
=======
  const { data } = await api.put<Membre>(`/membres/${idMembre}/desactiver`);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return data;
}