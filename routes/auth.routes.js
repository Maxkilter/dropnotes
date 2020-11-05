const { Router } = require("express");
const router = Router();
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/User");

const errorMessage = "Something went wrong, please try more or try later :-(";

// /api/auth/
router.post(
  "/register",
  [
    check("email", "Email is not correct").isEmail(),
    check("password", "Password must be more than six symbols").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(400).json({
          status: 400,
          errors: errors.array(),
          message: "Incorrect registration data",
        });
      }

      const { firstName, lastName, email, password } = req.body;

      const candidate = await User.findOne({ email });

      if (candidate) {
        return res
          .status(400)
          .json({ status: 400, message: "User already exist" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });

      await user.save();

      res.status(201).json({ status: 201, message: "User created!" });
    } catch (e) {
      res.status(500).json({
        status: 500,
        message: errorMessage,
      });
    }
  }
);

router.post(
  "/login",
  [
    check("email", "Enter correct email").normalizeEmail().isEmail(),
    check("password", "Enter password").exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 400,
          errors: errors.array(),
          message: "Incorrect entrance data",
        });
      }
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({
          status: 400,
          message: "Your Email is not founded!",
        });
      }

      const isPasswordMatched = await bcrypt.compare(password, user.password);

      if (!isPasswordMatched) {
        return res.status(400).json({
          status: 400,
          message: "Your Password is not correct!",
        });
      }

      const token = jwt.sign({ userId: user.id }, config.jwtSecretKey, {
        expiresIn: "1h",
      });

      return res.json({ token, userId: user.id });
    } catch (e) {
      res.status(500).json({
        status: 500,
        message: errorMessage,
      });
    }
  }
);

module.exports = router;
