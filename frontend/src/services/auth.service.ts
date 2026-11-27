import { api } from './api';

export type UtilisateurConnecte = {
  idUser: string;
  email: string;
  role: string;
  idCoop: string | null;
  nomCoop: string | null;
};

export async function login(email: string, motDePasse: string): Promise<UtilisateurConnecte> {
  const { data } = await api.post<UtilisateurConnecte>('/auth/login', { email, motDePasse });
  return data;
}