import { api } from './api';

export type Livraison = {
  idCommande: string;
  dateAcceptation: string | null;
  dateLivraison: string | null;
  statutCommande: 'EN_COURS_LIVRAISON' | 'LIVREE';
  statutPaiement: 'PAYE' | 'NON_PAYE';
  idCoop: string;
  nomCoop: string;
  nbLignes: number;
  quantiteLivree: number;
};

export async function getLivraisons(idUser: string, statut?: string): Promise<Livraison[]> {
  const { data } = await api.get<Livraison[]>('/livraisons', {
    params: { idUser, ...(statut ? { statut } : {}) },
  });
  return data;
}

export async function confirmerLivraison(idCommande: string, idUser: string): Promise<void> {
  await api.post(`/livraisons/${idCommande}/confirmer`, { idUser });
}