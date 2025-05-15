import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  idType: {
    type: String,
    enum: [
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
    ],
    required: true
  },
  idPresented: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
appointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;