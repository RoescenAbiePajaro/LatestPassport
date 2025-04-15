import { Link } from 'react-router-dom';
import { 
  FaFacebook, 
  FaInstagram, 
  FaXTwitter, 
  FaGithub, 
  FaLinkedin 
} from 'react-icons/fa6';

export default function FooterComponent() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Logo & Info Section */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <div className="flex items-center">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
                  CivicView
                </span>
              </div>
            </Link>
            
            <p className="text-gray-300 text-sm leading-relaxed">
              CivicView - Your Digital Gateway to Government Services.
              Real-time information access and efficient guidelines.
            </p>
            
            <div className="pt-2">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <span className="text-gray-300">+1-800-123-4567</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <span className="text-gray-300">info@civicview.com</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span className="text-gray-300">123 Civic Street, Suite 456</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span className="text-gray-300">New York, NY 10001, USA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* About Section */}
          <div className="mt-8 md:mt-0">
            <h3 className="text-lg font-semibold mb-6 text-white relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-1 after:w-12 after:bg-gradient-to-r after:from-teal-400 after:to-blue-500">
              About
            </h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-gray-300 hover:text-teal-400 transition duration-300">About CivicView</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-teal-400 transition duration-300">Contact Us</Link></li>
              <li><Link to="/news" className="text-gray-300 hover:text-teal-400 transition duration-300">News & Updates</Link></li>
            </ul>
          </div>
          
          {/* Legal Section */}
          <div className="mt-8 md:mt-0">
            <h3 className="text-lg font-semibold mb-6 text-white relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-1 after:w-12 after:bg-gradient-to-r after:from-teal-400 after:to-blue-500">
              Legal
            </h3>
            <ul className="space-y-4">
              <li><Link to="/privacy-policy" className="text-gray-300 hover:text-teal-400 transition duration-300">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions" className="text-gray-300 hover:text-teal-400 transition duration-300">Terms & Conditions</Link></li>
              <li><Link to="/data-protection" className="text-gray-300 hover:text-teal-400 transition duration-300">Data Protection</Link></li>
              <li><Link to="/accessibility" className="text-gray-300 hover:text-teal-400 transition duration-300">Accessibility</Link></li>
            </ul>
          </div>
          
          {/* Newsletter Section */}
          <div className="mt-8 md:mt-0">
            <h3 className="text-lg font-semibold mb-6 text-white relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-1 after:w-12 after:bg-gradient-to-r after:from-teal-400 after:to-blue-500">
              Stay Connected
            </h3>
            <p className="text-gray-300 mb-4 text-sm">Subscribe to our newsletter for updates</p>
            <form className="flex flex-col space-y-4">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-300 text-sm"
              />
              <button 
                type="submit" 
                className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition duration-300"
              >
                Subscribe
              </button>
            </form>
            
            
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-gray-700 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} <span className="font-medium text-gray-300">CivicView</span>. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}