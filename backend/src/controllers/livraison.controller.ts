import { Request, Response } from 'express';
import * as service from '../services/livraison.service';

function texte(valeur: unknown): string {
  return typeof valeur === 'string' ? valeur : '';
}

export async function getLivraisons(req: Request, res: Response) {
  const statut = typeof req.query.statut === 'string' && req.query.statut !== ''
    ? req.query.statut
    : undefined;
  const r = await service.lister(texte(req.query.idUser), statut);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.data);
}

export async function postConfirmerLivraison(req: Request, res: Response) {
  const r = await service.confirmer(String(req.params.id), texte(req.body.idUser));
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.data);
}