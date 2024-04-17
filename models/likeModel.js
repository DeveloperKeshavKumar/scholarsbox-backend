const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project reference is required']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student reference is required']
  },
  likedAt:{
    type: Date,
    default:Date.now(),
  }
});

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
