export interface Membre {
  idMembre: string;
  nomMembre: string;
  prenomMembre: string;
  telephoneMembre: string | null;
  districtMembre: string;
  communeMembre: string;
  fokotanyMembre: string;
  actifMembre: 'Oui' | 'Non';
  idCoop: string;
}