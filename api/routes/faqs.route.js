import express from 'express';
import {
  getAllFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
  searchFaqs
} from '../controllers/faqs.controller.js'; 

const router = express.Router();


router.get('/', getAllFaqs);
router.get('/search', searchFaqs);
router.get('/:id', getFaqById);
router.post('/', createFaq);
router.put('/:id', updateFaq);
router.delete('/:id', deleteFaq);

export default router;