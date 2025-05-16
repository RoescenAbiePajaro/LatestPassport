import mongoose from 'mongoose';

const personSchema = new mongoose.Schema({
  // Applicant Information
  firstName: {
    type: String,
    required: [true, 'First name is required']
  },
  middleName: {
    type: String
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['MALE', 'FEMALE']
  },
  nickname: {
    type: String
  },
  akaName: {
    type: String
  },
  civilStatus: {
    type: String,
    required: [true, 'Civil status is required'],
    enum: ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']
  },
  birthDate: {
    type: Date,
    required: [true, 'Birth date is required']
  },
  birthPlace: {
    type: String,
    required: [true, 'Birth place is required']
  },
  citizenship: {
    type: String,
    required: [true, 'Citizenship is required'],
    enum: ['FILIPINO', 'OTHER']
  },
  
  // Contact Details
  address: {
    type: String
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    match: [/^09\d{9}$/, 'Please enter a valid Philippine mobile number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    unique: true
  },
  
  // Family Background
  spouseName: {
    type: String,
    // Required conditionally in controller
  },
  spouseBirthPlace: {
    type: String,
    // Required conditionally in controller
  },
  fatherName: {
    type: String,
    required: [true, 'Father name is required']
  },
  fatherBirthPlace: {
    type: String,
    required: [true, 'Father birth place is required']
  },
  motherName: {
    type: String,
    required: [true, 'Mother name is required']
  },
  motherBirthPlace: {
    type: String,
    required: [true, 'Mother birth place is required']
  },
  
  // Other Information
  education: {
    type: String,
    required: [true, 'Educational attainment is required'],
    enum: ['HIGH SCHOOL GRADUATE', 'COLLEGE GRADUATE', 'POST GRADUATE']
  },
  occupation: {
    type: String
  },
  religion: {
    type: String,
    required: [true, 'Religion is required'],
    enum: ['ROMAN CATHOLIC', 'ISLAM', 'PROTESTANT', 'OTHER']
  },
  height: {
    type: Number,
    required: [true, 'Height is required']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required']
  },
  complexion: {
    type: String,
    required: [true, 'Complexion is required'],
    enum: ['FAIR', 'BROWN', 'DARK']
  },
  identifyingMarks: {
    type: String
  }
}, {
  timestamps: true
});

// Create a virtual property for birthDate from the individual components
personSchema.virtual('fullBirthDate').get(function() {
  return this.birthDate;
});

personSchema.pre('validate', function(next) {
  // Check if spouse fields are provided if civil status is MARRIED
  if (this.civilStatus === 'MARRIED') {
    if (!this.spouseName) {
      this.invalidate('spouseName', 'Spouse name is required when civil status is married');
    }
    if (!this.spouseBirthPlace) {
      this.invalidate('spouseBirthPlace', 'Spouse birth place is required when civil status is married');
    }
  }
  next();
});

const Person = mongoose.model('Person', personSchema);

export default Person;