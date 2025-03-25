import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
  return (
    <div className='group relative w-full border border-blue-500 hover:border-2 h-[320px] rounded-lg sm:w-[380px] transition-all overflow-hidden'>
      <Link to={`/post/${post.slug}`}>
        <img
          src={post.image}
          alt='post cover'
          className='h-[180px] w-full object-cover transition-all duration-300 group-hover:h-[150px]'
        />
      </Link>
      <div className='p-2 flex flex-col gap-1'>
        <p className='text-base font-semibold line-clamp-2'>{post.title}</p>
        <span className='italic text-xs'>{post.category}</span>
        <Link
          to={`/post/${post.slug}`}
          className='absolute bottom-[-150px] left-0 right-0 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300 text-center py-1 rounded-md !rounded-tl-none m-2 group-hover:bottom-0'
        >
          Read article
        </Link>
      </div>
    </div>
  );
}
