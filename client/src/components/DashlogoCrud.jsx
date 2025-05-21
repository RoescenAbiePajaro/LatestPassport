import { useState, useEffect } from 'react';
import { Search, Upload, Edit, Trash2, CheckCircle, X, Plus } from 'lucide-react';

export default function LogoManagement() {
  // State variables
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLogoId, setActiveLogoId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentLogo, setCurrentLogo] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    video: ''
  });


  // Fetch all logos on component mount
  useEffect(() => {
    fetchLogos();
  }, []);

  // Fetch logos from API
  const fetchLogos = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  // Filter logos based on search term
  const filteredLogos = logos.filter(logo =>
    logo.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Create a new logo
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId
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
    } catch (err) {
      setError(err.message);
    }
  };

  // Update an existing logo
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
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
    }
  };

  // Delete a logo
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this logo?')) return;
    
    try {
      const response = await fetch(`/api/logo/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete logo');
      
      setLogos(prev => prev.filter(logo => logo._id !== id));
      
      // If the active logo is deleted, set a new active logo
      if (activeLogoId === id) {
        const remainingLogos = logos.filter(logo => logo._id !== id);
        if (remainingLogos.length > 0) {
          setActiveLogoId(remainingLogos[0]._id);
        } else {
          setActiveLogoId(null);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Open edit form for a logo
  const openEditForm = (logo) => {
    setCurrentLogo(logo);
    setFormData({
      title: logo.title,
      image: logo.image,
      video: logo.video
    });
    setShowEditForm(true);
  };

  // Set a logo as active
  const handleUseLogo = (id) => {
    setActiveLogoId(id);
    // In a real application, you might want to save this preference to the backend
    // For now, we're just storing it in the component state
    console.log(`Logo ${id} is now active`);
  };

  // Reset form data
  const resetForm = () => {
    setFormData({ title: '', image: '', video: '' });
    setCurrentLogo(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading logos...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Logo Management</h1>
        <button 
          onClick={() => { setShowAddForm(true); resetForm(); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus size={16} /> Add New Logo
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={16} /></button>
        </div>
      )}

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search logos..."
          className="pl-10 w-full p-2 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {logos.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No logos found. Add your first logo to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLogos.map(logo => (
            <div 
              key={logo._id}
              className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                activeLogoId === logo._id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                {logo.image ? (
                  <img 
                    src={logo.image} 
                    alt={logo.title} 
                    className="object-contain h-full w-full"
                  />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <Upload size={32} />
                    <span>No image</span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg truncate">{logo.title}</h3>
                  {activeLogoId === logo._id && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditForm(logo)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(logo._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => handleUseLogo(logo._id)}
                    disabled={activeLogoId === logo._id}
                    className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
                      activeLogoId === logo._id 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {activeLogoId === logo._id ? (
                      <>
                        <CheckCircle size={14} /> Active
                      </>
                    ) : (
                      'Use this logo'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Logo Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Logo</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com/image.png"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to use default image</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-1">Video URL (optional)</label>
                <input
                  type="url"
                  name="video"
                  value={formData.video}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com/video.mp4"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Logo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Logo Modal */}
      {showEditForm && currentLogo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Logo</h2>
              <button 
                onClick={() => setShowEditForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-1">Video URL (optional)</label>
                <input
                  type="url"
                  name="video"
                  value={formData.video}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Logo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}