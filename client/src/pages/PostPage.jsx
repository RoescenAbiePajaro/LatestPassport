import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from 'flowbite-react';
import CallToAction from '../components/CallToAction';
import CommentSection from '../components/CommentSection';
import PostCard from '../components/PostCard';

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

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-300 border-t-slate-600 dark:border-slate-700 dark:border-t-slate-300 animate-spin"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-300 font-medium">Loading article...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg max-w-md text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-2">Article Not Found</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">We couldn't find the article you're looking for.</p>
          <Link to="/">
            <Button gradientDuoTone="purpleToBlue" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );

  return (
    <main className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      {/* Hero Section */}
      <div 
        className="w-full bg-cover bg-center h-96 relative" 
        style={{ 
          backgroundImage: `url(${post?.image})`,
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
          <div className="max-w-3xl mx-auto w-full">
            {post?.category && (
              <Link
                to={`/search?category=${post.category}`}
                className="inline-block mb-4"
              >
                <span className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-full transition duration-300">
                  {categoryName || 'Loading...'}
                </span>
              </Link>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-serif tracking-tight mb-4">
              {post?.title}
            </h1>
            <div className="flex items-center text-white text-opacity-90 text-sm">
              <span>{post && new Date(post.createdAt).toLocaleDateString()}</span>
              <span className="mx-2">•</span>
              <span>{post && (post.content.length / 1000).toFixed(0)} min read</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <article className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 md:p-10">
            <div
              className="prose prose-slate dark:prose-invert prose-img:rounded-xl prose-headings:font-serif prose-a:text-blue-600 max-w-none"
              dangerouslySetInnerHTML={{ __html: post?.content }}
            />
          </div>
          
          {/* Author Information */}
          {post?.author && (
            <div className="border-t border-slate-200 dark:border-slate-700 p-6 md:p-8 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center">
                <img 
                  src={post.author.avatar || "https://via.placeholder.com/80"} 
                  alt={post.author.username} 
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    {post.author.username}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {post.author.bio || "Content Writer"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </article>

        {/* Comments Section */}
        <div className="mt-12">
          <CommentSection postId={post?._id} />
        </div>

        {/* Call to Action */}
        <div className="mt-16">
          <CallToAction />
        </div>
      </div>

      {/* Related Posts */}
      <div className="bg-slate-100 dark:bg-slate-900 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 font-serif">
            More CivicView Guidelines
          </h2>
          
          {recentPosts?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-600 dark:text-slate-400">
              No related articles found.
            </p>
          )}
          
          <div className="mt-12 text-center">
            <Link to="/blog">
              <Button gradientDuoTone="purpleToBlue" size="lg">
                View All Articles
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}