import { Request, Response } from 'express';
import * as service from '../services/recolte.service';

<<<<<<< HEAD
function texte(valeur: unknown): string {
  return typeof valeur === 'string' ? valeur : '';
}

=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
function lireId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

<<<<<<< HEAD
function envoyer(res: Response, r: service.Resultat) {
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  if (r.status === 204) return res.status(204).end();
  return res.status(r.status).json(r.data);
}

// Président : toutes les récoltes de sa coopérative
export async function getRecoltes(req: Request, res: Response) {
  envoyer(res, await service.lister(texte(req.query.idUser)));
}

// Responsable : récoltes encore disponibles d'une coopérative
export async function getRecoltesDisponibles(req: Request, res: Response) {
  envoyer(res, await service.disponibles(texte(req.query.idUser), texte(req.query.idCoop)));
}

export async function getRecolte(req: Request, res: Response) {
  envoyer(res, await service.trouver(texte(req.query.idUser), lireId(req)));
}

export async function postRecolte(req: Request, res: Response) {
  envoyer(res, await service.ajouter(texte(req.body.idUser), req.body));
}

export async function putRecolte(req: Request, res: Response) {
  envoyer(res, await service.modifier(texte(req.body.idUser), lireId(req), req.body));
}

export async function deleteRecolte(req: Request, res: Response) {
  envoyer(res, await service.supprimer(texte(req.query.idUser), lireId(req)));
=======
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
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
}