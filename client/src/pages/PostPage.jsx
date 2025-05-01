import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from 'flowbite-react';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PostPage() {
  const { postSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState(null);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/post/getposts?slug=${postSlug}`);
        const data = await res.json();
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        if (res.ok) {
          setPost(data.posts[0]);
          
          // Fetch category name if category exists
          if (data.posts[0]?.category) {
            fetchCategoryName(data.posts[0].category);
          }
          
          setLoading(false);
          setError(false);
        }
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchPost();
  }, [postSlug]);

  // Function to fetch category name
  const fetchCategoryName = async (categoryId) => {
    try {
      const res = await fetch(`/api/category/${categoryId}`);
      const data = await res.json();
      
      if (res.ok && data) {
        setCategoryName(data.name);
      }
    } catch (error) {
      console.error('Failed to fetch category name:', error);
    }
  };

  useEffect(() => {
    try {
      const fetchRecentPosts = async () => {
        const res = await fetch(`/api/post/getposts?limit=3`);
        const data = await res.json();
        if (res.ok) {
          setRecentPosts(data.posts);
        }
      };
      fetchRecentPosts();
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        <div className="flex flex-col items-center">
          <LoadingSpinner size="lg" color="primary" />
          <p className="mt-4 text-slate-600 dark:text-slate-300 font-medium">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl max-w-md text-center border border-slate-100 dark:border-slate-700">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Article Not Found</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-8">We couldn't find the article you're looking for.</p>
          <Link to="/">
            <Button gradientDuoTone="purpleToBlue" className="w-full font-medium">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Image fallback handling
  const heroImageUrl = post?.image || '/default-post-image.jpg';
  const handleImageError = (e) => {
    e.target.src = '/default-post-image.jpg';
  };

  return (
    <main className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      {/* Hero Section with Fixed Image */}
      <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
        {/* Background gradient overlay for consistent look even if image fails */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/60 to-slate-900/80 z-10"></div>
        
        {/* Backup solid color in case image fails */}
        <div className="absolute inset-0 bg-slate-800 dark:bg-slate-900"></div>
        
        {/* Image with error handling */}
        <img 
          src={heroImageUrl}
          alt={post?.title || "Article hero image"}
          className="absolute inset-0 w-full h-full object-cover"
          onError={handleImageError}
        />
        
        {/* Content overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-16">
          <div className="max-w-4xl mx-auto w-full">
            {post?.category && (
              <Link
                to={`/search?category=${post.category}`}
                className="inline-block mb-5 transform transition hover:scale-105"
              >
                <span className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition duration-300">
                  {categoryName || 'Loading...'}
                </span>
              </Link>
            )}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white font-serif tracking-tight mb-6 leading-tight">
              {post?.title}
            </h1>
            <div className="flex items-center text-white text-opacity-90 text-sm md:text-base backdrop-blur-sm bg-black/20 px-4 py-2 rounded-full inline-flex">
              <span>{post && new Date(post.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
              <span className="mx-2">•</span>
              <span>{post && (post.content.length / 1000).toFixed(0)} min read</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 -mt-16 md:-mt-24 relative z-30">
        <article className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
          <div className="p-6 md:p-12">
            <div
              className="prose prose-slate dark:prose-invert prose-lg prose-img:rounded-xl prose-headings:font-serif prose-headings:tracking-tight prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline max-w-none"
              dangerouslySetInnerHTML={{ __html: post?.content }}
            />
          </div>
          
          {/* Author Information */}
          {post?.author && (
            <div className="border-t border-slate-200 dark:border-slate-700 p-6 md:p-8 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center">
                <img 
                  src={post.author.avatar || "/default-avatar.jpg"} 
                  alt={post.author.username} 
                  className="w-14 h-14 rounded-full object-cover mr-5 border-2 border-blue-500 shadow-md"
                  onError={(e) => e.target.src = "/default-avatar.jpg"}
                />
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {post.author.username}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {post.author.bio || "Content Writer"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </article>
      </div>

      {/* Related Posts */}
      <div className="bg-slate-100 dark:bg-slate-900 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-12 text-center">
            More CivicView Guidelines
          </h2>
          
          {recentPosts?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-xl shadow-md">
              <p className="text-slate-600 dark:text-slate-400">
                No related articles found.
              </p>
            </div>
          )}
          
        </div>
      </div>
    </main>
  );
}