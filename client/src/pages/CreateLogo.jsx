import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import supabase, { CDNURL } from '../supabase';
import { v4 as uuidv4 } from 'uuid';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LogoManagement() {
  const { currentUser } = useSelector(state => state.user);
  const [logos, setLogos] = useState([]);
  const [currentLogo, setCurrentLogo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mediaUploadError, setMediaUploadError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    image: ''
  });
  const [publishError, setPublishError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  // Maximum file size (in bytes)
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchLogos = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/logo');
        const data = await res.json();
        
        if (res.ok) {
          setLogos(data);
          
          // Set current logo to the most recent one
          if (data && data.length > 0) {
            setCurrentLogo(data[0]);
            // Populate form with current logo data for editing
            setFormData({
              title: data[0].title || '',
              image: data[0].image || '',
            });
            setIsEdit(true);
          }
        } else {
          throw new Error(data.message || 'Failed to fetch logos');
        }
      } catch (error) {
        console.error('Error fetching logos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title?.trim()) {
      setPublishError('Title is required');
      return;
    }

    if (!formData.image?.trim()) {
      setPublishError('Logo image is required');
      return;
    }

    setIsSubmitting(true);
    setPublishError(null);

    try {
      // Determine if we're creating a new logo or updating existing one
      const url = isEdit ? `/api/logo/${currentLogo._id}` : '/api/logo';
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          userId: currentUser._id,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setPublishError(data.message || 'Something went wrong');
        return;
      }
      
      // Update local state
      if (isEdit) {
        setLogos(logos.map(logo => 
          logo._id === currentLogo._id ? data : logo
        ));
        setCurrentLogo(data);
      } else {
        setLogos([data, ...logos]);
        setCurrentLogo(data);
        setIsEdit(true);
      }
      
      setSuccessMessage(isEdit ? 'Logo updated successfully!' : 'New logo created successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Reset file states
      setFile(null);
      setPreview(null);
      
    } catch (error) {
      setPublishError('Something went wrong');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadMedia = async () => {
    if (!file) {
      setMediaUploadError('Please select a file');
      return;
    }

    // Check file size
    if (file.size > MAX_IMAGE_SIZE) {
      setMediaUploadError(`Image size exceeds maximum allowed (5MB)`);
      return;
    }

    setUploading(true);
    setMediaUploadError(null);

    try {
      const fileName = `${uuidv4()}-${file.name}`;
      const filePath = 'logo/' + fileName;

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('passportinteractiveboard')
        .upload(filePath, file);

      if (error) {
        throw new Error(error.message);
      }

      // Construct public URL
      const mediaUrl = `${CDNURL}${filePath}`;
      
      // Update form data with new image URL
      setFormData(prev => ({ ...prev, image: mediaUrl }));
      setSuccessMessage('Image uploaded successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Upload failed:', error);
      setMediaUploadError(error.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    
    // Validate file type
    if (selectedFile.type.startsWith('image/')) {
      // Create image preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setMediaUploadError('Invalid file type. Please select an image.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this logo?')) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/logo/${currentLogo._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!res.ok) {
        const data = await res.json();
        setPublishError(data.message || 'Failed to delete logo');
        return;
      }
      
      // Update local state
      const updatedLogos = logos.filter(logo => logo._id !== currentLogo._id);
      setLogos(updatedLogos);
      
      // Reset form and set new current logo if available
      if (updatedLogos.length > 0) {
        setCurrentLogo(updatedLogos[0]);
        setFormData({
          title: updatedLogos[0].title || '',
          image: updatedLogos[0].image || '',
        });
      } else {
        setCurrentLogo(null);
        setFormData({
          title: '',
          image: '',
        });
        setIsEdit(false);
      }
      
      setSuccessMessage('Logo deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error) {
      setPublishError('Something went wrong');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user is admin
  if (currentUser?.isAdmin !== true) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="p-4 border-l-4 border-red-500 bg-red-50 text-red-700 rounded">
          <p className="font-medium">Access denied! You do not have permission to manage logos.</p>
        </div>
      </div>
    );
  }

  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-900 dark:text-white">Create Logo</h1>

      {publishError && (
        <div className="mb-6 p-4 border-l-4 border-red-500 bg-red-50 text-red-700 rounded dark:bg-red-900 dark:border-red-400 dark:text-red-300">
          <p className="font-medium">{publishError}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 border-l-4 border-green-500 bg-green-50 text-green-700 rounded dark:bg-green-900 dark:border-green-400 dark:text-green-300">
          <p className="font-medium">{successMessage}</p>
        </div>
      )}
      

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Logo Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            placeholder="Enter logo title"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
          />
        </div>

        {/* Media Upload Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Logo Image <span className="text-red-500">*</span>
            </label>
            
            <div className="flex items-center space-x-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors dark:border-gray-600 dark:hover:bg-gray-800">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, SVG (max 5MB)
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
              </label>
              <button
                type="button"
                onClick={handleUploadMedia}
                disabled={uploading || !file}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  uploading || !file
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {uploading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" color="white" />
                    <span className="ml-2">Uploading...</span>
                  </div>
                ) : 'Upload'}
              </button>
            </div>
            
            {mediaUploadError && (
              <p className="mt-2 text-sm text-red-600">{mediaUploadError}</p>
            )}
            
            {!mediaUploadError && file && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected file: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Image Preview */}
          {preview && (
            <div className="mt-4">
              <div className="relative rounded-lg overflow-hidden shadow-md">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-64 object-contain bg-gray-100 dark:bg-gray-700"
                />
              </div>
            </div>
          )}
          
          {!preview && formData.image && (
            <div className="mt-4">
              <div className="relative rounded-lg overflow-hidden shadow-md">
                <img 
                  src={formData.image} 
                  alt="Current Logo" 
                  className="w-full h-64 object-contain bg-gray-100 dark:bg-gray-700"
                />
                <div className="absolute bottom-2 right-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Current
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
              isSubmitting 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" color="white" />
                <span className="ml-2">{isEdit ? 'Updating...' : 'Creating...'}</span>
              </div>
            ) : (
              isEdit ? 'Update Logo' : 'Create New Logo'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}