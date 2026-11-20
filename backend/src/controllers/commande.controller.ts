import { Request, Response } from 'express';
import * as service from '../services/commande.service';

function texte(valeur: unknown): string | undefined {
  return typeof valeur === 'string' && valeur !== '' ? valeur : undefined;
}

// Liste : le responsable voit tout (ou une coopérative filtrée), le président seulement la sienne
export async function getCommandes(req: Request, res: Response) {
  const utilisateur = (req as any).utilisateur ?? null;
  const estPresident = utilisateur?.role === 'PRESIDENT';
  const idCoop = estPresident ? utilisateur.idCoop : texte(req.query.idCoop);
  res.json(await service.lister({ idCoop: idCoop ?? undefined }));
}

export async function getCommande(req: Request, res: Response) {
  const utilisateur = (req as any).utilisateur ?? null;
  const idCoop = utilisateur?.role === 'PRESIDENT' ? utilisateur.idCoop : undefined;
  const r = await service.detail(String(req.params.id), idCoop);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.data);
}

export async function postCommande(req: Request, res: Response) {
  const idUser = texte(req.body.idUser);
  if (!idUser) {
    return res.status(401).json({ message: 'Utilisateur non identifié, reconnectez-vous' });
  }
  const r = await service.creer(req.body.idCoop, idUser, req.body.lignes);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.status(201).json(r.data);
}

export async function postAccepterCommande(req: Request, res: Response) {
  const r = await service.accepter(String(req.params.id), texte(req.body.idUser) ?? '', req.body.lignes);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.data);
}

export async function postRefuserCommande(req: Request, res: Response) {
  const r = await service.refuser(String(req.params.id), texte(req.body.idUser) ?? '');
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.data);
}