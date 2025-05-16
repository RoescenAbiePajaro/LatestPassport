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
  onToggleReplies,
  depth = 0,
  isReply = false,
}) {
  const { currentUser } = useSelector((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const replyInputRef = useRef(null);
  const editInputRef = useRef(null);
  const isLiked = currentUser && comment.likes?.includes(currentUser._id);
  const maxDepth = 3;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
    if (isReplying && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [isEditing, isReplying]);

  const handleEdit = async () => {
    if (!editedContent.trim()) return;
    await onEdit(comment, editedContent);
    setIsEditing(false);
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    await onReply(comment._id, replyContent);
    setReplyContent('');
    setIsReplying(false);
  };

  return (
    <div className={`animate-fadeIn ${isReply ? 'ml-3 sm:ml-12 mt-3' : ''}`}>
      <div className="flex gap-3">
        <Link to={`/profile/${comment.user?._id}`} className="flex-shrink-0">
          <img
            src={comment.user?.profilePicture}
            alt={comment.user?.username}
            className="w-9 h-9 rounded-full object-cover"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="relative">
            <div className="bg-gray-100 dark:bg-slate-700 rounded-2xl px-4 py-2.5 inline-block max-w-full break-words">
              <div className="flex flex-col">
                <div className="flex flex-wrap items-baseline gap-x-2 mb-1">
                  <Link
                    to={`/profile/${comment.user?._id}`}
                    className="font-semibold text-sm text-gray-900 dark:text-gray-100 hover:underline"
                  >
                    {comment.user?.username}
                  </Link>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {format(comment.createdAt)}
                    {comment.createdAt !== comment.updatedAt && ' (edited)'}
                  </span>
                </div>
                {isEditing ? (
                  <div className="mt-1">
                    <textarea
                      ref={editInputRef}
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedContent(comment.content);
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleEdit}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
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
            <div className="absolute -right-1 top-0 transition-opacity opacity-0 group-hover:opacity-100 focus-within:opacity-100">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                <HiOutlineDotsHorizontal className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              {showMenu && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-8 w-40 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
                >
                  {currentUser && currentUser._id === comment.userId && (
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
                  {currentUser &&
                    (currentUser._id === comment.userId || currentUser.isAdmin) && (
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
            {comment.replyCount > 0 && (
              <button
                onClick={() => onToggleReplies(comment._id)}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                {comment.showReplies
                  ? 'Hide replies'
                  : `View ${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}`}
              </button>
            )}
          </div>
          {isReplying && currentUser && (
            <div className="mt-3 flex gap-2">
              <img
                src={currentUser.profilePicture}
                alt={currentUser.username}
                className="w-8 h-8 rounded-full object-cover"
              />
              <form onSubmit={handleReply} className="flex-1">
                <textarea
                  ref={replyInputRef}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsReplying(false)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
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
          {comment.showReplies && comment.replies && comment.replies.length > 0 && (
            <div
              className={`${
                depth < maxDepth ? 'border-l-2 border-gray-200 dark:border-gray-700 pl-2' : ''
              } mt-3`}
            >
              {comment.replies.map((reply) => (
                <Comment
                  key={reply._id}
                  comment={reply}
                  onLike={onLike}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReply={onReply}
                  onToggleReplies={onToggleReplies}
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
}