import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

// Constants
const ITEMS_PER_PAGE = 6;

// User card component for better organization
const UserCard = ({ user, actionInProgress, onApprove, onReject }) => (
  <motion.div
    key={user._id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
  >
    <div className="p-5">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">
          <img 
            className="h-20 w-20 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
            src={user.profilePicture || "/api/placeholder/80/80"}
            alt={user.username}
          />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{user.username}</h3>
        
        <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
          <Mail className="w-4 h-4 mr-2" />
          <span className="text-sm">{user.email}</span>
        </div>
        
        <div className="flex items-center text-gray-400 dark:text-gray-500 text-xs mb-4">
          <Calendar className="w-3 h-3 mr-1" />
          <span>Registered: {new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="flex justify-between gap-3">
        <button
          onClick={() => onReject(user._id)}
          disabled={actionInProgress[user._id]}
          className="flex-1 flex items-center justify-center py-2 bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 font-medium rounded-lg transition-colors"
        >
          {actionInProgress[user._id] === 'reject' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>Processing</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 mr-1" />
              <span>Reject</span>
            </>
          )}
        </button>
        
        <button
          onClick={() => onApprove(user._id)}
          disabled={actionInProgress[user._id]}
          className="flex-1 flex items-center justify-center py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-colors"
        >
          {actionInProgress[user._id] === 'approve' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>Processing</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-1" />
              <span>Approve</span>
            </>
          )}
        </button>
      </div>
    </div>
  </motion.div>
);

// Empty state component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl p-10 text-center">
    <UserPlus className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">No pending users</h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6">When new users register, their requests will appear here for approval.</p>
  </div>
);

export default function PendingUsersApproval() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionInProgress, setActionInProgress] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPendingUsers = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Memoized filtered and paginated users
  const { filteredUsers, totalPages } = useMemo(() => {
    const filtered = pendingUsers.filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const paginatedUsers = filtered.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

    return { filteredUsers: paginatedUsers, totalPages, totalFilteredUsers: filtered.length };
  }, [pendingUsers, searchTerm, currentPage]);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleApprove = useCallback(async (userId) => {
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
      
      setPendingUsers(prev => prev.filter(user => user._id !== userId));
      setSuccessMessage(`User ${data.user.username} has been approved successfully`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setErrorMessage(error.message);
      
      // Clear error message after 5 seconds
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setActionInProgress(prev => ({ ...prev, [userId]: null }));
    }
  }, []);

  const handleReject = useCallback(async (userId) => {
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
      
      setPendingUsers(prev => prev.filter(user => user._id !== userId));
      setSuccessMessage('User has been rejected and removed successfully');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setErrorMessage(error.message);
      
      // Clear error message after 5 seconds
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setActionInProgress(prev => ({ ...prev, [userId]: null }));
    }
  }, []);

  const approveAll = useCallback(async () => {
    setSuccessMessage('');
    setErrorMessage('');
    
    if (!pendingUsers.length) {
      setErrorMessage('No pending users to approve');
      setTimeout(() => setErrorMessage(''), 5000);
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
      
      // Clear messages after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
    } catch (error) {
      setErrorMessage('Error approving users: ' + error.message);
      fetchPendingUsers();
      
      // Clear error message after 5 seconds
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setActionInProgress({});
    }
  }, [pendingUsers, fetchPendingUsers]);

  return (
    <div className="container mx-auto px-4 py-6">
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
<div className="mb-6">
  <div className="flex flex-col sm:flex-row gap-3 w-full items-stretch">
    <div className="relative flex-grow">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="text-gray-400" size={18} />
      </div>
      <input
        type="text"
        placeholder="Search by username or email..."
        value={searchTerm}
        onChange={handleSearch}
        className="w-full pl-10 pr-4 py-2 h-full border-2 border-white bg-white dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
      />
    </div>
    
    <div className="flex gap-2 sm:flex-nowrap flex-wrap">
      <button 
        onClick={fetchPendingUsers}
        className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all h-full"
      >
        <RefreshCw size={18} className="mr-2" />
        Refresh
      </button>
      
      <button 
        onClick={approveAll}
        className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-400 to-blue-500 dark:from-teal-500 dark:to-blue-600 text-white font-medium px-5 py-2 rounded-lg transition-all duration-300 hover:from-teal-500 hover:to-blue-600 hover:shadow-lg h-full"
        disabled={pendingUsers.length === 0 || Object.keys(actionInProgress).length > 0}
      >
        <CheckCircle size={18} className="mr-2" />
        Approve All
      </button>
    </div>
  </div>
</div>

      {/* Notification Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-lg flex items-center"
          >
            <CheckCircle size={20} className="text-green-500 mr-3 flex-shrink-0" />
            <p className="text-green-700 dark:text-green-400">{successMessage}</p>
          </motion.div>
        )}
        
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-lg flex items-center"
          >
            <AlertTriangle size={20} className="text-red-500 mr-3 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-400">{errorMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content area */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <LoadingSpinner size="lg" color="primary" />
        </div>
      ) : (
        <>
          {error ? (
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
          ) : (
            <>
              {pendingUsers.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map((user) => (
                      <UserCard 
                        key={user._id}
                        user={user}
                        actionInProgress={actionInProgress}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() => paginate(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                            currentPage === 1 
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                            currentPage === totalPages 
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}</span> of{' '}
                            <span className="font-medium">{pendingUsers.length}</span> users
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                              onClick={() => paginate(Math.max(1, currentPage - 1))}
                              disabled={currentPage === 1}
                              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                                currentPage === 1 
                                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              <span className="sr-only">Previous</span>
                              <HiOutlineChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                              <button
                                key={number}
                                onClick={() => paginate(number)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === number
                                    ? 'z-10 bg-teal-50 dark:bg-teal-900/30 border-teal-500 text-teal-600 dark:text-teal-400'
                                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                              >
                                {number}
                              </button>
                            ))}
                            <button
                              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                              disabled={currentPage === totalPages}
                              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                                currentPage === totalPages 
                                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              <span className="sr-only">Next</span>
                              <HiOutlineChevronRight className="h-5 w-5" aria-hidden="true" />
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}