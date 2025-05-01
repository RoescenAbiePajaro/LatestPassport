import { Button } from 'flowbite-react';
import { Link } from 'react-router-dom'; // Make sure to import Link from react-router-dom
import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function CallToAction() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading completion
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className='flex flex-col sm:flex-row p-3 border border-blue-500 justify-center items-center rounded-tl-3xl rounded-br-3xl text-center min-h-[200px] bg-gradient-to-br from-blue-600 to-purple-600'>
        <div className="flex items-center justify-center w-full">
          <LoadingSpinner size="lg" color="primary" />
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col sm:flex-row p-3 border border-blue-500 justify-center items-center rounded-tl-3xl rounded-br-3xl text-center bg-gradient-to-br from-blue-600 to-purple-600'>
        <div className="flex-1 left flex flex-col">
            <h1 className='text-lg sm:text-2xl font-bold text-white'>
                CivicView
            </h1>

            <p className='text-gray-200 my-2 relative'>
                A CivicView is a document that outlines an 
                organization's aims, values, and standards of service. 
                It also includes information about how the organization 
                will provide services to the public and what the public can expect from the organization.
            </p>
            
            {/* Replacing the Button with Link */}
            <Link
              to={'/search'} // URL for your route
              className='text-lg text-white hover:text-gray-200 text-center hover:underline'
            >
              View all posts
            </Link>
        </div>
        <div className="py-5 flex-2 px-4">
  {/* Light mode image */}
  <img 
    src="src/3.png" 
    alt="civic"
    className="dark:hidden"  // hidden in dark mode
  />
  
  {/* Dark mode image */}
  <img 
    src="src/3.png" 
    alt="civic" 
    className="hidden dark:block"  // shown only in dark mode
  />
</div>
    </div>
  )
}
