import { Sidebar, Dropdown } from 'flowbite-react';
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
  HiMenu
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

  if (isMobile) {
    return (
      <div className="w-full p-4 flex justify-end">
        <Dropdown
          label=""
          dismissOnClick={false}
          theme={{
            floating: {
              target: "w-full",
              base: "z-10 w-fit rounded divide-y divide-gray-100 shadow focus:outline-none",
              content: "py-1 text-sm text-gray-700 dark:text-gray-200",
              header: "block py-2 px-4 text-sm text-gray-700 dark:text-gray-200",
              footer: "block py-2 px-4 text-sm text-gray-700 dark:text-gray-200",
              item: {
                base: "flex items-center justify-start py-2 px-4 text-sm text-gray-700 cursor-pointer w-full hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none dark:hover:bg-gray-600 dark:focus:bg-gray-600",
                icon: "mr-2 h-4 w-4"
              }
            }
          }}
          renderTrigger={() => (
            <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white">
              <HiMenu className="h-6 w-6" />
              <span>Menu</span>
            </button>
          )}
        >
          {filteredItems.map((item) => (
            <Link to={item.path} key={item.id}>
              <Dropdown.Item
                icon={item.icon}
                className={`flex items-center gap-2 ${
                  tab === item.id || (item.id === 'dash' && !tab) ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
              >
                {item.label}
                {item.id === 'profile' && (
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                    {currentUser?.isAdmin ? 'Admin' : 'User'}
                  </span>
                )}
              </Dropdown.Item>
            </Link>
          ))}
        </Dropdown>
      </div>
    );
  }

  return (
    <Sidebar 
      className="w-full md:w-56"
      theme={{
        root: {
          base: "flex h-full w-full flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800",
          inner: "h-full overflow-y-auto overflow-x-hidden py-4 px-3"
        },
        item: {
          base: "flex items-center justify-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
          active: "bg-gray-100 dark:bg-gray-700",
          icon: {
            base: "h-6 w-6 flex-shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white",
            active: "text-gray-900 dark:text-white"
          }
        }
      }}
    >
      <Sidebar.Items>
        <Sidebar.ItemGroup className="flex flex-col gap-1">
          {filteredItems.map((item) => (
            <Link to={item.path} key={item.id}>
              <Sidebar.Item
                active={tab === item.id || (item.id === 'dash' && !tab)}
                icon={item.icon}
                as="div"
                label={item.id === 'profile' ? (currentUser?.isAdmin ? 'Admin' : 'User') : undefined}
                labelColor="dark"
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