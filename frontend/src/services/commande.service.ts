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
  // Montants en Ariary
  montantEstime: number;
  montantConfirme: number;
  montantTotal: number;
};

export type LigneCommande = {
  idLigneCommande: string;
  nomProduit: string;
  prixUnitaire: number;
  nomMembre: string;
  prenomMembre: string;
  districtMembre: string;
  communeMembre: string;
  fokotanyMembre: string;
  dateRecolte: string;
  quantiteDemandee: number;
  quantiteConfirmee: number | null;
  quantiteRestanteRecolte: number;
  montantLigne: number;
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

function idUser(): string {
  return lireSession()?.idUser ?? '';
}

// Le président ne reçoit que les commandes de sa coopérative
export async function getCommandes(): Promise<Commande[]> {
  const { data } = await api.get<Commande[]>('/commandes', { params: { idUser: idUser() } });
  return data;
}

export async function getDetailCommande(idCommande: string): Promise<DetailCommande> {
  const { data } = await api.get<DetailCommande>(`/commandes/${idCommande}`, {
    params: { idUser: idUser() },
  });
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

export async function accepterCommande(
  idCommande: string,
  idUser: string,
  lignes: LigneConfirmee[]
): Promise<void> {
  await api.post(`/commandes/${idCommande}/accepter`, { idUser, lignes });
}

export async function refuserCommande(idCommande: string, idUser: string): Promise<void> {
  await api.post(`/commandes/${idCommande}/refuser`, { idUser });
}

// Statut de paiement : responsable SOAM uniquement
export async function changerStatutPaiement(
  idCommande: string,
  idUser: string,
  statut: 'PAYE' | 'NON_PAYE'
): Promise<void> {
  await api.post(`/commandes/${idCommande}/paiement`, { idUser, statutPaiement: statut });
}