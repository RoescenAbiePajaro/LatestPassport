import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  HiOutlineExclamationCircle, 
  HiOutlinePencil, 
  HiOutlineTrash, 
  HiOutlinePhotograph, 
  HiOutlineTag, 
  HiDocumentText 
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import { Clock } from 'lucide-react';

// Post card component to improve code organization
const PostCard = ({ post, index, onDeleteClick, categoryName }) => (
  <motion.div
    key={post._id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }} // Cap delay for better performance
    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
  >
    <Link to={`/post/${post.slug}`} className="block relative group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          loading="lazy" // Add lazy loading for performance
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </Link>
    
    <div className="p-5">
      <div className="flex items-center space-x-2 mb-3">
        <span className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
          <HiOutlineTag className="w-3 h-3 mr-1" />
          {categoryName}
        </span>
      </div>
      
      <Link to={`/post/${post.slug}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
          {post.title}
        </h3>
      </Link>
      
      <div className="flex items-center justify-between mt-5">
        <button
          onClick={() => onDeleteClick(post._id)}
          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center transition-colors duration-300"
        >
          <HiOutlineTrash className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">Delete</span>
        </button>
        
        <Link 
          to={`/dashboard?tab=updatepost&postId=${post._id}`}
          className="text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 flex items-center transition-colors duration-300"
        >
          <HiOutlinePencil className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">Edit</span>
        </Link>
      </div>
    </div>
  </motion.div>
);

// Delete confirmation modal component
const DeleteModal = ({ isOpen, onClose, onConfirm, isLoading }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={onClose}
        />
        
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-auto overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-5">
                  <HiOutlineExclamationCircle className="h-10 w-10 text-red-600 dark:text-red-500" />
                </div>
              </div>
              
              <h3 className="text-center text-lg font-medium text-gray-900 dark:text-white mb-4">
                Delete Post
              </h3>
              
              <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300 focus:outline-none"
                >
                  Cancel
                </button>
                
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" color="white" />
                      <span className="ml-2">Deleting...</span>
                    </div>
                  ) : 'Delete'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </>
    )}
  </AnimatePresence>
);

// Empty state component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl p-10 text-center">
    <HiOutlinePhotograph className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">No posts yet</h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't created any posts.</p>
    <Link 
      to="/dashboard?tab=createpost"
      className="px-5 py-2 bg-gradient-to-r from-teal-400 to-blue-500 dark:from-teal-500 dark:to-blue-600 text-white font-medium rounded-lg transition duration-300 hover:from-teal-500 hover:to-blue-600"
    >
      Create your first post
    </Link>
  </div>
);

export default function DashPosts() {
  const { currentUser } = useSelector((state) => state.user);
  const [userPosts, setUserPosts] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categories, setCategories] = useState({});

  // Memoize the API URL to prevent unnecessary re-renders
  const apiUrl = useMemo(() => {
    return currentUser?.isAdmin 
      ? '/api/post/getallposts' 
      : `/api/post/getposts?userId=${currentUser?._id}`;
  }, [currentUser?.isAdmin, currentUser?._id]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/category');
      const data = await res.json();
      if (res.ok) {
        // Create a mapping of category IDs to names
        const categoryMap = {};
        data.forEach(category => {
          categoryMap[category._id] = category.name;
        });
        setCategories(categoryMap);
      }
    } catch (error) {
      console.error('Error fetching categories:', error.message);
    }
  }, []);

  // Fetch posts with useCallback to prevent unnecessary re-renders
  const fetchPosts = useCallback(async () => {
    if (!currentUser?._id) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(apiUrl);
      const data = await res.json();
      if (res.ok) {
        setUserPosts(data.posts || []);
        setShowMore(data.posts && data.posts.length >= 9);
      }
    } catch (error) {
      console.error('Error fetching posts:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, currentUser?._id]);

  // Load data on component mount
  useEffect(() => {
    // Fetch categories and posts in parallel for better performance
    Promise.all([fetchCategories(), fetchPosts()]);
  }, [fetchCategories, fetchPosts]);

  // Handle "Show More" button click
  const handleShowMore = useCallback(async () => {
    const startIndex = userPosts.length;
    try {
      const res = await fetch(`${apiUrl}${apiUrl.includes('?') ? '&' : '?'}startIndex=${startIndex}`);
      const data = await res.json();
      if (res.ok) {
        setUserPosts((prev) => [...prev, ...(data.posts || [])]);
        setShowMore(data.posts && data.posts.length >= 9);
      }
    } catch (error) {
      console.error('Error fetching more posts:', error.message);
    }
  }, [apiUrl, userPosts.length]);

  // Handle delete button click
  const handleDeleteClick = useCallback((postId) => {
    setPostIdToDelete(postId);
    setShowModal(true);
  }, []);

  // Handle post deletion confirmation
  const handleDeletePost = useCallback(async () => {
    if (!postIdToDelete) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/post/deletepost/${postIdToDelete}/${currentUser._id}`, { 
        method: 'DELETE' 
      });
      const data = await res.json();
      if (res.ok) {
        setUserPosts((prev) => prev.filter((post) => post._id !== postIdToDelete));
      } else {
        console.error('Failed to delete post:', data.message);
      }
    } catch (error) {
      console.error('Error deleting post:', error.message);
    } finally {
      setShowModal(false);
      setIsDeleting(false);
    }
  }, [postIdToDelete, currentUser._id]);

  // Get category name from ID - memoized for performance
  const getCategoryName = useCallback((categoryId) => {
    return categories[categoryId] || 'Uncategorized';
  }, [categories]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-3">
          <HiDocumentText className="w-8 h-8 text-teal-400 dark:text-teal-500"/>
          Post Management
        </h2>
        <div className="mt-3 md:mt-0 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Clock className="h-4 w-4 mr-2" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <LoadingSpinner size="lg" color="primary" />
        </div>
      ) : (
        <>
          {userPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPosts.map((post, index) => (
                  <PostCard 
                    key={post._id}
                    post={post}
                    index={index}
                    onDeleteClick={handleDeleteClick}
                    categoryName={getCategoryName(post.category)}
                  />
                ))}
              </div>
              
              {showMore && (
                <div className="flex justify-center mt-8">
                  <button 
                    onClick={handleShowMore}
                    className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  >
                    Show more posts
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDeletePost}
        isLoading={isDeleting}
      />
    </div>
  );
}