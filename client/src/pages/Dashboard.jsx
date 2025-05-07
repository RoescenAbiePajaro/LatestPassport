import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashSidebar from '../components/DashSideBar';
import DashProfile from '../components/DashProfile';
import DashPosts from '../components/DashPosts';
import DashUsers from '../components/DashUsers';
import DashComments from '../components/DashComments';
import DashboardComp from '../components/DashboardComp';
import DashCategories from '../components/DashCategories'; // Updated import
import UpdateCategory from './UpdateCategory';
import CreatePost from './CreatePost';
import UpdatePost from './UpdatePost';
import LoadingSpinner from '../components/LoadingSpinner';
import UserApproval from '../components/UserApproval';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState('');
  const [postId, setPostId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    const postIdFromUrl = urlParams.get('postId');
    const categoryIdFromUrl = urlParams.get('categoryId');
    
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
    if (postIdFromUrl) {
      setPostId(postIdFromUrl);
    }
    if (categoryIdFromUrl) {
      setCategoryId(categoryIdFromUrl);
    }
    // Simulate loading completion
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [location.search]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col md:flex-row bg-white dark:bg-gray-900'>
      {/* Sidebar */}
      <div className='md:w-56'>
        <DashSidebar />
      </div>

      {/* Main Content */}
      <div className='flex-1 p-4 bg-white dark:bg-gray-900'>
        {tab === 'profile' && <DashProfile />}
        {tab === 'posts' && <DashPosts />}
        {tab === 'users' && <DashUsers />}
        {tab === 'comments' && <DashComments />}
        {tab === 'dash' && <DashboardComp />}
        {tab === 'categories' && <DashCategories />} 
        {tab === 'createpost' && <CreatePost />}
        {tab === 'updatepost' && <UpdatePost postId={postId} />}
        {tab === 'updatecategory' && <UpdateCategory categoryId={categoryId} />}
        {tab === 'userapproval' && <UserApproval />}
      </div>
    </div>
  );
}