'use client';

import { MegaMenu, Navbar, TextInput, Button, Avatar, Dropdown } from 'flowbite-react';
import { HiArrowRight, HiChevronDown } from 'react-icons/hi';
import { AiOutlineSearch } from 'react-icons/ai';
import { FaMoon, FaSun } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/theme/themeSlice';
import { signoutSuccess } from '../redux/user/userSlice';
import { useEffect, useState } from 'react';

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
      if (res.ok) {
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
    <MegaMenu>
      <Link
              to='/'
              className='self-center whitespace-nowrap text-lg sm:text-xl font-semibold dark:text-white'
            >
              <span className='px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white'>
                Citizen's Charter
              </span>
              Passport
            </Link>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Navbar.Link href="/">Home</Navbar.Link>
        <Navbar.Link href="/about">About</Navbar.Link>
        <Navbar.Link href="/projects">Projects</Navbar.Link>
        <MegaMenu.DropdownToggle>
          More
          <HiChevronDown className="ml-2" />
        </MegaMenu.DropdownToggle>
      </Navbar.Collapse>
      
      <form onSubmit={handleSubmit} className="relative hidden md:flex w-full max-w-xs">
        <TextInput
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg pr-10"
        />
        <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <AiOutlineSearch size={20} />
        </button>
      </form>
      
      <div className="flex items-center gap-4">
        <Button color="gray" pill onClick={() => dispatch(toggleTheme())}>
          {theme === 'light' ? <FaSun size={18} /> : <FaMoon size={18} />}
        </Button>

        {currentUser ? (
          <Dropdown arrowIcon={false} inline label={<Avatar alt='user' img={currentUser.profilePicture} rounded />}> 
            <Dropdown.Header>
              <span className='block text-sm'>@{currentUser.username}</span>
              <span className='block text-sm font-medium truncate'>{currentUser.email}</span>
            </Dropdown.Header>
            <Link to='/dashboard?tab=profile'><Dropdown.Item>Profile</Dropdown.Item></Link>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleSignout}>Sign out</Dropdown.Item>
          </Dropdown>
        ) : (
          <></>
        )}
      </div>

      <MegaMenu.Dropdown>
        <div className="mt-6 border-y border-gray-200 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-800">
          <div className="mx-auto grid max-w-screen-xl px-4 py-5 text-sm text-gray-500 dark:text-gray-400 md:grid-cols-3 md:px-6">
            <ul className="mb-4 hidden space-y-4 md:mb-0 md:block" aria-labelledby="mega-menu-full-image-button">
              <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-500">Online Stores</a></li>
              <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-500">Segmentation</a></li>
              <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-500">Marketing CRM</a></li>
            </ul>
            <ul className="mb-4 space-y-4 md:mb-0">
              <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-500">Our Blog</a></li>
              <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-500">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-500">License</a></li>
            </ul>
            <a href="#" className="rounded-lg bg-gray-500 p-8 text-left">
              <p className="mb-5 max-w-xl font-extrabold leading-tight tracking-tight text-white">
                Preview the new Citizen's Charter Passport dashboard navigation.
              </p>
              <Link to='/sign-in'>
                <button type="button" className="inline-flex items-center rounded-lg border border-white px-2.5 py-1.5 text-center text-xs font-medium text-white hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-700">
                  Get started
                  <HiArrowRight className="ml-2" />
                </button>
              </Link>
            </a>
          </div>
        </div>
      </MegaMenu.Dropdown>
    </MegaMenu>
  );
}