import { api } from './api';

export type StockCooperative = {
  idCoop: string;
  nomCoop: string;
  idProduit: string;
  nomProduit: string;
  quantiteRestante: number;
  nbRecoltes: number;
};

export type StockSoam = {
  idProduit: string;
  nomProduit: string;
  quantiteStock: number;
};

export type DetailRecolteStock = {
  dateRecolte: string;
  nomMembre: string;
  prenomMembre: string;
  districtMembre: string;
  communeMembre: string;
  fokotanyMembre: string;
  quantiteDeclaree: number;
  quantiteRestante: number;
};

export type DetailStock = {
  nomCoop: string;
  nomProduit: string;
  recoltes: DetailRecolteStock[];
};

export async function getStockCooperatives(idCoop?: string): Promise<StockCooperative[]> {
  const { data } = await api.get<StockCooperative[]>('/stock', {
    params: idCoop ? { idCoop } : {},
  });
  return data;
}

export async function getStockSoam(): Promise<StockSoam[]> {
  const { data } = await api.get<StockSoam[]>('/stock/soam');
  return data;
}

export async function getDetailStock(idCoop: string, idProduit: string): Promise<DetailStock> {
  const { data } = await api.get<DetailStock>('/stock/detail', {
    params: { idCoop, idProduit },
  });
  return data;
}