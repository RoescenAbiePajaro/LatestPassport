import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  ChevronUp, Activity, Users, FileText, 
  BarChart2, MessageSquare, Clock, MoreHorizontal, 
  ArrowUpRight, Shield, Download, Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import * as XLSX from 'xlsx';
import LoadingSpinner from './LoadingSpinner';
import RoleDistribution from './RoleDistribution';

// Constants
const TIME_PERIODS = ['today', 'week', 'month', 'all'];
const INITIAL_ACTIVITY_DATA = [
  { name: 'Mon', users: 0, posts: 0, comments: 0 },
  { name: 'Tue', users: 0, posts: 0, comments: 0 },
  { name: 'Wed', users: 0, posts: 0, comments: 0 },
  { name: 'Thu', users: 0, posts: 0, comments: 0 },
  { name: 'Fri', users: 0, posts: 0, comments: 0 },
  { name: 'Sat', users: 0, posts: 0, comments: 0 },
  { name: 'Sun', users: 0, posts: 0, comments: 0 },
];

// Helper functions
const generateRandomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;

const formatDate = (dateString) => new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
}).format(new Date(dateString));

// Dropdown Menu Component
const DropdownMenu = ({ onDownload }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      <button 
        onClick={toggleDropdown}
        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg z-10">
          <button
            onClick={() => {
              onDownload();
              setIsOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download as Excel
          </button>
        </div>
      )}
    </div>
  );
};

// ChartCard Component
const ChartCard = ({ title, subtitle, headerIcon, children, className = '', height = 'h-[300px]', onDownload }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 ${className} flex flex-col`}>
      <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-lg font-semibold dark:text-white flex items-center">
            {headerIcon && <span className="mr-2 text-indigo-500">{headerIcon}</span>}
            {title}
          </h2>
          {subtitle && <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{subtitle}</p>}
        </div>
        <DropdownMenu onDownload={onDownload} />
      </div>
      <div className={`p-5 flex-1 ${height}`}>
        {children}
      </div>
    </div>
  );
};

// StatsCard Component
const StatsCard = ({ title, value, icon: Icon, color, growth }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 h-full group">
    <div className={`absolute inset-x-0 top-0 h-1 ${color} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
    <div className="p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`${color.replace('bg-', 'text-')} w-5 h-5`} />
        </div>
        <span className="flex items-center text-xs font-medium text-green-500">
          <ArrowUpRight className="mr-1 w-3 h-3" />
          {growth}
          <span className="ml-1 text-gray-500 dark:text-gray-400 text-xs">last month</span>
        </span>
      </div>
      <h3 className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">
        {title}
      </h3>
      <p className="text-2xl font-bold dark:text-white mt-1">{value}</p>
    </div>
  </div>
);

