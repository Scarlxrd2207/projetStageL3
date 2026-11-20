import { api } from './api';
import { lireSession, effacerSession } from '../utils/session';

export type Commande = {
  idCommande: string;
  dateCommande: string;
  dateAcceptation: string | null;
  dateLivraison: string | null;
  statutCommande: 'EN_ATTENTE' | 'EN_COURS_LIVRAISON' | 'LIVREE' | 'REFUSEE';
  statutPaiement: 'PAYE' | 'NON_PAYE';
  idCoop: string;
  nomCoop: string;
  emailResponsable: string;
  nbLignes: number;
  quantiteTotale: number;
};

export type LigneCommande = {
  idLigneCommande: string;
  nomProduit: string;
  nomMembre: string;
  prenomMembre: string;
  districtMembre: string;
  communeMembre: string;
  fokotanyMembre: string;
  dateRecolte: string;
  quantiteDemandee: number;
  quantiteConfirmee: number | null;
  quantiteRestanteRecolte: number;
};

export type DetailCommande = {
  commande: Commande;
  lignes: LigneCommande[];
};

export type LigneSaisie = {
  idRecolte: string;
  quantiteDemandee: number;
};

export type LigneConfirmee = {
  idLigneCommande: string;
  quantiteConfirmee: number;
};

export async function getCommandes(): Promise<Commande[]> {
  const { data } = await api.get<Commande[]>('/commandes');
  return data;
}

export async function getDetailCommande(idCommande: string): Promise<DetailCommande> {
  const { data } = await api.get<DetailCommande>(`/commandes/${idCommande}`);
  return data;
}

export async function creerCommande(
  idCoop: string,
  lignes: LigneSaisie[]
): Promise<{ idCommande: string }> {
  const session = lireSession();
  if (!session) {
    effacerSession();
    throw new Error('Session incomplète : déconnectez-vous puis reconnectez-vous');
  }
  const { data } = await api.post('/commandes', { idCoop, idUser: session.idUser, lignes });
  return data;
}

// Acceptation par le président : quantités confirmées par ligne
export async function accepterCommande(
  idCommande: string,
  idUser: string,
  lignes: LigneConfirmee[]
): Promise<void> {
  await api.post(`/commandes/${idCommande}/accepter`, { idUser, lignes });
}

// Refus par le président : aucun stock n'est modifié
export async function refuserCommande(idCommande: string, idUser: string): Promise<void> {
  await api.post(`/commandes/${idCommande}/refuser`, { idUser });
}