import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner, Tooltip } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { FaEdit } from 'react-icons/fa';

export default function Logo({ className = '' }) {
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditTooltip, setShowEditTooltip] = useState(false);
  const { currentUser } = useSelector(state => state.user);
  const { theme } = useSelector(state => state.theme);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        setLoading(true);
        // Get the most recent logo (first in the sorted list)
        const res = await fetch('/api/logo');
        const data = await res.json();
        
        if (data && data.length > 0) {
          setLogo(data[0]); // Use the most recent logo
        } else {
          // Use default logo if none exists
          setLogo({
            title: 'Your Brand',
            image: `src/3.png`
          });
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching logo:', err);
        setError('Failed to load logo');
        // Use default logo on error
        setLogo({
          title: 'Your Brand',
          image: `src/3.png`
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLogo();
  }, []);

  // Determine if user has permission to edit
  const canEdit = currentUser && currentUser?.isAdmin;

  return (
    <div className={`flex items-center ${className}`}>
      {loading ? (
        <Spinner size="sm" />
      ) : (
        <Link 
          to="/" 
          className="flex items-center relative group"
          onMouseEnter={() => canEdit && setShowEditTooltip(true)}
          onMouseLeave={() => setShowEditTooltip(false)}
        >
          <img 
            src={logo?.image || `src/3.png`}
            alt={logo?.title || "Logo"} 
            className="h-8 sm:h-10 transform hover:scale-105 transition-transform duration-300" 
          />
          
          {/* Title next to logo */}
          <span className="ml-2 font-semibold text-gray-800 dark:text-gray-200 text-lg">
            {logo?.title || "Your Brand"}
          </span>
          
          {/* Edit button (only visible for admins) */}
          {canEdit && (
            <Link 
              to="/dashboard?tab=logo" 
              className={`absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 p-1.5 rounded-full hover:scale-110`}
            >
              <FaEdit size={14} />
            </Link>
          )}
          
          {/* Edit tooltip */}
          {showEditTooltip && canEdit && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-80 whitespace-nowrap z-50">
              Edit logo & title
            </div>
          )}
        </Link>
      )}
    </div>
  );
}