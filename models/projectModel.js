const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  url:{
    type:String,
  },
  tags: {
    type: [{
      type: String,
    }],
    // validate: {
    //   validator: function(v) {
    //     return v.length <= 5; //5 tags are allowed
    //   },
    //   message: 'Maximum 5 tags are allowed'
    // }
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Like'
  }],
  files: {
    type: [String],
    // required: [true, 'Filename is required']
  },
  // thumbnail:{
  //   type:String
  // },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    //required: [true, 'Student created is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
