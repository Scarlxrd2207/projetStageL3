import { api } from './api';
<<<<<<< HEAD
import { lireSession } from '../utils/session';

=======

// Récolte telle que renvoyée par l'API (avec noms et lieu du membre)
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
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

<<<<<<< HEAD
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
=======
export async function getRecoltes(idCoop?: string): Promise<Recolte[]> {
  const { data } = await api.get<Recolte[]>('/recoltes', { params: idCoop ? { idCoop } : {} });
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return data;
}

export async function getRecolte(idRecolte: string): Promise<Recolte> {
<<<<<<< HEAD
  const { data } = await api.get<Recolte>(`/recoltes/${idRecolte}`, { params: { idUser: idUser() } });
=======
  const { data } = await api.get<Recolte>(`/recoltes/${idRecolte}`);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return data;
}

export async function creerRecolte(d: DonneesRecolte): Promise<Recolte> {
<<<<<<< HEAD
  const { data } = await api.post<Recolte>('/recoltes', { ...d, idUser: idUser() });
  return data;
}

=======
  const { data } = await api.post<Recolte>('/recoltes', d);
  return data;
}

// En modification, seuls la date et la quantité changent
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
export async function modifierRecolte(
  idRecolte: string,
  d: Pick<DonneesRecolte, 'dateRecolte' | 'quantiteDeclaree'>
): Promise<Recolte> {
<<<<<<< HEAD
  const { data } = await api.put<Recolte>(`/recoltes/${idRecolte}`, { ...d, idUser: idUser() });
=======
  const { data } = await api.put<Recolte>(`/recoltes/${idRecolte}`, d);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return data;
}

export async function supprimerRecolte(idRecolte: string): Promise<void> {
<<<<<<< HEAD
  await api.delete(`/recoltes/${idRecolte}`, { params: { idUser: idUser() } });
=======
  await api.delete(`/recoltes/${idRecolte}`);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
}