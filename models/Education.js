var mongoose = require('mongoose');
// const _ = require('lodash');
// const validator=require('validator');


const EducationSchema=new mongoose.Schema({
    universityName:{
     type: String,
     lowercase: true,
      },
     facultyName: {
        type: String,
        lowercase: true,
      
      },
      degree:{
     type:String
      },
      grade:{
      type:Number
  }

},{});


const Education=mongoose.model('Education',EducationSchema);


module.exports=Education;