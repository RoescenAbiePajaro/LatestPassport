import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineClock, HiOutlineTag } from 'react-icons/hi';
import LoadingSpinner from '../components/LoadingSpinner';

export default function KioskHome() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState({});

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
          const categoryMap = {};
          data.forEach((category) => {
            categoryMap[category._id] = category.name;
          });
          setCategories(categoryMap);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <LoadingSpinner size="lg" color="white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-100 p-6 text-center text-red-800">
        <h2 className="text-3xl font-bold mb-4">Error Loading Content</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 text-xl px-6 py-3 bg-red-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {posts.map((post) => (
          <div
            key={post._id}
            className="rounded-3xl overflow-hidden bg-gray-900 hover:shadow-2xl transition shadow-lg"
          >
            <Link to={`/post/${post.slug}`} className="block">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="flex items-center bg-teal-600 text-white text-lg px-4 py-1 rounded-full">
                    <HiOutlineTag className="mr-2" />
                    {categories[post.category] || 'Uncategorized'}
                  </span>
                </div>

                <h3 className="text-2xl font-bold mb-4">{post.title}</h3>
                <p className="text-gray-300 text-lg mb-4 line-clamp-4">
                  {post.excerpt || post.content.substring(0, 200) + '...'}
                </p>

                <div className="flex justify-between text-sm text-gray-400">
                  <span>
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="flex items-center">
                    <HiOutlineClock className="w-5 h-5 mr-1" />
                    {calculateReadTime(post.content)} min read
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
