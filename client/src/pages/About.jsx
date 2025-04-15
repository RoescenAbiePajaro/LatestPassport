export default function About() {
    return (
      <div className='min-h-screen dark:bg-gray-900'>
        <div className='max-w-4xl mx-auto px-4 py-16'>
          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8'>
            <h1 className='text-4xl font-bold text-gray-800 dark:text-white mb-8'>Welcome to CivicView</h1>
            
            <div className='grid md:grid-cols-2 gap-8'>
              <div>
                <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4'>Our Mission</h2>
                <p className='text-gray-600 dark:text-gray-400 mb-4'>CivicView is a cutting-edge digital platform designed to revolutionize the way public information is accessed and managed. Our mission is to create a more transparent, efficient, and user-friendly environment for citizens and institutions alike.</p>
              </div>

              <div>
                <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4'>Key Features</h2>
                <ul className='list-disc list-inside text-gray-600 dark:text-gray-400'>
                  <li>Real-time information updates</li>
                  <li>User-friendly digital document information</li>
                  <li>Efficient communication channels</li>
                  <li>Comprehensive public information</li>
                </ul>
              </div>
            </div>

            <div className='mt-12'>
              <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4'>What is CivicView Offers?</h2>
              <p className='text-gray-600 dark:text-gray-400 mb-6'>CivicView offers a modern solution to traditional information management systems by providing:</p>
              
              <div className='grid md:grid-cols-2 gap-6'>
                <div className='p-4 border dark:border-gray-700 rounded-lg'>
                  <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2'>Time Efficiency</h3>
                  <p className='text-gray-600 dark:text-gray-400'>Quick access to essential information reduces manual inquiries and improves service delivery.</p>
                </div>

                <div className='p-4 border dark:border-gray-700 rounded-lg'>
                  <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2'>Improved Communication</h3>
                  <p className='text-gray-600 dark:text-gray-400'>Seamless flow of information between citizens and institutions enhances transparency and engagement.</p>
                </div>

                <div className='p-4 border dark:border-gray-700 rounded-lg'>
                  <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2'>Digital Accessibility</h3>
                  <p className='text-gray-600 dark:text-gray-400'>24/7 access to important documents and announcements from anywhere, at any time.</p>
                </div>

                <div className='p-4 border dark:border-gray-700 rounded-lg'>
                  <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2'>User-Friendly Interface</h3>
                  <p className='text-gray-600 dark:text-gray-400'>Intuitive design makes it easy for everyone to find and use the information they need.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }