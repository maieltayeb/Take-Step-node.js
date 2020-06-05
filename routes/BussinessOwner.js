const BusinessOwner = require("../models/businessOwner");
const express = require("express");
const authenticationMiddleware = require("../middlewares/authentication");
const validationMiddleWare = require("../middlewares/validationMiddleware");
require("express-async-errors");
const router = express.Router();
const { check } = require("express-validator");

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
router.get("/:id", authenticationMiddleware, async (req, res, next) => {
  const { id } = req.params;
  //const users=await User.find();
  const user = await BusinessOwner.findById(id).populate("country");
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
          companyName
        }
      },
      {
        new: true,
        runValidators: true,
        omitUndefined: true
      }
    );
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

    await user.save();
    res.json(user);
  }
);

////------------------------------login-----------------------//
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

module.exports = router;
