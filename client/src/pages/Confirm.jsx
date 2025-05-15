import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AppointmentSystem() {
  // State for available time slots
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [idTypes, setIdTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Appointment scheduling state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showConfirmationForm, setShowConfirmationForm] = useState(false);
  
  // Confirmation form state
  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [showIdDropdown, setShowIdDropdown] = useState(false);

  // React Router hooks
  const navigate = useNavigate();

  // Fetch ID types on component mount
  useEffect(() => {
    const fetchIdTypes = async () => {
      try {
        const response = await fetch('/api/appointment/id-types');
        const data = await response.json();
        if (data) {
          setIdTypes(data);
          if (data.length > 0) {
            setIdType(data[0]);
          }
        }
      } catch (err) {
        setError('Failed to load ID types');
      }
    };
    fetchIdTypes();
  }, []);

  // Fetch available slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      const fetchAvailableSlots = async () => {
        try {
          setLoading(true);
          const dateStr = selectedDate.toISOString().split('T')[0];
          const response = await fetch(`/api/appointment/timeslots/${dateStr}`);
          const data = await response.json();
          if (data) {
            setAvailableSlots(data.availableSlots || []);
            setBookedSlots(data.bookedSlots || []);
          }
          setLoading(false);
        } catch (err) {
          setError(err.message || 'Failed to load available time slots');
          setAvailableSlots([]);
          setBookedSlots([]);
          setLoading(false);
        }
      };
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  // Generate days for the current month view
  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    
    // Add padding for days from previous month
    const startingDayOfWeek = date.getDay();
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days for current month
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    
    return days;
  };

  // Navigation functions
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Handle selections
  const handleDateClick = (day) => {
    if (day) {
      setSelectedDate(day);
      setSelectedTime(null);
      setError(null);
    }
  };

  const handleTimeClick = (time) => {
    setSelectedTime(time);
  };

  const handleProceedToConfirmation = () => {
    setShowConfirmationForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitAppointment = async (e) => {
      e.preventDefault();
      try {
        setLoading(true);
        setError(null);
  
        const dateStr = selectedDate.toISOString().split('T')[0];
  
        const appointmentData = {
          date: dateStr,
          time: selectedTime,
          idType,
          idPresented: idNumber,
          userInfo
        };
  
        const response = await fetch('/api/appointment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(appointmentData)
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create appointment');
        }
  
        setSuccessMessage(`Appointment confirmed for ${formatDate(selectedDate)} at ${selectedTime}`);
        setSelectedDate(null);
        setSelectedTime(null);
        setShowConfirmationForm(false);
        setUserInfo({
          firstName: '',
          lastName: '',
          email: '',
          phone: ''
        });
        setIdNumber('');
      } catch (err) {
        setError(err.message || 'Failed to create appointment');
      } finally {
        setLoading(false);
      }
    };
    const handleClose = () => {
      setShowConfirmationForm(false);
      setError(null);
    };

  const handleIdSelection = (idType) => {
    setIdType(idType);
    setShowIdDropdown(false);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Generate days for the calendar
  const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Appointment Scheduling System
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            Book your appointment and confirm your identity
          </p>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {!showConfirmationForm ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Calendar Section */}
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Select Appointment Date</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={prevMonth}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={nextMonth}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-blue-600">{monthName}</h3>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-6">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
                
                {days.map((day, index) => (
                  <div 
                    key={index} 
                    className={`h-12 flex items-center justify-center rounded-lg cursor-pointer transition-colors
                      ${day ? '' : 'invisible'} 
                      ${selectedDate && day && day.toDateString() === selectedDate.toDateString() ? 
                        'bg-blue-600 text-white' : 
                        'hover:bg-gray-100'}`}
                    onClick={() => handleDateClick(day)}
                  >
                    {day ? day.getDate() : ''}
                  </div>
                ))}
              </div>
              
              {selectedDate && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Available Times for {formatDate(selectedDate)}
                  </h3>
                  {loading ? (
                    <div className="text-center py-4">Loading available slots...</div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {availableSlots.map((time, index) => (
                        <button
                          key={index}
                          className={`py-2 px-3 rounded-lg border transition-colors
                            ${selectedTime === time ? 
                              'bg-blue-600 text-white border-blue-600' : 
                              'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}`}
                          onClick={() => handleTimeClick(time)}
                        >
                          {time}
                        </button>
                      ))}
                      {availableSlots.length === 0 && !loading && (
                        <div className="col-span-full text-center text-gray-500 py-4">
                          No available slots for this date
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Footer with proceed button */}
            {selectedDate && selectedTime && (
              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  onClick={handleProceedToConfirmation}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Proceed to Confirmation'}
                </button>
              </div>
            )}
          </div>
        ) : (
          // Confirmation Form
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
              <h2 className="text-2xl font-bold text-white">Confirmation</h2>
              <p className="text-blue-100 mt-1">
                Appointment for {formatDate(selectedDate)} at {selectedTime}
              </p>
            </div>
            
            {/* Form Content */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={userInfo.firstName}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={userInfo.lastName}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={userInfo.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={userInfo.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Presented 
                    <span className="ml-2 text-xs text-gray-500 font-normal">
                      (Note: Bring this document for verification)
                    </span>
                  </label>
                  <div 
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 cursor-pointer flex justify-between items-center"
                    onClick={() => setShowIdDropdown(!showIdDropdown)}
                  >
                    <span>{idType}</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-gray-400" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  {showIdDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 max-h-60 overflow-auto">
                      {idTypes.map((type) => (
                        <div
                          key={type}
                          className={`p-3 hover:bg-blue-50 cursor-pointer ${idType === type ? 'bg-blue-100' : ''}`}
                          onClick={() => handleIdSelection(type)}
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-700 text-center">
                  I certify that all information on this form are true and correct. I understand that
                  any incorrect, false or misleading statement is punishable by law.
                </p>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="px-6 pb-6 flex space-x-4">
              <button 
                onClick={handleClose}
                disabled={loading}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button 
                onClick={handleSubmitAppointment}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Appointment'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}