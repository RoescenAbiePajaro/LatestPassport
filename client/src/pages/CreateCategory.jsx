import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiOutlineTag, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi';
import { motion } from 'framer-motion';

export default function CreateCategory() {
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token'); // assuming JWT is stored here

      const res = await fetch('api/category/createCategory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          userId: currentUser._id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Something went wrong');
        setLoading(false);
        return;
      }

      setLoading(false);
      setSuccessMessage('Category created successfully!');
      setFormData({ name: '', description: '' });

      setTimeout(() => {
        navigate('/dashboard?tab=categories');
      }, 2000);
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3 mb-6">
            <HiOutlineTag className="h-6 w-6 text-teal-500" />
            Create New Category
          </h2>

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-900 rounded-lg flex items-center gap-3"
            >
              <HiOutlineCheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300">{successMessage}</span>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-3"
            >
              <HiOutlineExclamationCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-700 focus:ring-2 focus:ring-teal-500"
                placeholder="Enter category name"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-700 focus:ring-2 focus:ring-teal-500"
                placeholder="Enter category description"
              ></textarea>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard?tab=categories')}
                className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`bg-teal-500 text-white px-5 py-2 rounded-lg ${
                  loading ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating...' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
