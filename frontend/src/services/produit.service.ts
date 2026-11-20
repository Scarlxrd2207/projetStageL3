import { api } from './api';

export type Produit = {
  idProduit: string;
  nomProduit: string;
};

export async function getProduits(): Promise<Produit[]> {
  const { data } = await api.get<Produit[]>('/produits');
  return data;
}

export async function creerProduit(nomProduit: string): Promise<Produit> {
  const { data } = await api.post<Produit>('/produits', { nomProduit });
  return data;
}

export async function modifierProduit(idProduit: string, nomProduit: string): Promise<Produit> {
  const { data } = await api.put<Produit>(`/produits/${idProduit}`, { nomProduit });
  return data;
}

export async function supprimerProduit(idProduit: string): Promise<void> {
  await api.delete(`/produits/${idProduit}`);
}