import { Request, Response } from 'express';
import * as service from '../services/stock.service';

function texte(valeur: unknown): string | undefined {
  return typeof valeur === 'string' && valeur !== '' ? valeur : undefined;
}

export async function getStock(req: Request, res: Response) {
  res.json(await service.lister(texte(req.query.idCoop)));
}

export async function getStockSoam(_req: Request, res: Response) {
  res.json(await service.soam());
}

export async function getStockDetail(req: Request, res: Response) {
  const idCoop = texte(req.query.idCoop);
  const idProduit = texte(req.query.idProduit);
  if (!idCoop || !idProduit) {
    return res.status(400).json({ message: 'Coopérative et produit obligatoires' });
  }
  const r = await service.detail(idCoop, idProduit);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.detail);
}