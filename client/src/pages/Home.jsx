import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CallToAction from '../components/CallToAction';
import PostCard from '../components/PostCard';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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
    setCurrentIndex((prevIndex) =>
      prevIndex === posts.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? posts.length - 1 : prevIndex - 1
    );
  };

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (posts.length <= 1) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [posts.length, currentIndex]);

  // Determine which posts to show (current and next ones)
  const visiblePosts = posts.length ? [
    posts[currentIndex],
    posts[(currentIndex + 1) % posts.length],
    posts[(currentIndex + 2) % posts.length]
  ] : [];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section with Call to Action */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" />
          <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-center opacity-30" />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
          <CallToAction />
        </div>
      </section>

      {/* Recent Posts Section with Carousel */}
      <section className="max-w-6xl mx-auto px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              CivicView Guidelines
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
              Essential information to help with your application process
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-transparent animate-spin" />
            </div>
          ) : posts.length > 0 ? (
            <div className="relative px-10">
              {/* Carousel Navigation Buttons */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevSlide}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg z-10 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft size={24} />
              </motion.button>

              {/* Carousel Container */}
              <div className="overflow-hidden">
                <motion.div 
                  className="flex gap-6"
                  initial={{ x: 0 }}
                  animate={{ x: `-${currentIndex * (100 / posts.length)}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {posts.map((post) => (
                    <div key={post._id} className="min-w-[calc(33.333%-16px)] flex-shrink-0">
                      <PostCard post={post} />
                    </div>
                  ))}
                </motion.div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextSlide}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg z-10 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight size={24} />
              </motion.button>

              {/* Carousel Indicators */}
              <div className="flex justify-center gap-3 mt-8">
                {posts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      currentIndex === index 
                        ? 'bg-gray-700 dark:bg-gray-300 w-6' 
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No CivicView guidelines available at the moment.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}