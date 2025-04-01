// Home
import { useEffect, useState } from 'react';
import CallToAction from '../components/CallToAction';
import PostCard from '../components/PostCard';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch('/api/post/getPosts');
      const data = await res.json();
      setPosts(data.posts);
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

  // Determine which posts to show (current and next ones)
  const visiblePosts = posts.slice(currentIndex, currentIndex + 3);
  // If we're near the end, wrap around to show posts from the beginning
  if (visiblePosts.length < 3) {
    visiblePosts.push(...posts.slice(0, 3 - visiblePosts.length));
  }

  return (
    <div>
      {/* Call to Action Section - Placed First */}
      <div className='p-3 bg-blue-100 dark:bg-slate-700'>
        <CallToAction />
      </div>

      {/* Recent Posts Section with Carousel */}
      <div className='max-w-6xl mx-auto p-3 flex flex-col gap-8 py-7'>
        {posts && posts.length > 0 && (
          <div className='flex flex-col gap-6'>
            <h2 className='text-2xl font-semibold text-center'>Passport Guidelines</h2>
            
            <div className='relative'>
              {/* Carousel Navigation Buttons */}
              <button 
                onClick={prevSlide}
                className='absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10'
              >
                &lt;
              </button>
              
              <div className='flex justify-center gap-4 overflow-hidden'>
                {visiblePosts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
              
              <button 
                onClick={nextSlide}
                className='absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10'
              >
                &gt;
              </button>
            </div>
            
            {/* Carousel Indicators */}
            <div className='flex justify-center gap-2'>
              {posts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full ${currentIndex === index ? 'bg-blue-500' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}