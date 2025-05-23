import { Dropdown } from 'flowbite-react';
import {
  HiUser,
  HiArrowSmRight,
  HiDocumentText,
  HiOutlineUserGroup,
  HiAnnotation,
  HiChartPie,
  HiTag,
  HiUserAdd,
  HiChatAlt,
  HiPencil,
  HiCloudUpload,
  HiCamera,
  HiQuestionMarkCircle,
  HiMenu,
  HiX
} from 'react-icons/hi';
import { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signoutSuccess } from '../redux/user/userSlice';
import { useDispatch, useSelector } from 'react-redux';

const sidebarItems = [
  {
    id: 'dash',
    label: 'Dashboard',
    icon: HiChartPie,
    adminOnly: true,
    path: '/dashboard?tab=dash',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: HiUser,
    adminOnly: true,
    path: '/dashboard?tab=profile',
  },
  {
    id: 'posts',
    label: 'Content',
    icon: HiDocumentText,
    adminOnly: true,
    path: '/dashboard?tab=posts',
  },
  {
    id: 'createpost',
    label: 'Create Content',
    icon: HiPencil,
    adminOnly: true,
    path: '/dashboard?tab=createpost',
  },
  {
    id: 'dashlogocrud',
    label: 'Logo Management',
    icon: HiCloudUpload,
    adminOnly: true,
    path: '/dashboard?tab=dashlogocrud',
  },
  {
    id: 'createlogo',
    label: 'Create Logo',
    icon: HiCamera,
    adminOnly: true,
    path: '/dashboard?tab=createlogo',
  },
  {
    id: 'categories',
    label: 'Categories',
    icon: HiTag,
    adminOnly: true,
    path: '/dashboard?tab=categories',
  },
  {
    id: 'users',
    label: 'Users',
    icon: HiOutlineUserGroup,
    adminOnly: true,
    path: '/dashboard?tab=users',
  },
  {
    id: 'userapproval',
    label: 'User Approvals',
    icon: HiUserAdd,
    adminOnly: true,
    path: '/dashboard?tab=userapproval',
  },
  {
    id: 'comments',
    label: 'Comments',
    icon: HiAnnotation,
    adminOnly: true,
    path: '/dashboard?tab=comments',
  },
  {
    id: 'feedback',
    label: 'Feedback',
    icon: HiChatAlt,
    adminOnly: true,
    path: '/dashboard?tab=feedback',
  },
  {
    id: 'dashfaqs',
    label: 'FAQs',
    icon: HiQuestionMarkCircle, 
    adminOnly: true,
    path: '/dashboard?tab=faqs',
  },
];

export default function DashSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  const handleSignout = async () => {
    try {
      const res = await fetch('/api/user/signout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const filteredItems = useMemo(() => {
    return sidebarItems.filter((item) => {
      if (item.adminOnly) return currentUser?.isAdmin;
      if (item.userOnly) return !currentUser?.isAdmin;
      return true;
    });
  }, [currentUser]);

  const navLinkClass = (itemId) => 
    `group relative overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ease-out flex items-center gap-3 w-full ${
      tab === itemId || (itemId === 'dash' && !tab)
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
        : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5'
    }`;

  if (isMobile) {
    return (
      <>
        {/* Modern Floating Hamburger Button for Mobile */}
        <div className={`fixed top-6 right-6 z-50 transition-all duration-500 ease-out ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="group relative p-3 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white hover:shadow-xl hover:shadow-blue-500/25 hover:scale-110 transition-all duration-300 ease-out"
          >
            <HiMenu size={18} className="transition-transform duration-300 group-hover:rotate-180" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
          </button>
        </div>

        {/* Modern Mobile Sidebar with Glassmorphism */}
        <div className={`fixed inset-y-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-40 transition-all duration-500 ease-out ${isSidebarOpen ? 'w-80' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full p-6">
            {/* Enhanced Header with Close Button */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex-1">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Menu
                </h2>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="group p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white hover:shadow-lg hover:shadow-red-500/25 hover:rotate-90 transition-all duration-300 ease-out"
              >
                <HiX size={16} />
              </button>
            </div>

            {/* Enhanced Navigation Links */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {filteredItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link 
                    key={item.id} 
                    to={item.path} 
                    className={navLinkClass(item.id)}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10">
                      <IconComponent size={16} />
                    </div>
                    <span className="font-medium">{item.label}</span>
                    {item.id === 'profile' && (
                      <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">
                        {currentUser?.isAdmin ? 'Admin' : 'User'}
                      </span>
                    )}
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                );
              })}
            </div>

            {/* Sign Out Button */}
            <div className="mt-6">
              <button
                onClick={handleSignout}
                className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-2xl shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all duration-300 ease-out"
              >
                <HiArrowSmRight size={16} className="transition-transform duration-300 group-hover:scale-110" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modern Backdrop Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-all duration-500 ease-out"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div className="w-full md:w-64 h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 shadow-xl">
      <div className="flex flex-col h-full p-6">

        {/* Enhanced Navigation Links */}
        <div className="space-y-3 flex-1 overflow-y-auto">
          {filteredItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link 
                key={item.id} 
                to={item.path} 
                className={navLinkClass(item.id)}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10">
                  <IconComponent size={16} />
                </div>
                <span className="font-medium">{item.label}</span>
                {item.id === 'profile' && (
                  <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">
                    {currentUser?.isAdmin ? 'Admin' : 'User'}
                  </span>
                )}
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            );
          })}
        </div>

        
      </div>
    </div>
  );
}