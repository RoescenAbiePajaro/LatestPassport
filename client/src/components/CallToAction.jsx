// CallToAction
import { Button } from 'flowbite-react';

export default function CallToAction() {
  return (
    <div className='flex flex-col sm:flex-row p-3 border border-blue-500 justify-center items-center rounded-tl-3xl rounded-br-3xl text-center'>
        <div className="flex-1 justify-center flex flex-col">
            <h1 className='text-lg sm:text-2xl font-bold'>
                Citizen's Charter for Passport
            </h1>

            
            <p className='text-gray-500 my-2'>
            A citizen's charter is a document that outlines an organization's aims, values, and standards of service. It also includes information about how the organization will provide services to the public and what the public can expect from the organization.
                
            </p>
            
            <Button gradientDuoTone='purpleToPink' className='rounded-tl-xl rounded-bl-none'>
                <a href="https://www.100jsprojects.com" target='_blank' rel='noopener noreferrer'>
                    View all posts
                </a>
            </Button>
        </div>
        <div className="p-7 flex-1">
            <img src="https://bairesdev.mo.cloudinary.net/blog/2023/08/What-Is-JavaScript-Used-For.jpg" />
        </div>
    </div>
  )
}