import { Request, Response } from 'express';
import * as service from '../services/conversation.service';

function texte(valeur: unknown): string {
  return typeof valeur === 'string' ? valeur : '';
}

export async function getConversations(req: Request, res: Response) {
  const r = await service.lister(texte(req.query.idUser));
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.data);
}

export async function postOuvrir(req: Request, res: Response) {
  const idCoop = typeof req.body.idCoop === 'string' ? req.body.idCoop : undefined;
  const r = await service.ouvrir(texte(req.body.idUser), idCoop);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.data);
}

export async function getMessages(req: Request, res: Response) {
  const r = await service.messages(String(req.params.id), texte(req.query.idUser));
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.data);
}

export async function postMessage(req: Request, res: Response) {
  const r = await service.envoyer(String(req.params.id), texte(req.body.idUser), req.body.contenu);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.status(201).json(r.data);
}