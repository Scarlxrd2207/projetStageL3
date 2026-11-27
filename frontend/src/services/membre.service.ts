import { api } from './api';
import { lireSession } from '../utils/session';

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
  nomCoop?: string | null;
};

export type DonneesMembre = {
  nomMembre: string;
  prenomMembre: string;
  telephoneMembre: string;
  fokotanyMembre: string;
  idCoop: string;
};

function idUser(): string {
  return lireSession()?.idUser ?? '';
}

// Président : ses membres. Responsable : les membres d'une coopérative (lecture seule).
export async function getMembres(idCoop?: string): Promise<Membre[]> {
  const { data } = await api.get<Membre[]>('/membres', {
    params: { idUser: idUser(), ...(idCoop ? { idCoop } : {}) },
  });
  return data;
}

export async function getMembre(idMembre: string): Promise<Membre> {
  const { data } = await api.get<Membre>(`/membres/${idMembre}`, { params: { idUser: idUser() } });
  return data;
}

export async function creerMembre(d: DonneesMembre): Promise<Membre> {
  const { data } = await api.post<Membre>('/membres', { ...d, idUser: idUser() });
  return data;
}

export async function modifierMembre(idMembre: string, d: DonneesMembre): Promise<Membre> {
  const { data } = await api.put<Membre>(`/membres/${idMembre}`, { ...d, idUser: idUser() });
  return data;
}

export async function desactiverMembre(idMembre: string): Promise<Membre> {
  const { data } = await api.put<Membre>(`/membres/${idMembre}/desactiver`, { idUser: idUser() });
  return data;
}