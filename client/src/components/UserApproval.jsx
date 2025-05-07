import { useEffect, useState } from 'react';
import { Alert, Button, Table, Spinner, Badge, Modal } from 'flowbite-react';
import { HiCheck, HiX, HiOutlineExclamation, HiEye } from 'react-icons/hi';
import { toast } from 'react-toastify';

export default function UserApproval() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const res = await fetch('/api/user/pending/users', {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setPendingUsers(data);
      } else {
        setError(data.message || 'Failed to fetch pending users');
        toast.error(data.message || 'Failed to fetch pending users');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleAction = async (userId, action) => {
    try {
      setError(null);
      setActionLoading(true);
      
      const endpoint = action === 'approve' 
        ? `/api/user/approve/${userId}` 
        : `/api/user/reject/${userId}`;
      
      const method = action === 'approve' ? 'PUT' : 'DELETE';
      
      const res = await fetch(endpoint, {
        method,
        credentials: 'include',
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setPendingUsers(pendingUsers.filter(user => user._id !== userId));
        setSuccess(`User ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
        toast.success(`User ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || `Failed to ${action} user`);
        toast.error(data.message || `Failed to ${action} user`);
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setActionLoading(false);
      setShowModal(false);
    }
  };

  const confirmAction = (user, type) => {
    setSelectedUser(user);
    setActionType(type);
    setShowModal(true);
  };

  const viewUserDetails = (user) => {
    setUserDetails(user);
    setShowDetailsModal(true);
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pending User Approvals</h1>
      
      {error && (
        <Alert color="failure" className="mb-4" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert color="success" className="mb-4" onDismiss={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      {pendingUsers.length === 0 ? (
        <Alert color="info">
          No pending user approvals at this time.
        </Alert>
      ) : (
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Username</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Admin Status</Table.HeadCell>
              <Table.HeadCell>Approval Status</Table.HeadCell>
              <Table.HeadCell>Registration Date</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {pendingUsers.map((user) => (
                <Table.Row key={user._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>{user.username || 'N/A'}</Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>
                    <Badge color={user.isAdmin ? 'purple' : 'blue'}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="warning">Pending</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Button
                        size="xs"
                        color="gray"
                        onClick={() => viewUserDetails(user)}
                        disabled={actionLoading}
                      >
                        <HiEye className="mr-1" /> View
                      </Button>
                      <Button
                        size="xs"
                        color="success"
                        onClick={() => confirmAction(user, 'approve')}
                        disabled={actionLoading}
                      >
                        <HiCheck className="mr-1" /> Approve
                      </Button>
                      <Button
                        size="xs"
                        color="failure"
                        onClick={() => confirmAction(user, 'reject')}
                        disabled={actionLoading}
                      >
                        <HiX className="mr-1" /> Reject
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}
      
      {/* Confirmation Modal */}
      <Modal
        show={showModal}
        size="md"
        popup
        onClose={() => setShowModal(false)}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamation className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to {actionType} {selectedUser?.username || 'this user'}?
              {actionType === 'reject' && (
                <p className="mt-2 text-sm text-red-500">
                  This action will permanently delete the user account.
                </p>
              )}
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color={actionType === 'approve' ? 'success' : 'failure'}
                onClick={() => handleAction(selectedUser?._id, actionType)}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Spinner size="sm" />
                ) : (
                  `Yes, ${actionType}`
                )}
              </Button>
              <Button
                color="gray"
                onClick={() => setShowModal(false)}
                disabled={actionLoading}
              >
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* User Details Modal */}
      <Modal
        show={showDetailsModal}
        size="md"
        popup
        onClose={() => setShowDetailsModal(false)}
      >
        <Modal.Header>
          User Details
        </Modal.Header>
        <Modal.Body>
          {userDetails && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium">{userDetails.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{userDetails.email}</p>
              </div>
              {userDetails.profilePicture && (
                <div>
                  <p className="text-sm text-gray-500">Profile Picture</p>
                  <img 
                    src={userDetails.profilePicture} 
                    alt="Profile" 
                    className="h-20 w-20 rounded-full object-cover mt-2"
                  />
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Admin Status</p>
                <Badge color={userDetails.isAdmin ? 'purple' : 'blue'}>
                  {userDetails.isAdmin ? 'Admin' : 'User'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Registered On</p>
                <p className="font-medium">{new Date(userDetails.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
          <div className="flex justify-end mt-6">
            <Button
              color="gray"
              onClick={() => setShowDetailsModal(false)}
            >
              Close
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}