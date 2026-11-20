import { Request, Response } from 'express';
import * as service from '../services/utilisateur.service';

// Lit une valeur texte du corps de la requête ; renvoie '' si absente
function texte(valeur: unknown): string {
  return typeof valeur === 'string' ? valeur : '';
}

// POST /api/utilisateurs/presidents
export async function postCreerPresident(req: Request, res: Response) {
  const r = await service.creerComptePresident(texte(req.body.idUser), {
    email: texte(req.body.email),
    motDePasse: texte(req.body.motDePasse),
    idCoop: texte(req.body.idCoop),
  });

  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.status(201).json(r.data);
}