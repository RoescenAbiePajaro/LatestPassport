import { useState } from 'react';

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    feedbackType: '',
    rating: '',
    feedbackDetails: '',
    improvementSuggestions: '',
    wouldRecommend: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      feedbackType: '',
      rating: '',
      feedbackDetails: '',
      improvementSuggestions: '',
      wouldRecommend: '',
    });
    setError(null);
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Format rating as a number before sending
      const formattedData = {
        ...formData,
        rating: parseInt(formData.rating, 10)
      };
      
      // Send the data to the backend API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit feedback');
      }
      
      setSuccessMessage('Thank you for your feedback! We appreciate your time.');
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to submit feedback. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow-sm border border-gray-200">
      <h1 className="text-2xl font-bold text-center mb-6">Customer Feedback Form</h1>
      
      {/* Status Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Contact Information */}
        <div className="border-b border-gray-300 pb-2 mb-6">
          <h2 className="text-lg font-medium text-gray-700">Contact Information</h2>
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        {/* Feedback Details */}
        <div className="border-b border-gray-300 pb-2 mb-6 mt-8">
          <h2 className="text-lg font-medium text-gray-700">Feedback Details</h2>
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">
            Feedback Type <span className="text-red-500">*</span>
          </label>
          <select
            name="feedbackType"
            value={formData.feedbackType}
            onChange={handleChange}
            className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Select</option>
            <option value="GENERAL_FEEDBACK">General Feedback</option>
            <option value="PRODUCT_FEEDBACK">Product Feedback</option>
            <option value="CUSTOMER_SERVICE">Customer Service</option>
            <option value="WEBSITE_EXPERIENCE">Website Experience</option>
            <option value="SUGGESTION">Suggestion</option>
            <option value="COMPLAINT">Complaint</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">
            Overall Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4 mt-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <label key={value} className="flex items-center">
                <input
                  type="radio"
                  name="rating"
                  value={value}
                  checked={formData.rating === value.toString()}
                  onChange={() => setFormData({ ...formData, rating: value.toString() })}
                  className="mr-1"
                  required
                />
                {value}
              </label>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Very Dissatisfied</span>
            <span>Very Satisfied</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">
            Feedback Details <span className="text-red-500">*</span>
          </label>
          <textarea
            name="feedbackDetails"
            value={formData.feedbackDetails}
            onChange={handleChange}
            rows="4"
            className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
            required
            placeholder="Please share your experience..."
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">
            How can we improve?
          </label>
          <textarea
            name="improvementSuggestions"
            value={formData.improvementSuggestions}
            onChange={handleChange}
            rows="3"
            className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
            placeholder="Your suggestions for improvement..."
          ></textarea>
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-1">
            Would you recommend us to others? <span className="text-red-500">*</span>
          </label>
          <select
            name="wouldRecommend"
            value={formData.wouldRecommend}
            onChange={handleChange}
            className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Select</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
            <option value="MAYBE">Maybe</option>
          </select>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
          <button
            type="button"
            className="bg-white border border-gray-400 text-gray-700 px-6 py-2 rounded hover:bg-gray-50"
            onClick={resetForm}
            disabled={loading}
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
}