import { api } from './api';

export async function login(email: string, motDePasse: string) {
  const { data } = await api.post('/auth/login', { email, motDePasse });
  return data as { idUser: string; email: string; role: string; idCoop: string | null };
}