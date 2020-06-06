const Volunteer = require("../models/Volunteer");
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
      description
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
          description
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
    const { firstName, lastName, password, country, email } = req.body;
    const user = new Volunteer({
      firstName,
      lastName,
      password,
      country,
      email
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

module.exports = router;
