import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Table } from 'flowbite-react';
import { 
  HiUsers, 
  HiTrendingUp, 
  HiDocumentText, 
  HiAnnotation,
  HiOutlineEye,
  HiChartPie
} from 'react-icons/hi';
import { ChevronUp, ChevronDown, Activity, Users, FileText, TrendingUp, BarChart2, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

export default function DashboardComp() {
  // State management
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [lastMonthUsers, setLastMonthUsers] = useState(0);
  const [lastMonthPosts, setLastMonthPosts] = useState(0);
  const [lastMonthComments, setLastMonthComments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState('today');
  const [topPerformers, setTopPerformers] = useState([]);
  const { currentUser } = useSelector((state) => state.user);

  // Activity data for charts - will be populated from real data
  const [activityData, setActivityData] = useState([
    { name: 'Mon', users: 0, posts: 0 },
    { name: 'Tue', users: 0, posts: 0 },
    { name: 'Wed', users: 0, posts: 0 },
    { name: 'Thu', users: 0, posts: 0 },
    { name: 'Fri', users: 0, posts: 0 },
    { name: 'Sat', users: 0, posts: 0 },
    { name: 'Sun', users: 0, posts: 0 },
  ]);

  // Content category distribution - will be populated from post categories
  const [contentDistribution, setContentDistribution] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/user/getusers');
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
        const res = await fetch('/api/post/getposts');
        const data = await res.json();
        if (res.ok) {
          setPosts(data.posts);
          setTotalPosts(data.totalPosts);
          setLastMonthPosts(data.lastMonthPosts);
          
          // Update content distribution based on post categories
          const categoryCount = {};
          data.posts.forEach(post => {
            // Use the actual category from the post, defaulting to 'uncategorized'
            const category = post.category || 'uncategorized';
            categoryCount[category] = (categoryCount[category] || 0) + 1;
          });
          
          // Get categories from your CreatePost component
          const categoryColors = {
            'uncategorized': '#8884d8',
            'appointment': '#00C49F',
            'passport': '#0088FE',
            'renewal': '#FF8042',
            'tracking': '#6366F1',
            'visa': '#FF5252'
          };
          
          // Convert category counts to content distribution
          const updatedDistribution = Object.keys(categoryCount).map(category => ({
            name: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize first letter
            value: categoryCount[category],
            color: categoryColors[category.toLowerCase()] || '#CCCCCC' // Default color for unknown categories
          }));
          
          setContentDistribution(updatedDistribution);
          
          // Calculate daily activity for charts
          const today = new Date();
          const weekData = Array(7).fill().map((_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (6 - i));
            return date.toISOString().split('T')[0];
          });
          
          // Count posts and users created each day of the week
          const dailyActivity = weekData.map(date => {
            const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(date).getDay()];
            const dayPosts = data.posts.filter(post => 
              new Date(post.createdAt).toISOString().split('T')[0] === date
            ).length;
            
            const dayUsers = data.users ? data.users.filter(user => 
              new Date(user.createdAt).toISOString().split('T')[0] === date
            ).length : 0;
            
            return {
              name: dayName,
              posts: dayPosts,
              users: dayUsers
            };
          });
          
          setActivityData(dailyActivity);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    const fetchComments = async () => {
      try {
        const res = await fetch('/api/comment/getcomments');
        const data = await res.json();
        if (res.ok) {
          setTotalComments(data.totalComments);
          setLastMonthComments(data.lastMonthComments);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    if (currentUser.isAdmin) {
      Promise.all([fetchUsers(), fetchPosts(), fetchComments()])
        .then(() => {
          calculateTopPerformers();
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [currentUser]);

  // Calculate top performers based on posts
  const calculateTopPerformers = () => {
    if (users.length > 0 && posts.length > 0) {
      // Create a map to count posts per user
      const userPostCounts = posts.reduce((acc, post) => {
        if (post.userId) {
          acc[post.userId] = (acc[post.userId] || 0) + 1;
        }
        return acc;
      }, {});
      
      // Convert to array and sort by post count
      const userPostArray = users
        .map(user => ({
          id: user._id,
          name: user.username,
          avatar: user.profilePicture || '/api/placeholder/40/40',
          value: (userPostCounts[user._id] || 0).toString(),
          trend: userPostCounts[user._id] > 0 ? 'up' : 'down' // Trend based on post count
        }))
        .sort((a, b) => parseInt(b.value) - parseInt(a.value))
        .slice(0, 4); // Get top 4
      
      setTopPerformers(userPostArray);
    }
  };

  // Modern statistics card component
  const StatsCard = ({ title, value, icon: Icon, color, gradient, growth }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-px overflow-hidden">
      <div className={`h-1 ${gradient}`}></div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
            <Icon className={`${color.replace('bg-', 'text-')} w-5 h-5`} />
          </div>
          <span className="flex items-center text-sm font-medium text-green-500">
            <TrendingUp className="mr-1 w-4 h-4" />
            {growth}
            <span className="ml-1 text-gray-500 dark:text-gray-400">last month</span>
          </span>
        </div>
        <h3 className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">
          {title}
        </h3>
        <p className="text-3xl font-bold dark:text-white mt-2">{value}</p>
      </div>
    </div>
  );

  // Chart card component with improved styling
  const ChartCard = ({ title, subtitle, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-lg font-semibold dark:text-white flex items-center">
            <BarChart2 className="mr-2 text-indigo-500 w-5 h-5" />
            {title}
          </h2>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );

  // Placeholder content for empty tables
  const renderEmptyState = (type) => (
    <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
      {type === 'users' ? (
        <Users className="w-12 h-12 mb-3 text-gray-400" />
      ) : (
        <FileText className="w-12 h-12 mb-3 text-gray-400" />
      )}
      <p className="text-lg font-medium">No {type} found</p>
      <p className="text-sm">New {type} will appear here when added</p>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm rounded-md text-indigo-500 bg-indigo-100 dark:bg-indigo-900 dark:bg-opacity-20">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  // Calculate percentages for content distribution
  const contentDistributionPercentages = contentDistribution.map(item => {
    const total = contentDistribution.reduce((sum, current) => sum + current.value, 0);
    const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
    return {
      ...item,
      percentage
    };
  });

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header with search and actions */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <div className="flex items-center text-gray-500 text-sm mt-1">
            <span>Admin</span>
            <span className="mx-1.5">•</span>
            <span>Analytics Overview</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl px-4 py-2 flex items-center">
          <span className="text-sm text-gray-500 mr-2">Last updated:</span>
          <span className="text-sm font-medium">{new Date().toLocaleDateString()}</span>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard 
          title="Total Users" 
          value={totalUsers} 
          icon={Users} 
          color="bg-indigo-500" 
          gradient="bg-gradient-to-r from-indigo-500 to-purple-500"
          growth={lastMonthUsers} 
        />
        <StatsCard 
          title="Total Posts" 
          value={totalPosts} 
          icon={FileText} 
          color="bg-emerald-500" 
          gradient="bg-gradient-to-r from-emerald-500 to-teal-500"
          growth={lastMonthPosts} 
        />
        <StatsCard 
          title="Total Comments" 
          value={totalComments} 
          icon={Activity} 
          color="bg-blue-500" 
          gradient="bg-gradient-to-r from-blue-500 to-cyan-500"
          growth={lastMonthComments} 
        />
      </div>

      {/* Charts and Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User & Post Activity Chart */}
        <ChartCard title="User & Post Activity" subtitle="Last 7 days">
          <div className="mb-4">
            <div className="flex items-center">
              <h3 className="text-2xl font-bold dark:text-white">{totalUsers + totalPosts}</h3>
              <div className="ml-auto flex items-center">
                <span className="text-green-500 text-sm">+{lastMonthUsers + lastMonthPosts}%</span>
                <ChevronUp className="text-green-500 h-4 w-4" />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">TOTAL ACTIVITY</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} barSize={24} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide={true} />
                <Tooltip 
                  cursor={{fill: 'rgba(243, 244, 246, 0.2)'}} 
                  contentStyle={{
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 0 15px rgba(0,0,0,0.1)',
                    padding: '10px'
                  }}
                />
                <Bar dataKey="users" name="Users" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="posts" name="Posts" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-2 mt-4">
            {['today', 'week', 'month', 'all'].map((period) => (
              <button 
                key={period}
                className={`${
                  activeTimeframe === period 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                } px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200`}
                onClick={() => setActiveTimeframe(period)}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </ChartCard>

        {/* Content Distribution - Now using a more modern Pie Chart */}
        <ChartCard title="Content Categories">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [`${value} posts`, props.payload.name]}
                  contentStyle={{
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 0 15px rgba(0,0,0,0.1)',
                    padding: '10px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {contentDistributionPercentages.slice(0, 6).map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <div>
                  <p className="text-xs font-medium dark:text-white">{item.percentage}%</p>
                  <p className="text-xs text-gray-500 truncate">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Top Performers - showing users with most posts */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold dark:text-white flex items-center">
              <Users className="mr-2 text-emerald-500 w-5 h-5" />
              Top Content Creators
            </h2>
          </div>
          <div className="p-5 space-y-4">
            {topPerformers.length > 0 ? (
              topPerformers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0 border-2 border-white">
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium dark:text-white">{user.name}</h4>
                      <p className="text-xs text-gray-500">Content Creator</p>
                    </div>
                  </div>
                  <div className="flex items-center bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm">
                    {user.trend === 'up' ? (
                      <ChevronUp className="text-green-500 h-4 w-4" />
                    ) : (
                      <ChevronDown className="text-red-500 h-4 w-4" />
                    )}
                    <span className={`ml-1 text-sm font-medium ${user.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>{user.value}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-10 w-10 mb-2 opacity-40" />
                <p>No post data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold dark:text-white flex items-center">
              <Users className="mr-2 text-indigo-500 w-5 h-5" />
              Recent Users
            </h2>
            <Button color="indigo" size="sm" className="rounded-lg">
              <Link to="/dashboard?tab=users" className="flex items-center">
                <span>View All</span>
                <Eye className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            {users && users.length > 0 ? (
              <Table hoverable className="rounded-lg overflow-hidden">
                <Table.Head className="bg-gray-50 dark:bg-gray-700/50">
                  <Table.HeadCell className="dark:text-gray-200 py-4">User</Table.HeadCell>
                  <Table.HeadCell className="dark:text-gray-200 py-4">Username</Table.HeadCell>
                  <Table.HeadCell className="dark:text-gray-200 py-4">Status</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y divide-gray-100 dark:divide-gray-700">
                  {users.slice(0, 5).map((user) => (
                    <Table.Row key={user._id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <img
                            src={user.profilePicture || '/api/placeholder/40/40'}
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-gray-200 dark:border-gray-700"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/api/placeholder/40/40';
                            }}
                          />
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="dark:text-gray-200 font-medium">@{user.username}</Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-1">
                          <span className={`${user.isAdmin ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:bg-opacity-30 dark:text-purple-300' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:bg-opacity-30 dark:text-emerald-300'} px-2.5 py-1 rounded-lg text-xs font-medium`}>
                            {user.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            ) : (
              renderEmptyState('users')
            )}
          </div>
        </div>
      </div>
      
      {/* Recent Posts */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-white flex items-center">
            <FileText className="mr-2 text-emerald-500 w-5 h-5" />
            Recent Posts
          </h2>
          <Button color="success" size="sm" className="rounded-lg">
            <Link to="/dashboard?tab=posts" className="flex items-center">
              <span>View All</span>
              <Eye className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          {posts && posts.length > 0 ? (
            <Table hoverable className="rounded-lg overflow-hidden">
              <Table.Head className="bg-gray-50 dark:bg-gray-700/50">
                <Table.HeadCell className="dark:text-gray-200 py-4">Image</Table.HeadCell>
                <Table.HeadCell className="dark:text-gray-200 py-4">Title</Table.HeadCell>
                <Table.HeadCell className="dark:text-gray-200 py-4">Category</Table.HeadCell>
                <Table.HeadCell className="dark:text-gray-200 py-4">Date</Table.HeadCell>
                <Table.HeadCell className="dark:text-gray-200 py-4">Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y divide-gray-100 dark:divide-gray-700">
                {posts.slice(0, 5).map((post) => (
                  <Table.Row key={post._id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <Table.Cell>
                      <img
                        src={post.image || '/api/placeholder/60/40'}
                        alt={post.title}
                        className="w-16 h-12 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/api/placeholder/60/40';
                        }}
                      />
                    </Table.Cell>
                    <Table.Cell className="dark:text-gray-200 font-medium line-clamp-1">
                      {post.title}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-lg dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300">
                        {post.category || 'Uncategorized'}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="dark:text-gray-200">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell className="dark:text-gray-200">
                      <div className="flex space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium text-sm">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-800 dark:text-red-400 font-medium text-sm">
                          Delete
                        </button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            renderEmptyState('posts')
          )}
        </div>
      </div>
    </div>
  );
}