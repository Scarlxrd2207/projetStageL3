import { Request, Response } from 'express';
import * as service from '../services/commande.service';
<<<<<<< HEAD
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
=======

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
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.data);
}

export async function postCommande(req: Request, res: Response) {
<<<<<<< HEAD
  const s = await exigerResponsable(texte(req.body.idUser));
  if (!s.ok) return res.status(s.status).json({ message: s.message });

  const r = await service.creer(req.body.idCoop, s.idUser, req.body.lignes);
=======
  const idUser = texte(req.body.idUser);
  if (!idUser) {
    return res.status(401).json({ message: 'Utilisateur non identifié, reconnectez-vous' });
  }
  const r = await service.creer(req.body.idCoop, idUser, req.body.lignes);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.status(201).json(r.data);
}

export async function postAccepterCommande(req: Request, res: Response) {
<<<<<<< HEAD
  const r = await service.accepter(lireId(req), texte(req.body.idUser), req.body.lignes);
=======
  const r = await service.accepter(String(req.params.id), texte(req.body.idUser) ?? '', req.body.lignes);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.data);
}

export async function postRefuserCommande(req: Request, res: Response) {
<<<<<<< HEAD
  const r = await service.refuser(lireId(req), texte(req.body.idUser));
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.data);
}

// Mise à jour du paiement par le responsable SOAM
export async function postPaiement(req: Request, res: Response) {
  const r = await service.changerPaiement(lireId(req), texte(req.body.idUser), req.body.statutPaiement);
=======
  const r = await service.refuser(String(req.params.id), texte(req.body.idUser) ?? '');
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.data);
}