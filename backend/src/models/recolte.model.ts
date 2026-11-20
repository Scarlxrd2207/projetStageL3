export interface Recolte {
  idRecolte: string;
  dateRecolte: string;
  quantiteDeclaree: number;
  quantiteRestante: number;
  idMembre: string;
  idProduit: string;
}

// Une récolte avec les noms (produit, membre, coopérative) et le lieu du membre
export interface RecolteDetail extends Recolte {
  nomProduit: string;
  nomMembre: string;
  prenomMembre: string;
  districtMembre: string;
  communeMembre: string;
  fokotanyMembre: string;
  idCoop: string;
  nomCoop: string;
}