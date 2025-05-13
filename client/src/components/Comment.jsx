import moment from 'moment';
import { useEffect, useState } from 'react';
import { FaThumbsUp, FaReply } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { Button, Textarea } from 'flowbite-react';

export default function Comment({ comment, onLike, onEdit, onDelete, onReply, level = 0 }) {
  const [user, setUser] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const { currentUser } = useSelector((state) => state.user);

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

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(comment.content);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/comment/editComment/${comment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editedContent }),
      });
      if (res.ok) {
        setIsEditing(false);
        onEdit(comment, editedContent);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleReplySubmit = async () => {
    if (replyContent.length > 200) return;
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
      if (res.ok) {
        const data = await res.json();
        setReplyContent('');
        setIsReplying(false);
        onReply(data);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div 
      className={`flex p-4 border-l-2 border-gray-200 dark:border-gray-700 text-sm transition-all duration-300 
        hover:bg-gray-50 dark:hover:bg-gray-800 ${level > 0 ? `ml-${level * 4}` : ''}`}
    >
      <div className='flex-shrink-0 mr-3'>
        <img
          className='w-10 h-10 rounded-full bg-gray-200 object-cover'
          src={user.profilePicture}
          alt={user.username}
        />
      </div>
      <div className='flex-1'>
        <div className='flex items-center mb-1'>
          <span className='font-semibold mr-2 text-sm text-gray-800 dark:text-gray-200'>
            {user ? `@${user.username}` : 'anonymous user'}
          </span>
          <span className='text-gray-500 text-xs'>
            {moment(comment.createdAt).fromNow()}
          </span>
        </div>
        {isEditing ? (
          <div className='animate-in fade-in'>
            <Textarea
              className='mb-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <div className='flex justify-end gap-2'>
              <Button
                size='sm'
                gradientDuoTone='purpleToBlue'
                onClick={handleSave}
                className='transition-all duration-300'
              >
                Save
              </Button>
              <Button
                size='sm'
                gradientDuoTone='purpleToBlue'
                outline
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className='text-gray-700 dark:text-gray-300 pb-2'>{comment.content}</p>
            <div className='flex items-center pt-2 text-xs border-t border-gray-200 dark:border-gray-700 gap-3'>
              <button
                type='button'
                onClick={() => onLike(comment._id)}
                className={`flex items-center gap-1 text-gray-400 hover:text-blue-500 transition-colors duration-200
                  ${currentUser && comment.likes.includes(currentUser._id) && '!text-blue-500'}`}
              >
                <FaThumbsUp className='text-sm' />
                {comment.numberOfLikes > 0 && comment.numberOfLikes}
              </button>
              <button
                type='button'
                onClick={() => setIsReplying(!isReplying)}
                className='flex items-center gap-1 text-gray-400 hover:text-blue-500 transition-colors duration-200'
              >
                <FaReply className='text-sm' />
                Reply
              </button>
              {currentUser && (currentUser._id === comment.userId || currentUser.isAdmin) && (
                <>
                  <button
                    type='button'
                    onClick={handleEdit}
                    className='text-gray-400 hover:text-blue-500 transition-colors duration-200'
                  >
                    Edit
                  </button>
                  <button
                    type='button'
                    onClick={() => onDelete(comment._id)}
                    className='text-gray-400 hover:text-red-500 transition-colors duration-200'
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
            {isReplying && currentUser && (
              <div className='mt-3 animate-in slide-in-from-top'>
                <Textarea
                  placeholder='Write a reply...'
                  rows='2'
                  maxLength='200'
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className='mb-2'
                />
                <div className='flex justify-end gap-2'>
                  <Button
                    size='sm'
                    gradientDuoTone='purpleToBlue'
                    onClick={handleReplySubmit}
                  >
                    Post Reply
                  </Button>
                  <Button
                    size='sm'
                    gradientDuoTone='purpleToBlue'
                    outline
                    onClick={() => setIsReplying(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {/* Render replies recursively */}
            {comment.replies && comment.replies.length > 0 && (
              <div className='mt-4'>
                {comment.replies.map((reply) => (
                  <Comment
                    key={reply._id}
                    comment={reply}
                    onLike={onLike}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onReply={onReply}
                    level={level + 1}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}