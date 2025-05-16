import express from 'express';
import { check } from 'express-validator';
import {
  getAllFeedback,
  createFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  getFeedbackStats
} from '../controllers/feedback.controller.js';

const router = express.Router();

router.get('/', getAllFeedback);
router.post('/', createFeedback);
router.get('/:id', getFeedbackById);
router.put('/:id', updateFeedback);
router.delete('/:id', deleteFeedback);
router.get('/statistics/overview', getFeedbackStats);

export default router;