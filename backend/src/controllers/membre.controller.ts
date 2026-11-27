import { Request, Response } from 'express';
import * as service from '../services/membre.service';

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
=======
function erreurServeur(res: Response, err: unknown) {
  console.error(err);
  res.status(500).json({ message: (err as Error).message ?? 'Erreur serveur' });
}

export async function getMembres(req: Request, res: Response) {
  try {
    const idCoop = typeof req.query.idCoop === 'string' ? req.query.idCoop : undefined;
    res.json(await service.lister(idCoop));
  } catch (err) {
    erreurServeur(res, err);
  }
}

export async function getMembre(req: Request, res: Response) {
  try {
    const membre = await service.trouver(lireId(req));
    if (!membre) return res.status(404).json({ message: 'Membre introuvable' });
    res.json(membre);
  } catch (err) {
    erreurServeur(res, err);
  }
}

export async function postMembre(req: Request, res: Response) {
  try {
    const r = await service.ajouter(req.body);
    if (!r.ok) return res.status(r.status).json({ message: r.message });
    res.status(201).json(r.membre);
  } catch (err) {
    erreurServeur(res, err);
  }
}

export async function putMembre(req: Request, res: Response) {
  try {
    const r = await service.modifier(lireId(req), req.body);
    if (!r.ok) return res.status(r.status).json({ message: r.message });
    res.json(r.membre);
  } catch (err) {
    erreurServeur(res, err);
  }
}

export async function putDesactiverMembre(req: Request, res: Response) {
  try {
    const r = await service.desactiver(lireId(req));
    if (!r.ok) return res.status(r.status).json({ message: r.message });
    res.json(r.membre);
  } catch (err) {
    erreurServeur(res, err);
  }
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
}