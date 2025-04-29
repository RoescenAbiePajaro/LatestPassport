import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { HiOutlineExclamationCircle, HiOutlinePencil, HiOutlineTrash, HiOutlineCollection, HiOutlineTag } from 'react-icons/hi';
import { motion } from 'framer-motion';

export default function DashCategories() {
    const { currentUser } = useSelector((state) => state.user);
    const [categories, setCategories] = useState([]);
    const [showMore, setShowMore] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [categoryIdToDelete, setCategoryIdToDelete] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/category/getcategories${currentUser.isAdmin ? '' : `?userId=${currentUser._id}`}`);
            const data = await res.json();
            if (res.ok) {
                setCategories(data.categories || []);
                setShowMore(data.categories && data.categories.length >= 9);
            } else {
                console.error('Failed to fetch categories:', data.message);
            }
        } catch (error) {
            console.error('Error fetching categories:', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [currentUser._id]);

    const handleShowMore = async () => {
        const startIndex = categories.length;
        try {
            const res = await fetch(
                `/api/category/getcategories${currentUser.isAdmin ? '' : `?userId=${currentUser._id}`}&startIndex=${startIndex}`
            );
            const data = await res.json();
            if (res.ok) {
                setCategories((prev) => [...prev, ...(data.categories || [])]);
                setShowMore(data.categories && data.categories.length >= 9);
            } else {
                console.error('Failed to fetch more categories:', data.message);
            }
        } catch (error) {
            console.error('Error fetching more categories:', error.message);
        }
    };

    const handleDeleteCategory = async () => {
        setShowModal(false);
        try {
            const res = await fetch(`/api/category/deletecategory/${categoryIdToDelete}/${currentUser._id}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                setCategories((prev) => prev.filter((category) => category._id !== categoryIdToDelete));
            } else {
                console.error('Failed to delete category:', data.message);
            }
        } catch (error) {
            console.error('Error deleting category:', error.message);
        }
    };

    const getRandomColor = () => {
        const colors = [
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
            'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
            'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    return (
        <div className="container mx-auto px-4 py-6">
            {isLoading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                </div>
            ) : (
                <>
                    {categories.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categories.map((category, index) => (
                                    <motion.div
                                        key={category._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                                    >
                                        <div className="p-5">
                                            <div className="flex items-center space-x-2 mb-4">
                                                <span className={`${getRandomColor()} text-sm font-medium px-3 py-1.5 rounded-full flex items-center`}>
                                                    <HiOutlineTag className="w-4 h-4 mr-1" />
                                                    {category.name}
                                                </span>
                                            </div>
                                            
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                {category.name}
                                            </h3>
                                            
                                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                                {category.description || `Category for organizing ${category.name.toLowerCase()} related content`}
                                            </p>
                                            
                                            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                                {category.postCount ? (
                                                    <span>{category.postCount} posts in this category</span>
                                                ) : (
                                                    <span>No posts in this category yet</span>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                                                <button
                                                    onClick={() => { setShowModal(true); setCategoryIdToDelete(category._id); }}
                                                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center transition-colors duration-300"
                                                >
                                                    <HiOutlineTrash className="w-5 h-5 mr-1" />
                                                    <span className="text-sm font-medium">Delete</span>
                                                </button>
                                                
                                                <Link 
                                                    to={`/dashboard?tab=updatecategory&categoryId=${category._id}`}
                                                    className="text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 flex items-center transition-colors duration-300"
                                                >
                                                    <HiOutlinePencil className="w-5 h-5 mr-1" />
                                                    <span className="text-sm font-medium">Edit</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            
                            {showMore && (
                                <div className="flex justify-center mt-8">
                                    <button 
                                        onClick={handleShowMore}
                                        className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                                    >
                                        Show more categories
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl p-10 text-center">
                            <HiOutlineCollection className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">No categories yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't created any categories.</p>
                            <Link 
                                to="/dashboard?tab=createcategory"
                                className="px-5 py-2 bg-gradient-to-r from-teal-400 to-blue-500 dark:from-teal-500 dark:to-blue-600 text-white font-medium rounded-lg transition duration-300 hover:from-teal-500 hover:to-blue-600"
                            >
                                Create your first category
                            </Link>
                        </div>
                    )}
                </>
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
                                    Delete Category
                                </h3>
                                
                                <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
                                    Are you sure you want to delete this category? This may affect posts that use this category.
                                </p>
                                
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300 focus:outline-none"
                                    >
                                        Cancel
                                    </button>
                                    
                                    <button
                                        onClick={handleDeleteCategory}
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
        </div>
    );
}