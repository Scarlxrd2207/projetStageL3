import { Request, Response } from 'express';
import * as service from '../services/cooperative.service';
<<<<<<< HEAD
import { exigerUtilisateur, exigerResponsable } from '../utils/acces';

function texte(valeur: unknown): string {
  return typeof valeur === 'string' ? valeur : '';
}

=======

// Garantit que l'identifiant est une seule chaîne
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
function lireId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

<<<<<<< HEAD
// Responsable : toutes les coopératives. Président : seulement la sienne.
export async function getCooperatives(req: Request, res: Response) {
  const s = await exigerUtilisateur(texte(req.query.idUser));
  if (!s.ok) return res.status(s.status).json({ message: s.message });

  const liste = await service.lister({
    district: texte(req.query.district) || undefined,
    commune: texte(req.query.commune) || undefined,
    fokotany: texte(req.query.fokotany) || undefined,
  });

  res.json(s.role === 'PRESIDENT' ? liste.filter((c) => c.idCoop === s.idCoop) : liste);
=======
export async function getCooperatives(req: Request, res: Response) {
  const filtres = {
    district: typeof req.query.district === 'string' ? req.query.district : undefined,
    commune: typeof req.query.commune === 'string' ? req.query.commune : undefined,
    fokotany: typeof req.query.fokotany === 'string' ? req.query.fokotany : undefined,
  };
  res.json(await service.lister(filtres));
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
}

export async function getLieux(_req: Request, res: Response) {
  res.json(await service.lieux());
}

<<<<<<< HEAD
// Le président ne peut lire que sa propre coopérative
export async function getCooperative(req: Request, res: Response) {
  const s = await exigerUtilisateur(texte(req.query.idUser));
  if (!s.ok) return res.status(s.status).json({ message: s.message });

  const idCoop = lireId(req);
  if (s.role === 'PRESIDENT' && s.idCoop !== idCoop) {
    return res.status(403).json({ message: 'Accès refusé à cette coopérative' });
  }

  const cooperative = await service.trouver(idCoop);
=======
export async function getCooperative(req: Request, res: Response) {
  const cooperative = await service.trouver(lireId(req));
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  if (!cooperative) return res.status(404).json({ message: 'Coopérative introuvable' });
  res.json(cooperative);
}

<<<<<<< HEAD
// Écritures réservées au responsable SOAM
export async function postCooperative(req: Request, res: Response) {
  const s = await exigerResponsable(texte(req.body.idUser));
  if (!s.ok) return res.status(s.status).json({ message: s.message });

=======
export async function postCooperative(req: Request, res: Response) {
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  const r = await service.inscrire(req.body);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.status(201).json(r.cooperative);
}

export async function putCooperative(req: Request, res: Response) {
<<<<<<< HEAD
  const s = await exigerResponsable(texte(req.body.idUser));
  if (!s.ok) return res.status(s.status).json({ message: s.message });

=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  const r = await service.modifier(lireId(req), req.body);
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.json(r.cooperative);
}

export async function deleteCooperative(req: Request, res: Response) {
<<<<<<< HEAD
  const s = await exigerResponsable(texte(req.query.idUser));
  if (!s.ok) return res.status(s.status).json({ message: s.message });

=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  const r = await service.supprimer(lireId(req));
  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.status(204).end();
}