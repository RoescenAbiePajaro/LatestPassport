export default function Contact() {
  return (
    <div className='min-h-screen dark:bg-gray-900'>
      <div className='max-w-4xl mx-auto px-4 py-16'>
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8'>
          <h1 className='text-4xl font-bold text-gray-800 dark:text-white mb-8'>Contact Us</h1>
          
          <div className='grid md:grid-cols-2 gap-8'>
            <div>
              <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4'>Get in Touch</h2>
              <p className='text-gray-600 dark:text-gray-400 mb-4'>We'd love to hear from you! Whether you have a question about our services, need assistance, or want to provide feedback, our team is here to help.</p>
              
              <div className='mt-6 space-y-4'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-300'>Email</h3>
                  <p className='text-gray-600 dark:text-gray-400'>info@civicview.com</p>
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-300'>Phone</h3>
                  <p className='text-gray-600 dark:text-gray-400'>+1 (555) 123-4567</p>
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-300'>Address</h3>
                  <p className='text-gray-600 dark:text-gray-400'>Olongapo City</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4'>Send us a Message</h2>
              <form className='space-y-4'>
                <div>
                  <label htmlFor="name" className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Name</label>
                  <input
                    type="text"
                    id="name"
                    className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Email</label>
                  <input
                    type="email"
                    id="email"
                    className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Subject</label>
                  <input
                    type="text"
                    id="subject"
                    className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                    placeholder="Subject"
                  />
                </div>
                <div>
                  <label htmlFor="message" className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Message</label>
                  <textarea
                    id="message"
                    rows="4"
                    className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                    placeholder="Your message"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300'
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>

          <div className='mt-12'>
            <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4'>Available Hours</h2>
            <div className='grid md:grid-cols-2 gap-6'>
              <div className='p-4 border dark:border-gray-700 rounded-lg'>
                <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2'>Monday - Friday</h3>
                <p className='text-gray-600 dark:text-gray-400'>9:00 AM - 5:00 PM</p>
              </div>

              <div className='p-4 border dark:border-gray-700 rounded-lg'>
                <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2'>Saturday - Sunday</h3>
                <p className='text-gray-600 dark:text-gray-400'>Closed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 