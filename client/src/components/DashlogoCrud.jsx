import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { 
  HiOutlineExclamationCircle, 
  HiOutlinePencil, 
  HiOutlineTrash,
  HiDocumentText,
  HiOutlineSearch,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlinePhotograph
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Upload, CheckCircle, X, Plus } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

// Constants
const ITEMS_PER_PAGE = 6;

// Logo card component to improve code organization
const LogoCard = ({ logo, isActive, onEditClick, onDeleteClick, onUseClick, index }) => (
  <motion.div
    key={logo._id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }} 
    className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border dark:border-gray-700 ${
      isActive ? 'ring-2 ring-teal-500 dark:ring-teal-400' : ''
    }`}
  >
    <div className="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
      {logo.image ? (
        <img 
          src={logo.image} 
          alt={logo.title} 
          className="object-contain h-full w-full"
          loading="lazy"
        />
      ) : (
        <div className="text-gray-400 dark:text-gray-500 flex flex-col items-center">
          <Upload size={32} />
          <span>No image</span>
        </div>
      )}
    </div>
    
    <div className="p-5">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-lg text-gray-900 dark:text-white truncate">{logo.title}</h3>
        {isActive && (
          <span className="bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200 text-xs px-2.5 py-0.5 rounded-full flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-2">
          <button 
            onClick={() => onEditClick(logo)}
            className="p-2 text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-full transition-colors duration-300"
            title="Edit"
          >
            <HiOutlinePencil className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDeleteClick(logo._id)}
            className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors duration-300"
            title="Delete"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
        
        <button 
          onClick={() => onUseClick(logo._id)}
          disabled={isActive}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors duration-300 ${
            isActive 
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-teal-400 to-blue-500 dark:from-teal-500 dark:to-blue-600 text-white hover:from-teal-500 hover:to-blue-600'
          }`}
        >
          {isActive ? "Active" : "Use this logo"}
        </button>
      </div>
    </div>
  </motion.div>
);

// Delete confirmation modal component
const DeleteModal = ({ isOpen, onClose, onConfirm, isLoading }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={onClose}
        />
        
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-auto overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-5">
                  <HiOutlineExclamationCircle className="h-10 w-10 text-red-600 dark:text-red-500" />
                </div>
              </div>
              
              <h3 className="text-center text-lg font-medium text-gray-900 dark:text-white mb-4">
                Delete Logo
              </h3>
              
              <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete this logo? This action cannot be undone.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300 focus:outline-none"
                >
                  Cancel
                </button>
                
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" color="white" />
                      <span className="ml-2">Deleting...</span>
                    </div>
                  ) : 'Delete'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </>
    )}
  </AnimatePresence>
);

