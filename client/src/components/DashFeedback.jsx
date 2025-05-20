import { useState, useEffect } from 'react';
import { Trash2, Edit, X, Check, AlertCircle, MessageSquare } from 'lucide-react';

export default function FeedbackCRUD() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [stats, setStats] = useState({
    totalFeedbacks: 0,
    averageRating: 0,
    recommendationRate: 0
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

  // Calculate statistics
  const calculateStats = (feedbackData) => {
    const total = feedbackData.length;
    const averageRating = total > 0 
      ? feedbackData.reduce((sum, item) => sum + item.rating, 0) / total
      : 0;
    const recommendationRate = total > 0
      ? (feedbackData.filter(item => item.wouldRecommend === 'YES').length / total) * 100
      : 0;

    setStats({
      totalFeedbacks: total,
      averageRating,
      recommendationRate
    });
  };

  // Load feedback data when component mounts
  useEffect(() => {
    fetchFeedback();
  }, []);

  // Delete feedback
  const deleteFeedback = async (id) => {
    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE',
        headers: {
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

  // Format date to YYYY-MM-DD
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Map between feedbackType and display colors
  const getTypeColor = (type) => {
    switch (type) {
      case 'POSITIVE_FEEDBACK':
        return 'bg-green-100 text-green-800';
      case 'NEGATIVE_FEEDBACK':
        return 'bg-red-100 text-red-800';
      case 'GENERAL_FEEDBACK':
        return 'bg-blue-100 text-blue-800';
      case 'PRODUCT_FEEDBACK':
        return 'bg-purple-100 text-purple-800';
      case 'COMPLAINT':
        return 'bg-red-100 text-red-800';
      case 'SUGGESTION':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Feedback Dashboard</h1>
      
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
          {feedback.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommend</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feedback.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
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
                          <button 
                            onClick={() => setConfirmDelete(item._id)}
                            className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-5 h-5" />
                          </button>
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
              <p className="text-gray-500 text-lg">No feedback found yet.</p>
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
            {stats.totalFeedbacks > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Would Recommend</h3>
          <p className="text-3xl font-bold text-green-600">
            {stats.totalFeedbacks > 0 ? `${stats.recommendationRate.toFixed(0)}%` : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}