import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { Eye, EyeOff } from 'lucide-react';
import OAuth from '../components/OAuth';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!formData.username) errors.username = 'Username is required';
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) errors.password = 'Password is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
    if (validationErrors[e.target.id]) {
      setValidationErrors({ ...validationErrors, [e.target.id]: '' });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

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
      if (res.ok) navigate('/sign-in');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Branding */}
        <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-12 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white/10"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-white/10"></div>

          <div className="relative z-10">
            <Link to="/" className="inline-block mb-8">
              <img src="src/3.png" alt="CivicView Logo" className="h-12" />
            </Link>

            <h2 className="text-3xl font-bold text-white mb-3">Create Account</h2>
            <p className="text-blue-100 mb-8 max-w-sm">
              Start managing your content and stay connected by creating your account.
            </p>

            <div className="flex space-x-4 mt-auto">
              <span className="w-3 h-3 rounded-full bg-white/30"></span>
              <span className="w-3 h-3 rounded-full bg-white/60"></span>
              <span className="w-3 h-3 rounded-full bg-white"></span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Sign up for an account</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Enter your details to get started
            </p>
          </div>

          {errorMessage && (
            <Alert className="mb-6" color="failure">
              {errorMessage}
            </Alert>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="username" value="Username" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block" />
              <TextInput
                id="username"
                type="text"
                placeholder="Username"
                onChange={handleChange}
                className={`mt-1 w-full ${validationErrors.username ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {validationErrors.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.username}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" value="Email" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block" />
              <TextInput
                id="email"
                type="email"
                placeholder="name@company.com"
                onChange={handleChange}
                className={`mt-1 w-full ${validationErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" value="Password" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block" />
              <div className="relative">
                <TextInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  onChange={handleChange}
                  className={`mt-1 w-full ${validationErrors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Spinner size="sm" />
                  <span className="pl-3">Signing up...</span>
                </div>
              ) : (
                'Sign Up'
              )}
            </button>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            <OAuth />
          </form>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/sign-in" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}