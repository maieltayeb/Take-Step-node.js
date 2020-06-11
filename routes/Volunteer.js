const Volunteer = require("../models/Volunteer");
const Education = require("../models/Education");
const Skill = require("../models/Skill");
const express = require("express");
const authenticationMiddleware = require("../middlewares/authentication");
const ownerAuthorization = require("../middlewares/ownerAuthorization");
const validationMiddleWare = require("../middlewares/validationMiddleware");

require("express-async-errors");
require("dotenv").config();
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
  const user = await Volunteer.findById(id)
    .populate("country")
    .populate("educations")
    .populate("skills");
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
  console.log("from login");
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
    const newEducation = new Education({
      volunteerId,
      universityId,
      facultyName,
      degree,
      graduationYear,
      location,
      grade,
    });
    let volunteerNewEducation = await Volunteer.findByIdAndUpdate(volunteerId, {
      $push: { educations: newEducation.id },
      // $push: { educations: newEducation }
    });

    await newEducation.save();
    res.json({
      newEducation,
      volunteerNewEducation,
    });
  }
);

//////////////////////////////////////////////edit Edu////////
router.patch(
  "/EditEducation/:EduId",
  authenticationMiddleware,
  async (req, res, next) => {
    const { EduId } = req.params;
    const {
      universityId,
      facultyName,
      degree,
      graduationYear,
      location,
      grade,
    } = req.body;
    const updatedEducation = await Education.findByIdAndUpdate(
      EduId,
      {
        universityId,
        facultyName,
        degree,
        graduationYear,
        location,
        grade,
      },
      {
        new: true,
        omitUndefined: true,
      }
    );
    res.json({ updatedEducation });
  }
);
//----------------------get educations by volunteer id------------------------------------//
router.get("/getEdu/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const educations = await Volunteer.findById(id);
    const volunteerEduction = educations.educations;
    console.log("edu", volunteerEduction);
    res.status(200).json(volunteerEduction);
    // var myEducations=[];
    // for(var i=0; i<volunteerEduction.length;i++){
    //  var x = volunteerEduction[i];
    // //  console.log(x)
    //  const newEdu=await Education.findById(x);
    //  myEducation=myEducations.push(newEdu)
    //  console.log("newEdu",newEdu)
    //  }
    //  console.log(myEducations)
  } catch (err) {
    statusCode = 400;
    next(err);
  }
});
//--------------------------------get education dy education id------------------------------------------------//
router.get("/getEduById/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const educations = await Education.findById(id);
    // const volunteerEduction=educations.educations;
    console.log("edu", educations);
    res.status(200).json(educations);
  } catch (err) {
    statusCode = 400;
    next(err);
  }
});
///--------------------------------------------------------------------------------------------------------///////
//////////////////////////////////////////////DELETE EDUCATION//////////////////////////
// router.delete("/:id", async (req, res, next) => {
//   const id = req.params.id;
//   const deleted = await Education.findByIdAndRemove(id);
//   const educationsAfterDel = await Education.find();
//   await res.json({ deleted });
//   // res.json({message : "delete education"});
// });

//////////////////////////////////delete education  ///////////////////////////
router.delete(
  "/deleteEdu/:id",
  authenticationMiddleware,
  // ownerAuthorization,
  async (req, res) => {
    const { id } = req.params;
    const educationToDelete = await Education.findByIdAndDelete(id);
    console.log("deleted from db ");
    res.status(200).json(educationToDelete);
  }
);
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
router.delete(
  "/delete_skill/:volunteerId/:SkillId",
  authenticationMiddleware,
  async (req, res, next) => {
    const {   volunteerId, SkillId } = req.params;
    const volunteer = await Volunteer.findById(volunteerId);
    console.log("delete from vol", volunteer);
    const skillDelete = await Skill.findByIdAndDelete(SkillId);

    const skillFilter = volunteer.skills.filter((skil) => skil.id != SkillId);
    // console.log("delete from edu", EduId);
    res.status(200).json(skillFilter);
  }
);

///////////////////////////////////
//////////////////////////Add skill hereee//////////////////////////
router.post("/addSkill", authenticationMiddleware, async (req, res) => {
  const { volunteerId, skillName } = req.body;
  const newSkill = new Skill({
    volunteerId,
    skillName,
  });
  let volunteer = await Volunteer.findByIdAndUpdate(volunteerId, {
    $push: { skills: newSkill },
  });
  console.log("pushed", volunteer);
  await newSkill.save();
  res.json({
    newSkill,
  });
});
module.exports = router;

////---------------Edite Skill--------------////
router.patch(
  "/editSkill/:skillId",
  authenticationMiddleware,
  // ownerAuthorization,
  async (req, res, next) => {
    const { skillId } = req.params;
    const { skillName } = req.body;
    const updatedSkill = await Skill.findByIdAndUpdate(
      skillId,
      {
        skillName,
      },
      {
        new: true,
        omitUndefined: true,
      }
    );
    res.status(200).json({
      message: "skill Edited Succssefully",
      updatedSkill,
    });
    console.error(" can't edite skill");
    next();
  }
);

////------------------Delete Skill----------------////
// router.delete(
//   "/deleteSkill/:id",
//   authenticationMiddleware,
//   // ownerAuthorization,
//   async (req, res) => {
//     const { id } = req.params;
//     const skillToDelete = await Skill.findByIdAndDelete(id);
//     res.status(200).json(skillToDelete);
//   }
// );
/////------------------end Skill-----------------//////

// router.delete('/:productId',(req,res,next)=>{
//   Product.findById(req.params.productId , (err , product)=>{
//       if(err) return next(createError(400,err));
//       product.remove(product,(err)=>{
//           if(err) return next(createError(400,err));
//       });
//       res.send(product);
//   })
// })

//----------------------get skill by volunteer id------------------------------------//
router.get(
  "/getUserSkills/:id",
  authenticationMiddleware,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const sills = await Volunteer.findById(id);
      const volunteerSkills = sills.skills;
      const dataArrSkills = [];

      for (i = 0; i < volunteerSkills.length; i++) {
        const skill = await Skill.findById(volunteerSkills[i]);
        dataArrSkills.push(skill);
      }
      res.status(200).json(dataArrSkills);
    } catch (err) {
      statusCode = 400;
      next(err);
    }
  }
);

//--------------------------------get skill by id------------------------------------------------//
router.get("/getSkillById/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const skills = await Skill.findById(id);
    // const volunteerEduction=educations.educations;
    console.log("skil", skills);
    res.status(200).json(skills);
  } catch (err) {
    statusCode = 400;
    next(err);
  }
});

///--------------------------------------------------------------------------------------------------------///////
