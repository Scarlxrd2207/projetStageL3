import { Request, Response } from 'express';
import * as service from '../services/stock.service';
import { exigerUtilisateur, exigerResponsable } from '../utils/acces';

function texte(valeur: unknown): string {
  return typeof valeur === 'string' ? valeur : '';
}

// Le président ne voit que le stock de sa coopérative ; le responsable voit tout
export async function getStock(req: Request, res: Response) {
  const s = await exigerUtilisateur(texte(req.query.idUser));
  if (!s.ok) return res.status(s.status).json({ message: s.message });

  const idCoop = s.role === 'PRESIDENT' ? (s.idCoop ?? undefined) : (texte(req.query.idCoop) || undefined);
  res.json(await service.lister(idCoop));
}

// Stock central SOAM : responsable uniquement
export async function getStockSoam(req: Request, res: Response) {
  const s = await exigerResponsable(texte(req.query.idUser));
  if (!s.ok) return res.status(s.status).json({ message: s.message });

  res.json(await service.soam());
}

// Détail : le président ne peut consulter que le stock de sa coopérative
export async function getStockDetail(req: Request, res: Response) {
  const s = await exigerUtilisateur(texte(req.query.idUser));
  if (!s.ok) return res.status(s.status).json({ message: s.message });

  const demandee = texte(req.query.idCoop);
  const idProduit = texte(req.query.idProduit);

  if (s.role === 'PRESIDENT' && demandee && demandee !== s.idCoop) {
    return res.status(403).json({ message: "Ce stock n'appartient pas à votre coopérative" });
  }

  const idCoop = s.role === 'PRESIDENT' ? (s.idCoop ?? '') : demandee;
  if (!idCoop || !idProduit) {
    return res.status(400).json({ message: 'Coopérative et produit obligatoires' });
  }

  const r = await service.detail(idCoop, idProduit);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.detail);
}