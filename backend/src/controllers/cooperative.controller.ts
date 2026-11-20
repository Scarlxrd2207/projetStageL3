import { Request, Response } from 'express';
import * as service from '../services/cooperative.service';

// Garantit que l'identifiant est une seule chaîne
function lireId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

export async function getCooperatives(req: Request, res: Response) {
  const filtres = {
    district: typeof req.query.district === 'string' ? req.query.district : undefined,
    commune: typeof req.query.commune === 'string' ? req.query.commune : undefined,
    fokotany: typeof req.query.fokotany === 'string' ? req.query.fokotany : undefined,
  };
  res.json(await service.lister(filtres));
}

export async function getLieux(_req: Request, res: Response) {
  res.json(await service.lieux());
}

export async function getCooperative(req: Request, res: Response) {
  const cooperative = await service.trouver(lireId(req));
  if (!cooperative) return res.status(404).json({ message: 'Coopérative introuvable' });
  res.json(cooperative);
}

export async function postCooperative(req: Request, res: Response) {
  const r = await service.inscrire(req.body);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.status(201).json(r.cooperative);
}

export async function putCooperative(req: Request, res: Response) {
  const r = await service.modifier(lireId(req), req.body);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.cooperative);
}

export async function deleteCooperative(req: Request, res: Response) {
  const r = await service.supprimer(lireId(req));
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.status(204).end();
}