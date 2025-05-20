import express from 'express';
import {
  submitFeedback,
  getFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
} from '../controllers/feedback.controller.js';

const router = express.Router();

router.post("/feedback", submitFeedback);
router.get("/feedback", getFeedback);
router.get("/feedback/:id", getFeedbackById);
router.put("/feedback/:id", updateFeedback);
router.delete("/feedback/:id", deleteFeedback);

export default router;
