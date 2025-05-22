import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    feedback: {
      type: String,
      enum: ["up", "down"],
      required: true,
    },
    comment: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
