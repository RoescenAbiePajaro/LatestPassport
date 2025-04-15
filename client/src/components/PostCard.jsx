import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
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
        <span className='italic text-xs text-gray-600 dark:text-gray-400'>{post.category}</span>
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
