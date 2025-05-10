import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

// Constants
const ITEMS_PER_PAGE = 6;

export default function Search() {
  const [searchParams, setSearchParams] = useState({
    searchTerm: '',
    sort: 'desc',
    category: '',
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  // Calculate pagination values
  const totalPages = Math.ceil(totalPosts / ITEMS_PER_PAGE);
  const indexOfLastPost = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - ITEMS_PER_PAGE;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/category');
        const data = await res.json();
        if (res.ok) {
          // Format categories for dropdown
          const formattedCategories = data.map(cat => ({
            value: cat._id, // Use category ID instead of name
            label: cat.name
          }));
          setCategories([
            { value: '', label: 'All Categories' }, // Empty value for all categories
            ...formattedCategories
          ]);
        } else {
          throw new Error(data.message || 'Failed to fetch categories');
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        // Fallback if API fails
        setCategories([
          { value: '', label: 'All Categories' },
          { value: 'uncategorized', label: 'Uncategorized' }
        ]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const sortFromUrl = urlParams.get('sort');
    const categoryFromUrl = urlParams.get('category');
    
    setSearchParams({
      ...searchParams,
      searchTerm: searchTermFromUrl || '',
      sort: sortFromUrl || 'desc',
      category: categoryFromUrl || '',
    });

    const fetchPosts = async () => {
      setLoading(true);
      const searchQuery = urlParams.toString();
      
      try {
        const res = await fetch(`/api/post/getposts?${searchQuery}`);
        if (!res.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        const data = await res.json();
        setPosts(data.posts);
        setTotalPosts(data.posts.length);
        setShowMore(data.posts.length === 9);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSearchParams(prev => ({ 
      ...prev, 
      [id]: value 
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleShowMore = async () => {
    const startIndex = posts.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    
    try {
      const res = await fetch(`/api/post/getposts?${urlParams.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch more posts');
      }
      
      const data = await res.json();
      setPosts(prev => [...prev, ...data.posts]);
      setTotalPosts(prev => prev + data.posts.length);
      setShowMore(data.posts.length === 9);
    } catch (error) {
      console.error('Error fetching more posts:', error);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams();
    urlParams.set('searchTerm', searchParams.searchTerm);
    urlParams.set('sort', searchParams.sort);
    urlParams.set('category', searchParams.category);
    navigate(`/search?${urlParams.toString()}`, { replace: true });
  }, [searchParams, navigate]);

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 dark:bg-gray-900 dark:text-gray-200">
      {/* Header with Search Bar */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-gray-200">Search Posts</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              id="searchTerm"
              placeholder="Search for posts..."
              value={searchParams.searchTerm}
              onChange={handleChange}
              className="w-full py-3 px-4 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            />
            <svg 
              className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button 
            onClick={toggleFilters}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition duration-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className={`bg-white rounded-lg shadow-md p-6 mb-8 transition-all duration-300 dark:bg-gray-800 ${isFilterOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 hidden md:block overflow-hidden'}`}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">Sort By</label>
            <div className="flex gap-4">
              <label className={`flex items-center cursor-pointer p-3 rounded-lg border ${searchParams.sort === 'desc' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-300 hover:bg-gray-50'} dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200`}>
                <input
                  type="radio"
                  name="sort"
                  id="sort-desc"
                  value="desc"
                  checked={searchParams.sort === 'desc'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                Latest
              </label>
              <label className={`flex items-center cursor-pointer p-3 rounded-lg border ${searchParams.sort === 'asc' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-300 hover:bg-gray-50'} dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200`}>
                <input
                  type="radio"
                  name="sort"
                  id="sort"
                  value="asc"
                  checked={searchParams.sort === 'asc'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
                Oldest
              </label>
            </div>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              id="category"
              value={searchParams.category}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800">
        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center dark:text-gray-200">
            Search Results
            {!loading && posts.length > 0 && (
              <span className="ml-2 text-sm bg-gray-100 text-gray-600 py-1 px-2 rounded-full dark:bg-gray-700 dark:text-gray-300">
                {totalPosts} posts
              </span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <LoadingSpinner size="lg" color="primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-lg dark:text-gray-400">No posts found matching your search criteria.</p>
            <button 
              onClick={() => setSearchParams({searchTerm: '', sort: 'desc', category: 'uncategorized'})}
              className="mt-4 text-teal-600 hover:text-teal-800 font-medium dark:text-teal-500 dark:hover:text-teal-400"
            >
              Clear filters
            </button>
          </div>
          
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {currentPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            
            {/* Pagination */}
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
                      Showing <span className="font-medium">{indexOfFirstPost + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastPost, totalPosts)}
                      </span> of{' '}
                      <span className="font-medium">{totalPosts}</span> results
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

            {showMore && (
              <div className="flex justify-center mt-8">
                <button 
                  onClick={handleShowMore}
                  className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" color="primary" />
                      <span className="ml-2">Loading...</span>
                    </div>
                  ) : 'Show more posts'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}