import { Request, Response } from 'express';
import * as service from '../services/transformation.service';

function texte(valeur: unknown): string {
  return typeof valeur === 'string' ? valeur : '';
}

// POST /api/transformations  { idUser, idProduit, quantite }
export async function postTransformation(req: Request, res: Response) {
  try {
    const r = await service.transformer(texte(req.body.idUser), req.body);
    if (!r.ok) return res.status(r.status).json({ message: r.message });
    res.status(r.status).json(r.data);
  } catch (err) {
    console.error('Erreur transformation :', err);
    res.status(500).json({ message: `Erreur serveur : ${(err as Error).message}` });
  }
}