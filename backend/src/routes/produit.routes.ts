import { Router } from 'express';
import {
  getProduits,
  getProduit,
  postProduit,
  putProduit,
  deleteProduit,
} from '../controllers/produit.controller';

const router = Router();

router.get('/', getProduits);
router.get('/:id', getProduit);
router.post('/', postProduit);
router.put('/:id', putProduit);
router.delete('/:id', deleteProduit);

export default router;