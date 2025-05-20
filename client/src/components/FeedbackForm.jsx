import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export default function FeedbackForm() {
  const [feedback, setFeedback] = useState(null); // 'up' | 'down' | null
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleClick = (type) => {
    setFeedback((prev) => (prev === type ? null : type));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback) return;

    // You can replace this with an actual API call
    console.log("Feedback submitted:", { feedback, comment });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-4 rounded bg-green-100 text-green-800">
        Thank you for your feedback!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-6">
        <button
          type="button"
          onClick={() => handleClick("up")}
          className={`flex items-center space-x-1 text-sm transition ${
            feedback === "up" ? "text-green-600" : "text-gray-500"
          }`}
        >
          <ThumbsUp size={24} />
          <span>Like</span>
        </button>

        <button
          type="button"
          onClick={() => handleClick("down")}
          className={`flex items-center space-x-1 text-sm transition ${
            feedback === "down" ? "text-red-600" : "text-gray-500"
          }`}
        >
          <ThumbsDown size={24} />
          <span>Dislike</span>
        </button>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional comment..."
        className="w-full p-2 border rounded resize-none"
        rows={3}
      />

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={!feedback}
      >
        Submit Feedback
      </button>
    </form>
  );
}
