import { api } from './api';

// Récolte telle que renvoyée par l'API (avec noms et lieu du membre)
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

export async function getRecoltes(idCoop?: string): Promise<Recolte[]> {
  const { data } = await api.get<Recolte[]>('/recoltes', { params: idCoop ? { idCoop } : {} });
  return data;
}

export async function getRecolte(idRecolte: string): Promise<Recolte> {
  const { data } = await api.get<Recolte>(`/recoltes/${idRecolte}`);
  return data;
}

export async function creerRecolte(d: DonneesRecolte): Promise<Recolte> {
  const { data } = await api.post<Recolte>('/recoltes', d);
  return data;
}

// En modification, seuls la date et la quantité changent
export async function modifierRecolte(
  idRecolte: string,
  d: Pick<DonneesRecolte, 'dateRecolte' | 'quantiteDeclaree'>
): Promise<Recolte> {
  const { data } = await api.put<Recolte>(`/recoltes/${idRecolte}`, d);
  return data;
}

export async function supprimerRecolte(idRecolte: string): Promise<void> {
  await api.delete(`/recoltes/${idRecolte}`);
}