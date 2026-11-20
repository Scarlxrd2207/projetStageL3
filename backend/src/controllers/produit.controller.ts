import { Request, Response } from 'express';
import * as service from '../services/produit.service';

function lireId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

export async function getProduits(_req: Request, res: Response) {
  res.json(await service.lister());
}

export async function getProduit(req: Request, res: Response) {
  const produit = await service.trouver(lireId(req));
  if (!produit) return res.status(404).json({ message: 'Produit introuvable' });
  res.json(produit);
}

export async function postProduit(req: Request, res: Response) {
  const r = await service.ajouter(req.body.nomProduit);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.status(201).json(r.produit);
}

export async function putProduit(req: Request, res: Response) {
  const r = await service.modifier(lireId(req), req.body.nomProduit);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.produit);
}

export async function deleteProduit(req: Request, res: Response) {
  const r = await service.supprimer(lireId(req));
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.status(204).end();
}