import { Router } from 'express';
import {
  postCreerPresident,
  getMoi,
  putMoi,
  putMotDePasse,
  getPresidents,
  getPresident,
  putPresident,
  putPresidentActif,
} from '../controllers/utilisateur.controller';

const router = Router();

// Profil de l'utilisateur connecté
router.get('/moi', getMoi);
router.put('/moi', putMoi);
router.put('/moi/mot-de-passe', putMotDePasse);

// Gestion des présidents par le responsable
router.get('/presidents', getPresidents);
router.post('/presidents', postCreerPresident);
router.get('/presidents/:id', getPresident);
router.put('/presidents/:id', putPresident);
router.put('/presidents/:id/actif', putPresidentActif);

export default router;






