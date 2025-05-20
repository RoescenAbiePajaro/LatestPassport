import { useState } from 'react';

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
      // The error likely means the API URL is incorrect. Let's use the correct path
      // Based on your router configuration, your endpoint doesn't have /api prefix
      const response = await fetch('/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback: feedbackType, // "up" or "down" as required by your API
          comment: comment
        }),
      });
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text(); // Get the error as text instead of trying to parse JSON
        throw new Error(`Server error: ${response.status} - ${errorText.substring(0, 100)}`);
      }
      
      const data = await response.json();
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Was this helpful?</h2>
        
        {!isSubmitted ? (
          <>
            <div className="flex justify-center gap-6 my-5">
              <button 
                onClick={() => handleSubmitFeedback('up')} 
                disabled={isSubmitting}
                className="text-4xl hover:scale-110 transition-transform duration-200 disabled:opacity-50"
                aria-label="Thumbs up"
              >
                👍
              </button>
              
              <button 
                onClick={() => handleSubmitFeedback('down')} 
                disabled={isSubmitting}
                className="text-4xl hover:scale-110 transition-transform duration-200 disabled:opacity-50"
                aria-label="Thumbs down"
              >
                👎
              </button>
            </div>
            
            {feedback && (
              <div className="mt-4">
                <textarea
                  placeholder="Any additional comments?"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                
                <button 
                  onClick={() => handleSubmitFeedback(feedback)}
                  disabled={isSubmitting}
                  className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            )}
            
            {error && (
              <div className="mt-4 text-red-600">
                Error: {error}
              </div>
            )}
          </>
        ) : (
          <div className="mt-4 text-green-600 font-semibold">
            Thank you for your feedback!
          </div>
        )}
      </div>
    </div>
  );
}