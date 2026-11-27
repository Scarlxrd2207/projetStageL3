import { api } from './api';

<<<<<<< HEAD
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
=======
export async function login(email: string, motDePasse: string) {
  const { data } = await api.post('/auth/login', { email, motDePasse });
  return data as { idUser: string; email: string; role: string; idCoop: string | null };
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
}