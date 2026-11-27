import { api } from './api';
import { lireSession } from '../utils/session';

export type PresidentLigne = {
  idUser: string;
  email: string;
  nom: string | null;
  prenom: string | null;
  adresse: string | null;
  dateNaissance: string | null;
  idCoop: string | null;
  nomCoop: string | null;
  actifUtilisateur: 'Oui' | 'Non';
};

export type DonneesPresident = {
  nom: string;
  prenom: string;
  dateNaissance: string;
  adresse: string;
  email: string;
  nouveauMotDePasse?: string;
  motDePasseResponsable: string;
};

function idUser(): string {
  return lireSession()?.idUser ?? '';
}

export async function getPresidents(): Promise<PresidentLigne[]> {
  const { data } = await api.get<PresidentLigne[]>('/utilisateurs/presidents', {
    params: { idUser: idUser() },
  });
  return data;
}

export async function modifierPresident(idPresident: string, d: DonneesPresident): Promise<PresidentLigne> {
  const { data } = await api.put<PresidentLigne>(`/utilisateurs/presidents/${idPresident}`, {
    ...d,
    idUser: idUser(),
  });
  return data;
}

export async function changerActifPresident(
  idPresident: string,
  actif: boolean,
  motDePasseResponsable: string
): Promise<void> {
  await api.put(`/utilisateurs/presidents/${idPresident}/actif`, {
    idUser: idUser(),
    actif,
    motDePasseResponsable,
  });
}