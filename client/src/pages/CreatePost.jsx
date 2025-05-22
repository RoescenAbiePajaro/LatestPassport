import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase, { CDNURL } from '../supabase';
import { v4 as uuidv4 } from 'uuid';
import RichTextEditor from '../components/RichTextEditor';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CreatePost() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null); // 'image' or 'video'
  const [preview, setPreview] = useState(null);
  const [mediaUploadError, setMediaUploadError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    image: '',
    video: ''
  });
  const [publishError, setPublishError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const videoRef = useRef(null);

  const navigate = useNavigate();

  // Maximum file sizes (in bytes)
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

  useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      setCategoryError(null);
      
      try {
        const res = await fetch('/api/category');
        const data = await res.json();
        
        if (res.ok) {
          setCategories(data);
          // Set default category if available
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, category: data[0]._id }));
          }
        } else {
          throw new Error(data.message || 'Failed to fetch categories');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategoryError(err.message || 'Failed to load categories. Please try again later.');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Modified validation
    if (!formData.title?.trim()) {
      setPublishError('Title is required');
      return;
    }

    // Better content validation
    const contentWithoutTags = formData.content?.replace(/<[^>]*>/g, '').trim();
    const hasContent = contentWithoutTags && contentWithoutTags.length > 0;

    if (!hasContent) {
      setPublishError('Content is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/post/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          title: formData.title.trim(),
          content: formData.content
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }
      navigate(`/post/${data.slug}`);
    } catch (error) {
      setPublishError('Something went wrong');
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
    if (fileType === 'image' && file.size > MAX_IMAGE_SIZE) {
      setMediaUploadError(`Image size exceeds maximum allowed (5MB)`);
      return;
    } else if (fileType === 'video' && file.size > MAX_VIDEO_SIZE) {
      setMediaUploadError(`Video size exceeds maximum allowed (50MB)`);
      return;
    }

    setUploading(true);
    setMediaUploadError(null);

    try {
      const fileName = `${uuidv4()}-${file.name}`;
      const folderPath = fileType === 'image' ? 'images/' : 'videos/';
      const filePath = folderPath + fileName;

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('passportinteractiveboard')
        .upload(filePath, file);

      if (error) {
        throw new Error(error.message);
      }

      // Construct public URL
      const mediaUrl = `${CDNURL}${filePath}`;
      
      // Update the appropriate field based on file type
      if (fileType === 'image') {
        setFormData(prev => ({ ...prev, image: mediaUrl }));
      } else {
        setFormData(prev => ({ ...prev, video: mediaUrl }));
      }
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
    
    // Determine file type
    if (selectedFile.type.startsWith('image/')) {
      setFileType('image');
      
      // Create image preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else if (selectedFile.type.startsWith('video/')) {
      setFileType('video');
      
      // Create video preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
      
      // Clean up the URL when component unmounts or preview changes
      return () => URL.revokeObjectURL(url);
    } else {
      setFile(null);
      setMediaUploadError('Invalid file type. Please select an image or video.');
    }
  };

  const handleMediaTypeChange = (type) => {
    // Reset file and preview when switching media type
    setFile(null);
    setPreview(null);
    setFileType(type);
    setMediaUploadError(null);
  };

  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-3">
          <svg className="w-8 h-8 text-teal-400 dark:text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Create Post
        </h1>
        <div className="mt-3 md:mt-0 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
      
      {publishError && (
        <div className="mb-6 p-4 border-l-4 border-red-500 bg-red-50 text-red-700 rounded dark:bg-red-900 dark:border-red-400 dark:text-red-300">
          <p className="font-medium">{publishError}</p>
        </div>
      )}
      
      <form className="space-y-8" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            placeholder="Enter post title"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
          />
        </div>

        {/* Category Selection */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Category <span className="text-red-500">*</span>
          </label>
          
          {categoryError && (
            <div className="mb-3 p-2 border-l-4 border-red-500 bg-red-50 text-red-700 text-sm rounded dark:bg-red-900 dark:border-red-400 dark:text-red-300">
              {categoryError}
            </div>
          )}
          
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
            disabled={isLoadingCategories}
            required
          >
            {isLoadingCategories ? (
              <option value="" className="flex items-center">
                <LoadingSpinner size="sm" color="primary" />
                <span className="ml-2">Loading categories...</span>
              </option>
            ) : categories.length === 0 ? (
              <option value="">No categories available</option>
            ) : (
              <>
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </>
            )}
          </select>
          
          <div className="mt-2 flex items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isLoadingCategories ? 'Loading categories...' : 
               categories.length === 0 && !categoryError ? 'No categories available. Please create one first.' : ''}
            </span>
          </div>
        </div>

        {/* Media Upload Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Media Upload
            </label>
            
            {/* Media Type Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                type="button"
                onClick={() => handleMediaTypeChange('image')}
                className={`py-2 px-4 mr-2 ${
                  fileType === 'image' || fileType === null
                    ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Upload Image
              </button>
              <button
                type="button"
                onClick={() => handleMediaTypeChange('video')}
                className={`py-2 px-4 ${
                  fileType === 'video'
                    ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Upload Video
              </button>
            </div>
            
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
                    {fileType === 'video' 
                      ? 'MP4, WebM, Ogg (max 50MB)' 
                      : 'PNG, JPG, GIF (max 5MB)'}
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept={fileType === 'video' ? 'video/*' : 'image/*'} 
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

          {/* Media Preview */}
          {fileType === 'image' && (preview || formData.image) && (
            <div className="mt-4">
              <div className="relative rounded-lg overflow-hidden shadow-md">
                <img 
                  src={formData.image || preview} 
                  alt="Preview" 
                  className="w-full h-64 object-cover"
                />
                {formData.image && (
                  <div className="absolute bottom-2 right-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Uploaded
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {fileType === 'video' && (preview || formData.video) && (
            <div className="mt-4">
              <div className="relative rounded-lg overflow-hidden shadow-md">
                <video 
                  ref={videoRef}
                  src={formData.video || preview} 
                  controls
                  className="w-full h-64 object-contain bg-black"
                />
                {formData.video && (
                  <div className="absolute bottom-2 right-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Uploaded
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Content <span className="text-red-500">*</span>
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden dark:border-gray-700">
            <RichTextEditor 
              onChange={newContent => setFormData(prev => ({ ...prev, content: newContent }))}
              initialContent={formData.content}
            />
          </div>
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
                <span className="ml-2">Publishing...</span>
              </div>
            ) : (
              'Publish Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}