import { useEffect, useState } from 'react';
import { Avatar, Button, Dropdown, Navbar, TextInput } from 'flowbite-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
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
      <Link to="/" className="text-sm sm:text-xl font-semibold dark:text-white">
        <span className="px-2 py-1 rounded-lg dark:text-white">
        Citizen's Charter 
        </span>
        for Passport
      </Link>

      {/* Navigation Links (Always Visible) */}
      <div className="hidden md:flex gap-6">
        <Link to="/" className={`text-sm font-medium ${location.pathname === '/' ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}>
          Home
        </Link>
        <Link to="/projects" className={`text-sm font-medium ${location.pathname === '/about' ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}>
          Passport
        </Link>
        <Link to="/" className={`text-sm font-medium ${location.pathname === '/' ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}>
          FAQs
        </Link>

        <Link to="/" className={`text-sm font-medium ${location.pathname === '/' ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}>
          Contact Us
        </Link>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="hidden lg:flex">
        <TextInput
          type="text"
          placeholder="Search..."
          rightIcon={AiOutlineSearch}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>

      {/* Right Side (Theme Toggle, User Menu) */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          className="w-10 h-10"
          color="gray"
          pill
          onClick={() => dispatch(toggleTheme())}
        >
          {theme === 'light' ? <FaSun /> : <FaMoon />}
        </Button>

        {/* User Profile / Sign-in */}
        {currentUser ? (
          <Dropdown arrowIcon={false} inline label={<Avatar alt="user" img={currentUser.profilePicture} rounded />}>
            <Dropdown.Header>
              <span className="block text-sm">@{currentUser.username}</span>
              <span className="block text-sm font-medium truncate">{currentUser.email}</span>
            </Dropdown.Header>
            <Link to="/dashboard?tab=profile">
              <Dropdown.Item>Profile</Dropdown.Item>
            </Link>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleSignout}>Sign out</Dropdown.Item>
          </Dropdown>
        ) : (
          <Link to="/sign-in" >
           <Button 
  as={Link} 
  to="/sign-in" 
  className={`text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500  `}
>
  Sign In
</Button>


          </Link>
        )}
      </div>
    </Navbar>
  );
}
