import { Modal, Button } from 'flowbite-react';
import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineExclamationCircle, HiOutlineTrash, HiAnnotation, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashComments() {
  const { currentUser } = useSelector((state) => state.user);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState({});
  const [posts, setPosts] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  const [totalComments, setTotalComments] = useState(0);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/comment/getcomments`);
      const data = await res.json();
      if (res.ok) {
        setComments(data.comments);
        setTotalComments(data.comments.length);
        await fetchUserAndPostDetails(data.comments);
      } else {
        setError(data.message || 'Failed to fetch comments');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserAndPostDetails = async (comments) => {
    try {
      const userIds = [...new Set(comments.map((c) => c.userId))];
      const postIds = [...new Set(comments.map((c) => c.postId))];

      const userPromises = userIds.map(async (userId) => {
        const res = await fetch(`/api/user/${userId}`);
        if (res.ok) {
          const data = await res.json();
          return { userId, data };
        }
        return { userId, data: null };
      });
      
      const userResults = await Promise.all(userPromises);
      const userMap = userResults.reduce((acc, { userId, data }) => {
        if (data) acc[userId] = data;
        return acc;
      }, {});
      setUsers(userMap);

      const postPromises = postIds.map(async (postId) => {
        const res = await fetch(`/api/post/getposts?postId=${postId}`);
        if (res.ok) {
          const data = await res.json();
          // Make sure we're getting the post data correctly
          const post = data.posts && data.posts.length > 0 ? data.posts[0] : null;
          return { postId, data: post };
        }
        return { postId, data: null };
      });
      
      const postResults = await Promise.all(postPromises);
      const postMap = postResults.reduce((acc, { postId, data }) => {
        if (data) acc[postId] = data;
        return acc;
      }, {});
      setPosts(postMap);
    } catch (error) {
      console.error('Error fetching user/post details:', error.message);
    }
  };

  useEffect(() => {
    if (currentUser.isAdmin) {
      fetchComments();
      // Set up polling for real-time updates
      const interval = setInterval(fetchComments, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [currentUser.isAdmin, fetchComments]);

  const handleDeleteComment = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/comment/deleteComment/${commentIdToDelete}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => {
          const newComments = prev.filter((comment) => comment._id !== commentIdToDelete);
          setTotalComments(newComments.length); // Update total count when deleting
          const totalPages = Math.ceil(newComments.length / ITEMS_PER_PAGE);
          if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
          }
          return newComments;
        });
        setShowModal(false);
      } else {
        setError(data.message || 'Failed to delete comment');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate pagination data
  const totalPages = Math.ceil(comments.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = comments.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-3">
          <HiAnnotation className="w-8 h-8 text-teal-400 dark:text-teal-500" />
          Comment Management
        </h2>
        <div className="mt-3 md:mt-0 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Clock className="h-4 w-4 mr-2" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total comments:</span>
          <motion.span
            key={totalComments}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
          >
            {totalComments}
          </motion.span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : currentUser.isAdmin && comments.length > 0 ? (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Comment
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Likes
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Post
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentItems.map((comment) => (
                    <motion.tr
                      key={comment._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(comment.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 max-w-xs">
                        <div className="line-clamp-2">{comment.content}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                          {comment.numberOfLikes}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {posts[comment.postId] ? (
                            <Link
                              to={`/post/${comment.postId}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[150px] block"
                            >
                              {posts[comment.postId].title || 'Untitled Post'}
                            </Link>
                          ) : (
                            'Loading...'
                          )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {users[comment.userId] ? (
                          <Link
                            to={`/profile/${comment.userId}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[150px] block"
                          >
                            {users[comment.userId].username}
                          </Link>
                        ) : (
                          comment.userId
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setShowModal(true);
                            setCommentIdToDelete(comment._id);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                        >
                          <HiOutlineTrash className="h-5 w-5" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{currentItems.length ? indexOfFirstItem + 1 : 0}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastItem, comments.length)}</span> of{' '}
                    <span className="font-medium">{totalComments}</span> comments
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                        currentPage === 1
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <HiOutlineChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === number
                            ? 'z-10 bg-teal-50 dark:bg-teal-900/30 border-teal-500 text-teal-600 dark:text-teal-400'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                        currentPage === totalPages
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <HiOutlineChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No comments yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {currentUser.isAdmin ? 'There are no comments to display.' : "You don't have permission to view comments."}
          </p>
        </div>
      )}

      <Modal 
  show={showModal} 
  onClose={() => setShowModal(false)} 
  popup 
  size="md"
  className="backdrop-blur-sm"
>
  <Modal.Body className="p-0">
    <div className="relative">
      {/* Close button */}
      <button
        onClick={() => setShowModal(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      {/* Modal content */}
      <div className="text-center px-8 py-10">
        {/* Animated icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/20 dark:to-red-900/40 mb-6 shadow-inner"
        >
          <HiOutlineExclamationCircle className="h-10 w-10 text-red-500 dark:text-red-400" />
        </motion.div>
        
        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Delete Comment
        </h3>
        
        {/* Description */}
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          This action cannot be undone. The comment will be permanently removed from the system.
        </p>
        
        {/* Buttons */}
        <div className="flex justify-center gap-3">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(false)}
            className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 text-sm font-medium"
          >
            Cancel
          </motion.button>
          
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDeleteComment}
            disabled={deleting}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium relative overflow-hidden"
          >
            {deleting ? (
              <>
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
                <span className="invisible">Deleting...</span>
              </>
            ) : (
              'Delete'
            )}
          </motion.button>
        </div>
      </div>
    </div>
  </Modal.Body>
</Modal>
    </div>
  );
}