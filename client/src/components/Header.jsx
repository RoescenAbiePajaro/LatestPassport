import { useEffect, useState } from 'react';
import { Avatar, Button, Dropdown, Navbar, TextInput } from 'flowbite-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineSearch, AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/theme/themeSlice';
import { signoutSuccess } from '../redux/user/userSlice';
import PassportDropdown from './PassportDropdown';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar state

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('searchTerm', searchTerm);
    navigate(`/search?${urlParams.toString()}`);
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar className="border-b-2 flex justify-between items-center px-4 py-2">
        {/* Logo */}
        <Link to="/" className="self-center whitespace-nowrap text-lg sm:text-xl font-semibold dark:text-white">
          <span className="px-2 py-1 bg-gradient-to-r rounded-lg dark:text-white">Citizen's Charter Passport </span> 
        </Link>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-2xl">
          {isSidebarOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex  gap-6">
          <Link to="/" className={`text-m ${location.pathname === '/' ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}>Home</Link>
          <PassportDropdown />
          <Link to="/faqs" className={`text-m ${location.pathname === '/faqs' ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}>FAQs</Link>
          <Link to="/contact" className={`text-m ${location.pathname === '/contact' ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}>Contact Us</Link>
        </div>

        {/* Desktop Search Form */}
        <form onSubmit={handleSubmit} className="hidden lg:flex px-4 py-2">
          <div className="relative">
            <TextInput type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            <AiOutlineSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </form>

        {/* Desktop Theme Toggle & User Menu */}
        <div className="hidden md:flex items-center gap-5">
          <Button className="w-10 h-10" color="gray" pill onClick={() => dispatch(toggleTheme())}>
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </Button>
          {currentUser ? (
            <Dropdown arrowIcon={false} inline label={<Avatar alt="user" img={currentUser.profilePicture} rounded />}>
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
              <Button className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500">Sign In</Button>
            </Link>
          )}
        </div>
      </Navbar>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden z-50`}>
        <div className="flex flex-col p-4 space-y-4">
          <Link to="/" className={`block px-4 py-2 text-sm font-medium ${location.pathname === '/' ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}>Home</Link>
          <PassportDropdown />
          <Link to="/faqs" className={`block px-4 py-2 text-sm font-medium ${location.pathname === '/faqs' ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}>FAQs</Link>
          <Link to="/contact" className={`block px-4 py-2 text-sm font-medium ${location.pathname === '/contact' ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}>Contact Us</Link>

          {/* Theme Toggle & User Menu in Sidebar */}
          <div className="mt-4 space-y-4">
            <Button className="w-full text-left" color="gray" pill onClick={() => dispatch(toggleTheme())}>
              {theme === 'light' ? <FaMoon className="mr-2" /> : <FaSun className="mr-2" />}
              {theme === 'light' ? "Dark Mode" : "Light Mode"}
            </Button>

            {currentUser ? (
              <Dropdown arrowIcon={false} inline label={<Avatar alt="user" img={currentUser.profilePicture} rounded />} className="w-full">
                <Dropdown.Header>
                  <span className="block text-sm">@{currentUser.username}</span>
                  <span className="block text-sm font-medium truncate">{currentUser.email}</span>
                </Dropdown.Header>
                <Link to="/dashboard?tab=profile"><Dropdown.Item>Profile</Dropdown.Item></Link>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleSignout}>Sign out</Dropdown.Item>
              </Dropdown>
            ) : (
              <Link to="/sign-in" className="w-full">
                <Button className="w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}
    </div>
  );
}