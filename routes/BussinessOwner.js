const BusinessOwner = require("../models/businessOwner");
const SubmitTasks = require("../models/SubmitTasks");
const express = require("express");
const authenticationMiddleware = require("../middlewares/authentication");
const validationMiddleWare = require("../middlewares/validationMiddleware");
require("express-async-errors");
const router = express.Router();
const { check } = require("express-validator");
// const altImg = require("../backup");

//-----------multer - image upload--------------
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter
});

//----------------------get all users-----------------------------//
router.get(
  "/getAllBussinessUsers",
  //   authenticationMiddleware,
  async (req, res, next) => {
    const users = await BusinessOwner.find().populate("country");
    res.json(users);
  }
);
//-----------------get user by id ---------------------------//
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  //const users=await User.find();
  const user = await BusinessOwner.findById(id).populate("country");
  res.json({ user });
});

//---------------------------UpdateUser---------------------------//
router.patch(
  "/Edit/:id",
  authenticationMiddleware,
  upload.single("imgUrl"),
  async (req, res, next) => {
    debugger;
    console.log(req.file);
    // let imgUrl = undefined;
    // if (!req.file) {
    //   imgUrl = undefined;
    // } else {
    // }
    let imgUrl = req.file.path;
    // || altImg
    id = req.user.id;
    const {
      password,
      firstName,
      lastName,
      country,
      email,
      paymentData,
      jobTitle,
      description,
      companyName
    } = req.body;
    const user = await BusinessOwner.findByIdAndUpdate(
      id,
      {
        $set: {
          password,
          firstName,
          lastName,
          country,
          email,
          paymentData,
          jobTitle,
          description,
          companyName,
          imgUrl
        }
      },
      {
        new: true,
        runValidators: true,
        omitUndefined: true
      }
    ).populate("country");
    res.status(200).json(user);
  }
);

///-----------------------Register-----------------//
router.post(
  "/register",
  validationMiddleWare(
    check("password")
      .isLength({
        min: 4
      })
      .withMessage("must be at least 4 chars long"),
    check("email").isEmail()
  ),
  async (req, res, next) => {
    const {
      email,
      firstName,
      lastName,
      password,
      country,
      paymentData
    } = req.body;
    const user = new BusinessOwner({
      firstName,
      lastName,
      password,
      country,
      paymentData,
      email
    });

    await user.save(function(err) {
      if (err) {
        if (err.name === "MongoError" && err.code === 11000) {
          // Duplicate username
          return res
            .status(422)
            .send({ succes: false, message: " email already exist!" });
        }

        // Some other error
        return res.status(422).send(err);
      }

      res.json({
        success: true,
        user
      });
    });
  }
);

////------------------------------login-----------------------///
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const user = await BusinessOwner.findOne({ email }).populate("country");
  if (!user) throw new Error("wrong email or password");
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error("wrong email or password");

  const token = await user.generateToken();

  if (!token) throw new Error("token  cant created");

  res.json({ token, user });
});

//----------------------------------------**********task submitted part*******----------------------------------------////
router.post(
  "/addSubmitTasks",
  // authenticationMiddleware,
  async (req, res, next) => {
    const {
      bussinessOwnerId,
      volunteerId,
      jobId,
      jobTitle,
      taskLink,
      VolunteerComment
    } = req.body;
    const newLink = new SubmitTasks({
      bussinessOwnerId,
      volunteerId,
      jobId,
      jobTitle,
      taskLink,
      VolunteerComment
    });
    const arr = await BusinessOwner.findById(bussinessOwnerId);
    const realJobTitles = [];
    for (let i = 0; i < arr.submitTasks.length; i++) {
      arr.submitTasks[i] = Object.keys(arr.submitTasks[i]);
      console.log("", arr.submitTasks[i][i]);
      realJobTitles.push(arr.submitTasks[i]);
      //  if(arr.submitTasks[i][i]===jobTitle){console.log("ahhhh")}
      let newTaskLink;
      if (arr.submitTasks[i][i] === newLink.jobTitle) {
        newTaskLink = await BusinessOwner.findOneAndUpdate(newLink.jobTitle, {
          $push: { submitTasks: [{ [newLink.jobTitle]: newLink }] }
        });
      } else {
        newTaskLink = await BusinessOwner.findByIdAndUpdate(bussinessOwnerId, {
          $push: { submitTasks: { [newLink.jobTitle]: newLink } }
        });

        // console.log(newTaskLink)
        // }
        // else{
        //    newTaskLink = await BusinessOwner.findByIdAndUpdate(bussinessOwnerId, {
        //     $push: { submitTasks: {[newLink.jobTitle]:newLink}},

        //     // $push: { educations: newEducation }

        //   });}

        console.log(newTaskLink);
        await newLink.save();
        res.json({
          newLink
        });
      }
    }
  }
);

//------------------------------get submittedprojects by id -----------------------------------------///
router.get("/getSubmitTasks/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await BusinessOwner.findById(id);
    console.log("projects", user);
    const submitTasks = user.submitTasks;
    console.log("submitTasks", submitTasks);
    if (submitTasks) var mySubmitTasks = [];
    for (var i = 0; i < submitTasks.length; i++) {
      var x = submitTasks[i];
      //  console.log(x)
      const newProject = await SubmitTasks.findById(x);
      mySubmitTasks.push(newProject);
      console.log("newProject", newProject);
    }
    console.log(mySubmitTasks);
    res.status(200).json(mySubmitTasks);
  } catch (err) {
    statusCode = 400;
    next(err);
  }
});
//-------------------------********************************--------------------------///

module.exports = router;
