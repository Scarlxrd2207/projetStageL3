import { Request, Response } from 'express';
import * as service from '../services/produit.service';

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
=======
export async function getProduits(_req: Request, res: Response) {
  res.json(await service.lister());
}

export async function getProduit(req: Request, res: Response) {
  const produit = await service.trouver(lireId(req));
  if (!produit) return res.status(404).json({ message: 'Produit introuvable' });
  res.json(produit);
}

export async function postProduit(req: Request, res: Response) {
  const r = await service.ajouter(req.body.nomProduit);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.status(201).json(r.produit);
}

export async function putProduit(req: Request, res: Response) {
  const r = await service.modifier(lireId(req), req.body.nomProduit);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.produit);
}

export async function deleteProduit(req: Request, res: Response) {
  const r = await service.supprimer(lireId(req));
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.status(204).end();
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
}