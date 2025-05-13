import { Sidebar } from 'flowbite-react';
import {
  HiUser,
  HiArrowSmRight,
  HiDocumentText,
  HiOutlineUserGroup,
  HiAnnotation,
  HiChartPie,
  HiTag,
  HiUserAdd, 
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
    path: '/dashboard?tab=dash'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: HiUser,
    adminOnly: false,
    path: '/dashboard?tab=profile'
  },
  {
    id: 'posts',
    label: 'Posts',
    icon: HiDocumentText,
    adminOnly: false,
    path: '/dashboard?tab=posts'
  },
  {
    id: 'createpost',
    label: 'Create Post',
    icon: HiDocumentText,
    adminOnly: false,
    userOnly: true,
    path: '/dashboard?tab=createpost'
  },
  {
    id: 'categories',
    label: 'Categories',
    icon: HiTag,
    adminOnly: true,
    path: '/dashboard?tab=categories'
  },
  {
    id: 'users',
    label: 'Users',
    icon: HiOutlineUserGroup,
    adminOnly: true,
    path: '/dashboard?tab=users'
  },
  {
    id: 'userapproval',
    label: 'User Approvals',
    icon: HiUserAdd,
    adminOnly: true,
    path: '/dashboard?tab=userapproval'
  },
  {
    id: 'comments',
    label: 'Comments',
    icon: HiAnnotation,
    adminOnly: true,
    path: '/dashboard?tab=comments'
  },
];

export default function DashSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState('');

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
    return sidebarItems.filter(item => {
      if (item.adminOnly) return currentUser?.isAdmin;
      if (item.userOnly) return !currentUser?.isAdmin;
      return true;
    });
  }, [currentUser]);

  return (
    <Sidebar className='w-full md:w-56'>
      <Sidebar.Items>
        <Sidebar.ItemGroup className='flex flex-col gap-1'>
          {filteredItems.map((item) => (
            <Link to={item.path} key={item.id}>
              <Sidebar.Item
                active={tab === item.id || (item.id === 'dash' && !tab)}
                icon={item.icon}
                as='div'
                label={item.id === 'profile' ? (currentUser?.isAdmin ? 'Admin' : 'User') : undefined}
                labelColor='dark'
              >
                {item.label}
              </Sidebar.Item>
            </Link>
          ))}
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}