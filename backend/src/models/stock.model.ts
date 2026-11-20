// Stock d'une coopérative pour un produit (calculé depuis les récoltes)
export interface StockCooperative {
  idCoop: string;
  nomCoop: string;
  idProduit: string;
  nomProduit: string;
  quantiteRestante: number;
  nbRecoltes: number;
}

// Stock central SOAM (table stock, type SOAM)
export interface StockSoam {
  idProduit: string;
  nomProduit: string;
  quantiteStock: number;
}

// Une récolte qui compose le stock
export interface DetailRecolteStock {
  dateRecolte: string;
  nomMembre: string;
  prenomMembre: string;
  districtMembre: string;
  communeMembre: string;
  fokotanyMembre: string;
  quantiteDeclaree: number;
  quantiteRestante: number;
}

export interface DetailStock {
  nomCoop: string;
  nomProduit: string;
  recoltes: DetailRecolteStock[];
}