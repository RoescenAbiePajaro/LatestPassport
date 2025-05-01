import { Link } from 'react-router-dom';
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
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 shadow-lg min-h-[300px]">
        <div className="flex items-center justify-center w-full">
          <LoadingSpinner size="lg" color="primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
      <div className="flex-1 space-y-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <Info size={16} className="mr-1" /> Important
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          CivicView <span className="text-blue-600 dark:text-blue-400">Portal</span> 
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl">
          Streamline your application process with our intuitive platform designed for civic engagement and community development.
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <Link
            to="/search"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-md hover:shadow-xl flex items-center gap-2"
          >
            View all posts <ArrowRight size={18} />
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
}