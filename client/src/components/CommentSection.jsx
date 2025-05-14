import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
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
  const [activeReplyId, setActiveReplyId] = useState(null);
  const replyInputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch top-level comments
  useEffect(() => {
    const getComments = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/comment/getPostComments/${postId}`);
        if (res.ok) {
          const data = await res.json();
          // Initialize comments with empty replies array
          const commentsWithReplies = data.map((comment) => ({
            ...comment,
            replies: [], // Will be populated when fetched
            showReplies: false, // Track reply visibility
          }));
          setComments(commentsWithReplies);
          setTotalComments(data.length); // Initial count (updated when replies are fetched)
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    getComments();
  }, [postId]);

  // Focus on reply input when activeReplyId changes
  useEffect(() => {
    if (activeReplyId && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [activeReplyId]);

  // Submit a new comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.length > 200 || !comment.trim()) {
      setCommentError('Comment must be 1-200 characters');
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
        const newComment = {
          ...data,
          user: {
            _id: currentUser._id,
            username: currentUser.username,
            profilePicture: currentUser.profilePicture,
          },
          replies: [],
          showReplies: false,
        };
        setComment('');
        setCommentError(null);
        setComments([newComment, ...comments]);
        setTotalComments((prev) => prev + 1);
        setShowEmojiPicker(false);
      } else {
        setCommentError(data.message || 'Failed to post comment');
      }
    } catch (error) {
      setCommentError(error.message);
    }
  };

  // Fetch replies for a comment
  const fetchReplies = async (commentId) => {
    try {
      const res = await fetch(`/api/comment/getReplies/${commentId}`);
      if (res.ok) {
        const replies = await res.json();
        // Add user data to replies (assuming backend doesn't populate it)
        const repliesWithUsers = replies.map((reply) => ({
          ...reply,
          user: reply.user || {
            _id: reply.userId,
            username: 'Unknown User', // Fallback; ideally, fetch user data
            profilePicture: '/default-avatar.png',
          },
          replies: [], // Nested replies not supported in this schema
          showReplies: false,
        }));
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  replies: repliesWithUsers.sort(
                    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                  ),
                  showReplies: true,
                }
              : comment
          )
        );
        // Update total comments count
        setTotalComments((prev) => prev + replies.length);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Toggle reply visibility
  const toggleReplies = (commentId) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment._id === commentId
          ? { ...comment, showReplies: !comment.showReplies }
          : comment
      )
    );
    // Fetch replies if not already loaded
    const comment = comments.find((c) => c._id === commentId);
    if (comment && !comment.showReplies && comment.replyCount > 0) {
      fetchReplies(commentId);
    }
  };

  // Handle like
  const handleLike = async (commentId) => {
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }
    try {
      const res = await fetch(`/api/comment/likeComment/${commentId}`, {
        method: 'PUT',
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId
              ? { ...comment, likes: data.likes, numberOfLikes: data.numberOfLikes }
              : {
                  ...comment,
                  replies: comment.replies.map((reply) =>
                    reply._id === commentId
                      ? { ...reply, likes: data.likes, numberOfLikes: data.numberOfLikes }
                      : reply
                  ),
                }
          )
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Handle edit
  const handleEdit = async (comment, editedContent) => {
    try {
      const res = await fetch(`/api/comment/editComment/${comment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editedContent }),
      });
      if (res.ok) {
        setComments((prevComments) =>
          prevComments.map((c) =>
            c._id === comment._id
              ? { ...c, content: editedContent }
              : {
                  ...c,
                  replies: c.replies.map((r) =>
                    r._id === comment._id ? { ...r, content: editedContent } : r
                  ),
                }
          )
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Handle delete
  const handleDelete = async (commentId) => {
    setShowModal(false);
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }
    try {
      const res = await fetch(`/api/comment/deleteComment/${commentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setComments((prevComments) => {
          const updatedComments = prevComments
            .filter((comment) => comment._id !== commentId)
            .map((comment) => ({
              ...comment,
              replies: comment.replies.filter((reply) => reply._id !== commentId),
            }));
          // Update total comments count
          const deletedComment = findCommentInTree(prevComments, commentId);
          if (deletedComment) {
            const count = countCommentAndReplies(deletedComment);
            setTotalComments((prev) => prev - count);
          }
          return updatedComments;
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Handle reply
  const handleReply = async (parentId, replyContent) => {
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }
    if (!replyContent.trim() || replyContent.length > 200) {
      setCommentError('Reply must be 1-200 characters');
      return;
    }
    try {
      const res = await fetch('/api/comment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent,
          postId,
          userId: currentUser._id,
          parentId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const newReply = {
          ...data,
          user: {
            _id: currentUser._id,
            username: currentUser.username,
            profilePicture: currentUser.profilePicture,
          },
          replies: [],
          showReplies: false,
        };
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === parentId
              ? {
                  ...comment,
                  replies: [...comment.replies, newReply].sort(
                    (a, b) => new Date(a.createdAt) - newBiography(b.createdAt)
                  ),
                  showReplies: true,
                  replyCount: comment.replyCount + 1,
                }
              : comment
          )
        );
        setTotalComments((prev) => prev + 1);
        setActiveReplyId(null);
      } else {
        setCommentError(data.message || 'Failed to post reply');
      }
    } catch (error) {
      setCommentError(error.message);
    }
  };

  // Helper functions
  const findCommentInTree = (comments, commentId) => {
    for (const comment of comments) {
      if (comment._id === commentId) return comment;
      if (comment.replies && comment.replies.length > 0) {
        const found = findCommentInTree(comment.replies, commentId);
        if (found) return found;
      }
    }
    return null;
  };

  const countCommentAndReplies = (comment) => {
    return 1 + (comment.replies ? comment.replies.length : 0);
  };

  const handleEmojiClick = (emojiObject) => {
    setComment((prev) => prev + emojiObject.emoji);
  };

  const toggleReply = (commentId) => {
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }
    setActiveReplyId(activeReplyId === commentId ? null : commentId);
  };

  // Reply Form Component
  const ReplyForm = ({ parentId }) => {
    const [replyText, setReplyText] = useState('');
    const [showEmojiPickerReply, setShowEmojiPickerReply] = useState(false);

    const handleEmojiClickReply = (emojiObject) => {
      setReplyText((prev) => prev + emojiObject.emoji);
    };

    const handleSubmitReply = (e) => {
      e.preventDefault();
      handleReply(parentId, replyText);
      setReplyText('');
    };

    return (
      <form onSubmit={handleSubmitReply} className="mt-2 mb-3 relative">
        <div className="flex items-start gap-2">
          <img
            src={currentUser?.profilePicture}
            alt=""
            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
          />
          <div className="relative flex-grow bg-gray-50 dark:bg-slate-900 rounded-2xl">
            <input
              ref={replyInputRef}
              type="text"
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              maxLength="200"
              className="w-full bg-transparent border-0 focus:ring-0 rounded-2xl py-2 px-3 text-gray-700 dark:text-gray-100 text-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
              <button
                type="button"
                onClick={() => setShowEmojiPickerReply(!showEmojiPickerReply)}
                className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              >
                <HiOutlineEmojiHappy size={16} />
              </button>
              <button
                type="submit"
                disabled={!replyText.trim() || replyText.length > 200}
                className={`ml-1 p-1.5 rounded-full transition-colors ${
                  !replyText.trim() || replyText.length > 200
                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {showEmojiPickerReply && (
          <div className="absolute z-10 mt-1 right-0">
            <div className="shadow-xl rounded-xl overflow-hidden">
              <EmojiPicker onEmojiClick={handleEmojiClickReply} />
            </div>
          </div>
        )}
      </form>
    );
  };

  // Facebook-style Comment Component
  const FacebookComment = ({ comment, depth = 0, isReply = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content);
    const isLiked = currentUser && comment.likes?.includes(currentUser._id);
    const maxDepth = 3;

    const handleEditSubmit = async (e) => {
      e.preventDefault();
      if (!editText.trim() || editText.length > 200) {
        return;
      }
      await handleEdit(comment, editText);
      setIsEditing(false);
    };

    return (
      <div className={`${isReply ? 'ml-3 sm:ml-12 mt-3 pt-3' : ''}`}>
        <div className="flex gap-2">
          <div className="flex-shrink-0">
            <img
              src={comment.user?.profilePicture}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
          <div className="flex-grow">
            <div className="group">
              <div className="bg-gray-100 dark:bg-slate-700 rounded-2xl px-4 py-2 inline-block max-w-full">
                <div className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-0.5">
                  {comment.user?.username}
                </div>
                {isEditing ? (
                  <form onSubmit={handleEditSubmit} className="mt-1">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      maxLength="200"
                      autoFocus
                      className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm p-2"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setEditText(comment.content);
                        }}
                        className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                )}
              </div>
              <div className="flex gap-3 items-center mt-1 text-xs font-medium">
                <button
                  onClick={() => handleLike(comment._id)}
                  className={`${
                    isLiked
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Like
                </button>
                <button
                  onClick={() => toggleReply(comment._id)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Reply
                </button>
                {currentUser &&
                  (currentUser._id === comment.userId || currentUser.isAdmin) && (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setShowModal(true);
                          setCommentToDelete(comment._id);
                        }}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        Delete
                      </button>
                    </>
                  )}
                {comment.numberOfLikes > 0 && (
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center bg-blue-500 rounded-full w-4 h-4 text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-2.5 h-2.5"
                      >
                        <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z" />
                      </svg>
                    </div>
                    <span className="ml-1">{comment.numberOfLikes}</span>
                  </div>
                )}
              </div>
            </div>
            {activeReplyId === comment._id && currentUser && (
              <ReplyForm parentId={comment._id} />
            )}
            {comment.replyCount > 0 && (
              <button
                onClick={() => toggleReplies(comment._id)}
                className="text-blue-600 dark:text-blue-400 text-xs font-medium mt-2 flex items-center gap-1 hover:underline"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  {comment.showReplies ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-3 h-3"
                    >
                      <path
                        fillRule="evenodd"
                        d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-3 h-3"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                {comment.showReplies
                  ? 'Hide replies'
                  : `Show ${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}`}
              </button>
            )}
            {comment.showReplies && comment.replies && comment.replies.length > 0 && (
              <div
                className={`${
                  depth < maxDepth ? 'border-l-2 border-gray-200 dark:border-gray-700 pl-2' : ''
                } mt-2`}
              >
                {comment.replies.map((reply) => (
                  <FacebookComment
                    key={reply._id}
                    comment={reply}
                    depth={depth + 1}
                    isReply={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
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
              <p className="text-blue-700 dark:text-blue-300 font-medium">
                Sign in to join the conversation
              </p>
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
                placeholder="Write a comment..."
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
                  <span
                    className={`text-xs font-medium ${
                      comment.length > 180 ? 'text-amber-500' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
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
                <FacebookComment key={comment._id} comment={comment} />
              ))}
            </div>
          </>
        )}
      </div>
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