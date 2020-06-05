var mongoose = require('mongoose');
// const _ = require('lodash');
// const validator=require('validator');


const SkillSchema=new mongoose.Schema({
    SkillName:{
     type: String,
     required:true,
     unique: true,
 
    }
   

},{});


const Skill=mongoose.model('Skill',SkillSchema);


module.exports=Skill;