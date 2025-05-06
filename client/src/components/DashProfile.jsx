import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HiOutlineExclamationCircle, HiOutlinePhotograph, HiPencil } from 'react-icons/hi';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import supabase, { CDNURL } from '../supabase';
import LoadingSpinner from './LoadingSpinner';

import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signoutSuccess,
} from '../redux/user/userSlice';

// Memo-ized components for better performance
const ProfileImage = memo(({ 
  imageUrl, 
  username, 
  uploadProgress, 
  onSelectImage, 
  inputRef 
}) => (
  <div className="relative group">
    <input
      type="file"
      accept="image/jpeg,image/png,image/webp"
      onChange={onSelectImage}
      ref={inputRef}
      hidden
    />
    
    <div 
      className="relative w-40 h-40 rounded-full cursor-pointer overflow-hidden ring-4 ring-indigo-50 dark:ring-gray-700 group-hover:ring-indigo-200 dark:group-hover:ring-gray-600 transition-all duration-300"
      onClick={() => inputRef.current.click()}
    >
      {uploadProgress && (
        <CircularProgressbar
          value={uploadProgress || 0}
          text={`${uploadProgress}%`}
          strokeWidth={5}
          styles={{
            root: {
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 10,
            },
            path: {
              stroke: `rgba(99, 102, 241, ${uploadProgress / 100})`,
            },
            text: {
              fill: '#fff',
              fontSize: '22px',
              fontWeight: 'bold',
            },
          }}
        />
      )}
      
      <img
        src={imageUrl}
        alt={username}
        className={`w-full h-full object-cover ${
          uploadProgress && uploadProgress < 100 ? 'opacity-60' : ''
        }`}
      />

      {/* Overlay with camera icon */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-300">
        <HiOutlinePhotograph className="text-white opacity-0 group-hover:opacity-100 w-12 h-12 transition-opacity duration-300" />
      </div>
    </div>
    
    <div className="absolute -bottom-1 -right-1 bg-indigo-600 hover:bg-indigo-700 rounded-full p-2 shadow-lg cursor-pointer transition-colors"
         onClick={() => inputRef.current.click()}>
      <HiPencil className="w-5 h-5 text-white" />
    </div>
  </div>
));

const FormField = memo(({ 
  id, 
  label, 
  type = 'text', 
  placeholder, 
  defaultValue, 
  error, 
  onChange 
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      placeholder={placeholder}
      defaultValue={defaultValue}
      onChange={onChange}
      className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:outline-none ${
        error 
          ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-900' 
          : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-200 dark:focus:ring-indigo-800'
      } transition-colors`}
    />
    {error && (
      <p className="mt-1 text-sm text-red-500">{error}</p>
    )}
  </div>
));

const DeleteModal = memo(({ onDelete, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/60">
    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6 transform transition-all">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-5">
          <HiOutlineExclamationCircle className="h-10 w-10 text-red-600 dark:text-red-500" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Delete Account
        </h3>
        
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Are you sure you want to delete your account? This action cannot be undone.
        </p>
        
        <div className="flex justify-center gap-3">
          <button
            onClick={onDelete}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" color="white" />
                <span className="ml-2">Deleting...</span>
              </div>
            ) : 'Delete'}
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
));

const StatusMessage = memo(({ type, message }) => {
  if (!message) return null;
  
  const styles = {
    error: "bg-red-50 border-l-4 border-red-500 p-4 dark:bg-red-900/20 dark:border-red-700",
    success: "bg-green-50 border-l-4 border-green-500 p-4 dark:bg-green-900/20 dark:border-green-700"
  };
  
  const textStyles = {
    error: "text-sm text-red-700 dark:text-red-400",
    success: "text-sm text-green-700 dark:text-green-400"
  };
  
  return (
    <div className={styles[type]}>
      <p className={textStyles[type]}>{message}</p>
    </div>
  );
});

export default function DashProfile() {
  const { currentUser, error, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  
  // File upload state
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  
  // UI state
  const [showModal, setShowModal] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  // Refs
  const filePickerRef = useRef();
  
  // Clear status messages after a timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (updateUserSuccess) setUpdateUserSuccess(null);
      if (updateUserError) setUpdateUserError(null);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [updateUserSuccess, updateUserError]);
  
  // Simulate initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 500); // Reduced from 1000ms to 500ms for faster loading

    return () => clearTimeout(timer);
  }, []);
  
  // Initialize image URL from current user
  useEffect(() => {
    if (currentUser?.profilePicture) {
      setImageFileUrl(currentUser.profilePicture);
    }
  }, [currentUser]);
  
  // Form validation
  const validateForm = useCallback(() => {
    const errors = {};
    if (formData.username && formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);
  
  // Handle image upload
  const uploadImage = useCallback(async () => {
    if (!imageFile) return;
    
    setImageFileUploading(true);
    setImageFileUploadError(null);
    
    try {
      const fileName = `profile-${currentUser._id}-${Date.now()}`;
      const filePath = `profile-pictures/${fileName}`;
      
      // Simulate progress in smaller chunks for smoother UX
      const updateProgress = (progress) => {
        setImageFileUploadProgress(progress);
      };
      
      updateProgress(10);
      await new Promise(resolve => setTimeout(resolve, 100));
      updateProgress(30);
      
      // Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from('passportinteractiveboard')
        .upload(filePath, imageFile);
      
      if (uploadError) throw uploadError;
      
      updateProgress(60);
      await new Promise(resolve => setTimeout(resolve, 100));
      updateProgress(80);
      
      // Get public URL
      const publicUrl = `${CDNURL}${filePath}`;
      
      setImageFileUrl(publicUrl);
      setFormData(prev => ({ ...prev, profilePicture: publicUrl }));
      
      updateProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setImageFileUploadProgress(null);
      setImageFileUploading(false);
    } catch (error) {
      console.error('Upload error:', error);
      setImageFileUploadError('Could not upload image');
      setImageFileUploadProgress(null);
      setImageFileUploading(false);
    }
  }, [imageFile, currentUser]);
  
  // Trigger upload when image file changes
  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile, uploadImage]);
  
  // Handle image selection
  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file size
    if (file.size > 2 * 1024 * 1024) {
      setImageFileUploadError('File size must be less than 2MB');
      return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageFileUploadError('Only JPEG, PNG, and WebP images are allowed');
      return;
    }
    
    setImageFile(file);
    setImageFileUrl(URL.createObjectURL(file));
    setImageFileUploadError(null);
  }, []);
  
  // Handle form input changes
  const handleChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    if (validationErrors[id]) {
      setValidationErrors(prev => ({ ...prev, [id]: null }));
    }
  }, [validationErrors]);
  
  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);
    
    if (Object.keys(formData).length === 0) {
      setUpdateUserError('No changes made');
      return;
    }

    if (imageFileUploading) {
      setUpdateUserError('Please wait for image to upload');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      dispatch(updateStart());
      
      // Prepare the update data
      const updateData = { ...formData };
      // Don't send empty password
      if (updateData.password === '') {
        delete updateData.password;
      }
      
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
      } else {
        dispatch(updateSuccess(data));
        setUpdateUserSuccess("Profile updated successfully");
        setFormData({});
      }
    } catch (error) {
      dispatch(updateFailure(error.message));
      setUpdateUserError(error.message);
    }
  }, [formData, imageFileUploading, validateForm, dispatch, currentUser]);
  
  // Handle account deletion
  const handleDeleteUser = useCallback(async () => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
      } else {
        dispatch(deleteUserSuccess(data));
      }
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  }, [dispatch, currentUser]);
  
  // Handle sign out
  const handleSignout = useCallback(async () => {
    try {
      const res = await fetch('/api/user/signout', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(signoutSuccess());
      }
    } catch (error) {
      console.error('Signout error:', error.message);
    }
  }, [dispatch]);
  
  // Show loading spinner while page is loading
  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 w-full">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">Your Profile</h1>
        
        <div className="flex flex-col md:flex-row gap-8 mb-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center space-y-4">
            <ProfileImage
              imageUrl={imageFileUrl || currentUser.profilePicture}
              username={currentUser.username}
              uploadProgress={imageFileUploadProgress}
              onSelectImage={handleImageChange}
              inputRef={filePickerRef}
            />
            
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{currentUser.username}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{currentUser.email}</p>
            </div>
            
            {imageFileUploadError && (
              <div className="text-sm text-red-500 text-center max-w-xs">{imageFileUploadError}</div>
            )}
          </div>

          {/* Form Section */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-5">
              <FormField
                id="username"
                label="Username"
                placeholder="Username"
                defaultValue={currentUser.username}
                error={validationErrors.username}
                onChange={handleChange}
              />
              
              <FormField
                id="email"
                label="Email"
                type="email"
                placeholder="Email"
                defaultValue={currentUser.email}
                error={validationErrors.email}
                onChange={handleChange}
              />
              
              <FormField
                id="password"
                label="New Password (optional)"
                type="password"
                placeholder="••••••••"
                error={validationErrors.password}
                onChange={handleChange}
              />

              <button
                type="submit"
                disabled={loading || imageFileUploading}
                className={`w-full py-2 px-4 rounded-lg text-white font-medium shadow transition-all ${
                  loading || imageFileUploading
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" color="white" />
                    <span className="ml-2">Updating...</span>
                  </div>
                ) : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>
        
        {/* Status Messages */}
        <div className="mt-6 space-y-3">
          {updateUserError && <StatusMessage type="error" message={updateUserError} />}
          {updateUserSuccess && <StatusMessage type="success" message={updateUserSuccess} />}
          {error && <StatusMessage type="error" message={error} />}
        </div>
        
        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between">
          <button
            onClick={() => setShowModal(true)}
            className="py-2.5 px-4 text-sm font-medium bg-white dark:bg-transparent text-red-600 dark:text-red-500 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex-1"
          >
            Delete Account
          </button>
          
        </div>
      </div>

      {/* Delete Account Modal */}
      {showModal && (
        <DeleteModal
          onDelete={handleDeleteUser}
          onCancel={() => setShowModal(false)}
          loading={loading}
        />
      )}
    </div>
  );
}