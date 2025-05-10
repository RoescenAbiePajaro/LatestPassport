import { useEffect, useState } from 'react';
import { Avatar, Button, Dropdown, Navbar, TextInput } from 'flowbite-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
import { FaMoon, FaSun, FaBars, FaTimes } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/theme/themeSlice';
import { signoutSuccess } from '../redux/user/userSlice';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector(state => state.user);
  const { theme } = useSelector(state => state.theme);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) setSearchTerm(searchTermFromUrl);
  }, [search]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    setIsSidebarOpen(false);
    setIsSearchExpanded(false);
  };

  const navLinkClass = (path) => 
    `text-sm font-medium relative group ${
      pathname === path 
        ? 'text-blue-600 dark:text-blue-300' 
        : 'text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300'
    }`;

  const activeLinkStyle = (path) => {
    return pathname === path ? (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-300 rounded-full transform scale-x-100 transition-transform duration-300"></span>
    ) : (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-300 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
    );
  };

  const mobileLinkClass = (path) => 
    `px-4 py-3 my-1 rounded-xl flex items-center transition-all duration-300 ${
      pathname === path 
        ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-300 font-medium' 
        : 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`;

  return (
    <div className={`sticky top-0 z-40 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md' 
        : 'bg-white dark:bg-gray-900'
      } border-b border-gray-200 dark:border-gray-800`}>
      <Navbar fluid className="px-4 py-3 mx-auto max-w-7xl">
        <div className="flex items-center md:gap-8">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="md:hidden text-gray-700 dark:text-gray-300 hover:text-blue-500 hover:rotate-180 transition-all duration-300 mr-3"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
          <Link to="/" className="flex items-center">
            <img 
              src={`src/${theme === 'light' ? '3' : '3'}.png`} 
              alt="Logo" 
              className="h-8 sm:h-10 transform hover:scale-105 transition-transform duration-300" 
            />
          </Link>
        </div>

        <div className="hidden md:flex gap-8 items-center">
          <Link to="/" className={navLinkClass('/')}>
            Home
            {activeLinkStyle('/')}
          </Link>
          <Link to="/about" className={navLinkClass('/about')}>
            About CivicView
            {activeLinkStyle('/about')}
          </Link>
          <Link to="/contact" className={navLinkClass('/contact')}>
            Contact Us
            {activeLinkStyle('/contact')}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button 
            className="md:hidden text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors duration-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            aria-label="Search"
          >
            <AiOutlineSearch size={20} />
          </button>

          <AnimatePresence>
            {isSearchExpanded && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute top-16 left-0 right-0 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg md:hidden z-50"
              >
                <form onSubmit={handleSubmit}>
                  <div className="relative">
                    <TextInput 
                      type="text" 
                      placeholder="Search..." 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      className="w-full pl-10 rounded-xl focus:ring-blue-500"
                      autoFocus
                    />
                    <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="hidden md:block">
            <div className="relative group">
              <TextInput 
                type="text" 
                placeholder="Search..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-64 pl-10 rounded-xl bg-gray-50 dark:bg-gray-800 border-0 focus:ring-blue-500 transition-all duration-300 group-hover:shadow-md"
              />
              <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
          </form>

          <div className="flex items-center gap-3">
            <Button 
              className="w-10 h-10 hidden sm:inline-flex rounded-full shadow-sm hover:shadow-md transition-all duration-300" 
              color={theme === 'light' ? 'gray' : 'dark'}
              pill 
              onClick={() => dispatch(toggleTheme())}
            >
              {theme === 'light' ? <FaMoon className="text-indigo-600" /> : <FaSun className="text-amber-400" />}
            </Button>

            {currentUser ? (
              <Dropdown 
                arrowIcon={false} 
                inline 
                label={
                  <div className="relative">
                    <Avatar alt="user" img={currentUser.profilePicture} rounded className="ring-2 ring-blue-500 hover:ring-blue-600 transition-all duration-300" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                  </div>
                }
                className="z-50"
              >
                <Dropdown.Header>
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar alt="user" img={currentUser.profilePicture} rounded size="sm" />
                    <div>
                      <span className="block text-sm font-semibold">@{currentUser.username}</span>
                      <span className="block text-xs text-gray-500 truncate">{currentUser.email}</span>
                    </div>
                  </div>
                </Dropdown.Header>
                <Link to="/dashboard?tab=profile">
                  <Dropdown.Item className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    Profile
                  </Dropdown.Item>
                </Link>
                <Link to="/dashboard?tab=posts">
                  <Dropdown.Item className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    My Posts
                  </Dropdown.Item>
                </Link>
                <Dropdown.Divider />
                <Dropdown.Item 
                  onClick={handleSignout} 
                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  Sign out
                </Dropdown.Item>
              </Dropdown>
            ) : (
              <Link to="/sign-in">
                <Button 
                  gradientDuoTone="purpleToBlue" 
                  outline 
                  className="hidden md:flex items-center gap-1 rounded-xl hover:shadow-md transition-all duration-300"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Navbar>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => {
                setIsSidebarOpen(false);
                setIsSearchExpanded(false);
              }}
            />
            
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-800 shadow-xl md:hidden z-50 overflow-y-auto rounded-r-xl"
            >
              <div className="flex flex-col p-5 h-full">
                <div className="flex justify-between items-center mb-8">
                  <Link to="/" onClick={() => setIsSidebarOpen(false)}>
                    <img src={`src/${theme === 'light' ? '3' : '3'}.png`} alt="Logo" className="h-8" />
                  </Link>
                  <button 
                    onClick={() => setIsSidebarOpen(false)} 
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-500 hover:rotate-90 transition-all duration-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <FaTimes size={18} />
                  </button>
                </div>

                <div className="flex flex-col space-y-1 flex-grow">
                  <Link to="/" onClick={() => setIsSidebarOpen(false)} className={mobileLinkClass('/')}>
                    Home
                  </Link>
                  <Link to="/faqs" onClick={() => setIsSidebarOpen(false)} className={mobileLinkClass('/faqs')}>
                    FAQs
                  </Link>
                  <Link to="/contact" onClick={() => setIsSidebarOpen(false)} className={mobileLinkClass('/contact')}>
                    Contact Us
                  </Link>
                  
                  <div className="my-6 border-t border-gray-100 dark:border-gray-700"></div>
                  
                  <form onSubmit={handleSubmit} className="mb-4">
                    <div className="relative">
                      <TextInput 
                        type="text" 
                        placeholder="Search..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="pl-10 w-full rounded-xl bg-gray-50 dark:bg-gray-700 border-0"
                      />
                      <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    </div>
                  </form>
                </div>

                <div className="mt-auto pt-5 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <Button 
                      className="w-10 h-10" 
                      color={theme === 'light' ? 'gray' : 'dark'} 
                      pill 
                      onClick={() => dispatch(toggleTheme())}
                    >
                      {theme === 'light' ? <FaMoon className="text-indigo-600" /> : <FaSun className="text-amber-400" />}
                    </Button>
                    
                    {currentUser ? (
                      <div className="flex items-center gap-3">
                        <Avatar alt="user" img={currentUser.profilePicture} rounded size="sm" className="ring-2 ring-blue-500" />
                        <div className="text-sm">
                          <div className="font-medium">@{currentUser.username}</div>
                          <div className="flex gap-4 mt-2">
                            <Link 
                              to="/dashboard?tab=profile" 
                              className="text-blue-600 dark:text-blue-400 text-xs font-medium"
                              onClick={() => setIsSidebarOpen(false)}
                            >
                              Profile
                            </Link>
                            <button 
                              onClick={handleSignout} 
                              className="text-red-500 dark:text-red-400 text-xs font-medium"
                            >
                              Sign out
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link to="/sign-in" onClick={() => setIsSidebarOpen(false)}>
                        <Button 
                          gradientDuoTone="purpleToBlue" 
                          outline 
                          size="sm" 
                          className="rounded-xl"
                        >
                          Sign In
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}