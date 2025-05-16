import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  feedbackType: {
    type: String,
    required: [true, 'Feedback type is required'],
    enum: ['GENERAL_FEEDBACK', 'PRODUCT_FEEDBACK', 'CUSTOMER_SERVICE', 'WEBSITE_EXPERIENCE', 'SUGGESTION', 'COMPLAINT']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  feedbackDetails: {
    type: String,
    required: [true, 'Feedback details are required'],
    trim: true
  },
  improvementSuggestions: {
    type: String,
    trim: true
  },
  wouldRecommend: {
    type: String,
    required: [true, 'Recommendation preference is required'],
    enum: ['YES', 'NO', 'MAYBE']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;