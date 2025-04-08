import { Modal, Button, TextInput, Select } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { FaCheck, FaTimes } from 'react-icons/fa';

export default function DashUsers() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState('');
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
      {currentUser.isAdmin && users.length > 0 ? (
        <>
          <div className='flex flex-col sm:flex-row gap-4 mb-6'>
            <div className='flex-1'>
              <TextInput
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full'
              />
            </div>
            <div className='w-full sm:w-48'>
              <Select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className='w-full'
              >
                <option value="all">All Users</option>
                <option value="admin">Super Admin</option>
                <option value="user">Admins</option>
              </Select>
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
            <button
              onClick={handleShowMore}
              className='mt-6 w-full flex items-center justify-center py-3 px-4 text-sm font-medium text-teal-600 dark:text-teal-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
            >
              Show more users
            </button>
          )}
        </>
      ) : (
        <div className='flex items-center justify-center h-40 bg-white dark:bg-gray-800 rounded-lg shadow-md'>
          <p className='text-gray-500 dark:text-gray-400'>You have no users yet!</p>
        </div>
      )}

      <Modal 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        popup 
        size='xs'
        position="center"
        dismissible={false}
        className="dark:bg-gray-800 max-w-sm mx-auto"
      >
        <div className="relative">
          <Modal.Header className="dark:border-gray-600 px-4 pt-4" />
          <Modal.Body className="px-4 pb-6">
            <div className='text-center'>
              <HiOutlineExclamationCircle className='h-16 w-16 text-red-400 dark:text-red-300 mb-5 mx-auto' />
              <h3 className='mb-6 text-lg font-medium text-gray-700 dark:text-gray-200'>
                Are you sure you want to delete this user?
              </h3>
              <div className='flex justify-center items-center gap-4'>
                <Button 
                  color='failure' 
                  onClick={handleDeleteUser}
                  size="sm"
                  className='bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700 w-28 font-medium'
                >
                  Delete
                </Button>
                <Button 
                  color='gray' 
                  onClick={() => setShowModal(false)}
                  size="sm"
                  className='bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 w-28 font-medium'
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal.Body>
        </div>
      </Modal>
    </div>
  );
}