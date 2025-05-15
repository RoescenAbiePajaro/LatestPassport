
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PersonalInformationForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    nickname: '',
    akaName: '',
    civilStatus: '',
    birthDate: '',
    birthMonth: '',
    birthYear: '',
    birthPlace: '',
    citizenship: '',
    address: '',
    mobile: '',
    email: '',
    spouseName: '',
    spouseBirthPlace: '',
    fatherName: '',
    fatherBirthPlace: '',
    motherName: '',
    motherBirthPlace: '',
    education: '',
    occupation: '',
    religion: '',
    height: '',
    weight: '',
    complexion: '',
    identifyingMarks: ''
  });

  const [persons, setPersons] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Fetch all persons on component mount
  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/persons');
      
      if (!response.ok) {
        throw new Error('Failed to fetch persons');
      }
      
      const data = await response.json();
      setPersons(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectPerson = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/persons/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch person details');
      }
      
      const data = await response.json();
      setSelectedPerson(data);
      
      // Format birthdate components
      const birthDate = new Date(data.birthDate);
      
      setFormData({
        ...data,
        birthDate: birthDate.getDate(),
        birthMonth: birthDate.getMonth() + 1, // JS months are 0-indexed
        birthYear: birthDate.getFullYear()
      });
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      gender: '',
      nickname: '',
      akaName: '',
      civilStatus: '',
      birthDate: '',
      birthMonth: '',
      birthYear: '',
      birthPlace: '',
      citizenship: '',
      address: '',
      mobile: '',
      email: '',
      spouseName: '',
      spouseBirthPlace: '',
      fatherName: '',
      fatherBirthPlace: '',
      motherName: '',
      motherBirthPlace: '',
      education: '',
      occupation: '',
      religion: '',
      height: '',
      weight: '',
      complexion: '',
      identifyingMarks: ''
    });
    setSelectedPerson(null);
    setError(null);
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const url = selectedPerson 
        ? `/api/persons/${selectedPerson._id}` 
        : '/api/persons';
      
      const method = selectedPerson ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }
      
      const data = await response.json();
      
      setSuccessMessage(selectedPerson 
        ? 'Person information updated successfully!' 
        : 'Person information saved successfully!');
      
      // Refresh the persons list
      fetchPersons();
      
      if (!selectedPerson) {
        resetForm(); // Reset form after creating a new person
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

   const handleNextPage = () => {
    setLoading(true);
    // Simulate loading if needed
    setTimeout(() => {
      navigate('/confirmation');
      setLoading(false);
    }, 500);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this person?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/persons/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete person');
      }
      
      setSuccessMessage('Person deleted successfully!');
      
      // Refresh the persons list and reset form
      fetchPersons();
      resetForm();
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow-sm border border-gray-200">
      {/* Status Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {/* List of Persons */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Existing Records</h3>
        {loading && <p>Loading...</p>}
        
        <div className="bg-gray-100 p-4 rounded max-h-32 overflow-y-auto">
          {persons.length === 0 ? (
            <p className="text-gray-500">No records found</p>
          ) : (
            <ul>
              {persons.map(person => (
                <li key={person._id} className="mb-1 flex justify-between">
                  <button
                    onClick={() => handleSelectPerson(person._id)}
                    className="text-blue-600 hover:underline"
                  >
                    {person.lastName}, {person.firstName} {person.middleName}
                  </button>
                  <button
                    onClick={() => handleDelete(person._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* APPLICANT INFORMATION */}
        <div className="border-b border-gray-300 pb-2 mb-6">
          <h2 className="text-center text-gray-700 font-medium">
            APPLICANT INFORMATION {selectedPerson && `(Editing ID: ${selectedPerson._id})`}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Middle Name</label>
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select</option>
              <option value="MALE">MALE</option>
              <option value="FEMALE">FEMALE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Nickname</label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">AKA/Other Name</label>
            <input
              type="text"
              name="akaName"
              value={formData.akaName}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm mb-1">
              Birth Date <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-1">
              <select
                name="birthMonth"
                value={formData.birthMonth}
                onChange={handleChange}
                className="bg-gray-200 p-2 border border-gray-300 rounded"
                required
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <select
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="bg-gray-200 p-2 border border-gray-300 rounded"
                required
              >
                <option value="">DD</option>
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <select
                name="birthYear"
                value={formData.birthYear}
                onChange={handleChange}
                className="bg-gray-200 p-2 border border-gray-300 rounded"
                required
              >
                <option value="">YYYY</option>
                {Array.from({ length: 100 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">
              Birth Place <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="birthPlace"
              value={formData.birthPlace}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">
              Citizenship <span className="text-red-500">*</span>
            </label>
            <select
              name="citizenship"
              value={formData.citizenship}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select</option>
              <option value="FILIPINO">FILIPINO</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm mb-1">
              Civil Status <span className="text-red-500">*</span>
            </label>
            <select
              name="civilStatus"
              value={formData.civilStatus}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select</option>
              <option value="SINGLE">SINGLE</option>
              <option value="MARRIED">MARRIED</option>
              <option value="DIVORCED">DIVORCED</option>
              <option value="WIDOWED">WIDOWED</option>
            </select>
          </div>
        </div>

        {/* CONTACT DETAILS */}
        <div className="border-b border-gray-300 pb-2 mb-6 mt-8">
          <h2 className="text-center text-gray-700 font-medium">CONTACT DETAILS</h2>
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-1">Street/Unit/Bldg/Village</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm mb-1">
              Mobile <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-2">(Example: 09175555555)</span>
            </label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
              required
              pattern="^09\d{9}$"
              title="Must be a valid Philippine mobile number (e.g., 09175555555)"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
              required
            />
          </div>
        </div>

        {/* FAMILY BACKGROUND */}
        <div className="border-b border-gray-300 pb-2 mb-6 mt-8">
          <h2 className="text-center text-gray-700 font-medium">FAMILY BACKGROUND</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm mb-1">
              Spouse Name {formData.civilStatus === 'MARRIED' && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              name="spouseName"
              value={formData.spouseName}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
              required={formData.civilStatus === 'MARRIED'}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">
              Spouse Birth Place {formData.civilStatus === 'MARRIED' && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              name="spouseBirthPlace"
              value={formData.spouseBirthPlace}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
              required={formData.civilStatus === 'MARRIED'}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm mb-1">
              Father Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">
              Father Birth Place <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fatherBirthPlace"
              value={formData.fatherBirthPlace}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm mb-1">
              Mother Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">
              Mother Birth Place <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="motherBirthPlace"
              value={formData.motherBirthPlace}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
              required
            />
          </div>
        </div>

        {/* OTHER INFORMATION */}
        <div className="border-b border-gray-300 pb-2 mb-6 mt-8">
          <h2 className="text-center text-gray-700 font-medium">OTHER INFORMATION</h2>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm mb-1">
              Educational Attainment <span className="text-red-500">*</span>
            </label>
            <select
              name="education"
              value={formData.education}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select</option>
              <option value="HIGH SCHOOL GRADUATE">HIGH SCHOOL GRADUATE</option>
              <option value="COLLEGE GRADUATE">COLLEGE GRADUATE</option>
              <option value="POST GRADUATE">POST GRADUATE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Occupation</label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">
              Religion <span className="text-red-500">*</span>
            </label>
            <select
              name="religion"
              value={formData.religion}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select</option>
              <option value="ROMAN CATHOLIC">ROMAN CATHOLIC</option>
              <option value="ISLAM">ISLAM</option>
              <option value="PROTESTANT">PROTESTANT</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm mb-1">
              Height (CM) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">
              Weight (KG) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">
              Complexion <span className="text-red-500">*</span>
            </label>
            <select
              name="complexion"
              value={formData.complexion}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select</option>
              <option value="FAIR">FAIR</option>
              <option value="BROWN">BROWN</option>
              <option value="DARK">DARK</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Identifying Marks</label>
            <input
              type="text"
              name="identifyingMarks"
              value={formData.identifyingMarks}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            type="submit"
            className="bg-white border border-red-900 text-red-900 px-6 py-2 rounded hover:bg-red-50"
            disabled={loading}
          >
            {loading ? 'SAVING...' : (selectedPerson ? 'UPDATE INFORMATION' : 'SAVE INFORMATION')}
          </button>
          <button
                  type="button"
                  onClick={handleNextPage}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  disabled={loading}
                >
                  NEXT PAGE
                </button>
          <button
            type="button"
            className="bg-white border border-gray-400 text-gray-700 px-6 py-2 rounded hover:bg-gray-50"
            onClick={resetForm}
            disabled={loading}
          >
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
}