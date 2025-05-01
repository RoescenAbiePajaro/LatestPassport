import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiOutlineTag, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';

export default function UpdateCategory({ categoryId }) {
    const { currentUser } = useSelector((state) => state.user);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const res = await fetch(`/api/category/getcategory/${categoryId}`);
                const data = await res.json();
                
                if (res.ok) {
                    setFormData({
                        name: data.name || '',
                        description: data.description || ''
                    });
                } else {
                    setError('Failed to fetch category');
                }
            } catch (error) {
                setError('Something went wrong while fetching the category');
            } finally {
                setFetchLoading(false);
            }
        };

        if (categoryId) {
            fetchCategory();
        } else {
            setFetchLoading(false);
            setError('No category ID provided');
        }
    }, [categoryId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form data
        if (!formData.name.trim()) {
            setError('Category name is required');
            return;
        }
        
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/category/updatecategory/${categoryId}/${currentUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Something went wrong');
                setLoading(false);
                return;
            }

            setLoading(false);
            setSuccessMessage('Category updated successfully!');
            
            // Redirect after a short delay
            setTimeout(() => {
                navigate('/dashboard?tab=categories');
            }, 2000);
        } catch (error) {
            setError('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[300px]">
                <LoadingSpinner size="lg" color="primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3 mb-6">
                        <HiOutlineTag className="h-6 w-6 text-teal-500" />
                        Update Category
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
                            <label 
                                htmlFor="name" 
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                Category Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                placeholder="Enter category name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent transition duration-200"
                            />
                        </div>

                        <div>
                            <label 
                                htmlFor="description" 
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                Description
                            </label>
                            <textarea
                                id="description"
                                placeholder="Enter category description (optional)"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent transition duration-200 resize-none"
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard?tab=categories')}
                                className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300 focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-5 py-2.5 bg-gradient-to-r from-teal-400 to-blue-500 dark:from-teal-500 dark:to-blue-600 text-white font-medium rounded-lg transition duration-300 hover:from-teal-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                                    loading ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <LoadingSpinner size="sm" color="white" />
                                        <span className="ml-2">Updating...</span>
                                    </div>
                                ) : (
                                    'Update Category'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}