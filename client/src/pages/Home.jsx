import { useState, useEffect } from 'react';
import { HiOutlineClock, HiOutlineTag } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

export default function KioskHome() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/post/getallposts');
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || 'Failed to fetch posts');
          return;
        }
        setPosts(data.posts || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/category');
        const data = await res.json();
        if (res.ok) {
          setCategories(data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchPosts();
    fetchCategories();

    // Auto-refresh content every 2 minutes
    const interval = setInterval(() => {
      fetchPosts();
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  const calculateReadTime = (content) => {
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.floor(wordCount / 200));
  };

  // Filter posts based on selected category
  const filteredPosts = selectedCategory 
    ? posts.filter(post => post.category === selectedCategory) 
    : posts;

  // Handle category selection
  const handleCategoryClick = (categoryId) => {
    if (selectedCategory === categoryId) {
      // Clicking the same category again deselects it
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-800">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-100 dark:bg-red-900/20 p-6 text-center text-red-800 dark:text-red-400">
        <h2 className="text-3xl font-bold mb-4">Error Loading Content</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 text-xl px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          {selectedCategory
            ? `${categories.find(cat => cat._id === selectedCategory)?.name || 'Category'} Content`
            : 'Featured Content'}
        </h1>
      </div>
      
      {/* Categories section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`text-sm px-4 py-2 rounded-full transition duration-200 flex items-center ${
              selectedCategory === null
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
            }`}
          >
            All Categories
          </button>
          
          {categories.map((category) => (
            <button 
              key={category._id}
              onClick={() => handleCategoryClick(category._id)}
              className={`text-sm px-4 py-2 rounded-full transition duration-200 flex items-center ${
                selectedCategory === category._id
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
              }`}
            >
              <HiOutlineTag className="mr-1 h-4 w-4" />
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPosts.map((post) => (
          <Link
            key={post._id}
            to={`/post/${post.slug}`}
            className="relative rounded-xl overflow-hidden h-64 group transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300"
          >
            <img
              src={post.image}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center mb-2">
                  <span className="flex items-center bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                    <HiOutlineTag className="mr-1 h-3 w-3" />
                    {categories.find(cat => cat._id === post.category)?.name || 'Uncategorized'}
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-2 line-clamp-2 text-white">{post.title}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {filteredPosts.length === 0 && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 dark:text-gray-400">
          <h2 className="text-2xl font-semibold mb-4">
            {selectedCategory 
              ? 'No Content Available in This Category' 
              : 'No Content Available'}
          </h2>
          <p>
            {selectedCategory 
              ? 'Try selecting a different category or check back later.' 
              : 'Check back later for new content.'}
          </p>
        </div>
      )}
    </div>
  );
}