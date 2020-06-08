var mongoose = require("mongoose");
// const _ = require('lodash');
// const validator=require('validator');

const SkillSchema = new mongoose.Schema(
  {
    skillName: {
      type: String,
      required: true
    }
  },
  {}
);

const Skill = mongoose.model("Skill", SkillSchema);

module.exports = Skill;
