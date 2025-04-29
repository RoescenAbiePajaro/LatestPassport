import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { HiOutlineExclamationCircle, HiOutlinePencil, HiOutlineTrash, HiOutlinePhotograph, HiOutlineTag } from 'react-icons/hi';
import { motion } from 'framer-motion';
import {
    HiUser,
    HiArrowSmRight,
    HiDocumentText,
    HiOutlineUserGroup,
    HiAnnotation,
    HiChartPie,
    HiTag,
  } from 'react-icons/hi';

export default function DashPosts() {
    const { currentUser } = useSelector((state) => state.user);
    const [userPosts, setUserPosts] = useState([]);
    const [showMore, setShowMore] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [postIdToDelete, setPostIdToDelete] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(currentUser.isAdmin ? `/api/post/getallposts` : `/api/post/getposts?userId=${currentUser._id}`);
            const data = await res.json();
            if (res.ok) {
                setUserPosts(data.posts || []);
                setShowMore(data.posts && data.posts.length >= 9);
            } else {
                console.error('Failed to fetch posts:', data.message);
            }
        } catch (error) {
            console.error('Error fetching posts:', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [currentUser._id]);

    const handleShowMore = async () => {
        const startIndex = userPosts.length;
        try {
            const res = await fetch(
                currentUser.isAdmin ? `/api/post/getallposts?startIndex=${startIndex}` : `/api/post/getposts?userId=${currentUser._id}&startIndex=${startIndex}`
            );
            const data = await res.json();
            if (res.ok) {
                setUserPosts((prev) => [...prev, ...(data.posts || [])]);
                setShowMore(data.posts && data.posts.length >= 9);
            } else {
                console.error('Failed to fetch more posts:', data.message);
            }
        } catch (error) {
            console.error('Error fetching more posts:', error.message);
        }
    };

    const handleDeletePost = async () => {
        setShowModal(false);
        try {
            const res = await fetch(`/api/post/deletepost/${postIdToDelete}/${currentUser._id}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                setUserPosts((prev) => prev.filter((post) => post._id !== postIdToDelete));
            } else {
                console.error('Failed to delete post:', data.message);
            }
        } catch (error) {
            console.error('Error deleting post:', error.message);
        }
    };

    return (
        
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-3">
                      <HiDocumentText className="w-8 h-8 text-teal-400 dark:text-teal-500"/>
                      Post Management
                    </h2>
                   
            </div>
            {isLoading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                </div>
            ) : (
                <>
                    {userPosts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {userPosts.map((post, index) => (
                                    <motion.div
                                        key={post._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                                    >
                                        <Link to={`/post/${post.slug}`} className="block relative group">
                                            <div className="relative h-48 overflow-hidden">
                                                <img 
                                                    src={post.image} 
                                                    alt={post.title} 
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            </div>
                                        </Link>
                                        
                                        <div className="p-5">
                                            <div className="flex items-center space-x-2 mb-3">
                                                <span className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                                                    <HiOutlineTag className="w-3 h-3 mr-1" />
                                                    {post.category}
                                                </span>
                                            </div>
                                            
                                            <Link to={`/post/${post.slug}`}>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                                                    {post.title}
                                                </h3>
                                            </Link>
                                            
                                            <div className="flex items-center justify-between mt-5">
                                                <button
                                                    onClick={() => { setShowModal(true); setPostIdToDelete(post._id); }}
                                                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center transition-colors duration-300"
                                                >
                                                    <HiOutlineTrash className="w-5 h-5 mr-1" />
                                                    <span className="text-sm font-medium">Delete</span>
                                                </button>
                                                
                                                <Link 
                                                    to={`/dashboard?tab=updatepost&postId=${post._id}`}
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
                                        Show more posts
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl p-10 text-center">
                            <HiOutlinePhotograph className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">No posts yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't created any posts.</p>
                            <Link 
                                to="/dashboard?tab=createpost"
                                className="px-5 py-2 bg-gradient-to-r from-teal-400 to-blue-500 dark:from-teal-500 dark:to-blue-600 text-white font-medium rounded-lg transition duration-300 hover:from-teal-500 hover:to-blue-600"
                            >
                                Create your first post
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
                                    Delete Post
                                </h3>
                                
                                <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
                                    Are you sure you want to delete this post? This action cannot be undone.
                                </p>
                                
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300 focus:outline-none"
                                    >
                                        Cancel
                                    </button>
                                    
                                    <button
                                        onClick={handleDeletePost}
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