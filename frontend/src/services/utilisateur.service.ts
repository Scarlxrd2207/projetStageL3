import { api } from './api';

export type DonneesPresident = {
  email: string;
  motDePasse: string;
  idCoop: string;
};

// idUser : identifiant du responsable connecté (son rôle est recontrôlé par le serveur)
export async function creerPresident(idUser: string, d: DonneesPresident) {
  const { data } = await api.post('/utilisateurs/presidents', { idUser, ...d });
  return data;
}