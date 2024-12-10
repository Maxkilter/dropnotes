const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const { isProduction } = require("../server");

const router = express.Router();

router.post(
  "/register",
  [
    check("email", "Enter a valid email").isEmail(),
    check("password", "Password must be at least six characters long").isLength(
      { min: 6 }
    ),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Incorrect registration data",
        });
      }

      const { firstName, lastName, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });

      await newUser.save();

      const token = jwt.sign(
        { userId: newUser.id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "24h",
        }
      );

      res.cookie("jwtToken", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "Strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      return res.status(201).json({
        message: "User registered successfully",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error occurred during registration", error });
    }
  }
);

router.get("/csrf-token", (req, res) => {
  try {
    return res.status(200).json({ csrfToken: req.csrfToken() });
  } catch (e) {
    console.error("Error generating CSRF token:", e);
    return res.status(403).json({ message: "Failed to generate CSRF token" });
  }
});

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
        return res
          .status(400)
          .json({ errors: errors.array(), message: "Incorrect login data" });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Incorrect password or email" });
      }
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect password or email" });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "24h",
      });

      res.cookie("jwtToken", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "Strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      return res
        .status(200)
        .json({ message: "Logged in successfully", status: "authenticated" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error occurred during login", error });
    }
  }
);

router.post("/logout", (req, res) => {
  if (!req.cookies.jwtToken) {
    return res.status(400).json({ message: "No active session found" });
  }

  try {
    res.clearCookie("jwtToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
    });

    res.clearCookie("csrf-token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
    });

    return res
      .status(200)
      .json({ message: "Logged out successfully", status: "loggedOut" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error occurred during logout", error });
  }
});

module.exports = router;
