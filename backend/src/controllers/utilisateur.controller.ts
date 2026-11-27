import { Request, Response } from 'express';
import * as service from '../services/utilisateur.service';

<<<<<<< HEAD
=======
// Lit une valeur texte du corps de la requête ; renvoie '' si absente
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
function texte(valeur: unknown): string {
  return typeof valeur === 'string' ? valeur : '';
}

<<<<<<< HEAD
function erreurServeur(res: Response, err: unknown) {
  console.error('Erreur utilisateurs :', err);
  return res.status(500).json({ message: `Erreur serveur : ${(err as Error).message}` });
}

// POST /api/utilisateurs/presidents
export async function postCreerPresident(req: Request, res: Response) {
  try {
    const r = await service.creerComptePresident(texte(req.body.idUser), req.body);
    if (!r.ok) return res.status(r.status).json({ message: r.message });
    res.status(201).json(r.data);
  } catch (err) {
    erreurServeur(res, err);
  }
}

// GET /api/utilisateurs/moi?idUser=...
export async function getMoi(req: Request, res: Response) {
  try {
    const r = await service.profil(texte(req.query.idUser));
    if (!r.ok) return res.status(r.status).json({ message: r.message });
    res.json(r.data);
  } catch (err) {
    erreurServeur(res, err);
  }
}

// PUT /api/utilisateurs/moi
export async function putMoi(req: Request, res: Response) {
  try {
    const r = await service.modifierProfil(texte(req.body.idUser), req.body);
    if (!r.ok) return res.status(r.status).json({ message: r.message });
    res.json(r.data);
  } catch (err) {
    erreurServeur(res, err);
  }
}

// PUT /api/utilisateurs/moi/mot-de-passe
export async function putMotDePasse(req: Request, res: Response) {
  try {
    const r = await service.changerMotDePasse(
      texte(req.body.idUser),
      texte(req.body.ancienMotDePasse),
      texte(req.body.nouveauMotDePasse)
    );
    if (!r.ok) return res.status(r.status).json({ message: r.message });
    res.json({ message: 'Mot de passe modifié' });
  } catch (err) {
    erreurServeur(res, err);
  }
}

// GET /api/utilisateurs/presidents?idUser=...
export async function getPresidents(req: Request, res: Response) {
  try {
    const r = await service.listerPresidentsService(texte(req.query.idUser));
    if (!r.ok) return res.status(r.status).json({ message: r.message });
    res.json(r.data);
  } catch (err) {
    erreurServeur(res, err);
  }
}

// GET /api/utilisateurs/presidents/:id?idUser=...
export async function getPresident(req: Request, res: Response) {
  try {
    const r = await service.detailPresident(texte(req.query.idUser), String(req.params.id));
    if (!r.ok) return res.status(r.status).json({ message: r.message });
    res.json(r.data);
  } catch (err) {
    erreurServeur(res, err);
  }
}

// PUT /api/utilisateurs/presidents/:id  { idUser, motDePasseResponsable, nom, prenom, ... }
export async function putPresident(req: Request, res: Response) {
  try {
    const r = await service.modifierPresident(texte(req.body.idUser), String(req.params.id), req.body);
    if (!r.ok) return res.status(r.status).json({ message: r.message });
    res.json(r.data);
  } catch (err) {
    erreurServeur(res, err);
  }
}

// PUT /api/utilisateurs/presidents/:id/actif  { idUser, actif, motDePasseResponsable }
export async function putPresidentActif(req: Request, res: Response) {
  try {
    const r = await service.changerActifPresident(
      texte(req.body.idUser),
      String(req.params.id),
      req.body.actif,
      req.body.motDePasseResponsable
    );
    if (!r.ok) return res.status(r.status).json({ message: r.message });
    res.json(r.data);
  } catch (err) {
    erreurServeur(res, err);
  }
=======
// POST /api/utilisateurs/presidents
export async function postCreerPresident(req: Request, res: Response) {
  const r = await service.creerComptePresident(texte(req.body.idUser), {
    email: texte(req.body.email),
    motDePasse: texte(req.body.motDePasse),
    idCoop: texte(req.body.idCoop),
  });

  if (!r.ok) return res.status(r.status).json({ message: r.message });
  res.status(201).json(r.data);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
}