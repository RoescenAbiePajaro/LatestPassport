// src/pages/Admin/UserApproval.jsx
import { useEffect, useState } from 'react';
import { Alert, Button, Table, Spinner } from 'flowbite-react';
import { HiCheck, HiX } from 'react-icons/hi';

export default function UserApproval() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
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
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/user/approve/${userId}`, {
        method: 'PUT',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setPendingUsers(pendingUsers.filter(user => user._id !== userId));
        setSuccess(`User ${data.user.username} approved successfully`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to approve user');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Pending User Approvals</h1>
      
      {error && (
        <Alert color="failure" className="mb-4">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert color="success" className="mb-4">
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
              <Table.HeadCell>Registered At</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {pendingUsers.map((user) => (
                <Table.Row key={user._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>{user.username}</Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>{new Date(user.createdAt).toLocaleString()}</Table.Cell>
                  <Table.Cell>
                    <Button
                      size="xs"
                      color="success"
                      onClick={() => handleApprove(user._id)}
                      disabled={loading}
                    >
                      <HiCheck className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}
    </div>
  );
}