// controllers/feedback.controller.js
import Feedback from "../models/feedback.model.js";

export const submitFeedback = async (req, res) => {
  try {
    const { feedback, comment } = req.body;

    if (!feedback || !["up", "down"].includes(feedback)) {
      return res.status(400).json({ message: "Invalid feedback type." });
    }

    const newFeedback = new Feedback({ feedback, comment });
    await newFeedback.save();

    res.status(201).json({ message: "Feedback submitted successfully.", data: newFeedback });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Get all feedback
export const getFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json({ data: feedbacks });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Get feedback by ID
export const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    res.status(200).json({ data: feedback });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Update feedback
export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback, comment } = req.body;

    if (feedback && !["up", "down"].includes(feedback)) {
      return res.status(400).json({ message: "Invalid feedback type." });
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { feedback, comment },
      { new: true, runValidators: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    res.status(200).json({ message: "Feedback updated successfully.", data: updatedFeedback });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Delete feedback
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Feedback.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    res.status(200).json({ message: "Feedback deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};