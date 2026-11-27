import { Request, Response } from 'express';
import * as service from '../services/membre.service';

function texte(valeur: unknown): string {
  return typeof valeur === 'string' ? valeur : '';
}

function lireId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

// Réponse uniforme : erreur avec message, ou données avec le statut
function envoyer(res: Response, r: service.Resultat) {
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  return res.status(r.status).json(r.data);
}

export async function getMembres(req: Request, res: Response) {
  envoyer(res, await service.lister(texte(req.query.idUser)));
}

export async function getMembre(req: Request, res: Response) {
  envoyer(res, await service.trouver(texte(req.query.idUser), lireId(req)));
}

export async function postMembre(req: Request, res: Response) {
  envoyer(res, await service.ajouter(texte(req.body.idUser), req.body));
}

export async function putMembre(req: Request, res: Response) {
  envoyer(res, await service.modifier(texte(req.body.idUser), lireId(req), req.body));
}

export async function putDesactiverMembre(req: Request, res: Response) {
  envoyer(res, await service.desactiver(texte(req.body.idUser), lireId(req)));
}