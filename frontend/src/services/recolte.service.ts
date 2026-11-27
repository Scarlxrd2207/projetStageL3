import { api } from './api';
import { lireSession } from '../utils/session';

export type Recolte = {
  idRecolte: string;
  dateRecolte: string;
  quantiteDeclaree: number;
  quantiteRestante: number;
  idMembre: string;
  idProduit: string;
  nomProduit: string;
  nomMembre: string;
  prenomMembre: string;
  districtMembre: string;
  communeMembre: string;
  fokotanyMembre: string;
  idCoop: string;
  nomCoop: string;
};

export type DonneesRecolte = {
  idMembre: string;
  idProduit: string;
  dateRecolte: string;
  quantiteDeclaree: number;
};

function idUser(): string {
  return lireSession()?.idUser ?? '';
}

// Président : toutes les récoltes de sa coopérative
export async function getRecoltes(): Promise<Recolte[]> {
  const { data } = await api.get<Recolte[]>('/recoltes', { params: { idUser: idUser() } });
  return data;
}

// Responsable : récoltes encore disponibles d'une coopérative (pour une commande)
export async function getRecoltesDisponibles(idCoop: string): Promise<Recolte[]> {
  const { data } = await api.get<Recolte[]>('/recoltes/disponibles', {
    params: { idUser: idUser(), idCoop },
  });
  return data;
}

export async function getRecolte(idRecolte: string): Promise<Recolte> {
  const { data } = await api.get<Recolte>(`/recoltes/${idRecolte}`, { params: { idUser: idUser() } });
  return data;
}

export async function creerRecolte(d: DonneesRecolte): Promise<Recolte> {
  const { data } = await api.post<Recolte>('/recoltes', { ...d, idUser: idUser() });
  return data;
}

export async function modifierRecolte(
  idRecolte: string,
  d: Pick<DonneesRecolte, 'dateRecolte' | 'quantiteDeclaree'>
): Promise<Recolte> {
  const { data } = await api.put<Recolte>(`/recoltes/${idRecolte}`, { ...d, idUser: idUser() });
  return data;
}

export async function supprimerRecolte(idRecolte: string): Promise<void> {
  await api.delete(`/recoltes/${idRecolte}`, { params: { idUser: idUser() } });
}