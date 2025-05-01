import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineExclamationCircle, HiOutlineUserGroup } from 'react-icons/hi';
import { motion } from 'framer-motion';

export default function DashUsers() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userType, setUserType] = useState('all');
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`/api/user/getusers`);
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
          if (data.users.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (currentUser.isAdmin) {
      fetchUsers();
    }
  }, [currentUser._id]);

  const handleShowMore = async () => {
    const startIndex = users.length;
    try {
      const res = await fetch(`/api/user/getusers?startIndex=${startIndex}`);
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => [...prev, ...data.users]);
        if (data.users.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeleteUser = async () => {
    try {
      const res = await fetch(`/api/user/delete/${userIdToDelete}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.filter((user) => user._id !== userIdToDelete));
        setShowModal(false);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleUpdateRole = async () => {
    try {
      const res = await fetch(`/api/user/updateRole/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isAdmin: !selectedUser.isAdmin
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.map(user => 
          user._id === selectedUser._id ? {...user, isAdmin: !user.isAdmin} : user
        ));
        setShowRoleModal(false);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = userType === 'all' ? true :
                       userType === 'admin' ? user.isAdmin :
                       !user.isAdmin;
    return matchesSearch && matchesType;
  });

  return (
    <div className='w-full max-w-full p-4'>
      <div className="flex justify-between items-center mb-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-3">
          <HiOutlineUserGroup className="w-8 h-8 text-teal-400 dark:text-teal-500"/>
            User Management
        </h2>
      </div>
      
      {currentUser.isAdmin && users.length > 0 ? (
        <>
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
                {filteredUsers.map((user) => (
                  <tr key={user._id} className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
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
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRoleModal(true);
                        }}
                        className='text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 mr-2'
                        aria-label="Change role"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M21.7 13.35l-1 1-2.05-2.05 1-1a.55.55 0 0 1 .77 0l1.28 1.28c.21.21.21.56 0 .77M12 18.94l6.06-6.06 2.05 2.05L14.06 21H12v-2.06M12 14c-4.42 0-8 1.79-8 4v2h6v-1.89l4-4c-.66-.08-1.33-.11-2-.11m0-10C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setShowModal(true);
                          setUserIdToDelete(user._id);
                        }}
                        className='text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20'
                        aria-label="Delete user"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 1024 1024">
                          <path fill="currentColor" d="M160 256H96a32 32 0 0 1 0-64h256V95.936a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V192h256a32 32 0 1 1 0 64h-64v672a32 32 0 0 1-32 32H192a32 32 0 0 1-32-32zm448-64v-64H416v64zM224 896h576V256H224zm192-128a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32m192 0a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {showMore && (
              <div className="flex justify-center mt-8">
                <button 
                  onClick={handleShowMore}
                  className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                  Show more users
                </button>
              </div>
            )}
        </>
      ) : (
        <div className='flex items-center justify-center h-40 bg-white dark:bg-gray-800 rounded-lg shadow-md'>
          <p className='text-gray-500 dark:text-gray-400'>You have no users yet!</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setShowModal(false)}
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
                  <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-5">
                    <HiOutlineExclamationCircle className="h-10 w-10 text-red-600 dark:text-red-500" />
                  </div>
                </div>
                
                <h3 className="text-center text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Delete User
                </h3>
                
                <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleDeleteUser}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Role Change Confirmation Modal */}
      {showRoleModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setShowRoleModal(false)}
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
                  <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-5">
                    <HiOutlineExclamationCircle className="h-10 w-10 text-blue-600 dark:text-blue-500" />
                  </div>
                </div>
                
                <h3 className="text-center text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Change User Role
                </h3>
                
                <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
                  {selectedUser && `Change ${selectedUser.username}'s role to ${selectedUser.isAdmin ? 'Staff' : 'Admin'}?`}
                </p>
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowRoleModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleUpdateRole}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}