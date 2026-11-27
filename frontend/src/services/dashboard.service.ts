import { api } from './api';
import { lireSession } from '../utils/session';

export type DonneesPresident = {
  indicateurs: {
    membresActifs: number;
    recoltes: number;
    stockKg: number;
    commandesAttente: number;
    livraisonsEnCours: number;
    paiementsEnAttente: number;
  };
  commandes: {
    idCommande: string;
    dateCommande: string;
    statutCommande: 'EN_ATTENTE' | 'EN_COURS_LIVRAISON' | 'LIVREE' | 'REFUSEE';
    statutPaiement: 'PAYE' | 'NON_PAYE';
    quantiteTotale: number;
  }[];
};

export type DonneesResponsable = {
  indicateurs: {
    cooperatives: number;
    commandesAttente: number;
    stockKg: number;
    paiementsAttente: number;
    livraisonsEnCours: number;
  };
  commandesParMois: { cle: string; libelle: string; nb: number }[];
  stockParProduit: { nomProduit: string; quantiteStock: number }[];
  dernieresCommandes: {
    idCommande: string;
    dateCommande: string;
    nomCoop: string;
    statutCommande: string;
    statutPaiement: string;
    quantiteTotale: number;
  }[];
};

function idUser(): string {
  return lireSession()?.idUser ?? '';
}

export async function getDashboardPresident(): Promise<DonneesPresident> {
  const { data } = await api.get<DonneesPresident>('/dashboard/president', { params: { idUser: idUser() } });
  return data;
}

export async function getDashboardResponsable(): Promise<DonneesResponsable> {
  const { data } = await api.get<DonneesResponsable>('/dashboard/responsable', { params: { idUser: idUser() } });
  return data;
}