import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { HiOutlineTag } from 'react-icons/hi';

export default function PostCard({ post }) {
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If post.category is already a string (the name), use it directly
    if (typeof post.category === 'string' && !post.category.match(/^[0-9a-fA-F]{24}$/)) {
      setCategoryName(post.category);
      setLoading(false);
      return;
    }

    // If post.category is an object with a name property, use that
    if (post.category && typeof post.category === 'object' && post.category.name) {
      setCategoryName(post.category.name);
      setLoading(false);
      return;
    }

    // Otherwise, fetch the category details from the API
    const fetchCategoryDetails = async () => {
      try {
        // Check if we have a category ID to fetch
        if (!post.category) {
          setCategoryName('Uncategorized');
          setLoading(false);
          return;
        }

        // Get the category ID - could be an object with _id or a string ID
        const categoryId = typeof post.category === 'object' ? post.category._id : post.category;

        // Fetch category details from the API
        const response = await fetch(`/api/category/${categoryId}`);
        const data = await response.json();
        
        if (response.ok && data) {
          setCategoryName(data.name);
        } else {
          setCategoryName('Uncategorized');
          console.error('Failed to fetch category details:', data);
        }
      } catch (error) {
        console.error('Error fetching category details:', error);
        setCategoryName('Uncategorized');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [post.category]);

  return (
    <div className='group relative w-full bg-white dark:bg-gray-800 rounded-lg sm:w-[380px] transition-all overflow-hidden transform hover:-translate-y-1 hover:shadow-xl shadow-lg dark:shadow-gray-900'>
      <Link to={`/post/${post.slug}`}>
        <img
          src={post.image}
          alt='post cover'
          className='h-[180px] w-full object-cover transition-all duration-300 group-hover:h-[150px]'
        />
      </Link>
      <div className='p-3 flex flex-col gap-2'>
        <p className='text-base font-semibold line-clamp-2 dark:text-white'>{post.title}</p>
        <span className='italic text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1'>
          <HiOutlineTag className="w-3 h-3" />
          {loading ? 'Loading...' : categoryName}
        </span>
        <Link
          to={`/post/${post.slug}`}
          className='absolute opacity-0 bottom-0 left-0 right-0 bg-gradient-to-r from-teal-400 to-blue-500 dark:from-teal-500 dark:to-blue-600 text-white hover:from-teal-500 hover:to-blue-600 transition-all duration-300 text-center py-2 group-hover:opacity-100 group-hover:bottom-0'
        >
          Read article
        </Link>
      </div>
    </div>
  );
}