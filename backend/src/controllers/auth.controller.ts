import { Request, Response } from 'express';
import { login } from '../services/auth.service';

export async function postLogin(req: Request, res: Response) {
  const { email, motDePasse } = req.body;

  if (!email || !motDePasse) {
    return res.status(400).json({ message: 'Champs incomplets' });
  }

  const resultat = await login(email, motDePasse);
  if (!resultat.ok) return res.status(401).json({ message: resultat.message });

  res.json(resultat.utilisateur);
}