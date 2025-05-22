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
    `text-sm font-medium relative group px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 ${
      pathname === path 
        ? 'bg-blue-600 text-white' 
        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600'
    }`;

  return (
    <SidebarContext.Provider value={{ isSidebarOpen }}>
      {/* Floating Hamburger Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        className={`fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all duration-300 shadow-lg ${isSidebarOpen ? 'hidden' : 'block'}`}
      >
        <FaBars size={20} />
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl z-40 transition-all duration-300 ${isSidebarOpen ? 'w-72' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-4">
          {/* Header with Logo */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <Logo />
            </div>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all duration-300 ml-4"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="relative">
              <TextInput 
                type="text" 
                placeholder="Search..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-10"
                icon={AiOutlineSearch}
              />
            </div>
          </form>

          {/* Navigation Links */}
          <div className="space-y-2">
            <Link to="/" className={navLinkClass('/')}>
              <FaHome size={20} />
              <span>Home</span>
            </Link>
            <Link to="/faqs" className={navLinkClass('/faqs')}>
              <FaQuestionCircle size={20} />
              <span>FAQs</span>
            </Link>
          </div>

          {/* Theme Toggle */}
          <div className="mt-auto space-y-4">
            <Button 
              onClick={() => dispatch(toggleTheme())}
              className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all duration-300"
              color="gray"
            >
              {theme === 'light' ? (
                <>
                  <FaMoon className="text-gray-700" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <FaSun className="text-gray-200" />
                  <span>Light Mode</span>
                </>
              )}
            </Button>

            {/* User Section */}
            {currentUser ? (
              <Dropdown 
                arrowIcon={false} 
                inline 
                label={
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all duration-300 cursor-pointer">
                    <Avatar 
                      alt="user" 
                      img={currentUser.profilePicture} 
                      rounded 
                      className="ring-2 ring-blue-500" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        @{currentUser.username}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>
                }
              >
                <Link to="/dashboard?tab=profile">
                  <Dropdown.Item>Profile</Dropdown.Item>
                </Link>
                <Link to="/dashboard?tab=posts">
                  <Dropdown.Item>My Posts</Dropdown.Item>
                </Link>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleSignout} className="text-red-500">
                  Sign out
                </Dropdown.Item>
              </Dropdown>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                <Link to="/sign-in">
                  <Button 
                    className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all duration-300"
                    color="gray"
                  >
                    <FaSignInAlt className="flex-shrink-0" size={18} />
                    <span className="whitespace-nowrap">Sign In</span>
                  </Button>
                </Link>
                <Link to="/sign-up">
                  <Button 
                    className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all duration-300"
                    color="gray"
                  >
                    <FaUserPlus className="flex-shrink-0" size={18} />
                    <span className="whitespace-nowrap">Sign Up</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}