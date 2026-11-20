import { Router } from 'express';
import {
  getCooperatives,
  getLieux,
  getCooperative,
  postCooperative,
  putCooperative,
  deleteCooperative,
} from '../controllers/cooperative.controller';

const router = Router();

router.get('/', getCooperatives);
router.get('/lieux', getLieux);       // doit rester avant /:id
router.get('/:id', getCooperative);
router.post('/', postCooperative);
router.put('/:id', putCooperative);
router.delete('/:id', deleteCooperative);

export default router;