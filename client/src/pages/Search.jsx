import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';

export default function Search() {
  const [searchParams, setSearchParams] = useState({
    searchTerm: '',
    sort: 'desc',
    category: 'uncategorized',
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const sortFromUrl = urlParams.get('sort');
    const categoryFromUrl = urlParams.get('category');
    
    if (searchTermFromUrl || sortFromUrl || categoryFromUrl) {
      setSearchParams({
        ...searchParams,
        searchTerm: searchTermFromUrl || '',
        sort: sortFromUrl || 'desc',
        category: categoryFromUrl || 'uncategorized',
      });
    }

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

  const categories = [
    { value: 'uncategorized', label: 'Uncategorized' },
    { value: 'appointment', label: 'Appointment' },
    { value: 'passport', label: 'Passport' },
    { value: 'renewal', label: 'Renewal' },
    { value: 'tracking', label: 'Tracking' },
    { value: 'visa', label: 'Visa' }
  ];

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      {/* Header with Search Bar */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Search Posts</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              id="searchTerm"
              placeholder="Search for posts..."
              value={searchParams.searchTerm}
              onChange={handleChange}
              className="w-full py-3 px-4 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
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
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition duration-200"
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className={`bg-white rounded-lg shadow-md p-6 mb-8 transition-all duration-300 ${isFilterOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 hidden md:block overflow-hidden'}`}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <div className="flex gap-4">
              <label className={`flex items-center cursor-pointer p-3 rounded-lg border ${searchParams.sort === 'desc' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-300 hover:bg-gray-50'}`}>
                <input
                  type="radio"
                  name="sort"
                  id="sort"
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
              <label className={`flex items-center cursor-pointer p-3 rounded-lg border ${searchParams.sort === 'asc' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-300 hover:bg-gray-50'}`}>
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
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            Search Results
            {!loading && posts.length > 0 && (
              <span className="ml-2 text-sm bg-gray-100 text-gray-600 py-1 px-2 rounded-full">
                {posts.length} posts
              </span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-lg">No posts found matching your search criteria.</p>
            <button 
              onClick={() => setSearchParams({searchTerm: '', sort: 'desc', category: 'uncategorized'})}
              className="mt-4 text-teal-600 hover:text-teal-800 font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            
            {showMore && (
              <div className="flex justify-center p-6 border-t border-gray-200">
                <button
                  onClick={handleShowMore}
                  className="py-2 px-4 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition duration-200 flex items-center"
                >
                  Load More
                  <svg className="ml-2 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}