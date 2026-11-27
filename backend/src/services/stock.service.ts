import { stockParCooperative, stockSoam, detailRecoltesStock } from '../repositories/stock.repository';
import { trouverCooperative } from '../repositories/cooperative.repository';
import { trouverProduit } from '../repositories/produit.repository';
import type { DetailStock } from '../models/stock.model';

export type ResultatDetail = {
  ok: boolean;
  status: number;
  message?: string;
  detail?: DetailStock;
};

export async function lister(idCoop?: string) {
  return stockParCooperative(idCoop);
}

export async function soam() {
  return stockSoam();
}

// Le détail a besoin du nom de la coopérative et du produit pour l'en-tête
export async function detail(idCoop: string, idProduit: string): Promise<ResultatDetail> {
  const coop = await trouverCooperative(idCoop);
  if (!coop) return { ok: false, status: 404, message: 'Coopérative introuvable' };

  const produit = await trouverProduit(idProduit);
  if (!produit) return { ok: false, status: 404, message: 'Produit introuvable' };

  const recoltes = await detailRecoltesStock(idCoop, idProduit);
  return {
    ok: true,
    status: 200,
    detail: { nomCoop: coop.nomCoop, nomProduit: produit.nomProduit, recoltes },
  };
}