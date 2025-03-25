import { Button } from 'flowbite-react';
import { Link } from 'react-router-dom'; // Make sure to import Link from react-router-dom

export default function CallToAction() {
  return (
    <div className='flex flex-col sm:flex-row p-3 border border-blue-500 justify-center items-center rounded-tl-3xl rounded-br-3xl text-center'>
        <div className="flex-1 left flex flex-col">
            <h1 className='text-lg sm:text-2xl font-bold'>
                Citizen's Charter for Passport
            </h1>

            <p className='text-gray-500 my-2 relative'>
                A citizen's charter is a document that outlines an 
                organization's aims, values, and standards of service. 
                It also includes information about how the organization 
                will provide services to the public and what the public can expect from the organization.
            </p>
            
            {/* Replacing the Button with Link */}
            <Link
              to={'/search'} // URL for your route
              className='text-lg text-teal-500 hover:underline text-center'
            >
              View all posts
            </Link>
        </div>
        <div className="p-7 flex-1">
        <img src="src/Passport.png" alt="Passport" />
        </div>
    </div>
  )
}
