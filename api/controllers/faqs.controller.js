import Faqs from '../models/faqs.model.js'; 


export const getAllFaqs = async (req, res) => {
  try {
    const faqs = await Faqs.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQs',
      error: error.message
    });
  }
};

// Get single FAQ by ID
export const getFaqById = async (req, res) => {
  try {
    const faq = await Faqs.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.status(200).json({
      success: true,
      data: faq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQ',
      error: error.message
    });
  }
};

// Create new FAQ
export const createFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;

    // Validation
    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Question and answer are required'
      });
    }

    const newFaq = new Faqs({
      question,
      answer
    });

    const savedFaq = await newFaq.save();

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: savedFaq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating FAQ',
      error: error.message
    });
  }
};

// Update FAQ
export const updateFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;

    // Find and update FAQ
    const updatedFaq = await Faqs.findByIdAndUpdate(
      req.params.id,
      {
        question,
        answer,
        updatedAt: Date.now()
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedFaq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      data: updatedFaq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating FAQ',
      error: error.message
    });
  }
};

// Delete FAQ
export const deleteFaq = async (req, res) => {
  try {
    const deletedFaq = await Faqs.findByIdAndDelete(req.params.id);

    if (!deletedFaq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully',
      data: deletedFaq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting FAQ',
      error: error.message
    });
  }
};

// Search FAQs
export const searchFaqs = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const faqs = await Faqs.find({
      $or: [
        { question: { $regex: q, $options: 'i' } },
        { answer: { $regex: q, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching FAQs',
      error: error.message
    });
  }
};