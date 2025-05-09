//DashUsers.jsx

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineExclamationCircle, HiOutlineUserGroup } from 'react-icons/hi';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import { Clock } from 'lucide-react';
import { 
  HiOutlineChevronLeft,
  HiOutlineChevronRight
} from 'react-icons/hi';

// Constants
const ITEMS_PER_PAGE = 5;

// Separate component for the user table row to optimize rendering
const UserRow = ({ user, onRoleChange, onDeleteClick }) => {
  return (
    <tr className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300'>
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='flex items-center'>
          <div className='flex-shrink-0 h-10 w-10'>
            <img
              className='h-10 w-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600'
              src={user.profilePicture}
              alt={user.username}
            />
          </div>
          <div className='ml-4'>
            <div className='text-sm font-medium text-gray-900 dark:text-gray-100'>{user.username}</div>
          </div>
        </div>
      </td>
      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300'>
        {user.email}
      </td>
      <td className='px-6 py-4 whitespace-nowrap text-center'>
        {user.isAdmin ? (
          <span className='px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'>
            Admin
          </span>
        ) : (
          <span className='px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'>
            Staff
          </span>
        )}
      </td>
      <td className='px-6 py-4 whitespace-nowrap text-center text-sm'>
        <button
          onClick={() => onRoleChange(user)}
          className='text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 mr-2'
          aria-label="Change role"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M21.7 13.35l-1 1-2.05-2.05 1-1a.55.55 0 0 1 .77 0l1.28 1.28c.21.21.21.56 0 .77M12 18.94l6.06-6.06 2.05 2.05L14.06 21H12v-2.06M12 14c-4.42 0-8 1.79-8 4v2h6v-1.89l4-4c-.66-.08-1.33-.11-2-.11m0-10C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>
          </svg>
        </button>
        <button
          onClick={() => onDeleteClick(user._id)}
          className='text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20'
          aria-label="Delete user"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 1024 1024">
            <path fill="currentColor" d="M160 256H96a32 32 0 0 1 0-64h256V95.936a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V192h256a32 32 0 1 1 0 64h-64v672a32 32 0 0 1-32 32H192a32 32 0 0 1-32-32zm448-64v-64H416v64zM224 896h576V256H224zm192-128a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32m192 0a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32"/>
          </svg>
        </button>
      </td>
    </tr>
  );
};

// Modal component for better organization
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, isLoading, type = "delete" }) => {
  if (!isOpen) return null;
  
  const bgColor = type === "delete" ? "bg-red-100 dark:bg-red-900/30" : "bg-blue-100 dark:bg-blue-900/30";
  const iconColor = type === "delete" ? "text-red-600 dark:text-red-500" : "text-blue-600 dark:text-blue-500";
  const buttonColor = type === "delete" 
    ? "bg-red-600 text-white font-medium rounded-lg hover:bg-red-700" 
    : "bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700";
  const ringColor = type === "delete" ? "focus:ring-red-500" : "focus:ring-blue-500";
  
  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-auto overflow-hidden"
        >
          <div className="p-6">
            <div className="flex justify-center">
              <div className={`h-20 w-20 rounded-full ${bgColor} flex items-center justify-center mb-5`}>
                <HiOutlineExclamationCircle className={`h-10 w-10 ${iconColor}`} />
              </div>
            </div>
            
            <h3 className="text-center text-lg font-medium text-gray-900 dark:text-white mb-4">
              {title}
            </h3>
            
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
              {message}
            </p>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
              >
                Cancel
              </button>
              
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-2.5 ${buttonColor} transition duration-300 focus:outline-none focus:ring-2 ${ringColor} focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" color="white" />
                    <span className="ml-2">{type === "delete" ? "Deleting..." : "Updating..."}</span>
                  </div>
                ) : confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

// Search and filter component
const SearchFilters = ({ searchTerm, setSearchTerm, userType, setUserType }) => {
  return (
    <div className='flex flex-col sm:flex-row gap-4 mb-6'>
      <div className='flex-1'>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 focus:ring-2 focus:ring-teal-500'
        />
      </div>
      <div className='w-full sm:w-48'>
        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          className='w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 focus:ring-2 focus:ring-teal-500'
        >
          <option value="all">All Users</option>
          <option value="admin">Admin</option>
          <option value="user">Staff</option>
        </select>
      </div>
    </div>
  );
};

