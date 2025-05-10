import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { Info, ArrowRight } from 'react-feather';

// Constants for better maintainability
const CLASSES = {
  CONTAINER: "flex flex-col lg:flex-row items-center justify-between gap-8 p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 shadow-lg min-h-[300px]",
  BADGE: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  TITLE: "text-4xl md:text-5xl font-bold text-gray-900 dark:text-white",
  DESCRIPTION: "text-lg text-gray-600 dark:text-gray-300 max-w-xl",
  BUTTON: "px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-md hover:shadow-xl flex items-center gap-2",
  IMAGE_WRAPPER: "relative w-full max-w-md aspect-square",
  IMAGE_OVERLAY: "absolute inset-0 rounded-3xl opacity-20",
  IMAGE_CONTENT: "absolute inset-0 flex items-center justify-center"
};

export default function CallToAction() {
  const [isLoading, setIsLoading] = useState(true);

  // Memoized content to prevent unnecessary re-renders
  const content = useMemo(() => ({
    badge: {
      text: "Important",
      icon: <Info size={16} className="mr-1" />
    },
    title: {
      main: "CivicView",
      highlight: "Portal"
    },
    description: "CivicView - Your Digital Gateway to Official Website Services.Real-time information access and efficient guidelines",
    button: {
      text: "View all posts",
      icon: <ArrowRight size={18} />
    }
  }), []);

  useEffect(() => {
    // Simulate loading with cleanup
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className={CLASSES.CONTAINER}>
        <div className="flex items-center justify-center w-full">
          <LoadingSpinner size="lg" color="primary" />
        </div>
      </div>
    );
  }

  return (
    <div className={CLASSES.CONTAINER}>
      {/* Text Content */}
      <div className="flex-1 space-y-4">
        <span className={CLASSES.BADGE}>
          {content.badge.icon} {content.badge.text}
        </span>
        
        <h1 className={CLASSES.TITLE}>
          {content.title.main} <span className="text-blue-600 dark:text-blue-400">{content.title.highlight}</span>
        </h1>
        
        <p className={CLASSES.DESCRIPTION}>
          {content.description}
        </p>
        
        <div className="flex flex-wrap gap-4 pt-2">
          <Link to="/search" className={CLASSES.BUTTON}>
            {content.button.text} {content.button.icon}
          </Link>
        </div>
      </div>

      {/* Image Content */}
      <div className="flex-1 flex justify-center items-center">
        <div className={CLASSES.IMAGE_WRAPPER}>
          <div className={`${CLASSES.IMAGE_OVERLAY} bg-blue-500 dark:bg-blue-600 rotate-6`}></div>
          <div className={`${CLASSES.IMAGE_OVERLAY} bg-indigo-500 dark:bg-indigo-600 -rotate-6`}></div>
          <div className={CLASSES.IMAGE_CONTENT}>
            <img 
              src="src/3.png" 
              alt="CivicView Application" 
              className="w-4/5 h-4/5 object-cover rounded-2xl shadow-xl"
              loading="lazy" // Add lazy loading for better performance
            />
          </div>
        </div>
      </div>
    </div>
  );
}