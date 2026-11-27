import { api } from './api';
import { lireSession } from '../utils/session';

export async function envoyerFacture(idCommande: string): Promise<{ idMessage: string; numero: string }> {
  const { data } = await api.post<{ idMessage: string; numero: string }>('/factures', {
    idCommande,
    idUser: lireSession()?.idUser ?? '',
  });
  return data;
}