export default function DashUsers() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: '' });
  const [roleModal, setRoleModal] = useState({ isOpen: false, user: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [userType, setUserType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Memoized pagination calculations
  const { currentItems, totalPages } = useMemo(() => {
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    
    // Filter users based on search and type
    const filtered = users.filter(user => {
      const matchesSearch = 
        !searchTerm || 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesType = 
        userType === 'all' ? true :
        userType === 'admin' ? user.isAdmin :
        !user.isAdmin;
        
      return matchesSearch && matchesType;
    });
    
    const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    
    return { currentItems, totalPages, filteredUsers: filtered };
  }, [users, currentPage, searchTerm, userType]);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    if (!currentUser?.isAdmin) return;
    
    setPageLoading(true);
    
    try {
      const res = await fetch(`/api/user/getusers`);
      const data = await res.json();
      
      if (res.ok) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error.message);
    } finally {
      setPageLoading(false);
    }
  }, [currentUser?.isAdmin]);
  
  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!deleteModal.userId) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/user/delete/${deleteModal.userId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setUsers(prev => prev.filter(user => user._id !== deleteModal.userId));
        setDeleteModal({ isOpen: false, userId: '' });
      } else {
        const data = await res.json();
        console.error("Delete user failed:", data.message);
      }
    } catch (error) {
      console.error("Delete user error:", error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle role update
  const handleUpdateRole = async () => {
    if (!roleModal.user) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/user/updateRole/${roleModal.user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !roleModal.user.isAdmin }),
      });
      
      if (res.ok) {
        setUsers(prev => prev.map(user => 
          user._id === roleModal.user._id 
            ? {...user, isAdmin: !user.isAdmin} 
            : user
        ));
        setRoleModal({ isOpen: false, user: null });
      } else {
        const data = await res.json();
        console.error("Update role failed:", data.message);
      }
    } catch (error) {
      console.error("Update role error:", error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handlers for user actions
  const handleRoleClick = useCallback((user) => {
    setRoleModal({ isOpen: true, user });
  }, []);
  
  const handleDeleteClick = useCallback((userId) => {
    setDeleteModal({ isOpen: true, userId });
  }, []);

  // Pagination handler
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className='w-full max-w-full p-4'>
      <div className="flex justify-between items-center mb-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-3">
          <HiOutlineUserGroup className="w-8 h-8 text-teal-400 dark:text-teal-500"/>
          User Management
        </h2>
        <div className="mt-4 md:mt-0 flex items-center text-white text-sm bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
          <Clock className="h-4 w-4 mr-2" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
      
      {pageLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <LoadingSpinner size="lg" color="primary" />
        </div>
      ) : currentUser?.isAdmin && users.length > 0 ? (
        <>
          <SearchFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            userType={userType}
            setUserType={setUserType}
          />
          
          <div className='overflow-x-auto rounded-lg shadow-md'>
            <table className='w-full bg-white dark:bg-gray-800 border-collapse'>
              <thead>
                <tr className='bg-gray-50 dark:bg-gray-700 text-left'>
                  <th className='px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Date Created</th>
                  <th className='px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>User</th>
                  <th className='px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Email</th>
                  <th className='px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider text-center'>Role</th>
                  <th className='px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider text-center'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
                {currentItems.length > 0 ? (
                  currentItems.map((user) => (
                    <UserRow
                      key={user._id}
                      user={user}
                      onRoleChange={handleRoleClick}
                      onDeleteClick={handleDeleteClick}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No users match your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
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
                    <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, currentItems.length)}</span> of{' '}
                    <span className="font-medium">{currentItems.length}</span> users
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
      ) : (
        <div className='flex items-center justify-center h-40 bg-white dark:bg-gray-800 rounded-lg shadow-md'>
          <p className='text-gray-500 dark:text-gray-400'>
            {!currentUser?.isAdmin 
              ? "You don't have permission to view users." 
              : "You have no users yet!"}
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, userId: '' })}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        isLoading={isLoading}
        type="delete"
      />

      {/* Role Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={roleModal.isOpen}
        onClose={() => setRoleModal({ isOpen: false, user: null })}
        onConfirm={handleUpdateRole}
        title="Change User Role"
        message={roleModal.user ? `Change ${roleModal.user.username}'s role to ${roleModal.user.isAdmin ? 'Staff' : 'Admin'}?` : ""}
        confirmText="Confirm"
        isLoading={isLoading}
        type="role"
      />
    </div>
  );
}