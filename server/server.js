require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const session = require("express-session");
const { doubleCsrf } = require("csrf-csrf");

require("./passportConfig")(passport);

const isProduction = process.env.NODE_ENV === "production";

const corsOptions = {
  origin: isProduction ? "https://dropnotes.site" : "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Csrf-Token"],
  credentials: true,
};

const server = express();

server.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "script-src": ["'self'", "https://www.googletagmanager.com"],
      "connect-src": ["'self'", "https://www.google-analytics.com"],
      "default-src": ["'self'"],
      "img-src": ["'self'", "data:"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "media-src": ["'self'", "blob:"],
    },
  })
);

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cors(corsOptions));
server.use(cookieParser(process.env.CSRF_SECRET));
server.use(morgan("combined"));

const { doubleCsrfProtection, invalidCsrfTokenError } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
  cookieName: "csrf-token",
  cookieOptions: {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getTokenFromRequest: (req) => req.headers["x-csrf-token"],
});

server.use(doubleCsrfProtection);

server.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
    },
  })
);

server.use(passport.initialize());
server.use(passport.session());

server.use((err, req, res, next) => {
  if (err === invalidCsrfTokenError) {
    console.error("Invalid CSRF token:", req.headers["x-csrf-token"]);
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
  next();
});

server.use("/api/auth", doubleCsrfProtection, require("./routes/auth.routes"));
server.use("/api/notes", doubleCsrfProtection, require("./routes/note.routes"));

server.use(express.static(path.join(__dirname, "public")));
server.get("/*", (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "index.html"));
});

const { PORT = 8000, MONGO_URI } = process.env;

const start = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected successfully");
    server.listen(PORT, () => console.log(`App started on port ${PORT}...`));
  } catch (e) {
    console.error("Server error:", e.message);
    process.exit(1);
  }
};

start();

module.exports = {
  isProduction,
};
