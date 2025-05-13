import { Alert, Button, Modal, Textarea } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Comment from './Comment';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import EmojiPicker from 'emoji-picker-react';

export default function CommentSection({ postId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.length > 200) {
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
        setShowEmojiPicker(false);
      }
    } catch (error) {
      setCommentWork(error.message);
    }
  };

  useEffect(() => {
    const getComments = async () => {
      try {
        const res = await fetch(`/api/comment/getPostComments/${postId}`);
        if (res.ok) {
          const data = await res.json();
          // Build a tree structure for comments
          const commentTree = buildCommentTree(data);
          setComments(commentTree);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    getComments();
  }, [postId]);

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
        commentMap[comment.parentId].replies.push(comment);
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
      const res = await fetch(`/api/comment/deleteComment/${commentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setComments(removeCommentFromTree(comments, commentId));
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleReply = (newReply) => {
    setComments(addReplyToTree(comments, newReply));
  };

  // Helper functions for tree operations
  const updateCommentInTree = (comments, commentId, updates) => {
    return comments.map((comment) => {
      if (comment._id === commentId) {
        return { ...comment, ...updates };
      }
      if (comment.replies.length > 0) {
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
        replies: removeCommentFromTree(comment.replies, commentId),
      }));
  };

  const addReplyToTree = (comments, reply) => {
    if (!reply.parentId) return [reply, ...comments];
    
    return comments.map((comment) => {
      if (comment._id === reply.parentId) {
        return {
          ...comment,
          replies: [reply, ...comment.replies],
        };
      }
      if (comment.replies.length > 0) {
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
    <div className='max-w-2xl mx-auto w-full p-3'>
      {currentUser ? (
        <div className='flex items-center gap-1 my-5 text-gray-500 text-sm'>
          <p>Signed in as:</p>
          <img
            className='h-5 w-5 object-cover rounded-full'
            src={currentUser.profilePicture}
            alt=''
          />
          <Link
            to={'/dashboard?tab=profile'}
            className='text-xs text-cyan-600 hover:underline'
          >
            @{currentUser.username}
          </Link>
        </div>
      ) : (
        <div className='text-sm text-blue-500 my-5 flex gap-1'>
          You must be signed in to comment.
          <Link className='text-blue-500 hover:underline' to={'/sign-in'}>
            Sign In
          </Link>
        </div>
      )}
      {currentUser && (
        <form
          onSubmit={handleSubmit}
          className='border border-teal-500 rounded-md p-3'
        >
          <Textarea
            placeholder='Add a comment...'
            rows='3'
            maxLength='200'
            onChange={(e) => setComment(e.target.value)}
            value={comment}
          />
          <div className='flex justify-between items-center mt-2'>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className='text-gray-500 hover:text-gray-700'
              >
                😊
              </button>
              <p className='text-gray-500 text-xs'>
                {200 - comment.length} characters remaining
              </p>
            </div>
            <Button outline gradientDuoTone='purpleToBlue' type='submit'>
              Submit
            </Button>
          </div>
          {showEmojiPicker && (
            <div className='mt-2'>
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          {commentError && (
            <Alert color='failure' className='mt-5'>
              {commentError}
            </Alert>
          )}
        </form>
      )}
      {comments.length === 0 ? (
        <p className='text-sm my-5'>No comments yet!</p>
      ) : (
        <>
          <div className='text-sm my-5 flex items-center gap-1'>
            <p>Comments</p>
            <div className='border border-gray-400 py-1 px-2 rounded-sm'>
              <p>{comments.length}</p>
            </div>
          </div>
          {comments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              onLike={handleLike}
              onEdit={handleEdit}
              onDelete={(commentId) => {
                setShowModal(true);
                setCommentToDelete(commentId);
              }}
              onReply={handleReply}
            />
          ))}
        </>
      )}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size='md'
      >
        <Modal.Header />
        <Modal.Body>
          <div className='text-center'>
            <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
            <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
              Are you sure you want to delete this comment?
            </h3>
            <div className='flex justify-center gap-4'>
              <Button
                color='failure'
                onClick={() => handleDelete(commentToDelete)}
              >
                Yes, I'm sure
              </Button>
              <Button color='gray' onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}