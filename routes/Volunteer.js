const Volunteer = require("../models/Volunteer");
const Education = require("../models/Education");
const Skill = require("../models/Skill");
const express = require("express");
const authenticationMiddleware = require("../middlewares/authentication");
const validationMiddleWare = require("../middlewares/validationMiddleware");
require("express-async-errors");
const router = express.Router();
const { check } = require("express-validator");

//----------------------get all Volunteers-----------------------------//
router.get("/getAllVolunteers", async (req, res, next) => {
  const users = await Volunteer.find().populate("country");
  res.json(users);
});
//-----------------get Volunteer by id ---------------------------//
router.get("/:id", authenticationMiddleware, async (req, res, next) => {
  const { id } = req.params;
  //const users=await User.find();
  const user = await Volunteer.findById(id).populate("country");
  res.json(user);
});

//---------------------------UpdateUser---------------------------//
router.patch(
  "/Edit/:id",
  authenticationMiddleware,

  async (req, res, next) => {
    id = req.user.id;
    const {
      password,
      firstName,
      lastName,
      country,
      email,
      jobTitle,
      description,
    } = req.body;
    const user = await Volunteer.findByIdAndUpdate(
      id,
      {
        $set: {
          password,
          firstName,
          lastName,
          country,
          email,
          jobTitle,
          description,
        },
      },
      {
        new: true,
        runValidators: true,
        omitUndefined: true,
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
        min: 4,
      })
      .withMessage("must be at least 4 chars long"),
    check("email").isEmail()
  ),
  async (req, res, next) => {
    const { firstName, lastName, password, country, email } = req.body;
    const user = new Volunteer({
      firstName,
      lastName,
      password,
      country,
      email,
    });

    await user.save();
    res.json(user);
  }
);

////------------------------------login-----------------------//
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const user = await Volunteer.findOne({ email }).populate("country");
  if (!user) throw new Error("wrong email or password");
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error("wrong email or password");

  const token = await user.generateToken();

  if (!token) throw new Error("token  cant created");

  res.json({ token, user });
});
/////////////////////////Add Edu/////////////////////
router.post(
  "/add-education",
  authenticationMiddleware,

  async (req, res, next) => {
    const {
      volunteerId,
      universityId,
      facultyName,
      degree,
      graduationYear,
      location,
      grade,
    } = req.body;
    const Voleducation = new Education({
      volunteerId,
      universityId,
      facultyName,
      degree,
      graduationYear,
      location,
      grade,
    });
    let volunteerEdu = await Volunteer.findByIdAndUpdate(volunteerId, {
      $push: { educations: Voleducation },
    });

    await Voleducation.save();
    res.json({
      Voleducation,
      volunteerEdu,
    });
  }
);

//////////////////////////////////////////////edit Edu
router.patch(
  "/EditEducation/:volunteerId/:EduId",
  authenticationMiddleware,

  async (req, res, next) => {
    try {
      const { volunteerId, EduId } = req.params;
      const {
        universityId,
        facultyName,
        degree,
        graduationYear,
        location,
        grade,
      } = req.body;
      const Voleducation = {
        universityId,
        facultyName,
        degree,
        graduationYear,
        location,
        grade,
      };

      const updatedEdu = await Education.findByIdAndUpdate(EduId, {
        volunteerId,
        universityId,
        facultyName,
        degree,
        graduationYear,
        location,
        grade,
      });
      // let volunteerEdu = await Volunteer.find({
      //   _id: volunteerId,
      //   educations: { _id: EduId },
      // }).forEach(function (doc) {
      //   doc.educations.forEach(function (event) {
      //     if (educations._id === EduId) {
      //       educations.facultyName = facultyName;
      //     }
      //   });
      //   //  await volunteerEdu.save();
      // });
      //  db.collection.find({ _id: ObjectId('4d2d8deff4e6c1d71fc29a07') })
      // .forEach(function (doc) {
      //   doc.events.forEach(function (event) {
      //     if (event.profile === 10) {
      //       event.handled=0;
      //     }
      //   });
      //   db.collection.save(doc);
      // });
      let volunteerEdu = await Volunteer.update(
        { volunteerId, educations: { $elemMatch: { _id: EduId } } },
        { $set: { "educations.$": Voleducation } }
      ); //change first Matched elem
      //await Volunteer.findOneAndUpdate(
      //   volunteerId,
      //   { educations: { _id: EduId } },

      //   {
      //     $set: { "educations.$.facultyName": facultyName },
      //     // $set: { educations: Voleducation },
      //     // omitUndefined: true,
      //     // new: true
      //   }
      // );
      res.json({ updatedEdu, volunteerEdu });
    } catch (err) {
      console.error(err.message);
    }
  }
);

// grades: { $elemMatch: { grade: { $lte: 90 }, mean: { $gt: 80 } } }
// },
// { $set: { "grades.$.std" : 6 } }

//////////////////////////////////////////////Add skill//////////////////////////
router.post(
  "/add-skill",
  authenticationMiddleware,

  async (req, res, next) => {
    const { volunteerId, SkillName } = req.body;
    const Volskill = new Education({
      volunteerId,
      SkillName
    });
    let volunteerSkill = await Volunteer.findByIdAndUpdate(volunteerId, {
      $push: { skills: Volskill }
    });

    awaitVolskill.save();
    res.json({
      Volskill,
      volunteerSkill
    });
  }
);

module.exports = router;
