import { api } from './api';
<<<<<<< HEAD
import { lireSession } from '../utils/session';
=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

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

<<<<<<< HEAD
function idUser(): string {
  return lireSession()?.idUser ?? '';
}

export async function getStockCooperatives(idCoop?: string): Promise<StockCooperative[]> {
  const { data } = await api.get<StockCooperative[]>('/stock', {
    params: { idUser: idUser(), ...(idCoop ? { idCoop } : {}) },
=======
export async function getStockCooperatives(idCoop?: string): Promise<StockCooperative[]> {
  const { data } = await api.get<StockCooperative[]>('/stock', {
    params: idCoop ? { idCoop } : {},
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  });
  return data;
}

<<<<<<< HEAD
// Réservé au responsable : le serveur refuse l'accès au président
export async function getStockSoam(): Promise<StockSoam[]> {
  const { data } = await api.get<StockSoam[]>('/stock/soam', { params: { idUser: idUser() } });
=======
export async function getStockSoam(): Promise<StockSoam[]> {
  const { data } = await api.get<StockSoam[]>('/stock/soam');
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return data;
}

export async function getDetailStock(idCoop: string, idProduit: string): Promise<DetailStock> {
  const { data } = await api.get<DetailStock>('/stock/detail', {
<<<<<<< HEAD
    params: { idCoop, idProduit, idUser: idUser() },
=======
    params: { idCoop, idProduit },
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  });
  return data;
}