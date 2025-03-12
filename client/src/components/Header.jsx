import { useEffect, useState } from 'react';
import { Avatar, Button, Dropdown, Navbar, TextInput } from 'flowbite-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineSearch, AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/theme/themeSlice';
import { signoutSuccess } from '../redux/user/userSlice';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state

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
    <Navbar className="border-b-2 flex justify-between items-center px-4 py-2">
      {/* Logo */}
      <Link to="/" className="self-center whitespace-nowrap text-lg sm:text-xl font-semibold dark:text-white">
        <span className="px-2 py-1 bg-gradient-to-r rounded-lg dark:text-white">Citizen's Charter</span> Passport
      </Link>

      {/* Mobile Menu Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-2xl">
        {isOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
      </button>

      {/* Navigation Links (Desktop & Mobile) */}
      <div className={`absolute md:relative top-16 md:top-auto left-0 w-full md:w-auto bg-white md:bg-transparent dark:bg-gray-900 md:dark:bg-transparent shadow-md md:shadow-none transition-all duration-300 ease-in-out transform ${isOpen ? "block" : "hidden"} md:flex md:items-center md:gap-6`}>
        <Link to="/" className={`block md:inline-block px-4 py-2 text-sm font-medium ${location.pathname === '/' ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}>Home</Link>

        {/* Dropdown Menu */}
      {/* Passport Services Dropdown */}
<Dropdown
  label="Passport Services"
  inline
  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500"
>
  <Link to="/projects">
    <Dropdown.Item className="hover:bg-gray-200 dark:bg-gray-700  dark:hover:bg-gray-800">Passport</Dropdown.Item>
  </Link>
  <Link to="/visa">
    <Dropdown.Item className="hover:bg-gray-200 dark:bg-gray-700  dark:hover:bg-gray-800">Visa</Dropdown.Item>
  </Link>
  <Link to="/renewal">
    <Dropdown.Item className="hover:bg-gray-200 dark:bg-gray-700  dark:hover:bg-gray-800">Renewal</Dropdown.Item>
  </Link>
  <Link to="/tracking">
    <Dropdown.Item className="hover:bg-gray-200 dark:bg-gray-700  dark:hover:bg-gray-800">Tracking</Dropdown.Item>
  </Link>
  <Link to="/appointments">
    <Dropdown.Item className="hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-800 ">Appointments</Dropdown.Item>
  </Link>
</Dropdown>


        <Link to="/faqs" className={`block md:inline-block px-4 py-2 text-sm font-medium ${location.pathname === '/faqs' ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}>FAQs</Link>
        <Link to="/contact" className={`block md:inline-block px-4 py-2 text-sm font-medium ${location.pathname === '/contact' ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}>Contact Us</Link>

        {/* Search Form (Only visible on larger screens) */}
        <form onSubmit={handleSubmit} className="hidden lg:flex px-4 py-2">
          <div className="relative">
            <TextInput type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            <AiOutlineSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </form>

        {/* Theme Toggle & User Menu (Visible in Mobile) */}
        <div className="md:hidden flex flex-col items-start px-4 py-2">
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

      {/* Right Side (Desktop: Theme Toggle & User Menu) */}
      <div className="hidden md:flex items-center gap-2">
        {/* Theme Toggle */}
        <Button className="w-10 h-10" color="gray" pill onClick={() => dispatch(toggleTheme())}>
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </Button>

        {/* User Profile / Sign-in */}
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
  );
}
