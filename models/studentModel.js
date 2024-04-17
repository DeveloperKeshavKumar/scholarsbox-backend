const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  rollNo: {
    type: String,
    trim: true
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    enum: {
      values: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Computer Science (AI & ML)'],
      message: 'Invalid branch'
    }
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1, 'Invalid year'],
    max: [4, 'Invalid year']
  },
  passingYear: {
    type: Number,
    required: [true, 'Passing year is required'],
    min: [2021, 'Passing year should be greater than or equal to 2021'],
    max: [new Date().getFullYear() + 4, 'Passing year should not be greater than current year + 4']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password should be at least 8 characters long']
  },
  projects: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }],
    default: []
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Like'
  }],
  // mobNo:{
  //   type:String,
  //   required:true
  // },
  token: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  image: {
    type: String
  },
  bio: {
    type: String,
  },
  goals: {
    type: [String],
    default: []
  },
  achievements: {
    type: [String],
    default: []
  }

});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
