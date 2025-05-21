import express from 'express';
import { 
  createLogo, 
  getAllLogos, 
  getLogoById, 
  getLogosByUserId, 
  updateLogo, 
  deleteLogo 
} from '../controllers/logo.controller.js';

const router = express.Router();

router.post('/', createLogo);
router.get('/', getAllLogos);
router.get('/:id', getLogoById);
router.get('/user/:userId', getLogosByUserId);
router.put('/:id', updateLogo);
router.delete('/:id', deleteLogo);

export default router;