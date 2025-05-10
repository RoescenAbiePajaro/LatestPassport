import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  HiOutlineExclamationCircle, 
  HiOutlinePencil, 
  HiOutlineTrash, 
  HiOutlinePhotograph, 
  HiOutlineTag, 
  HiDocumentText,
  HiOutlineSearch,
  HiOutlineChevronLeft,
  HiOutlineChevronRight
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import { Clock } from 'lucide-react';

// Constants
const ITEMS_PER_PAGE = 6;

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

// Search and filter component
const SearchFilters = ({ searchTerm, setSearchTerm, categoryFilter, setCategoryFilter, categories }) => {
  return (
    <div className='flex flex-col sm:flex-row gap-4 mb-6'>
      <div className='flex-1 relative'>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <HiOutlineSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search posts by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full pl-10 pr-4 py-2 rounded-lg border bg-white dark:bg-gray-700 focus:ring-2 focus:ring-teal-500'
        />
      </div>
      <div className='w-full sm:w-48'>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className='w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 focus:ring-2 focus:ring-teal-500'
        >
          <option value="all">All Categories</option>
          {Object.entries(categories).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

// Empty state component for no posts
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

// Empty state component for no search results
const NoResultsState = ({ setSearchTerm, setCategoryFilter }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center">
    <svg className="w-16 h-16 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p className="text-gray-500 text-lg dark:text-gray-400">No posts found matching your search criteria.</p>
    <button 
      onClick={() => {
        setSearchTerm('');
        setCategoryFilter('all');
      }}
      className="mt-4 text-teal-600 hover:text-teal-800 font-medium dark:text-teal-500 dark:hover:text-teal-400"
    >
      Clear filters
    </button>
  </div>
);

export default function DashPosts() {
  const { currentUser } = useSelector((state) => state.user);
  const [userPosts, setUserPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categories, setCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Memoize the API URL to prevent unnecessary re-renders
  const apiUrl = useMemo(() => {
    return currentUser?.isAdmin 
      ? '/api/post/getallposts' 
      : `/api/post/getposts?userId=${currentUser?._id}`;
  }, [currentUser?.isAdmin, currentUser?._id]);

  // Memoized pagination calculations
  const { currentItems, totalPages, filteredPosts } = useMemo(() => {
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    
    // Filter posts based on search and category
    const filtered = userPosts.filter(post => {
      const matchesSearch = 
        !searchTerm || 
        post.title.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesCategory = 
        categoryFilter === 'all' ? true :
        post.category === categoryFilter;
        
      return matchesSearch && matchesCategory;
    });
    
    const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    
    return { currentItems, totalPages, filteredPosts: filtered };
  }, [userPosts, currentPage, searchTerm, categoryFilter]);

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

  // Handle delete button click
  const handleDeleteClick = useCallback((postId) => {
    setPostIdToDelete(postId);
    setShowModal(true);
  }, []);

  // Get category name from ID - memoized for performance
  const getCategoryName = useCallback((categoryId) => {
    return categories[categoryId] || 'Uncategorized';
  }, [categories]);

  // Pagination handler
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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
              <SearchFilters 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                categories={categories}
              />
              
              {filteredPosts.length === 0 ? (
                <NoResultsState 
                  setSearchTerm={setSearchTerm}
                  setCategoryFilter={setCategoryFilter}
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentItems.map((post, index) => (
                      <PostCard 
                        key={post._id}
                        post={post}
                        index={index}
                        onDeleteClick={handleDeleteClick}
                        categoryName={getCategoryName(post.category)}
                      />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between mt-6">
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
                            Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredPosts.length)}</span> of{' '}
                            <span className="font-medium">{filteredPosts.length}</span> posts
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