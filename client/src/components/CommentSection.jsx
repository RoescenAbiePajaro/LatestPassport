import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Comment from './Comment';
import EmojiPicker from 'emoji-picker-react';
import { HiOutlineExclamationCircle, HiOutlineEmojiHappy } from 'react-icons/hi';

export default function CommentSection({ postId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [totalComments, setTotalComments] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.length > 200 || !comment.trim()) {
      return;
    }
    
    try {
      const res = await fetch('/api/comment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: comment,
          postId,
          userId: currentUser._id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setComment('');
        setCommentError(null);
        setComments([data, ...comments]);
        setTotalComments(prevTotal => prevTotal + 1);
        setShowEmojiPicker(false);
      }
    } catch (error) {
      setCommentError(error.message);
    }
  };

  useEffect(() => {
    const getComments = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/comment/getPostComments/${postId}`);
        if (res.ok) {
          const data = await res.json();
          // Build a tree structure for comments
          const commentTree = buildCommentTree(data);
          setComments(commentTree);
          // Count total comments including replies
          setTotalComments(countTotalComments(data));
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    getComments();
  }, [postId]);

  // Helper function to count total comments including replies
  const countTotalComments = (comments) => {
    return comments.length;
  };

  // Helper function to build comment tree
  const buildCommentTree = (comments) => {
    const commentMap = {};
    const tree = [];

    // Initialize comment map
    comments.forEach((comment) => {
      comment.replies = [];
      commentMap[comment._id] = comment;
    });

    // Build tree structure
    comments.forEach((comment) => {
      if (comment.parentId) {
        // Make sure the parent exists before trying to add a reply
        if (commentMap[comment.parentId]) {
          commentMap[comment.parentId].replies.push(comment);
        } else {
          // If parent doesn't exist (was deleted), add as top-level comment
          tree.push(comment);
        }
      } else {
        tree.push(comment);
      }
    });

    return tree;
  };

  const handleLike = async (commentId) => {
    try {
      if (!currentUser) {
        navigate('/sign-in');
        return;
      }
      const res = await fetch(`/api/comment/likeComment/${commentId}`, {
        method: 'PUT',
      });
      if (res.ok) {
        const data = await res.json();
        setComments(updateCommentInTree(comments, commentId, {
          likes: data.likes,
          numberOfLikes: data.likes.length,
        }));
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleEdit = async (comment, editedContent) => {
    setComments(updateCommentInTree(comments, comment._id, {
      content: editedContent,
    }));
  };

  const handleDelete = async (commentId) => {
    setShowModal(false);
    
    try {
      if (!currentUser) {
        navigate('/sign-in');
        return;
      }
      
      // First check if the user has permission to delete this comment
      const commentToDelete = findCommentInTree(comments, commentId);
      if (!commentToDelete) return;
      
      // Only allow delete if the user is the comment owner or an admin
      if (currentUser._id !== commentToDelete.userId && !currentUser.isAdmin) {
        setCommentError("You don't have permission to delete this comment");
        return;
      }
      
      const res = await fetch(`/api/comment/deleteComment/${commentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setComments(removeCommentFromTree(comments, commentId));
        setTotalComments(prevTotal => {
          // Count the comment and all its replies
          const commentWithReplies = countCommentAndReplies(commentToDelete);
          return prevTotal - commentWithReplies;
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Count a comment and all its nested replies
  const countCommentAndReplies = (comment) => {
    if (!comment.replies || comment.replies.length === 0) return 1;
    return 1 + comment.replies.reduce((acc, reply) => acc + countCommentAndReplies(reply), 0);
  };

  const handleReply = (newReply) => {
    setComments(addReplyToTree(comments, newReply));
    setTotalComments(prevTotal => prevTotal + 1);
  };

  // Find a comment in the tree
  const findCommentInTree = (comments, commentId) => {
    for (const comment of comments) {
      if (comment._id === commentId) {
        return comment;
      }
      if (comment.replies && comment.replies.length > 0) {
        const found = findCommentInTree(comment.replies, commentId);
        if (found) return found;
      }
    }
    return null;
  };

  // Helper functions for tree operations
  const updateCommentInTree = (comments, commentId, updates) => {
    return comments.map((comment) => {
      if (comment._id === commentId) {
        return { ...comment, ...updates };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentInTree(comment.replies, commentId, updates),
        };
      }
      return comment;
    });
  };

  const removeCommentFromTree = (comments, commentId) => {
    return comments
      .filter((comment) => comment._id !== commentId)
      .map((comment) => ({
        ...comment,
        replies: comment.replies ? removeCommentFromTree(comment.replies, commentId) : [],
      }));
  };

  const addReplyToTree = (comments, reply) => {
    // For new top-level comments
    if (!reply.parentId) return [reply, ...comments];
    
    return comments.map((comment) => {
      if (comment._id === reply.parentId) {
        return {
          ...comment,
          // Add replies at the end of the array (bottom) instead of the beginning
          replies: [...comment.replies, reply],
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: addReplyToTree(comment.replies, reply),
        };
      }
      return comment;
    });
  };

  const handleEmojiClick = (emojiObject) => {
    setComment((prevComment) => prevComment + emojiObject.emoji);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Comment input section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6 transition-all">
        {currentUser ? (
          <div className="flex items-center gap-3 mb-4">
            <img
              src={currentUser.profilePicture}
              alt=""
              className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900"
            />
            <Link
              to={'/dashboard?tab=profile'}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              @{currentUser.username}
            </Link>
          </div>
        ) : (
          <div className="mb-5 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-100 dark:border-blue-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
              <p className="text-blue-700 dark:text-blue-300 font-medium">Sign in to join the conversation</p>
              <Link 
                to="/sign-in"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center font-medium text-sm transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
        
        {currentUser && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative border-0 bg-gray-50 dark:bg-slate-900 rounded-xl focus-within:ring-2 focus-within:ring-blue-400 transition-all">
              <textarea
                placeholder="Share your thoughts..."
                rows="3"
                maxLength="200"
                onChange={(e) => setComment(e.target.value)}
                value={comment}
                className="w-full bg-transparent border-0 focus:ring-0 rounded-xl p-4 resize-none text-gray-700 dark:text-gray-100"
              />
              
              <div className="flex justify-between items-center px-4 py-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <HiOutlineEmojiHappy size={20} />
                  </button>
                  <span className={`text-xs font-medium ${
                    comment.length > 180 ? 'text-amber-500' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {200 - comment.length} characters left
                  </span>
                </div>
                
                <button 
                  type="submit"
                  disabled={!comment.trim() || comment.length > 200}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                    !comment.trim() || comment.length > 200
                      ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-sm hover:shadow'
                  }`}
                >
                  Comment
                </button>
              </div>
              
              {showEmojiPicker && (
                <div className="absolute z-10 bottom-14 left-0">
                  <div className="shadow-xl rounded-xl overflow-hidden">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                </div>
              )}
            </div>
            
            {commentError && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                {commentError}
              </div>
            )}
          </form>
        )}
      </div>

      {/* Comments display section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="relative w-12 h-12">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 dark:border-blue-700 rounded-full opacity-30"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
            <div className="mb-3 w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <HiOutlineEmojiHappy size={32} className="text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-center">No comments yet! Be the first to share your thoughts.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Discussion</h3>
                <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 py-1 px-3 rounded-full text-sm font-medium">
                  {totalComments}
                </div>
              </div>
              {comments.length > 0 && (
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 py-1.5 px-3 rounded-full">
                  Newest first
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              {comments.map((comment) => (
                <Comment
                  key={comment._id}
                  comment={comment}
                  onLike={handleLike}
                  onEdit={handleEdit}
                  onDelete={(commentId) => {
                    const commentToCheck = findCommentInTree(comments, commentId);
                    
                    if (commentToCheck && currentUser && 
                        (currentUser._id === commentToCheck.userId || currentUser.isAdmin)) {
                      setShowModal(true);
                      setCommentToDelete(commentId);
                    } else {
                      setCommentError("You don't have permission to delete this comment");
                    }
                  }}
                  onReply={handleReply}
                  // Make sure the Comment component renders replies at the bottom
                  repliesAtBottom={true}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Delete confirmation modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4 transform transition-all">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <HiOutlineExclamationCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
              </div>
              
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                Delete Comment
              </h3>
              
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Are you sure you want to delete this comment? This action cannot be undone.
              </p>
              
              <div className="flex justify-center gap-3">
                <button
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  onClick={() => handleDelete(commentToDelete)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}