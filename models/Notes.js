const mongoose = require('mongoose');
const { type } = require('vite');

const { Schema } = mongoose;

const NotesSchema = new Schema({
  user:{  // storing the user
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
  },
  title:{
      type : String,
      required:true
  },
  dis:
  {
    type : String,
      required:true,
  },
  tag:
  {
    type : String,
    default:"General"
  },
  date:
  {
    type : Date,
     default:Date.now
  }
});

const Notes=mongoose.model('notes',NotesSchema)
module.exports=Notes;