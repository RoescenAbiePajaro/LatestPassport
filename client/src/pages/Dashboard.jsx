import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashSidebar from '../components/DashSidebar';
import DashProfile from '../components/DashProfile';
import DashPosts from '../components/DashPosts';
import DashUsers from '../components/DashUsers';
import DashComments from '../components/DashComments';
import DashboardComp from '../components/DashboardComp';
import CreatePost from './CreatePost';
import UpdatePost from './UpdatePost';

export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState('');
  const [postId, setPostId] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    const postIdFromUrl = urlParams.get('postId');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
    if (postIdFromUrl) {
      setPostId(postIdFromUrl);
    }
  }, [location.search]);

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
        {tab === 'createpost' && <CreatePost />}
        {tab === 'updatepost' && <UpdatePost postId={postId} />}
      </div>
    </div>
  );
}
