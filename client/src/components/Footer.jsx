import { Footer } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { BsFacebook, BsInstagram, BsTwitter, BsGithub, BsLinkedin } from 'react-icons/bs';

export default function FooterCom() {
  return (
    <Footer container className='bg-gray-800 text-white border-t-4 border-teal-500'>
      <div className='w-full max-w-7xl mx-auto px-6 py-8'>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
          {/* Government Info */}
          <div className='space-y-4'>
            <Link
              to='/'
              className='text-xl font-semibold text-teal-500'
            >
              <span className='bg-gradient-to-r py-1 rounded-lg'>Citizen's Charter</span> Passport
            </Link>
            <p className='text-sm'>
              Government of Philippines Official Portal. Connecting citizens with government services.
            </p>
            <p className='text-sm'>
              <strong>Contact Us:</strong> +1-800-123-4567 | info@government.com
            </p>
          </div>

          {/* About */}
          <div>
            <Footer.Title title='About' />
            <Footer.LinkGroup col>
              <Footer.Link href='/about'>About Us</Footer.Link>
              <Footer.Link href='/contact'>Contact</Footer.Link>
              <Footer.Link href='/careers'>Careers</Footer.Link>
            </Footer.LinkGroup>
          </div>

          {/* Legal */}
          <div>
            <Footer.Title title='Legal' />
            <Footer.LinkGroup col>
              <Footer.Link href='/privacy-policy'>Privacy Policy</Footer.Link>
              <Footer.Link href='/terms-conditions'>Terms & Conditions</Footer.Link>
            </Footer.LinkGroup>
          </div>

          {/* Social Media */}
          <div>
            <Footer.Title title='Follow Us' />
            <div className="flex gap-4 justify-center sm:justify-start">
              <Footer.Icon href='#' icon={BsFacebook} />
              <Footer.Icon href='#' icon={BsInstagram} />
              <Footer.Icon href='#' icon={BsTwitter} />
              <Footer.Icon href='https://github.com/sahandghavidel' icon={BsGithub} />
              <Footer.Icon href='#' icon={BsLinkedin} />
            </div>
          </div>
        </div>

        <Footer.Divider />

        <div className='w-full flex flex-col sm:flex-row justify-between items-center mt-6'>
          <Footer.Copyright
            href='#'
            by="Citizen'sCharterforPassport"
            year={new Date().getFullYear()}
          />
          <p className='text-sm text-gray-400'>
            All rights reserved. Philippines Government.
          </p>
        </div>
      </div>
    </Footer>
  );
}
