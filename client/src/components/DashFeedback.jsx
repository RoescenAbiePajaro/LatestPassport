
import { useState, useEffect } from 'react'; import { Trash2, Edit, Save, X, Check, AlertCircle, MessageSquare } from 'lucide-react'; // Mock database - in a real app, this would be replaced with API calls const initialFeedback = [ { id: 1, name: 'John Doe', email: 'john@example.com', type:
export default function FeedbackCRUD() {
  const [feedback, setFeedback] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalFeedbacks: 0,
    unresolvedCount: 0,
    resolvedCount: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    feedbackType: 'GENERAL_FEEDBACK',
    rating: 5,
    feedbackDetails: '',
    improvementSuggestions: '',
    wouldRecommend: 'YES'
  });

  // Fetch all feedback from API
  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/feedback/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setFeedback(data.data);
        calculateStats(data.data);
      }
    } catch (err) {
      setError('Failed to fetch feedback data');
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch feedback statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/feedback/statistics/overview`);

      const data = await response.json();
      if (data.success) {
        const statsData = data.data.stats;
        setStats({
          totalFeedbacks: statsData.totalFeedbacks || 0,
          // Since the backend doesn't directly provide unresolved count,
          // we'll get this from the data we fetch for the main list
          unresolvedCount: 0,
          resolvedCount: 0
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Calculate stats manually from feedback data (since our API doesn't provide this directly)
  const calculateStats = (feedbackData) => {
    // Note: The current backend model doesn't have a status field, so we can't calculate
    // resolved vs unresolved. This is just a placeholder for when that functionality is added.
    setStats({
      totalFeedbacks: feedbackData.length,
      unresolvedCount: 0, // Will need to be updated when status field is added
      resolvedCount: 0    // Will need to be updated when status field is added
    });
  };

  // Load feedback data when component mounts
  useEffect(() => {
    fetchFeedback();
    fetchStats();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      feedbackType: 'GENERAL_FEEDBACK',
      rating: 5,
      feedbackDetails: '',
      improvementSuggestions: '',
      wouldRecommend: 'YES'
    });
    setIsEditMode(false);
    setCurrentFeedback(null);
  };

  // Open form for creating new feedback
  const handleOpenForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  // Open form for editing existing feedback
  const handleEdit = (id) => {
    const feedbackToEdit = feedback.find(item => item._id === id);
    setFormData({
      fullName: feedbackToEdit.fullName,
      email: feedbackToEdit.email,
      phoneNumber: feedbackToEdit.phoneNumber || '',
      feedbackType: feedbackToEdit.feedbackType,
      rating: feedbackToEdit.rating,
      feedbackDetails: feedbackToEdit.feedbackDetails,
      improvementSuggestions: feedbackToEdit.improvementSuggestions || '',
      wouldRecommend: feedbackToEdit.wouldRecommend
    });
    setCurrentFeedback(id);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  // Submit form - create or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditMode && currentFeedback) {
        // Update existing feedback
        const response = await fetch(`/api/feedback/${currentFeedback}`,
          {
          method: 'PUT',
          headers: 
          {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        const data = await response.json();

        if (data.success) {
          setFeedback(feedback.map(item => 
            item._id === currentFeedback 
              ? data.data
              : item
          ));
        }
      } else {
        // Create new feedback
        const response = await fetch('/api/feedback/', 
          {
          method: 'POST',
          headers: 
          {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (data.success) {
          setFeedback([...feedback, data.data]);
        }
      }
      
      setIsFormOpen(false);
      resetForm();
      // Refresh all data
      fetchFeedback();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  // Delete feedback
  const deleteFeedback = async (id) => {
    try {
      const response = await fetch(`/api/feedback/${id}`, 
        {
        method: 'DELETE',
        headers: 
        {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        const updatedFeedback = feedback.filter(item => item._id !== id);
        setFeedback(updatedFeedback);
        calculateStats(updatedFeedback);
      }
    } catch (err) {
      console.error('Error deleting feedback:', err);
      alert('Failed to delete feedback. Please try again.');
    }
    setConfirmDelete(null);
  };

  // Get filtered feedback items (placeholder for future implementation)
  const getFilteredFeedback = () => {
    // Since our current model doesn't have a status field, we'll just return all feedback
    // This can be updated when the backend model includes status
    return feedback;
  };

  // Format date to YYYY-MM-DD
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Map between feedbackType and display colors
  const getTypeColor = (type) => {
    switch (type) {
      case 'PRODUCT_FEEDBACK':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLAINT':
        return 'bg-red-100 text-red-800';
      case 'SUGGESTION':
        return 'bg-green-100 text-green-800';
      case 'CUSTOMER_SERVICE':
        return 'bg-yellow-100 text-yellow-800';
      case 'WEBSITE_EXPERIENCE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // UI Components
  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Feedback Management System</h1>
      
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <button 
          onClick={handleOpenForm}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex items-center"
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          New Feedback
        </button>
        
        {/* Filter will be implemented when the backend model includes status */}
        {/*
        <div className="flex items-center">
          <label htmlFor="status-filter" className="mr-2 text-gray-700">Status Filter:</label>
          <select 
            id="status-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded py-2 px-3 bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
        */}
      </div>
      
      {/* Feedback Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditMode ? 'Edit Feedback' : 'Add New Feedback'}
              </h2>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="fullName" className="block text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded py-2 px-3"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded py-2 px-3"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="phoneNumber" className="block text-gray-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded py-2 px-3"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="feedbackType" className="block text-gray-700 mb-1">Feedback Type</label>
                <select
                  id="feedbackType"
                  name="feedbackType"
                  value={formData.feedbackType}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded py-2 px-3"
                >
                  <option value="GENERAL_FEEDBACK">General Feedback</option>
                  <option value="PRODUCT_FEEDBACK">Product Feedback</option>
                  <option value="CUSTOMER_SERVICE">Customer Service</option>
                  <option value="WEBSITE_EXPERIENCE">Website Experience</option>
                  <option value="SUGGESTION">Suggestion</option>
                  <option value="COMPLAINT">Complaint</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="rating" className="block text-gray-700 mb-1">Rating (1-5)</label>
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded py-2 px-3"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="feedbackDetails" className="block text-gray-700 mb-1">Feedback Details</label>
                <textarea
                  id="feedbackDetails"
                  name="feedbackDetails"
                  value={formData.feedbackDetails}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full border border-gray-300 rounded py-2 px-3"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="improvementSuggestions" className="block text-gray-700 mb-1">Improvement Suggestions (Optional)</label>
                <textarea
                  id="improvementSuggestions"
                  name="improvementSuggestions"
                  value={formData.improvementSuggestions}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded py-2 px-3"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="wouldRecommend" className="block text-gray-700 mb-1">Would Recommend?</label>
                <select
                  id="wouldRecommend"
                  name="wouldRecommend"
                  value={formData.wouldRecommend}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded py-2 px-3"
                >
                  <option value="YES">Yes</option>
                  <option value="NO">No</option>
                  <option value="MAYBE">Maybe</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center"
                >
                  <Save className="w-5 h-5 mr-1" />
                  {isEditMode ? 'Update' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* Feedback List */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {getFilteredFeedback().length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Would Recommend</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredFeedback().map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item._id.substring(0, 8)}...</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.fullName}</div>
                        <div className="text-sm text-gray-500">{item.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(item.feedbackType)}`}>
                          {item.feedbackType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.rating} / 5
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{item.feedbackDetails}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${item.wouldRecommend === 'YES' ? 'bg-green-100 text-green-800' : 
                            item.wouldRecommend === 'NO' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {item.wouldRecommend}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {confirmDelete === item._id ? (
                          <div className="flex justify-end items-center space-x-2">
                            <span className="text-xs text-red-600">Confirm?</span>
                            <button 
                              onClick={() => deleteFeedback(item._id)}
                              className="text-green-600 hover:text-green-900">
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setConfirmDelete(null)}
                              className="text-gray-600 hover:text-gray-900">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end items-center space-x-3">
                            <button 
                              onClick={() => handleEdit(item._id)}
                              className="text-blue-600 hover:text-blue-900">
                              <Edit className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => setConfirmDelete(item._id)}
                              className="text-red-600 hover:text-red-900">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center flex flex-col items-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-500 text-lg">No feedback found. Create your first feedback entry!</p>
            </div>
          )}
        </div>
      )}
      
      {/* Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Total Feedback</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalFeedbacks}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Average Rating</h3>
          <p className="text-3xl font-bold text-purple-600">
            {feedback.length > 0 
              ? (feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length).toFixed(1)
              : 'N/A'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Would Recommend</h3>
          <p className="text-3xl font-bold text-green-600">
            {feedback.length > 0
              ? `${(feedback.filter(item => item.wouldRecommend === 'YES').length / feedback.length * 100).toFixed(0)}%`
              : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}
