import { Request, Response } from 'express';
import * as service from '../services/commande.service';
import { exigerUtilisateur, exigerResponsable } from '../utils/acces';

function texte(valeur: unknown): string {
  return typeof valeur === 'string' ? valeur : '';
}

function lireId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

export async function getCommandes(req: Request, res: Response) {
  const s = await exigerUtilisateur(texte(req.query.idUser));
  if (!s.ok) return res.status(s.status).json({ message: s.message });

  const idCoop = s.role === 'PRESIDENT' ? (s.idCoop ?? undefined) : (texte(req.query.idCoop) || undefined);
  res.json(await service.lister({ idCoop }));
}

export async function getCommande(req: Request, res: Response) {
  const s = await exigerUtilisateur(texte(req.query.idUser));
  if (!s.ok) return res.status(s.status).json({ message: s.message });

  const idCoop = s.role === 'PRESIDENT' ? (s.idCoop ?? undefined) : undefined;
  const r = await service.detail(lireId(req), idCoop);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.data);
}

export async function postCommande(req: Request, res: Response) {
  const s = await exigerResponsable(texte(req.body.idUser));
  if (!s.ok) return res.status(s.status).json({ message: s.message });

  const r = await service.creer(req.body.idCoop, s.idUser, req.body.lignes);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.status(201).json(r.data);
}

export async function postAccepterCommande(req: Request, res: Response) {
  const r = await service.accepter(lireId(req), texte(req.body.idUser), req.body.lignes);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.data);
}

export async function postRefuserCommande(req: Request, res: Response) {
  const r = await service.refuser(lireId(req), texte(req.body.idUser));
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.data);
}

// Mise à jour du paiement par le responsable SOAM
export async function postPaiement(req: Request, res: Response) {
  const r = await service.changerPaiement(lireId(req), texte(req.body.idUser), req.body.statutPaiement);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.data);
}