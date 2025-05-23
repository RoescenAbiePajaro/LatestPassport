import { useEffect, useState, createContext } from 'react';
import { Avatar, Button, Dropdown, TextInput } from 'flowbite-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
import { FaMoon, FaSun, FaBars, FaTimes, FaHome, FaQuestionCircle, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/theme/themeSlice';
import { signoutSuccess } from '../redux/user/userSlice';
import Logo from '../pages/Logo';

export const SidebarContext = createContext();

export default function Header() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector(state => state.user);
  const { theme } = useSelector(state => state.theme);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) setSearchTerm(searchTermFromUrl);
  }, [search]);

  const handleSignout = async () => {
    try {
      const res = await fetch('/api/user/signout', { method: 'POST' });
      if (res.ok) dispatch(signoutSuccess());
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(search);
    urlParams.set('searchTerm', searchTerm);
    navigate(`/search?${urlParams.toString()}`);
  };

  const navLinkClass = (path) => 
    `group relative overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ease-out flex items-center gap-3 ${
      pathname === path 
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
        : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5'
    }`;

  return (
    <SidebarContext.Provider value={{ isSidebarOpen }}>
      {/* Modern Floating Hamburger Button */}
      <div className={`fixed top-6 left-6 z-50 transition-all duration-500 ease-out ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="group relative p-3 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white hover:shadow-xl hover:shadow-blue-500/25 hover:scale-110 transition-all duration-300 ease-out"
        >
          <FaBars size={18} className="transition-transform duration-300 group-hover:rotate-180" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
        </button>
      </div>

      {/* Modern Sidebar with Glassmorphism */}
      <div className={`fixed inset-y-0 left-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-40 transition-all duration-500 ease-out ${isSidebarOpen ? 'w-80' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-6">
          {/* Enhanced Header with Close Button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <Logo />
            </div>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="group p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white hover:shadow-lg hover:shadow-red-500/25 hover:rotate-90 transition-all duration-300 ease-out"
            >
              <FaTimes size={16} />
            </button>
          </div>

          {/* Modern Search Bar with Enhanced Styling */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm"></div>
              <div className="relative">
                <AiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors duration-300" size={20} />
                <input
                  type="text"
                  placeholder="Search anything..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
          </form>

          {/* Enhanced Navigation Links */}
          <div className="space-y-3 mb-8">
            <Link to="/" className={navLinkClass('/')}>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10">
                <FaHome size={16} />
              </div>
              <span className="font-medium">Home</span>
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link to="/faqs" className={navLinkClass('/faqs')}>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10">
                <FaQuestionCircle size={16} />
              </div>
              <span className="font-medium">FAQs</span>
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>

          {/* Modern Theme Toggle and User Section */}
          <div className="mt-auto space-y-4">
            {/* Enhanced Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="group w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                  {theme === 'light' ? (
                    <FaMoon className="text-gray-600 dark:text-gray-300" size={16} />
                  ) : (
                    <FaSun className="text-yellow-500" size={16} />
                  )}
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative transition-colors duration-300">
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
              </div>
            </button>

            {/* Enhanced User Section */}
              {currentUser ? (
                <div className="group relative">
                  <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer">
                    <div className="relative">
                      <Avatar 
                        alt="user" 
                        img={currentUser.profilePicture} 
                        rounded
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        @{currentUser.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {currentUser.email}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Custom Dropdown Menu */}
                  <div className="absolute bottom-full left-0 mb-2 w-full origin-bottom scale-y-0 opacity-0 group-hover:scale-y-100 group-hover:opacity-100 transition-all duration-300 ease-out z-10">
                    <div className="p-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                      <Link 
                        to="/dashboard?tab=profile" 
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-300"
                      >
                        <span>Profile</span>
                      </Link>
                      <Link 
                        to="/dashboard?tab=posts" 
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-300"
                      >
                        <span>My Posts</span>
                      </Link>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <button
                        onClick={handleSignout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors duration-300"
                      >
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
              <div className="space-y-3">
                <Link to="/sign-in">
                  <button className="group w-full flex items-center justify-center gap-5 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 ease-out">
                    <FaSignInAlt size={16} className="transition-transform duration-300 group-hover:scale-110" />
                    <span>Sign In</span>
                  </button>
                </Link>
                <Link to="/sign-up">
                  <button className="group w-full flex items-center justify-center gap-5 px-6 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-semibold rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out">
                    <FaUserPlus size={16} className="transition-transform duration-300 group-hover:scale-110" />
                    <span>Sign Up</span>
                  </button>
                </Link>
              </div>
            )}
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
    </SidebarContext.Provider>
  );
}