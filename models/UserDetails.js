const mongoose = require('mongoose');

const UserDetailsSchema = new mongoose.Schema({
  _id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  
});

const addDetails = mongoose.model('additionalDetails', UserDetailsSchema);
module.exports = addDetails;