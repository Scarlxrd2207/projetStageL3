import { Request, Response } from 'express';
import * as service from '../services/produit.service';

function texte(valeur: unknown): string {
  return typeof valeur === 'string' ? valeur : '';
}

function lireId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

function envoyer(res: Response, r: service.Resultat) {
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  if (r.status === 204) return res.status(204).end();
  return res.status(r.status).json(r.data);
}

export async function getProduits(req: Request, res: Response) {
  envoyer(res, await service.lister(texte(req.query.idUser)));
}

export async function getProduit(req: Request, res: Response) {
  envoyer(res, await service.trouver(texte(req.query.idUser), lireId(req)));
}

export async function postProduit(req: Request, res: Response) {
  envoyer(res, await service.ajouter(texte(req.body.idUser), req.body));
}

export async function putProduit(req: Request, res: Response) {
  envoyer(res, await service.modifier(texte(req.body.idUser), lireId(req), req.body));
}

export async function deleteProduit(req: Request, res: Response) {
  envoyer(res, await service.supprimer(texte(req.query.idUser), lireId(req)));
}