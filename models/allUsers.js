var mongoose = require("mongoose");
const _ = require("lodash");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const util = require("util");
require("dotenv").config();
const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET;

const allUsersSchema = new mongoose.Schema(
  {
   
    bussinessOwner: {
        type: mongoose.ObjectId,
        ref: "BusinessOwner",
    },
    volunteer: {
      type: mongoose.ObjectId,
      ref: "Volunteer",
    },
  
  },
  {
    /////////////////

    // timestamps: true,
    // virtual: true,
    collection: "allUsersSchema",
    toJSON: {
      virtuals: true,
      transform: doc => {
        return _.pick(doc, [
          "id",
          "bussinessOwner",
          " volunteer"
         
        ]);
      }
    }

    //////////////////////
  }
);
const sign = util.promisify(jwt.sign);
const verify = util.promisify(jwt.verify);

allUsersSchema.pre("save", async function() {
  const userInstance = this;
  if (this.isModified("password")) {
    userInstance.password = await bcrypt.hash(
      userInstance.password,
      saltRounds
    );
  }
});
//---------------------to check password of spesifed user-----------------//
allUsersSchema.methods.comparePassword = async function(plainPassword) {
  const userInstance = this;
  return bcrypt.compare(plainPassword, userInstance.password);
};
//---------------------generate token for this user------------------------------//
allUsersSchema.methods.generateToken = async function(expiresIn = "30m") {
  const userInstance = this;
  return sign({ Id: userInstance.id }, jwtSecret, { expiresIn });
};
///----------------get user from token----------------------//
allUsersSchema.statics.getUserFromToken = async function(token) {
  const User = this;
  const payload = await verify(token, jwtSecret);
  const currentUser = await User.findById(payload.Id);
  if (!currentUser) throw Error("volunteer not found");
  return currentUser;
};

const allUsers= mongoose.model("allUsers", allUsersSchema);

module.exports = allUsers;