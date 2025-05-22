import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Send, Check, X } from 'lucide-react';

export default function FeedbackForm() {
  const [feedback, setFeedback] = useState(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmitFeedback = async (feedbackType) => {
    setIsSubmitting(true);
    setError(null);
    setFeedback(feedbackType);
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback: feedbackType,
          comment: comment
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText.substring(0, 100)}`);
      }
      
      await response.json();
      setIsSubmitted(true);
    } catch (err) {
      console.error("Feedback submission error:", err);
      setError(err.message || "Failed to connect to the server");
      setFeedback(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex justify-center items-center">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 w-full max-w-md text-center border border-gray-100 dark:border-gray-700 transition-all">
        {!isSubmitted ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">How was your experience?</h2>
            
            <div className="flex justify-center gap-8 my-6">
              <button
                onClick={() => handleSubmitFeedback('up')}
                disabled={isSubmitting}
                className={`flex flex-col items-center p-4 rounded-lg transition-all duration-300 ${
                  feedback === 'up' 
                    ? 'bg-green-50 dark:bg-green-900/30 ring-2 ring-green-400 dark:ring-green-500/50' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                aria-label="Positive feedback"
              >
                <div className={`p-3 rounded-full ${
                  feedback === 'up' 
                    ? 'bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  <ThumbsUp size={24} />
                </div>
                <span className={`mt-2 font-medium ${
                  feedback === 'up' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Helpful
                </span>
              </button>
              
              <button
                onClick={() => handleSubmitFeedback('down')}
                disabled={isSubmitting}
                className={`flex flex-col items-center p-4 rounded-lg transition-all duration-300 ${
                  feedback === 'down' 
                    ? 'bg-red-50 dark:bg-red-900/30 ring-2 ring-red-400 dark:ring-red-500/50' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                aria-label="Negative feedback"
              >
                <div className={`p-3 rounded-full ${
                  feedback === 'down' 
                    ? 'bg-red-100 dark:bg-red-800/50 text-red-600 dark:text-red-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  <ThumbsDown size={24} />
                </div>
                <span className={`mt-2 font-medium ${
                  feedback === 'down' 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Not Helpful
                </span>
              </button>
            </div>
            
            {feedback && (
              <div className="mt-6 animate-fade-in">
                <div className="relative">
                  <textarea
                    placeholder="Share your thoughts (optional)"
                    className="w-full p-4 pr-12 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-200"
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button
                    onClick={() => handleSubmitFeedback(feedback)}
                    disabled={isSubmitting}
                    className="absolute right-3 bottom-3 p-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md disabled:opacity-50 transition-colors duration-200"
                    aria-label="Submit feedback"
                  >
                    {isSubmitting ? (
                      <div className="animate-pulse">
                        <Send size={18} />
                      </div>
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
                
                <button
                  onClick={() => handleSubmitFeedback(feedback)}
                  disabled={isSubmitting}
                  className="mt-4 w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 font-medium transition-colors duration-200 flex items-center justify-center"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg text-red-600 dark:text-red-400 flex items-center">
                <X size={18} className="mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </>
        ) : (
          <div className="py-6 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <Check size={32} className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Thank you for your feedback!</h3>
            <p className="text-gray-600 dark:text-gray-400">Your input helps us improve our service.</p>
          </div>
        )}
      </div>
    </div>
  );
}