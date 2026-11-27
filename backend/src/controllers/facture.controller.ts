import { Request, Response } from 'express';
import * as service from '../services/facture.service';

function texte(valeur: unknown): string {
  return typeof valeur === 'string' ? valeur : '';
}

export async function postFacture(req: Request, res: Response) {
  try {
    const r = await service.envoyerFacture(texte(req.body.idCommande), texte(req.body.idUser));
    if (!r.ok) return res.status(r.status).json({ message: r.message });
    res.status(201).json(r.data);
  } catch (err) {
    console.error('Erreur facture :', err);
    res.status(500).json({ message: `Erreur serveur : ${(err as Error).message}` });
  }
}