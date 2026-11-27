import { api } from './api';
import { lireSession } from '../utils/session';

// Sortie du stock central SOAM pour transformation
export async function transformerStock(
  idProduit: string,
  quantite: number,
  motif: string
): Promise<{ restant: number }> {
  const { data } = await api.post<{ restant: number }>('/transformations', {
    idUser: lireSession()?.idUser ?? '',
    idProduit,
    quantite,
    motif,
  });
  return data;
}