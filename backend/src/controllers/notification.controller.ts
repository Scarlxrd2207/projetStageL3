import { Request, Response } from 'express';
import * as service from '../services/notification.service';

function texte(valeur: unknown): string {
  return typeof valeur === 'string' ? valeur : '';
}

export async function getNotifications(req: Request, res: Response) {
  const r = await service.lister(texte(req.query.idUser));
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.data);
}

export async function getCompteurs(req: Request, res: Response) {
  const r = await service.compteurs(texte(req.query.idUser));
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.data);
}