// Logo form modal component
const LogoFormModal = ({ isOpen, onClose, onSubmit, formData, setFormData, isEdit, isLoading }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={onClose}
        />
        
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-auto overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isEdit ? 'Edit Logo' : 'Add New Logo'}
                </h3>
                <button 
                  onClick={onClose}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={onSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-teal-500"
                    placeholder="https://example.com/image.png"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leave empty to use default image
                  </p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">
                    Video URL (optional)
                  </label>
                  <input
                    type="url"
                    name="video"
                    value={formData.video}
                    onChange={(e) => setFormData({...formData, video: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-teal-500"
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300 focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-gradient-to-r from-teal-400 to-blue-500 dark:from-teal-500 dark:to-blue-600 text-white font-medium rounded-lg transition duration-300 hover:from-teal-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <LoadingSpinner size="sm" color="white" />
                        <span className="ml-2">{isEdit ? 'Updating...' : 'Creating...'}</span>
                      </div>
                    ) : (
                      isEdit ? 'Update Logo' : 'Create Logo'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </>
    )}
  </AnimatePresence>
);

// Empty state component for no logos
const EmptyState = ({ onAddClick }) => (
  <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl p-10 text-center">
    <HiOutlinePhotograph className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">No logos yet</h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't created any logos.</p>
    <button 
      onClick={onAddClick}
      className="px-5 py-2 bg-gradient-to-r from-teal-400 to-blue-500 dark:from-teal-500 dark:to-blue-600 text-white font-medium rounded-lg transition duration-300 hover:from-teal-500 hover:to-blue-600"
    >
      Create your first logo
    </button>
  </div>
);

// No results found component
const NoResultsState = ({ setSearchTerm }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center">
    <svg className="w-16 h-16 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p className="text-gray-500 text-lg dark:text-gray-400">No logos found matching your search criteria.</p>
    <button 
      onClick={() => setSearchTerm('')}
      className="mt-4 text-teal-600 hover:text-teal-800 font-medium dark:text-teal-500 dark:hover:text-teal-400"
    >
      Clear search
    </button>
  </div>
);

export default function DashLogo() {
  const { currentUser } = useSelector((state) => state.user);
  const [logos, setLogos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLogoId, setActiveLogoId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [logoIdToDelete, setLogoIdToDelete] = useState('');
  const [currentLogo, setCurrentLogo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    video: ''
  });

  // Fetch logos on component mount
  useEffect(() => {
    fetchLogos();
  }, []);

  // Fetch logos from API
  const fetchLogos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/logo');
      if (!response.ok) throw new Error('Failed to fetch logos');
      const data = await response.json();
      setLogos(data);
      // Set the first logo as active if none is selected
      if (data.length > 0 && !activeLogoId) {
        setActiveLogoId(data[0]._id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter logos based on search term
  const filteredLogos = useMemo(() => {
    return logos.filter(logo =>
      logo.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logos, searchTerm]);

  // Memoized pagination calculations
  const { currentItems, totalPages } = useMemo(() => {
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    
    const currentItems = filteredLogos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLogos.length / ITEMS_PER_PAGE);
    
    return { currentItems, totalPages };
  }, [filteredLogos, currentPage]);

  // Handle logo creation
  const handleCreateLogo = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: currentUser._id
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create logo');
      }
      
      const newLogo = await response.json();
      setLogos(prev => [newLogo, ...prev]);
      setShowAddForm(false);
      setFormData({ title: '', image: '', video: '' });
      
      // Set as active if it's the first logo
      if (logos.length === 0) {
        setActiveLogoId(newLogo._id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle logo update
  const handleUpdateLogo = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/logo/${currentLogo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update logo');
      }
      
      const updatedLogo = await response.json();
      setLogos(prev => 
        prev.map(logo => logo._id === updatedLogo._id ? updatedLogo : logo)
      );
      setShowEditForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle logo deletion
  const handleDeleteLogo = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/logo/${logoIdToDelete}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete logo');
      
      setLogos(prev => prev.filter(logo => logo._id !== logoIdToDelete));
      
      // If the active logo is deleted, set a new active logo
      if (activeLogoId === logoIdToDelete) {
        const remainingLogos = logos.filter(logo => logo._id !== logoIdToDelete);
        if (remainingLogos.length > 0) {
          setActiveLogoId(remainingLogos[0]._id);
        } else {
          setActiveLogoId(null);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setShowDeleteModal(false);
      setLogoIdToDelete('');
      setIsSubmitting(false);
    }
  };

  // Handle delete button click
  const handleDeleteClick = useCallback((logoId) => {
    setLogoIdToDelete(logoId);
    setShowDeleteModal(true);
  }, []);

  // Open edit form for a logo
  const handleEditClick = useCallback((logo) => {
    setCurrentLogo(logo);
    setFormData({
      title: logo.title,
      image: logo.image,
      video: logo.video || ''
    });
    setShowEditForm(true);
  }, []);

  // Set a logo as active
  const handleUseLogo = useCallback((id) => {
    setActiveLogoId(id);
    // In a real application, you might want to save this preference to the backend
  }, []);

  // Open add form
  const handleAddClick = () => {
    setFormData({ title: '', image: '', video: '' });
    setShowAddForm(true);
  };

  // Pagination handler
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Dismiss error message
  const dismissError = () => {
    setError(null);
  };

  return (
    <div className="container mx-5 px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-3">
          <HiDocumentText className="w-8 h-8 text-teal-400 dark:text-teal-500"/>
          Logo Management
        </h2>
        <div className="mt-3 md:mt-0 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Clock className="h-4 w-4 mr-2" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={dismissError}
            className="text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search and Add button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiOutlineSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search logos by title..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-teal-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main content */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <LoadingSpinner size="lg" color="primary" />
        </div>
      ) : (
        <>
          {logos.length === 0 ? (
            <EmptyState onAddClick={handleAddClick} />
          ) : (
            <>
              {filteredLogos.length === 0 ? (
                <NoResultsState setSearchTerm={setSearchTerm} />
              ) : (
                <>
                  {/* Logo grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentItems.map((logo, index) => (
                      <LogoCard
                        key={logo._id}
                        logo={logo}
                        index={index}
                        isActive={activeLogoId === logo._id}
                        onEditClick={handleEditClick}
                        onDeleteClick={handleDeleteClick}
                        onUseClick={handleUseLogo}
                      />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between mt-6">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() => paginate(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                            currentPage === 1 
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                            currentPage === totalPages 
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredLogos.length)}</span> of{' '}
                            <span className="font-medium">{filteredLogos.length}</span> logos
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                              onClick={() => paginate(Math.max(1, currentPage - 1))}
                              disabled={currentPage === 1}
                              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                                currentPage === 1 
                                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              <span className="sr-only">Previous</span>
                              <HiOutlineChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                              <button
                                key={number}
                                onClick={() => paginate(number)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === number
                                    ? 'z-10 bg-teal-50 dark:bg-teal-900/30 border-teal-500 text-teal-600 dark:text-teal-400'
                                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark :hover:bg-gray-700'
                                }`}
                              >
                                {number}
                              </button>
                            ))}
                            <button
                              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                              disabled={currentPage === totalPages}
                              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                                currentPage === totalPages
                                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              <span className="sr-only">Next</span>
                              <HiOutlineChevronRight className="h-5 w-5" aria-hidden="true" />
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}

      {/* Modals */}
      <LogoFormModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleCreateLogo}
        formData={formData}
        setFormData={setFormData}
        isEdit={false}
        isLoading={isSubmitting}
      />
      
      <LogoFormModal
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={handleUpdateLogo}
        formData={formData}
        setFormData={setFormData}
        isEdit={true}
        isLoading={isSubmitting}
      />
      
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteLogo}
        isLoading={isSubmitting}
      />
    </div>
  );
}