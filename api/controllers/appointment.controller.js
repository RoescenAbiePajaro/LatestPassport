import Appointment from '../models/appointment.model.js';
import User from '../models/user.model.js'; // Make sure to import User model

// List of valid Philippine ID types
const PHILIPPINE_IDS = [
  'VOTER\'S_ID',
  'UMID',
  'PHILHEALTH',
  'SSS',
  'GSIS',
  'DRIVER\'S_LICENSE',
  'PRC',
  'PASSPORT',
  'SENIOR_CITIZEN',
  'POSTAL',
  'TIN',
  'BARANGAY',
  'SCHOOL',
  'BIRTH_CERTIFICATE',
  'MARRIAGE_CERTIFICATE',
  'POLICE',
  'NBI'
];

// Get all available time slots
export const getAvailableTimeSlots = async (req, res) => {
  try {
    const { date } = req.params;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }
    
    // Convert date to proper format
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }
    
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Get all appointments for this date
    const appointments = await Appointment.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['pending', 'confirmed'] }
    });
    
    // All possible time slots
    const allTimeSlots = [
      '9:00 AM', '10:00 AM', '11:00 AM', 
      '12:00 PM', '1:00 PM', '2:00 PM', 
      '3:00 PM', '4:00 PM'
    ];
    
    // Get booked time slots
    const bookedSlots = appointments.map(app => app.time);
    
    // Filter available slots
    const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot));
    
    res.status(200).json({
      success: true,
      date: date,
      availableSlots: availableSlots,
      bookedSlots: bookedSlots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching available time slots',
      error: error.message
    });
  }
};

// Create a new appointment
export const createAppointment = async (req, res) => {
  try {
    const { date, time, idType, idPresented, userInfo } = req.body;
    
    // Validate required fields
    if (!date || !time || !idType || !idPresented || !userInfo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Validate ID type
    if (!PHILIPPINE_IDS.includes(idType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID type'
      });
    }
    
    // Check if the time slot is still available
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }
    
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingAppointment = await Appointment.findOne({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      time,
      status: { $in: ['pending', 'confirmed'] }
    });
    
    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is no longer available'
      });
    }
    
    // Validate user info
    if (!userInfo.email || !userInfo.firstName || !userInfo.lastName) {
      return res.status(400).json({
        success: false,
        message: 'User information is incomplete'
      });
    }
    
    // Create or find user
    let user = await User.findOne({ email: userInfo.email });
    if (!user) {
      user = new User({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        phone: userInfo.phone || ''
      });
      await user.save();
    }
    
    // Create appointment
    const appointment = new Appointment({
      userId: user._id,
      date: selectedDate,
      time,
      idType,
      idPresented,
      status: 'confirmed'
    });
    
    await appointment.save();
    
    // Add appointment to user's appointments
    if (!user.appointments) {
      user.appointments = [];
    }
    user.appointments.push(appointment._id);
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: {
        appointment: appointment,
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating appointment',
      error: error.message
    });
  }
};

// Get all valid ID types
export const getIdTypes = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: PHILIPPINE_IDS
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ID types',
      error: error.message
    });
  }
};

// Get appointment by ID
export const getAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required'
      });
    }
    
    const appointment = await Appointment.findById(id)
      .populate('userId', 'firstName lastName email phone');
      
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment',
      error: error.message
    });
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required'
      });
    }
    
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message
    });
  }
};