export default function DashboardComp() {
  // State management
  const [data, setData] = useState({
    users: [],
    posts: [],
    categories: [],
    comments: [],
    totalUsers: 0,
    totalPosts: 0,
    totalCategories: 0,
    totalAdmins: 0,
    totalStaff: 0,
    lastMonthUsers: 0,
    lastMonthPosts: 0,
    lastMonthComments: 0,
    totalComments: 0,
    activityData: INITIAL_ACTIVITY_DATA,
    contentDistribution: [],
    topPerformers: [],
    topCommenters: [],
    commentData: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState('week');
  const { currentUser } = useSelector((state) => state.user);

  // Memoized calculations
  const mostUsedCategory = useMemo(() => {
    if (data.categories.length === 0) return 'N/A';
    return data.categories.reduce((prev, current) => 
      (data.posts.filter(p => p.category === prev._id).length > 
       data.posts.filter(p => p.category === current._id).length ? prev : current)
    ).name;
  }, [data.categories, data.posts]);

  const totalCategorizedPosts = useMemo(() => 
    data.categories.reduce((sum, cat) => 
      sum + data.posts.filter(post => post.category === cat._id).length, 0
    ),
    [data.categories, data.posts]
  );

  const contentDistributionPercentages = useMemo(() => 
    data.contentDistribution.map(item => {
      const total = data.contentDistribution.reduce((sum, current) => sum + current.value, 0);
      const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
      return { ...item, percentage };
    }),
    [data.contentDistribution]
  );

  // Comment-related calculations
  const totalComments = useMemo(() => 
    data.totalComments,
    [data.totalComments]
  );

  const avgCommentsPerPost = useMemo(() => {
    if (data.posts.length === 0) return 0;
    return (totalComments / data.posts.length).toFixed(1);
  }, [totalComments, data.posts]);

  const mostCommentedPosts = useMemo(() => {
    const postCommentCounts = data.posts.map(post => ({
      title: post.title,
      commentCount: data.comments.filter(comment => comment.postId === post._id).length,
      postId: post._id
    }));
    return postCommentCounts.sort((a, b) => b.commentCount - a.commentCount).slice(0, 5);
  }, [data.posts, data.comments]);

  // Download handlers
  const handleDownloadActivity = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.activityData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Activity');
    XLSX.writeFile(workbook, 'activity_data.xlsx');
  };

  const handleDownloadContentCategories = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.contentDistribution.map(item => ({
      Category: item.name,
      Posts: item.value,
      Percentage: `${contentDistributionPercentages.find(p => p.name === item.name)?.percentage}%`
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Content Categories');
    XLSX.writeFile(workbook, 'content_categories.xlsx');
  };

  const handleDownloadCategoryUsage = () => {
    const worksheet = XLSX.utils.json_to_sheet(categoryUsageData.map(item => ({
      Category: item.name,
      Posts: item.count
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Category Usage');
    XLSX.writeFile(workbook, 'category_usage.xlsx');
  };

  const handleDownloadTopPerformers = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.topPerformers.map(item => ({
      Name: item.name,
      Posts: item.value,
      Trend: item.trend
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Top Performers');
    XLSX.writeFile(workbook, 'top_performers.xlsx');
  };

  const handleDownloadTopCommenters = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.topCommenters.map(item => ({
      Name: item.name,
      Comments: item.value,
      Trend: item.trend
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Top Commenters');
    XLSX.writeFile(workbook, 'top_commenters.xlsx');
  };

  const handleDownloadRoleDistribution = () => {
    const worksheet = XLSX.utils.json_to_sheet([{
      Admins: data.totalAdmins,
      Staff: data.totalStaff,
      Total_Users: data.totalUsers
    }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Role Distribution');
    XLSX.writeFile(workbook, 'role_distribution.xlsx');
  };

  const handleDownloadRecentUsers = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.users.map(user => ({
      Username: user.username,
      Email: user.email,
      Joined: formatDate(user.createdAt)
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Recent Users');
    XLSX.writeFile(workbook, 'recent_users.xlsx');
  };

  const handleDownloadRecentPosts = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.posts.map(post => ({
      Title: post.title,
      Category: data.categories.find(cat => cat._id === post.category)?.name || 'Uncategorized',
      Comments: data.comments.filter(comment => comment.postId === post._id).length,
      Created: formatDate(post.createdAt)
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Recent Posts');
    XLSX.writeFile(workbook, 'recent_posts.xlsx');
  };

  const handleDownloadRecentComments = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.comments.map(comment => ({
      Content: comment.content,
      User: data.users.find(user => user._id === comment.userId)?.username || 'Unknown',
      Post: data.posts.find(post => post._id === comment.postId)?.title || 'Unknown',
      Created: formatDate(comment.createdAt)
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Recent Comments');
    XLSX.writeFile(workbook, 'recent_comments.xlsx');
  };

  const handleDownloadCommentData = () => {
    const worksheet = XLSX.utils.json_to_sheet(mostCommentedPosts.map(item => ({
      Post_Title: item.title,
      Comment_Count: item.commentCount,
      Post_ID: item.postId
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Comment Statistics');
    XLSX.writeFile(workbook, 'comment_statistics.xlsx');
  };

  // Data fetching and processing
  const fetchData = useCallback(async () => {
    if (!currentUser || !currentUser.isAdmin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const categoriesRes = await fetch('/api/category');
      const categoriesData = await categoriesRes.json();
      
      if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
      
      const [usersRes, postsRes, commentsRes] = await Promise.all([
        fetch('/api/user/getusers'),
        fetch('/api/post/getposts'),
        fetch('/api/comment/getcomments?limit=5') // Limit to 5 for recent comments
      ]);
      
      const [usersData, postsData, commentsData] = await Promise.all([
        usersRes.json(),
        postsRes.json(),
        commentsRes.json()
      ]);
      
      if (!usersRes.ok || !postsRes.ok || !commentsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      // Calculate admin and staff counts
      const adminCount = usersData.users ? usersData.users.filter(user => user.isAdmin).length : 0;
      const staffCount = usersData.users ? usersData.users.filter(user => !user.isAdmin).length : 0;

      // Calculate last month comments (note: limited by ?limit=5)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const lastMonthComments = commentsData.comments.filter(comment => 
        new Date(comment.createdAt) >= thirtyDaysAgo
      ).length;

      // Process content distribution
      const categoryCount = {};
      postsData.posts.forEach(post => {
        const matchedCategory = categoriesData.find(cat => cat._id === post.category);
        const categoryName = matchedCategory ? matchedCategory.name : 'uncategorized';
        const categoryColor = matchedCategory ? matchedCategory.color || generateRandomColor() : '#8884d8';
        
        if (!categoryCount[categoryName]) {
          categoryCount[categoryName] = { count: 0, color: categoryColor };
        }
        categoryCount[categoryName].count++;
      });

      // Process activity data
      const today = new Date();
      const weekData = Array(7).fill().map((_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });
      
      const dailyActivity = weekData.map(date => {
        const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(date).getDay()];
        const dayPosts = postsData.posts.filter(post => 
          new Date(post.createdAt).toISOString().split('T')[0] === date
        ).length;
        
        const dayUsers = usersData.users ? usersData.users.filter(user => 
          new Date(user.createdAt).toISOString().split('T')[0] === date
        ).length : 0;
        
        const dayComments = commentsData.comments.filter(comment =>
          new Date(comment.createdAt).toISOString().split('T')[0] === date
        ).length;
        
        return { name: dayName, posts: dayPosts, users: dayUsers, comments: dayComments };
      });

      // Calculate top performers
      const topPerformers = calculateTopPerformers(usersData.users || [], postsData.posts || []);

      // Calculate top commenters
      const topCommenters = calculateTopCommenters(usersData.users || [], commentsData.comments || []);

      setData({
        users: usersData.users?.slice(0, 5) || [],
        allUsers: usersData.users || [],
        posts: postsData.posts?.slice(0, 5) || [],
        categories: categoriesData || [],
        comments: commentsData.comments?.slice(0, 5) || [],
        totalUsers: usersData.totalUsers || 0,
        totalPosts: postsData.totalPosts || 0,
        totalCategories: categoriesData?.length || 0,
        totalAdmins: adminCount,
        totalStaff: staffCount,
        lastMonthUsers: usersData.lastMonthUsers || 0,
        lastMonthPosts: postsData.lastMonthPosts || 0,
        lastMonthComments,
        totalComments: commentsData.totalComments || commentsData.comments?.length || 0, // Use totalComments from endpoint
        activityData: dailyActivity,
        contentDistribution: Object.keys(categoryCount).map(categoryName => ({
          name: categoryName,
          value: categoryCount[categoryName].count,
          color: categoryCount[categoryName].color
        })),
        topPerformers,
        topCommenters,
        commentData: mostCommentedPosts
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateTopPerformers = (users = [], posts = []) => {
    if (users.length === 0 || posts.length === 0) return [];
  
    const userPostCounts = posts.reduce((acc, post) => {
      acc[post.userId] = (acc[post.userId] || 0) + 1;
      return acc;
    }, {});
  
    return users
      .map((user) => ({
        id: user._id,
        name: user.username,
        avatar: user.profilePicture || '/api/placeholder/40/40',
        value: (userPostCounts[user._id] || 0).toString(),
        trend: (userPostCounts[user._id] || 0) > 0 ? 'up' : 'down'
      }))
      .sort((a, b) => parseInt(b.value) - parseInt(a.value))
      .slice(0, 4);
  };

  const calculateTopCommenters = (users = [], comments = []) => {
    if (users.length === 0 || comments.length === 0) return [];
  
    const userCommentCounts = comments.reduce((acc, comment) => {
      acc[comment.userId] = (acc[comment.userId] || 0) + 1;
      return acc;
    }, {});
  
    return users
      .map((user) => ({
        id: user._id,
        name: user.username,
        avatar: user.profilePicture || '/api/placeholder/40/40',
        value: (userCommentCounts[user._id] || 0).toString(),
        trend: (userCommentCounts[user._id] || 0) > 0 ? 'up' : 'down'
      }))
      .sort((a, b) => parseInt(b.value) - parseInt(a.value))
      .slice(0, 4);
  };

  const categoryUsageData = useMemo(() => 
    data.categories.map(cat => ({
      name: cat.name,
      count: data.posts.filter(post => post.category === cat._id).length,
      color: cat.color || generateRandomColor()
    })),
    [data.categories, data.posts]
  );

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" color="primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            Dashboard
            <span className="bg-indigo-100 text-indigo-800 text-xs py-1 px-2 rounded-md font-medium">Admin</span>
          </h1>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
            <Clock className="w-3.5 h-3.5 mr-1" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard 
          title="Total Users" 
          value={data.totalUsers} 
          icon={Users} 
          color="bg-indigo-500" 
          growth={`${data.lastMonthUsers}%`} 
        />
        <StatsCard 
          title="Total Posts" 
          value={data.totalPosts} 
          icon={FileText} 
          color="bg-emerald-500" 
          growth={`${data.lastMonthPosts}%`} 
        />
        <StatsCard 
          title="Total Comments" 
          value={totalComments} 
          icon={MessageSquare} 
          color="bg-orange-500" 
          growth={`${Math.round((data.lastMonthComments / (totalComments || 1)) * 100)}%`} 
        />
        <StatsCard 
          title="Users by Role" 
          value={`${data.totalAdmins} Admins / ${data.totalStaff} Staff`} 
          icon={Shield} 
          color="bg-purple-500" 
          growth={`${Math.round(((data.totalAdmins + data.totalStaff) / (data.totalUsers || 1)) * 100)}%`} 
        />
      </div>

      {/* Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2">
          <ChartCard 
            title="User, Post & Comment Activity" 
            subtitle="Last 7 days" 
            headerIcon={<BarChart2 className="w-5 h-5" />}
            height="h-[300px]"
            onDownload={handleDownloadActivity}
          >
            <div className="mb-3">
              <div className="flex items-center">
                <h3 className="text-xl font-bold dark:text-white">{data.totalUsers + data.totalPosts + totalComments}</h3>
                <div className="ml-auto flex items-center">
                  <span className="text-green-500 text-xs">+{data.lastMonthUsers + data.lastMonthPosts + data.lastMonthComments}%</span>
                  <ChevronUp className="text-green-500 h-3 w-3 ml-1" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">TOTAL ACTIVITY</p>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.activityData} barSize={20} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis hide />
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
                  <Bar dataKey="comments" name="Comments" fill="#F97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {TIME_PERIODS.map((period) => (
                <button 
                  key={period}
                  className={`${
                    activeTimeframe === period 
                      ? 'bg-indigo-500 text-white ring-2 ring-indigo-200' 
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  } px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200`}
                  onClick={() => setActiveTimeframe(period)}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Content Distribution */}
        <div className="lg:col-span-1">
          <ChartCard 
            title="Content Categories" 
            headerIcon={<Activity className="w-5 h-5" />}
            height="h-[300px]"
            onDownload={handleDownloadContentCategories}
          >
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.contentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={70}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {data.contentDistribution.map((entry, index) => (
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
            <div className="grid grid-cols-2 gap-2 mt-3">
              {contentDistributionPercentages.slice(0, 6).map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)` }} />
                  <div>
                    <p className="text-xs font-medium dark:text-white">{item.percentage}%</p>
                    <p className="text-xs text-gray-500 truncate">{item.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Category Usage Chart */}
        <div className="lg:col-span-1">
          <ChartCard 
            title="Category Usage" 
            subtitle="Posts per category" 
            headerIcon={<Activity className="w-5 h-5" />}
            height="h-[300px]"
            onDownload={handleDownloadCategoryUsage}
          >
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryUsageData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    width={80}
                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(243, 244, 246, 0.2)'}} 
                    contentStyle={{
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 0 15px rgba(0,0,0,0.1)',
                      padding: '10px'
                    }}
                    formatter={(value) => [`${value} posts`, 'Count']}
                  />
                  <Bar dataKey="count" name="Posts">
                    {categoryUsageData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        radius={[0, 4, 4, 0]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center mt-3 text-xs">
              <div className="text-gray-500 dark:text-gray-400">
                Most used: {mostUsedCategory}
              </div>
              <div className="font-medium dark:text-white">
                Total: {totalCategorizedPosts} posts
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Comment Statistics Chart */}
        <div className="lg:col-span-1">
          <ChartCard 
            title="Comment Statistics" 
            subtitle="Most commented posts" 
            headerIcon={<MessageSquare className="w-5 h-5" />}
            height="h-[300px]"
            onDownload={handleDownloadCommentData}
          >
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mostCommentedPosts}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis 
                    dataKey="title" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    width={80}
                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(243, 244, 246, 0.2)'}} 
                    contentStyle={{
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 0 15px rgba(0,0,0,0.1)',
                      padding: '10px'
                    }}
                    formatter={(value) => [`${value} comments`, 'Comments']}
                  />
                  <Bar dataKey="commentCount" name="Comments" fill="#F97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center mt-3 text-xs">
              <div className="text-gray-500 dark:text-gray-400">
                Total: {totalComments}
              </div>
              <div className="font-medium dark:text-white">
                Avg/Post: {avgCommentsPerPost}
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Top Commenters Chart */}
        <div className="lg:col-span-1">
          <ChartCard 
            title="Top Commenters" 
            subtitle="Most active commenters" 
            headerIcon={<Users className="w-5 h-5" />}
            height="h-[300px]"
            onDownload={handleDownloadTopCommenters}
          >
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.topCommenters}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    width={80}
                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(243, 244, 246, 0.2)'}} 
                    contentStyle={{
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 0 15px rgba(0,0,0,0.1)',
                      padding: '10px'
                    }}
                    formatter={(value) => [`${value} comments`, 'Comments']}
                  />
                  <Bar dataKey="value" name="Comments" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              <p>Total Commenters: {data.users.length}</p>
              <p>Active Commenters: {data.topCommenters.length}</p>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold dark:text-white flex items-center">
              <Users className="mr-2 text-blue-500 w-5 h-5" />
              Recent Users
            </h2>
            <div className="flex items-center space-x-2">
              <Link to="/dashboard?tab=users" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                View All
                <Eye className="ml-1 w-4 h-4" />
              </Link>
              <DropdownMenu onDownload={handleDownloadRecentUsers} />
            </div>
          </div>
          <div className="p-5">
            {data.users.length > 0 ? (
              <div className="space-y-4">
                {data.users.map((user) => (
                  <div key={user._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                        <img src={user.profilePicture || '/api/placeholder/40/40'} alt={user.username} className="w-full h-full object-cover" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium dark:text-white">{user.username}</h4>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Joined {formatDate(user.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Users className="mx-auto h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No recent users</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold dark:text-white flex items-center">
              <FileText className="mr-2 text-emerald-500 w-5 h-5" />
              Recent Posts
            </h2>
            <div className="flex items-center space-x-2">
              <Link to="/dashboard?tab=posts" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                View All
                <Eye className="ml-1 w-4 h-4" />
              </Link>
              <DropdownMenu onDownload={handleDownloadRecentPosts} />
            </div>
          </div>
          <div className="p-5">
            {data.posts.length > 0 ? (
              <div className="space-y-4">
                {data.posts.map((post) => (
                  <div key={post._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={post.image || '/api/placeholder/40/40'} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium dark:text-white">{post.title}</h4>
                        <p className="text-xs text-gray-500">
                          {data.categories.find(cat => cat._id === post.category)?.name || 'Uncategorized'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <MessageSquare className="w-3.5 h-3.5 mr-1" />
                        {data.comments.filter(comment => comment.postId === post._id).length}
                      </div>
                      <div>{formatDate(post.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <FileText className="mx-auto h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No recent posts</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Comments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold dark:text-white flex items-center">
              <MessageSquare className="mr-2 text-orange-500 w-5 h-5" />
              Recent Comments
            </h2>
            <div className="flex items-center space-x-2">
              <Link to="/dashboard?tab=comments" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                View All
                <Eye className="ml-1 w-4 h-4" />
              </Link>
              <DropdownMenu onDownload={handleDownloadRecentComments} />
            </div>
          </div>
          <div className="p-5">
            {data.comments.length > 0 ? (
              <div className="space-y-4">
                {data.comments.map((comment) => (
                  <div key={comment._id} className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                        <img 
                          src={data.users.find(user => user._id === comment.userId)?.profilePicture || '/api/placeholder/40/40'} 
                          alt="User" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium dark:text-white">
                          {data.users.find(user => user._id === comment.userId)?.username || 'Unknown'}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2">{comment.content}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          On: {data.posts.find(post => post._id === comment.postId)?.title || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No recent comments</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}