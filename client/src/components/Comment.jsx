import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { format } from 'timeago.js';
import { Link } from 'react-router-dom';
import {
  HiOutlineThumbUp,
  HiThumbUp,
  HiOutlineReply,
  HiOutlineDotsHorizontal,
  HiOutlinePencil,
  HiOutlineTrash,
} from 'react-icons/hi';

export default function Comment({
  comment,
  onLike,
  onEdit,
  onDelete,
  onReply,
  repliesAtBottom = true,
}) {
  const { currentUser } = useSelector((state) => state.user);
  const [user, setUser] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment?.content || '');
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const menuRef = useRef(null);
  const replyInputRef = useRef(null);
  const editInputRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when editing or replying
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
    if (isReplying && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [isEditing, isReplying]);

  // Get user data
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`/api/user/${comment.userId}`);
        const data = await res.json();
        if (res.ok) {
          setUser(data);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    getUser();
  }, [comment.userId]);

  const handleEdit = async () => {
    setShowMenu(false);
    if (!editedContent.trim()) return;
    
    try {
      const res = await fetch(`/api/comment/editComment/${comment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editedContent }),
      });
      
      if (res.ok) {
        onEdit(comment, editedContent);
        setIsEditing(false);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    try {
      const res = await fetch('/api/comment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent,
          postId: comment.postId,
          userId: currentUser._id,
          parentId: comment._id,
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        // Added repliesAtBottom check to ensure replies are properly added at the bottom
        onReply(data, repliesAtBottom);
        setReplyContent('');
        setIsReplying(false);
        
        // Make sure replies are visible when a new reply is added
        setShowReplies(true);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Check if the current user has liked this comment
  const isLiked = comment.likes && currentUser && comment.likes.includes(currentUser._id);

  return (
    <div className="animate-fadeIn">
      {/* Main comment container */}
      <div className="group flex gap-3">
        {/* User avatar */}
        <Link to={`/profile/${user._id}`} className="flex-shrink-0">
          <img
            src={user.profilePicture}
            alt={user.username}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800"
          />
        </Link>
        
        {/* Comment content */}
        <div className="flex-1 min-w-0">
          {/* Comment bubble */}
          <div className="relative">
            <div className="bg-gray-100 dark:bg-slate-700 rounded-2xl px-4 py-2.5 inline-block max-w-full break-words">
              <div className="flex flex-col">
                {/* Username and timestamp */}
                <div className="flex flex-wrap items-baseline gap-x-2 mb-1">
                  <Link 
                    to={`/profile/${user._id}`} 
                    className="font-semibold text-sm text-gray-900 dark:text-gray-100 hover:underline"
                  >
                    {user.username}
                  </Link>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {format(comment.createdAt)}
                    {comment.createdAt !== comment.updatedAt && ' (edited)'}
                  </span>
                </div>
                
                {/* Comment text or edit form */}
                {isEditing ? (
                  <div className="mt-1">
                    <textarea
                      ref={editInputRef}
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      rows="3"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedContent(comment.content);
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleEdit}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                )}
              </div>
            </div>
            
            {/* Comment menu */}
            <div 
              className="absolute -right-1 top-0 transition-opacity opacity-0 group-hover:opacity-100 focus-within:opacity-100"
            >
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                <HiOutlineDotsHorizontal className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              
              {showMenu && (
                <div 
                  ref={menuRef}
                  className="absolute right-0 top-8 w-40 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden py-1"
                >
                  {(currentUser && currentUser._id === comment.userId) && (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300"
                    >
                      <HiOutlinePencil className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  
                  {(currentUser && (currentUser._id === comment.userId || currentUser.isAdmin)) && (
                    <button
                      onClick={() => {
                        onDelete(comment._id);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-red-600 dark:text-red-400"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Like and reply buttons */}
          <div className="flex items-center gap-3 mt-1 ml-1">
            <button
              onClick={() => onLike(comment._id)}
              className={`flex items-center gap-1 text-xs font-medium ${
                isLiked
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              {isLiked ? (
                <HiThumbUp className="w-4 h-4" />
              ) : (
                <HiOutlineThumbUp className="w-4 h-4" />
              )}
              {comment.numberOfLikes > 0 && comment.numberOfLikes}
              <span className="hidden sm:inline">Like</span>
            </button>
            
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <HiOutlineReply className="w-4 h-4" />
              <span className="hidden sm:inline">Reply</span>
            </button>
            
            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                {showReplies ? 'Hide replies' : `View ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
              </button>
            )}
          </div>
          
          {/* Reply form */}
          {isReplying && currentUser && (
            <div className="mt-3 flex gap-2">
              <img
                src={currentUser.profilePicture}
                alt={currentUser.username}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800"
              />
              <form onSubmit={handleReply} className="flex-1">
                <textarea
                  ref={replyInputRef}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  rows="2"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsReplying(false)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!replyContent.trim()}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      !replyContent.trim()
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    Reply
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      
      {/* Replies section with replies displayed in chronological order */}
      {comment.replies && comment.replies.length > 0 && showReplies && (
        <div className="mt-3 ml-12">
          {comment.replies.map((reply, index) => (
            <div key={reply._id} className="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <span className="text-gray-500 dark:text-gray-400 font-medium">{index + 1}.</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{reply.userId === user._id ? user.username : 'User'}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{format(reply.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{reply.content}</p>
                <div className="mt-1">
                  <button 
                    onClick={() => setIsReplying(!isReplying)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}