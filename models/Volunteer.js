var mongoose = require('mongoose');
const _ = require('lodash');
const validator=require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const util=require('util');
require('dotenv').config();
const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET;
const CustomError = require('../helpers/customErorr');

const VolunteerSchema=new mongoose.Schema({
  firstName:{
     type: String,
     required:true,
    },
    lastName:{
        type: String,
        required:true,
   
       },
    password:{
        type:String,
        required:true,
      
    },
  country:{
      type:mongoose.ObjectId,
      ref:'Country',
      required:true
  },
    email:{
        type:String,
        unique:true,
        required:true,
        validate:(v)=>{
   return validator.isEmail(v);

       }
   
    }
    ,educations:{
        type:Array,
        ref:'Education'

    },
   
    skills:{
        type:Array,
        ref:'Skill'

    },
    jobTitle:{
        type:String,
       
       
    },
    imgUrl:{
      type:String
  },
description:{
      type:String
  }
    // missedTasks:{
    //     type:Array,
    //     ref:'Task'
    // },
    // portfolio:{
    //     type:Array,
    //     ref:'Task'  
    // }
       
    // ,
  
        //, 
    // inprogressTasks:{
    //         type:Array,
    //         ref:'Task'
    //     },
    
   
      
    
  


},{
/////////////////

    // timestamps: true,
    // virtual: true,
    collection: "Volunteers",
    toJSON: {
      virtuals: true,
      transform: doc => {
        return _.pick(doc, [
          "id",
          "fristName",
          "lastName",
          "password",
          "email",
          "country",
          "description",
          "educations",
          "skills",
          "jobTitle",
          "imgUrl",
         
          
        ]);
      }
    }




//////////////////////
});
const sign=util.promisify(jwt.sign);
const verify=util.promisify(jwt.verify);


VolunteerSchema.pre("save", async function() {
    const userInstance = this;
    if (this.isModified("password")) {
      userInstance.password = await bcrypt.hash(
        userInstance.password,
        saltRounds
      );
    }
  });
//---------------------to check password of spesifed user-----------------//
VolunteerSchema.methods.comparePassword = async function(plainPassword) {
    const userInstance = this;
    return bcrypt.compare(plainPassword, userInstance.password);
  };
  //---------------------generate token for this user------------------------------//
  VolunteerSchema.methods.generateToken = async function(expiresIn = "30m") {
    const userInstance = this;
    return sign({ Id: userInstance.id }, jwtSecret, { expiresIn });
  };
  ///----------------get user from token----------------------//
  VolunteerSchema.statics.getUserFromToken = async function(token) {
    const User = this;
    const payload = await verify(token, jwtSecret);
    const currentUser = await User.findById(payload.Id);
    if (!currentUser) throw Error("user not found");
    return currentUser;
  };




const Volunteer=mongoose.model('Volunteer',VolunteerSchema);


module.exports=Volunteer;