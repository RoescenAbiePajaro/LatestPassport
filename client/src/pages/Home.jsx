import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Info, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard';

const CallToAction = () => (
  <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
    <div className="flex-1 space-y-4">
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        <Info size={16} className="mr-1" /> Important
      </span>
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
        CivicView <span className="bg-gradient-to-r from-teal-400 to-blue-500 dark:from-teal-500 dark:to-blue-600 text-transparent bg-clip-text">Portal</span>
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl">
        Streamline your application process with our intuitive platform designed for civic engagement and community development.
      </p>
      <div className="flex flex-wrap gap-4 pt-2">
        <Link 
          to="/search" 
          className="bg-gradient-to-r from-teal-400 to-blue-500 dark:from-teal-500 dark:to-blue-600 text-white font-medium px-5 py-2 rounded-lg transition-all duration-300 hover:from-teal-500 hover:to-blue-600 hover:shadow-lg"
        >
          See More<ArrowRight size={18} />
        </Link>
      </div>
    </div>
    <div className="flex-1 flex justify-center items-center">
      <div className="relative w-full max-w-md aspect-square">
        <div className="absolute inset-0 bg-blue-500 dark:bg-blue-600 rounded-3xl rotate-6 opacity-20"></div>
        <div className="absolute inset-0 bg-indigo-500 dark:bg-indigo-600 rounded-3xl -rotate-6 opacity-20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src="src/3.png" 
            alt="CivicView Application" 
            className="w-4/5 h-4/5 object-cover rounded-2xl shadow-xl"
          />
        </div>
      </div>
    </div>
  </div>
);



export default function Home() {
  const [posts, setPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCards, setVisibleCards] = useState(3);

  useEffect(() => {
    // Responsive card count based on screen width
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCards(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCards(2);
      } else {
        setVisibleCards(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/post/getPosts');
        const data = await res.json();
        setPosts(data.posts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      return nextIndex >= posts.length - visibleCards + 1 ? 0 : nextIndex;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex - 1;
      return nextIndex < 0 ? posts.length - visibleCards : nextIndex;
    });
  };

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (posts.length <= visibleCards) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [posts.length, currentIndex, visibleCards]);

  // Determine which posts to show (current and next ones)
  const visiblePosts = posts.length ? [
    posts[currentIndex],
    ...(visibleCards > 1 ? [posts[(currentIndex + 1) % posts.length]] : []),
    ...(visibleCards > 2 ? [posts[(currentIndex + 2) % posts.length]] : [])
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Hero Section with animated background */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-900">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-blue-50 dark:bg-gray-800 opacity-50" />
          <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
          
          {/* Animated shapes in background */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-indigo-300 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
          <CallToAction />
        </div>
      </section>

      {/* Recent Posts Section with modern carousel */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-col gap-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium text-sm mb-4">
              <Info size={16} /> Essential Guidelines
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              CivicView <span className="bg-gradient-to-r from-teal-400 to-blue-500 dark:from-teal-500 dark:to-blue-600 text-transparent bg-clip-text">Guidelines</span>
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
              Everything you need to know to complete your application successfully
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <LoadingSpinner size="lg" color="primary" />
            </div>
          ) : posts.length > 0 ? (
            <div className="relative overflow-hidden px-10">
              {/* Carousel Navigation Buttons */}
              {posts.length > visibleCards && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg z-10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={24} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg z-10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={24} />
                  </motion.button>
                </>
              )}

              {/* Carousel Container */}
              <div className="overflow-hidden">
                <motion.div 
                  className="flex gap-6"
                  initial={false}
                  animate={{ 
                    x: `-${currentIndex * (100 / visibleCards)}%` 
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30,
                    mass: 1
                  }}
                >
                  {posts.map((post) => (
                    <div 
                      key={post._id} 
                      className="flex-shrink-0"
                      style={{ width: `calc(${100 / visibleCards}% - ${(visibleCards - 1) * 24 / visibleCards}px)` }}
                    >
                      <PostCard post={post} />
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Modern Carousel Indicators */}
              {posts.length > visibleCards && (
                <div className="flex justify-center gap-3 mt-12">
                  {Array.from({ length: posts.length - visibleCards + 1 }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`group relative h-2 transition-all duration-300 rounded-full overflow-hidden ${
                        currentIndex === index ? 'w-12 bg-blue-600 dark:bg-blue-500' : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    >
                      <span className={`absolute inset-0 scale-x-0 origin-left transition-transform duration-700 ease-out bg-blue-400 dark:bg-blue-300 ${
                        currentIndex === index ? 'scale-x-100' : ''
                      }`}></span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <Info size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p className="text-lg text-gray-500 dark:text-gray-400">
                No CivicView guidelines available at the moment.
              </p>
              <button className="mt-4 px-5 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                Check back later
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}