import { useState, useEffect } from 'react';
import { Clock, Calendar, MapPin, Info, MessageSquare, Coffee, ShoppingBag, ChevronLeft, ChevronRight, Search } from 'lucide-react';

export default function Kiosk() {
  const [activeSection, setActiveSection] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  
  // Current time display
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/category');
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        setCategories(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Fetch posts for selected category
  useEffect(() => {
    const fetchPosts = async () => {
      if (!selectedCategory) return;
      
      try {
        setLoadingPosts(true);
        const response = await fetch(`/api/post/getposts?category=${selectedCategory._id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        const data = await response.json();
        setPosts(data.posts || []);
        setLoadingPosts(false);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setLoadingPosts(false);
      }
    };
    
    if (selectedCategory) {
      fetchPosts();
    }
  }, [selectedCategory]);
  
  // Sample events data
  const events = [
    { 
      name: "Weekend Sale", 
      date: "May 24-26", 
      description: "Up to 70% off on selected items across all stores.",
      location: "All Stores"
    },
    { 
      name: "Art Exhibition", 
      date: "May 27-30", 
      description: "Local artists showcase their best works.", 
      location: "Event Hall, Floor 3"
    },
    { 
      name: "Kids Workshop", 
      date: "June 1", 
      description: "Arts and crafts session for children ages 5-12.", 
      location: "Play Area, Floor 2"
    }
  ];
  
  // Navigation options
  const navOptions = [
    { id: 'directory', label: 'Directory', icon: <MapPin size={24} /> },
    { id: 'events', label: 'Events', icon: <Calendar size={24} /> },
    { id: 'services', label: 'Services', icon: <Info size={24} /> },
    { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={24} /> }
  ];
  
  // Format the time
  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  
  // Handle category click
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setActiveSection('categoryPosts');
  };
  
  // Home screen content
  const HomeScreen = () => (
    <div className="flex flex-col items-center justify-center text-center px-8 py-6">
      <h1 className="text-4xl font-bold mb-6">Welcome to the Plaza</h1>
      <div className="grid grid-cols-2 gap-6 mb-8 w-full max-w-2xl">
        {navOptions.map((option) => (
          <button
            key={option.id}
            className="bg-white hover:bg-gray-50 text-gray-800 rounded-xl p-6 flex flex-col items-center shadow-md transition-all hover:shadow-lg"
            onClick={() => setActiveSection(option.id)}
          >
            <div className="text-blue-500 mb-3">{option.icon}</div>
            <span className="font-medium">{option.label}</span>
          </button>
        ))}
      </div>
      
      <div className="w-full max-w-2xl mt-4">
        <div className="bg-blue-500 text-white p-4 rounded-xl">
          <h3 className="font-medium mb-2">Featured Event</h3>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xl">{events[0].name}</h4>
              <p className="text-sm opacity-90">{events[0].date} • {events[0].location}</p>
            </div>
            <ChevronRight size={24} />
          </div>
        </div>
      </div>
    </div>
  );
  
  // Directory screen with clickable categories
  const DirectoryScreen = () => {
    const filteredCategories = categories.filter(category => 
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const allLocations = [
      ...filteredCategories.map(category => ({
        ...category,
        category: category.name.toLowerCase(),
        isCategory: true 
      }))
    ];

    return (
      <div className="px-6 py-4">
        <div className="flex items-center mb-6">
          <button onClick={() => setActiveSection('home')} className="mr-3">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold">Directory</h2>
        </div>
        
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search locations..."
            className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="text-gray-500">Loading categories...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg">
            {error} - Using default categories
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {allLocations.map((location, index) => (
              <button
                key={index}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left w-full"
                onClick={() => handleCategoryClick(location)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{location.name}</h3>
                    {location.description && (
                      <p className="text-gray-600 text-sm mt-1">{location.description}</p>
                    )}
                    {location.isCategory && (
                      <p className="text-blue-500 text-xs mt-1">Category • Click to view posts</p>
                    )}
                  </div>
                  {getCategoryIcon(location.category)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Category Posts Screen
  const CategoryPostsScreen = () => {
    if (!selectedCategory) return null;

    return (
      <div className="px-6 py-4">
        <div className="flex items-center mb-6">
          <button onClick={() => {
            setActiveSection('directory');
            setSelectedCategory(null);
          }} className="mr-3">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold">{selectedCategory.name}</h2>
            <p className="text-gray-500 text-sm">Browsing posts in this category</p>
          </div>
        </div>
        
        {loadingPosts ? (
          <div className="flex justify-center items-center h-40">
            <div className="text-gray-500">Loading posts...</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No Posts Found</h3>
            <p className="text-gray-500">There are no posts available in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {posts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {post.image && (
                  <div className="h-48 relative overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                  {post.content && (
                    <p className="text-gray-600 line-clamp-3 mb-4">{post.content.replace(/<[^>]*>?/gm, '')}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={16} className="mr-1" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                    <button className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Helper function to get appropriate icon for category
  const getCategoryIcon = (category) => {
    const lowerCategory = category ? category.toLowerCase() : '';
    
    if (lowerCategory.includes('dining') || lowerCategory.includes('food') || lowerCategory.includes('restaurant')) {
      return <Coffee size={20} className="text-orange-500" />;
    } else if (lowerCategory.includes('shop') || lowerCategory.includes('store') || lowerCategory.includes('boutique')) {
      return <ShoppingBag size={20} className="text-blue-500" />;
    } else if (lowerCategory.includes('service') || lowerCategory.includes('info')) {
      return <Info size={20} className="text-purple-500" />;
    } else {
      return <MapPin size={20} className="text-green-500" />;
    }
  };
  
  // Events content
  const EventsScreen = () => (
    <div className="px-6 py-4">
      <div className="flex items-center mb-6">
        <button onClick={() => setActiveSection('home')} className="mr-3">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold">Upcoming Events</h2>
      </div>
      
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-800 p-2 rounded-lg mr-4 h-12 w-12 flex items-center justify-center">
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{event.name}</h3>
                <p className="text-gray-600 text-sm">{event.date}</p>
                <p className="text-gray-800 mt-2">{event.description}</p>
                <p className="text-blue-600 text-sm mt-1">{event.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Services content
  const ServicesScreen = () => (
    <div className="px-6 py-4">
      <div className="flex items-center mb-6">
        <button onClick={() => setActiveSection('home')} className="mr-3">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold">Services</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex flex-col items-center text-center">
          <div className="bg-green-100 p-3 rounded-full mb-3">
            <MapPin size={24} className="text-green-600" />
          </div>
          <h3 className="font-medium">Wayfinding</h3>
          <p className="text-sm text-gray-600 mt-1">Get directions to your destination</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex flex-col items-center text-center">
          <div className="bg-purple-100 p-3 rounded-full mb-3">
            <Info size={24} className="text-purple-600" />
          </div>
          <h3 className="font-medium">Information</h3>
          <p className="text-sm text-gray-600 mt-1">Get help from our staff</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex flex-col items-center text-center">
          <div className="bg-blue-100 p-3 rounded-full mb-3">
            <ShoppingBag size={24} className="text-blue-600" />
          </div>
          <h3 className="font-medium">Shopping Assistance</h3>
          <p className="text-sm text-gray-600 mt-1">Store recommendations & deals</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex flex-col items-center text-center">
          <div className="bg-orange-100 p-3 rounded-full mb-3">
            <Coffee size={24} className="text-orange-600" />
          </div>
          <h3 className="font-medium">Dining Options</h3>
          <p className="text-sm text-gray-600 mt-1">Find restaurants & cafes</p>
        </div>
      </div>
    </div>
  );
  
  // Feedback content
  const FeedbackScreen = () => (
    <div className="px-6 py-4">
      <div className="flex items-center mb-6">
        <button onClick={() => setActiveSection('home')} className="mr-3">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold">Share Feedback</h2>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <p className="mb-4 text-gray-700">We value your opinion! Please rate your experience today:</p>
        
        <div className="flex justify-between items-center mb-6">
          <button className="flex flex-col items-center">
            <div className="bg-red-100 p-3 rounded-full mb-2">
              <span className="text-2xl">😔</span>
            </div>
            <span className="text-sm text-gray-600">Poor</span>
          </button>
          
          <button className="flex flex-col items-center">
            <div className="bg-orange-100 p-3 rounded-full mb-2">
              <span className="text-2xl">😐</span>
            </div>
            <span className="text-sm text-gray-600">Average</span>
          </button>
          
          <button className="flex flex-col items-center">
            <div className="bg-green-100 p-3 rounded-full mb-2">
              <span className="text-2xl">😊</span>
            </div>
            <span className="text-sm text-gray-600">Good</span>
          </button>
          
          <button className="flex flex-col items-center">
            <div className="bg-blue-100 p-3 rounded-full mb-2">
              <span className="text-2xl">😃</span>
            </div>
            <span className="text-sm text-gray-600">Excellent</span>
          </button>
        </div>
        
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
          placeholder="Additional comments (optional)"
        ></textarea>
        
        <button className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors">
          Submit Feedback
        </button>
      </div>
    </div>
  );
  
  return (
    <div className="bg-gray-100 w-full h-screen overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="bg-white flex justify-between items-center px-6 py-4 shadow-sm">
        <div className="flex items-center">
          <Clock size={20} className="text-gray-500 mr-2" />
          <span className="text-gray-700 font-medium">{formattedTime}</span>
          <span className="mx-2 text-gray-400">|</span>
          <span className="text-gray-500 text-sm">{formattedDate}</span>
        </div>
        
        {activeSection !== 'home' && (
          <button 
            className="text-blue-500 hover:text-blue-600"
            onClick={() => {
              setActiveSection('home');
              setSelectedCategory(null);
            }}
          >
            Home
          </button>
        )}
      </div>
      
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        {activeSection === 'home' && <HomeScreen />}
        {activeSection === 'directory' && <DirectoryScreen />}
        {activeSection === 'categoryPosts' && <CategoryPostsScreen />}
        {activeSection === 'events' && <EventsScreen />}
        {activeSection === 'services' && <ServicesScreen />}
        {activeSection === 'feedback' && <FeedbackScreen />}
      </div>
      
      {/* Footer */}
      <div className="bg-white px-6 py-3 shadow-inner text-center text-gray-400 text-sm">
        Touch screen to continue • Tap "Home" to return to main menu
      </div>
    </div>
  );
}