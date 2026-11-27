import { api } from './api';
import { lireSession } from '../utils/session';

export type Profil = {
  idUser: string;
  email: string;
  role: 'RESPONSABLE' | 'PRESIDENT';
  idCoop: string | null;
  nomCoop: string | null;
  nom: string | null;
  prenom: string | null;
  adresse: string | null;
  dateNaissance: string | null;
};

export type DonneesIdentite = {
  email: string;
  nom: string;
  prenom: string;
  adresse: string;
  dateNaissance: string;
};

export type DonneesPresident = DonneesIdentite & {
  idCoop: string;
  motDePasse: string;
};

function idUser(): string {
  return lireSession()?.idUser ?? '';
}

export async function getProfil(): Promise<Profil> {
  const { data } = await api.get<Profil>('/utilisateurs/moi', { params: { idUser: idUser() } });
  return data;
}

export async function modifierProfil(d: DonneesIdentite): Promise<Profil> {
  const { data } = await api.put<Profil>('/utilisateurs/moi', { ...d, idUser: idUser() });
  return data;
}

export async function changerMotDePasse(ancien: string, nouveau: string): Promise<void> {
  await api.put('/utilisateurs/moi/mot-de-passe', {
    idUser: idUser(),
    ancienMotDePasse: ancien,
    nouveauMotDePasse: nouveau,
  });
}

// Création du compte président par le responsable SOAM
export async function creerPresident(d: DonneesPresident): Promise<{ idUser: string; email: string; idCoop: string }> {
  const { data } = await api.post('/utilisateurs/presidents', { ...d, idUser: idUser() });
  return data;
}