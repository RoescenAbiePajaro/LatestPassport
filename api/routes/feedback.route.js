import express from 'express';
import {
  submitFeedback,
  getFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
} from '../controllers/feedback.controller.js';

const router = express.Router();


router.post("/", submitFeedback);
router.get("/", getFeedback);
router.get("/:id", getFeedbackById);
router.put("/:id", updateFeedback);
router.delete("/:id", deleteFeedback);

export default router;