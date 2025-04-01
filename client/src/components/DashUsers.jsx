import { Modal, Button, TextInput, Select } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { Icon } from '@iconify/react';


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
    <div className='w-full max-w-full overflow-x-auto p-3'>
      {currentUser.isAdmin && users.length > 0 ? (
        <>
          <div className='flex flex-col sm:flex-row gap-4 mb-4'>
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
          <div className='min-w-full inline-block align-middle'>
            <table className='shadow-md w-full border-separate border-spacing-0 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden'>
              <thead>
                <tr className='bg-gray-100 dark:bg-gray-700'>
                  <th className='border p-2 text-sm sm:text-base dark:border-gray-600 dark:text-gray-200 text-gray-700'>Date Created</th>
                  <th className='border p-2 text-sm sm:text-base dark:border-gray-600 dark:text-gray-200 text-gray-700'>User Image</th>
                  <th className='border p-2 text-sm sm:text-base dark:border-gray-600 dark:text-gray-200 text-gray-700'>Username</th>
                  <th className='border p-2 text-sm sm:text-base dark:border-gray-600 dark:text-gray-200 text-gray-700'>Email</th>
                  <th className='border p-2 text-sm sm:text-base dark:border-gray-600 dark:text-gray-200 text-gray-700'>Super Admin</th>
                  <th className='border p-2 text-sm sm:text-base dark:border-gray-600 dark:text-gray-200 text-gray-700'>Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className='bg-white dark:bg-gray-800 border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
                    <td className='border p-2 text-sm sm:text-base dark:border-gray-600 dark:text-gray-200 text-gray-700'>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className='border p-2 dark:border-gray-600'>
                      <img
                        src={user.profilePicture}
                        alt={user.username}
                        className='w-8 h-8 sm:w-10 sm:h-10 object-cover bg-gray-200 dark:bg-gray-600 rounded-full'
                      />
                    </td>
                    <td className='border p-2 text-sm sm:text-base dark:border-gray-600 dark:text-gray-200 text-gray-700'>{user.username}</td>
                    <td className='border p-2 text-sm sm:text-base dark:border-gray-600 dark:text-gray-200 text-gray-700'>{user.email}</td>
                    <td className='border p-2 text-center dark:border-gray-600'>
                      {user.isAdmin ? (
                        <FaCheck className='text-green-500 text-sm sm:text-base' />
                      ) : (
                        <FaTimes className='text-red-500 text-sm sm:text-base' />
                      )}
                    </td>
                    <td className='border p-2 text-center dark:border-gray-600'>
                      <button
                        onClick={() => {
                          setShowModal(true);
                          setUserIdToDelete(user._id);
                        }}
                        className='text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1'
                        aria-label="Delete user"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 1024 1024">
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
              className='w-full text-teal-500 dark:text-teal-400 self-center text-sm py-7 hover:underline'
            >
              Show more
            </button>
          )}
        </>
      ) : (
        <p className='dark:text-gray-200 text-center py-4'>You have no users yet!</p>
      )}

      <Modal 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        popup 
        size='xs'
        position="center"
        dismissible={false}
        className="dark:bg-gray-800 max-w-[360px] mx-auto"
      >
        <div className="relative">
          <Modal.Header className="dark:border-gray-600 px-3 pt-3" />
          <Modal.Body className="px-4 pb-4">
            <div className='text-center'>
              <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
              <h3 className='mb-5 text-base font-semibold text-gray-600 dark:text-gray-300'>
                Are you sure you want to delete this user?
              </h3>
              <div className='flex justify-center items-center gap-3'>
                <Button 
                  color='failure' 
                  onClick={handleDeleteUser}
                  size="sm"
                  className='bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700 w-24 font-medium'
                >
                  Delete
                </Button>
                <Button 
                  color='gray' 
                  onClick={() => setShowModal(false)}
                  size="sm"
                  className='dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 w-24 font-medium'
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
