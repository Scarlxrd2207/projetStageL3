import { Request, Response } from 'express';
import * as service from '../services/statistiques.service';

function texte(valeur: unknown): string {
  return typeof valeur === 'string' ? valeur : '';
}

// GET /api/statistiques?idUser=...&du=AAAA-MM-JJ&au=AAAA-MM-JJ
export async function getTableau(req: Request, res: Response) {
  try {
    const r = await service.tableau(texte(req.query.idUser), req.query.du, req.query.au);
    if (!r.ok) return res.status(r.status).json({ message: r.message });
    res.json(r.data);
  } catch (err) {
    console.error('Erreur statistiques :', err);
    res.status(500).json({ message: `Erreur serveur : ${(err as Error).message}` });
  }
}