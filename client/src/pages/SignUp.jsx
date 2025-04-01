import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!formData.username) {
      errors.username = 'Username is required';
    }
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
    // Clear validation error when user starts typing
    if (validationErrors[e.target.id]) {
      setValidationErrors({ ...validationErrors, [e.target.id]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        return setErrorMessage(data.message);
      }
      if(res.ok) {
        navigate('/sign-in');
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen mt-20'>
      <div className='flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5'>
        <div className='flex-1 flex items-center gap-2'>
          <Link to='/' className='font-bold dark:text-white text-4xl flex items-center'>
            {/* Light mode logo */}
            <img
              src="src/1.png" 
              alt="InformYou Logo"
              className="dark:hidden"
            />
            {/* Dark mode logo */}
            <img
              src="src/2.png" 
              alt="InformYou Logo"
              className="hidden dark:block"
            />
          </Link>
        </div>

        <div className='flex-1'>
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <div>
              <Label value='Admin username' className="text-sm font-medium text-gray-700 dark:text-gray-300" />
              <TextInput
                type='text'
                placeholder='Username'
                id='username'
                onChange={handleChange}
                className={`mt-1 ${validationErrors.username ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {validationErrors.username && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.username}</p>
              )}
            </div>
            <div>
              <Label value='Admin email' className="text-sm font-medium text-gray-700 dark:text-gray-300" />
              <TextInput
                type='email'
                placeholder='name@company.com'
                id='email'
                onChange={handleChange}
                className={`mt-1 ${validationErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
              )}
            </div>
            <div>
              <Label value='Admin password' className="text-sm font-medium text-gray-700 dark:text-gray-300" />
              <TextInput
                type='password'
                placeholder='Password'
                id='password'
                onChange={handleChange}
                className={`mt-1 ${validationErrors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
              )}
            </div>
            <Button
              gradientDuoTone='purpleToPink'
              className='w-full bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 shadow-md hover:shadow-lg'
              type='submit'
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size='sm' />
                  <span className='pl-3'>Loading...</span>
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
            <OAuth />
          </form>

          <div className='flex justify-center text-center gap-2 text-sm mt-6'>
            <span className="text-gray-600 dark:text-gray-400">Already have an account?</span>
            <Link to='/sign-in' className='text-blue-500 hover:text-blue-600 transition-colors duration-200 font-medium'>
              Sign In
            </Link>
          </div>

          {errorMessage && (
            <Alert className='mt-5' color='failure'>
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}