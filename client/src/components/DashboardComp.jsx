import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  ChevronUp, 
  ChevronDown, 
  Activity, 
  Users, 
  FileText, 
  TrendingUp, 
  BarChart2, 
  Eye,
  CalendarDays,
  Clock,
  MoreHorizontal,
  ArrowUpRight,
  Search,
  Filter
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

// Helper function to generate random colors
const generateRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 50%)`;
};

export default function DashboardComp() {
  // State management
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [lastMonthUsers, setLastMonthUsers] = useState(0);
  const [lastMonthPosts, setLastMonthPosts] = useState(0);
  const [lastMonthComments, setLastMonthComments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState('week');
  const [topPerformers, setTopPerformers] = useState([]);
  const { currentUser } = useSelector((state) => state.user);

  // Activity data for charts
  const [activityData, setActivityData] = useState([
    { name: 'Mon', users: 0, posts: 0 },
    { name: 'Tue', users: 0, posts: 0 },
    { name: 'Wed', users: 0, posts: 0 },
    { name: 'Thu', users: 0, posts: 0 },
    { name: 'Fri', users: 0, posts: 0 },
    { name: 'Sat', users: 0, posts: 0 },
    { name: 'Sun', users: 0, posts: 0 },
  ]);

  // Content category distribution
  const [contentDistribution, setContentDistribution] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories first
        const categoriesRes = await fetch('/api/category');
        const categoriesData = await categoriesRes.json();
        
        if (categoriesRes.ok) {
          setCategories(categoriesData);
          
          // Now fetch other data in parallel
          const [usersRes, postsRes, commentsRes] = await Promise.all([
            fetch('/api/user/getusers'),
            fetch('/api/post/getposts'),
            fetch('/api/comment/getcomments')
          ]);
          
          const usersData = await usersRes.json();
          const postsData = await postsRes.json();
          const commentsData = await commentsRes.json();
          
          if (usersRes.ok) {
            setUsers(usersData.users.slice(0, 5));
            setTotalUsers(usersData.totalUsers);
            setLastMonthUsers(usersData.lastMonthUsers);
          }
          
          if (postsRes.ok) {
            setPosts(postsData.posts.slice(0, 5));
            setTotalPosts(postsData.totalPosts);
            setLastMonthPosts(postsData.lastMonthPosts);
            
            // Update content distribution based on post categories
            const categoryCount = {};
            postsData.posts.forEach(post => {
              const matchedCategory = categoriesData.find(cat => cat._id === post.category);
              const categoryName = matchedCategory ? matchedCategory.name : 'uncategorized';
              const categoryColor = matchedCategory ? matchedCategory.color || generateRandomColor() : '#8884d8';
              
              if (!categoryCount[categoryName]) {
                categoryCount[categoryName] = {
                  count: 0,
                  color: categoryColor
                };
              }
              categoryCount[categoryName].count++;
            });

            // Convert category counts to content distribution
            const updatedDistribution = Object.keys(categoryCount).map(categoryName => ({
              name: categoryName,
              value: categoryCount[categoryName].count,
              color: categoryCount[categoryName].color
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
              const dayPosts = postsData.posts.filter(post => 
                new Date(post.createdAt).toISOString().split('T')[0] === date
              ).length;
              
              const dayUsers = usersData.users ? usersData.users.filter(user => 
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
          
          if (commentsRes.ok) {
            setTotalComments(commentsData.totalComments);
            setLastMonthComments(commentsData.lastMonthComments);
          }
          
          calculateTopPerformers(usersData.users, postsData.posts);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser.isAdmin) {
      fetchData();
    }
  }, [currentUser]);

  const calculateTopPerformers = (users = [], posts = []) => {
    if (users.length === 0 || posts.length === 0) return;
  
    const userPostCounts = posts.reduce((acc, post) => {
      acc[post.userId] = (acc[post.userId] || 0) + 1;
      return acc;
    }, {});
  
    const topPerformers = users
      .map((user) => {
        const postCount = userPostCounts[user._id] || 0;
        return {
          id: user._id,
          name: user.username,
          avatar: user.profilePicture || '/api/placeholder/40/40',
          value: postCount.toString(),
          trend: postCount > 0 ? 'up' : 'down'
        };
      })
      .sort((a, b) => parseInt(b.value) - parseInt(a.value))
      .slice(0, 4);
  
    setTopPerformers(topPerformers);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Modern statistics card component
  const StatsCard = ({ title, value, icon: Icon, color, growth }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 relative group">
      <div className={`absolute inset-x-0 top-0 h-1 ${color} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
            <Icon className={`${color.replace('bg-', 'text-')} w-5 h-5`} />
          </div>
          <span className="flex items-center text-sm font-medium text-green-500">
            <ArrowUpRight className="mr-1 w-4 h-4" />
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

  // Chart card component
  const ChartCard = ({ title, subtitle, headerIcon, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-lg font-semibold dark:text-white flex items-center">
            {headerIcon && <span className="mr-2 text-indigo-500">{headerIcon}</span>}
            {title}
          </h2>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <button className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );

  // Calculate percentages for content distribution
  const contentDistributionPercentages = contentDistribution.map(item => {
    const total = contentDistribution.reduce((sum, current) => sum + current.value, 0);
    const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
    return {
      ...item,
      percentage
    };
  });

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-t-4 border-indigo-500 border-r-4 border-indigo-200 border-b-4 border-indigo-200 border-l-4 border-indigo-200 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-indigo-500 rounded-full opacity-70"></div>
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header with welcome and search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            Dashboard
            <span className="bg-indigo-100 text-indigo-800 text-xs py-1 px-2 rounded-md font-medium">Admin</span>
          </h1>
          <div className="flex items-center text-gray-500 text-sm mt-1">
            <Clock className="w-3.5 h-3.5 mr-1" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input 
              type="text" 
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white" 
              placeholder="Search..." 
            />
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard 
          title="Total Staffs" 
          value={totalUsers} 
          icon={Users} 
          color="bg-indigo-500" 
          growth={lastMonthUsers} 
        />
        <StatsCard 
          title="Total Posts" 
          value={totalPosts} 
          icon={FileText} 
          color="bg-emerald-500" 
          growth={lastMonthPosts} 
        />
        <StatsCard 
          title="Total Comments" 
          value={totalComments} 
          icon={Activity} 
          color="bg-blue-500" 
          growth={lastMonthComments} 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User & Post Activity Chart */}
        <ChartCard 
          title="User & Post Activity" 
          subtitle="Last 7 days" 
          headerIcon={<BarChart2 className="w-5 h-5" />}
        >
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
              <BarChart data={activityData} barSize={20} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
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
                <Bar dataKey="users" name="Users" fill="#A5B4FC" radius={[4, 4, 0, 0]} />
                <Bar dataKey="posts" name="Posts" fill="#34D399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-2 mt-4">
            {['today', 'week', 'month', 'all'].map((period) => (
              <button 
                key={period}
                className={`${
                  activeTimeframe === period 
                    ? 'bg-indigo-500 text-white ring-2 ring-indigo-200' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                } px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200`}
                onClick={() => setActiveTimeframe(period)}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </ChartCard>

        {/* Content Distribution - Modern Pie Chart */}
        <ChartCard 
          title="Content Categories" 
          headerIcon={<PieChart className="w-5 h-5" />}
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={3}
                >
                  {contentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 60}, 70%, 50%)`} stroke="none" />
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
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)` }}></div>
                <div>
                  <p className="text-xs font-medium dark:text-white">{item.percentage}%</p>
                  <p className="text-xs text-gray-500 truncate">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Top Performers - Modern User Cards */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold dark:text-white flex items-center">
              <Users className="mr-2 text-emerald-500 w-5 h-5" />
              Top Content Creators
            </h2>
            <button className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 space-y-3">
            {topPerformers.length > 0 ? (
              topPerformers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0 border-2 border-white dark:border-gray-700">
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
                    <span className={`ml-1 text-sm font-medium ${user.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {user.value} posts
                    </span>
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
      
      {/* Tables Section - Recent Users & Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold dark:text-white flex items-center">
              <Users className="mr-2 text-blue-500 w-5 h-5" />
              Recent Users
            </h2>
            <Link to="/dashboard?tab=users" className="flex items-center">
                <span>View All</span>
                <Eye className="ml-2 w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700/30">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {users.length > 0 ? users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                          <img src={user.profilePicture || '/api/placeholder/40/40'} alt={user.username} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-medium ml-3 dark:text-white">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-300">{user.email}</td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-300">
                      <div className="flex items-center">
                        <CalendarDays className="w-4 h-4 mr-1 text-gray-400" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="px-5 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Posts Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold dark:text-white flex items-center">
              <FileText className="mr-2 text-emerald-500 w-5 h-5" />
              Recent Posts
            </h2>
            <Link to="/dashboard?tab=posts" className="flex items-center">
              <span>View All</span>
              <Eye className="ml-2 w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700/30">
                <tr>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {posts.length > 0 ? posts.map((post) => {
                  const matchedCategory = categories.find(cat => cat._id === post.category);
                  const categoryName = matchedCategory ? matchedCategory.name : 'uncategorized';
                  const categoryColor = matchedCategory ? matchedCategory.color || generateRandomColor() : generateRandomColor();

                  return (
                    <tr key={post._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-medium dark:text-white line-clamp-1">
                          {post.title}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span 
                          className="px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                          style={{ 
                            backgroundColor: `${categoryColor}20`,
                            color: categoryColor
                          }}
                        >
                          {categoryName}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-300">
                        <div className="flex items-center">
                          <CalendarDays className="w-4 h-4 mr-1 text-gray-400" />
                          {formatDate(post.createdAt)}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="3" className="px-5 py-8 text-center text-gray-500">
                      No posts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}