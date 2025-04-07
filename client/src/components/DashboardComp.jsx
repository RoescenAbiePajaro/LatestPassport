import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Table } from 'flowbite-react';
import { 
  HiUsers, 
  HiTrendingUp, 
  HiDocumentText, 
  HiAnnotation,
  HiOutlineEye
} from 'react-icons/hi';

export default function DashboardComp() {
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [lastMonthUsers, setLastMonthUsers] = useState(0);
  const [lastMonthPosts, setLastMonthPosts] = useState(0);
  const [lastMonthComments, setLastMonthComments] = useState(0);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/user/getusers?limit=5');
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
          setTotalUsers(data.totalUsers);
          setLastMonthUsers(data.lastMonthUsers);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/post/getposts?limit=5');
        const data = await res.json();
        if (res.ok) {
          setPosts(data.posts);
          setTotalPosts(data.totalPosts);
          setLastMonthPosts(data.lastMonthPosts);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    const fetchComments = async () => {
      try {
        const res = await fetch('/api/comment/getcomments?limit=5');
        const data = await res.json();
        if (res.ok) {
          setComments(data.comments);
          setTotalComments(data.totalComments);
          setLastMonthComments(data.lastMonthComments);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    if (currentUser.isAdmin) {
      fetchUsers();
      fetchPosts();
      fetchComments();
    }
  }, [currentUser]);

  const StatsCard = ({ title, value, icon: Icon, color, growth }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="text-white text-xl" />
        </div>
        <span className="flex items-center text-sm font-medium text-green-500">
          <HiTrendingUp className="mr-1" />
          {growth}
          <span className="ml-1 text-gray-500 dark:text-gray-400">last month</span>
        </span>
      </div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
        {title}
      </h3>
      <p className="text-3xl font-bold dark:text-white mt-1">{value}</p>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard 
          title="Total Users" 
          value={totalUsers} 
          icon={HiUsers} 
          color="bg-blue-500" 
          growth={lastMonthUsers} 
        />
        <StatsCard 
          title="Total Posts" 
          value={totalPosts} 
          icon={HiDocumentText} 
          color="bg-green-500" 
          growth={lastMonthPosts} 
        />
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold dark:text-white flex items-center">
              <HiUsers className="mr-2 text-blue-500" />
              Recent Users
            </h2>
            <Button gradientDuoTone="purpleToBlue" size="sm" className="rounded-lg">
              <Link to="/dashboard?tab=users" className="flex items-center">
                <span>View All</span>
                <HiOutlineEye className="ml-2" />
              </Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell className="dark:text-gray-200">User</Table.HeadCell>
                <Table.HeadCell className="dark:text-gray-200">Username</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {users.map((user) => (
                  <Table.Row key={user._id} className="bg-white dark:bg-gray-800 dark:border-gray-700">
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <img
                          src={user.profilePicture}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-gray-200 dark:border-gray-700"
                        />
                      </div>
                    </Table.Cell>
                    <Table.Cell className="dark:text-gray-200 font-medium">{user.username}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold dark:text-white flex items-center">
              <HiDocumentText className="mr-2 text-green-500" />
              Recent Posts
            </h2>
            <Button gradientDuoTone="greenToBlue" size="sm" className="rounded-lg">
              <Link to="/dashboard?tab=posts" className="flex items-center">
                <span>View All</span>
                <HiOutlineEye className="ml-2" />
              </Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell className="dark:text-gray-200">Post</Table.HeadCell>
                <Table.HeadCell className="dark:text-gray-200">Title</Table.HeadCell>
                <Table.HeadCell className="dark:text-gray-200">Category</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {posts.map((post) => (
                  <Table.Row key={post._id} className="bg-white dark:bg-gray-800 dark:border-gray-700">
                    <Table.Cell>
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-16 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                      />
                    </Table.Cell>
                    <Table.Cell className="dark:text-gray-200 font-medium line-clamp-1">
                      {post.title}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                        {post.category}
                      </span>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}