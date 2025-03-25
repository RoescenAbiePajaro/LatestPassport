import { useEffect, useState } from 'react';
import { Avatar, Button, Dropdown, Navbar, TextInput } from 'flowbite-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineSearch, AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/theme/themeSlice';
import { signoutSuccess } from '../redux/user/userSlice';

export default function Header() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector(state => state.user);
  const { theme } = useSelector(state => state.theme);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

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
    setIsSidebarOpen(false);
    setIsSearchExpanded(false);
  };

  const navLinkClass = (path) => 
    `text-sm font-medium ${pathname === path ? 'text-blue-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400'}`;

  const mobileLinkClass = (path) => 
    `px-4 py-2 rounded-lg ${pathname === path ? 'bg-blue-100 dark:bg-gray-700 text-blue-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`;

  return (
    <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <Navbar fluid className="px-4 py-2 mx-auto max-w-7xl">
        <div className="flex items-center md:gap-8">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="md:hidden text-gray-700 dark:text-gray-300 hover:text-blue-500 mr-2"
          >
            {isSidebarOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
          </button>
          <Link to="/">
            <img src={`src/${theme === 'light' ? '1' : '2'}.png`} alt="Logo" className="h-8 sm:h-10" />
          </Link>
        </div>

        <div className="hidden md:flex gap-8 items-center">
          <Link to="/" className={navLinkClass('/')}>Home</Link>
          <Link to="/faqs" className={navLinkClass('/faqs')}>FAQs</Link>
          <Link to="/contact" className={navLinkClass('/contact')}>Contact Us</Link>
        </div>

        <div className="flex items-center gap-4">
          <button 
            className="md:hidden text-gray-700 dark:text-gray-300 hover:text-blue-500"
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
          >
            <AiOutlineSearch size={20} />
          </button>

          {isSearchExpanded && (
            <form onSubmit={handleSubmit} className="absolute top-16 left-0 right-0 px-4 md:hidden">
              <div className="relative">
                <TextInput 
                  type="text" 
                  placeholder="Search..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full pl-10"
                />
                <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </form>
          )}

          <form onSubmit={handleSubmit} className="hidden md:block">
            <div className="relative">
              <TextInput 
                type="text" 
                placeholder="Search..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-64 pl-10"
              />
              <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <Button 
              className="w-10 h-10 hidden sm:inline-flex" 
              color="gray" 
              pill 
              onClick={() => dispatch(toggleTheme())}
            >
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </Button>

            {currentUser ? (
              <Dropdown 
                arrowIcon={false} 
                inline 
                label={<Avatar alt="user" img={currentUser.profilePicture} rounded />}
              >
                <Dropdown.Header>
                  <span className="block text-sm">@{currentUser.username}</span>
                  <span className="block text-sm font-medium truncate">{currentUser.email}</span>
                </Dropdown.Header>
                <Link to="/dashboard?tab=profile"><Dropdown.Item>Profile</Dropdown.Item></Link>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleSignout}>Sign out</Dropdown.Item>
              </Dropdown>
            ) : (
              <Link to="/sign-in">
                <Button gradientDuoTone="purpleToBlue" outline className="hidden md:block">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </Navbar>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden z-50`}>
        <div className="flex flex-col p-4 h-full">
          <div className="flex justify-between items-center mb-8">
            <Link to="/" onClick={() => setIsSidebarOpen(false)}>
              <img src={`src/${theme === 'light' ? '1' : '2'}.png`} alt="Logo" className="h-8" />
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-700 dark:text-gray-300 hover:text-blue-500">
              <AiOutlineClose size={20} />
            </button>
          </div>

          <div className="flex flex-col space-y-4 flex-grow">
            <Link to="/" onClick={() => setIsSidebarOpen(false)} className={mobileLinkClass('/')}>Home</Link>
            <Link to="/faqs" onClick={() => setIsSidebarOpen(false)} className={mobileLinkClass('/faqs')}>FAQs</Link>
            <Link to="/contact" onClick={() => setIsSidebarOpen(false)} className={mobileLinkClass('/contact')}>Contact Us</Link>
            <form onSubmit={handleSubmit} className="px-4 py-2">
              <div className="relative">
                <TextInput 
                  type="text" 
                  placeholder="Search..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-10 w-full"
                />
                <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </form>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <Button className="w-8 h-8" color="gray" pill onClick={() => dispatch(toggleTheme())}>
                {theme === 'light' ? <FaMoon size={16} /> : <FaSun size={16} />}
              </Button>
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <Avatar alt="user" img={currentUser.profilePicture} rounded size="sm" />
                  <div className="text-sm">
                    <div className="font-medium">@{currentUser.username}</div>
                    <div className="flex gap-2 mt-1">
                      <Link to="/dashboard?tab=profile" className="text-blue-500 dark:text-blue-400 text-xs">Profile</Link>
                      <button onClick={handleSignout} className="text-red-500 dark:text-red-400 text-xs">Sign out</button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/sign-in" onClick={() => setIsSidebarOpen(false)}>
                  <Button gradientDuoTone="purpleToBlue" outline size="sm">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={() => {
            setIsSidebarOpen(false);
            setIsSearchExpanded(false);
          }}
        />
      )}
    </div>
  );
}