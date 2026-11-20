import { Request, Response } from 'express';
import * as service from '../services/recolte.service';

function lireId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

export async function getRecoltes(req: Request, res: Response) {
  const idCoop = typeof req.query.idCoop === 'string' ? req.query.idCoop : undefined;
  res.json(await service.lister(idCoop));
}

export async function getRecolte(req: Request, res: Response) {
  const recolte = await service.trouver(lireId(req));
  if (!recolte) return res.status(404).json({ message: 'Récolte introuvable' });
  res.json(recolte);
}

export async function postRecolte(req: Request, res: Response) {
  const r = await service.ajouter(req.body);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.status(201).json(r.recolte);
}

export async function putRecolte(req: Request, res: Response) {
  const r = await service.modifier(lireId(req), req.body);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.recolte);
}

export async function deleteRecolte(req: Request, res: Response) {
  const r = await service.supprimer(lireId(req));
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.status(204).end();
}