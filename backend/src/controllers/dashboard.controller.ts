import { Request, Response } from 'express';
import * as servicePresident from '../services/dashboard.service';
import * as serviceResponsable from '../services/dashboardResponsable.service';

function texte(valeur: unknown): string {
  return typeof valeur === 'string' ? valeur : '';
}

export async function getDashboardPresident(req: Request, res: Response) {
  const r = await servicePresident.presidentDashboard(texte(req.query.idUser));
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.data);
}

export async function getDashboardResponsable(req: Request, res: Response) {
  const r = await serviceResponsable.responsableDashboard(texte(req.query.idUser));
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.data);
}