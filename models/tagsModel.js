const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required:[true, "Please enter tag name"]
  },
  description:{
    type:String
  },
  project:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Project"
  }


});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
