import { Modal, Button } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

export default function DashPosts() {
    const { currentUser } = useSelector((state) => state.user);
    const [userPosts, setUserPosts] = useState([]);
    const [showMore, setShowMore] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [postIdToDelete, setPostIdToDelete] = useState('');

    const fetchPosts = async () => {
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
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-3'>
            {userPosts.length > 0 ? (
                userPosts.map((post) => (
                    <div key={post._id} className='bg-white shadow-md rounded-lg p-4'>
                        <Link to={`/post/${post.slug}`}>
                            <img src={post.image} alt={post.title} className='w-full h-32 object-cover rounded-t-lg' />
                        </Link>
                        <h3 className='font-medium text-gray-900 mt-2'>{post.title}</h3>
                        <p className='text-gray-600'>{post.category}</p>
                        <div className='flex justify-between mt-4'>
                            <span onClick={() => { setShowModal(true); setPostIdToDelete(post._id); }} className='text-red-500 cursor-pointer'>Delete</span>
                            <Link className='text-teal-500' to={`/update-post/${post._id}`}>Edit</Link>
                        </div>
                    </div>
                ))
            ) : (
                <p>You have no posts yet!</p>
            )}
            {showMore && (
                <button onClick={handleShowMore} className='w-full text-teal-500 self-center text-sm py-7'>Show more</button>
            )}
            <Modal show={showModal} onClose={() => setShowModal(false)} popup size='md'>
                <Modal.Header />
                <Modal.Body>
                    <div className='text-center'>
                        <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
                        <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>Are you sure you want to delete this post?</h3>
                        <div className='flex justify-center gap-4'>
                            <Button color='failure' onClick={handleDeletePost}>Yes, I'm sure</Button>
                            <Button color='gray' onClick={() => setShowModal(false)}>No, cancel</Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}