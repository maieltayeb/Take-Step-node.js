var mongoose = require("mongoose");
// const _ = require('lodash');
// const validator=require('validator');

const EducationSchema = new mongoose.Schema({
  volunteerId: {
    type: mongoose.Types.ObjectId,
    ref: "Volunteer"
  },

  universityId: {
    type: mongoose.Types.ObjectId,
    ref: "University"
  },
  facultyName: {
    type: String,
    lowercase: true
  },
  degree: {
    type: String
  },
  img: {
    type: String
  },
  graduationYear: {
    type: Date
  },
  location: {
    type: String
  },
  grade: {
    type: String
  }
});

const Education = mongoose.model("Education", EducationSchema);

module.exports = Education;
