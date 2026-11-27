import { Request, Response } from 'express';
import * as service from '../services/stock.service';
<<<<<<< HEAD
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

=======

function texte(valeur: unknown): string | undefined {
  return typeof valeur === 'string' && valeur !== '' ? valeur : undefined;
}

export async function getStock(req: Request, res: Response) {
  res.json(await service.lister(texte(req.query.idCoop)));
}

export async function getStockSoam(_req: Request, res: Response) {
  res.json(await service.soam());
}

export async function getStockDetail(req: Request, res: Response) {
  const idCoop = texte(req.query.idCoop);
  const idProduit = texte(req.query.idProduit);
  if (!idCoop || !idProduit) {
    return res.status(400).json({ message: 'Coopérative et produit obligatoires' });
  }
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  const r = await service.detail(idCoop, idProduit);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.detail);
}