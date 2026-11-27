import { api } from './api';
import { lireSession } from '../utils/session';

// Prix en Ariary par kilogramme
export type Produit = {
  idProduit: string;
  nomProduit: string;
  prixUnitaire: number;
};

export type DonneesProduit = {
  nomProduit: string;
  prixUnitaire: number;
};

function idUser(): string {
  return lireSession()?.idUser ?? '';
}

export async function getProduits(): Promise<Produit[]> {
  const { data } = await api.get<Produit[]>('/produits', { params: { idUser: idUser() } });
  return data;
}

export async function getProduit(idProduit: string): Promise<Produit> {
  const { data } = await api.get<Produit>(`/produits/${idProduit}`, { params: { idUser: idUser() } });
  return data;
}

export async function creerProduit(d: DonneesProduit): Promise<Produit> {
  const { data } = await api.post<Produit>('/produits', { ...d, idUser: idUser() });
  return data;
}

// Le nom ET le prix sont envoyés ensemble : le backend exige les deux
export async function modifierProduit(idProduit: string, d: DonneesProduit): Promise<Produit> {
  const { data } = await api.put<Produit>(`/produits/${idProduit}`, { ...d, idUser: idUser() });
  return data;
}

export async function supprimerProduit(idProduit: string): Promise<void> {
  await api.delete(`/produits/${idProduit}`, { params: { idUser: idUser() } });
}