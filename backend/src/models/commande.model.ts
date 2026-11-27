export type StatutCommande = 'EN_ATTENTE' | 'EN_COURS_LIVRAISON' | 'LIVREE' | 'REFUSEE';
export type StatutPaiement = 'PAYE' | 'NON_PAYE';

export interface Commande {
  idCommande: string;
  dateCommande: string;
  dateAcceptation: string | null;
  dateLivraison: string | null;
  statutCommande: StatutCommande;
  statutPaiement: StatutPaiement;
  idCoop: string;
  idUser: string;
}

export interface LigneCommande {
  idLigneCommande: string;
  idRecolte: string;
  quantiteDemandee: number;
  quantiteConfirmee: number | null;
}