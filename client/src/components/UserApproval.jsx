import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  UserPlus, 
  Clock,
  Calendar,
  Mail
} from 'lucide-react';

export default function PendingUsersApproval() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionInProgress, setActionInProgress] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchPendingUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/pending/users', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch pending users');
      }
      
      setPendingUsers(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = pendingUsers.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = async (userId) => {
    setActionInProgress(prev => ({ ...prev, [userId]: 'approve' }));
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      const res = await fetch(`/api/user/approve/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to approve user');
      }
      
      setPendingUsers(pendingUsers.filter(user => user._id !== userId));
      setSuccessMessage(`User ${data.user.username} has been approved successfully`);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setActionInProgress(prev => ({ ...prev, [userId]: null }));
    }
  };

  const handleReject = async (userId) => {
    setActionInProgress(prev => ({ ...prev, [userId]: 'reject' }));
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      const res = await fetch(`/api/user/reject/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to reject user');
      }
      
      setPendingUsers(pendingUsers.filter(user => user._id !== userId));
      setSuccessMessage('User has been rejected and removed successfully');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setActionInProgress(prev => ({ ...prev, [userId]: null }));
    }
  };

  const approveAll = async () => {
    setSuccessMessage('');
    setErrorMessage('');
    
    if (!pendingUsers.length) {
      setErrorMessage('No pending users to approve');
      return;
    }
    
    const approvePromises = pendingUsers.map(user => {
      setActionInProgress(prev => ({ ...prev, [user._id]: 'approve' }));
      return fetch(`/api/user/approve/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    });
    
    try {
      const results = await Promise.allSettled(approvePromises);
      const allSuccessful = results.every(result => result.status === 'fulfilled' && result.value.ok);
      
      if (allSuccessful) {
        setPendingUsers([]);
        setSuccessMessage('All pending users have been approved successfully');
      } else {
        fetchPendingUsers();
        setErrorMessage('Some users could not be approved. Please try again.');
      }
    } catch (error) {
      setErrorMessage('Error approving users: ' + error.message);
      fetchPendingUsers();
    } finally {
      setActionInProgress({});
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-teal-400 dark:text-teal-500"/>
                User Approvals
          </h2>
          <div className="mt-3 md:mt-0 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-2" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
        
        {/* Search and Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={18} />
              </div>
              <input
                type="text"
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={fetchPendingUsers}
                className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all"
              >
                <RefreshCw size={18} className="mr-2" />
                Refresh
              </button>
              
              <button 
                onClick={approveAll}
                className="flex items-center gap-2 bg-gradient-to-r from-teal-400 to-blue-500 dark:from-teal-500 dark:to-blue-600 text-white font-medium px-5 py-2 rounded-lg transition-all duration-300 hover:from-teal-500 hover:to-blue-600 hover:shadow-lg"
                disabled={pendingUsers.length === 0 || Object.keys(actionInProgress).length > 0}
              >
                <CheckCircle size={18} className="mr-2" />
                Approve All
              </button>
            </div>
          </div>
        </div>

        {/* Notification Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-lg flex items-center animate-fadeIn">
            <CheckCircle size={20} className="text-green-500 mr-3 flex-shrink-0" />
            <p className="text-green-700 dark:text-green-400">{successMessage}</p>
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-lg flex items-center animate-fadeIn">
            <AlertTriangle size={20} className="text-red-500 mr-3 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-400">{errorMessage}</p>
          </div>
        )}

        {/* Content area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center p-10">
              <Loader2 size={30} className="text-indigo-500 animate-spin mr-3" />
              <span className="text-gray-600 dark:text-gray-400">Loading pending users...</span>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-xl">
              <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400 font-medium text-lg mb-2">{error}</p>
              <p className="text-gray-500 dark:text-gray-400 mb-4">There was a problem fetching the pending users.</p>
              <button
                onClick={fetchPendingUsers}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all"
              >
                Try Again
              </button>
            </div>
          )}

          {/* No pending users */}
          {!loading && !error && pendingUsers.length === 0 && (
            <div className="p-10 text-center">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">No pending user registrations</p>
              <p className="text-gray-400 dark:text-gray-500 mt-2 max-w-md mx-auto">When new users register, their requests will appear here for your approval</p>
            </div>
          )}

          {/* Users cards */}
          {!loading && !error && pendingUsers.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <div key={user._id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow transition-shadow overflow-hidden">
                  <div className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-3">
                        <img 
                          className="h-20 w-20 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                          src={user.profilePicture || "/api/placeholder/80/80"}
                          alt={user.username}
                        />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1">{user.username}</h3>
                      
                      <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 mb-1">
                        <Mail size={14} className="mr-1 flex-shrink-0" />
                        <span className="text-sm truncate">{user.email}</span>
                      </div>
                      
                      <div className="flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                        <Calendar size={12} className="mr-1 flex-shrink-0" />
                        <span>Registered: {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-px bg-gray-100 dark:bg-gray-700 mt-2">
                    <button
                      onClick={() => handleApprove(user._id)}
                      disabled={actionInProgress[user._id]}
                      className="py-2 bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-500 font-medium transition-colors flex items-center justify-center"
                    >
                      {actionInProgress[user._id] === 'approve' ? (
                        <>
                          <Loader2 size={16} className="animate-spin mr-2" />
                          <span>Processing</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} className="mr-2" />
                          <span>Approve</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(user._id)}
                      disabled={actionInProgress[user._id]}
                      className="py-2 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-500 font-medium transition-colors flex items-center justify-center"
                    >
                      {actionInProgress[user._id] === 'reject' ? (
                        <>
                          <Loader2 size={16} className="animate-spin mr-2" />
                          <span>Processing</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} className="mr-2" />
                          <span>Reject</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}