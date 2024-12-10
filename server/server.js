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
const MongoDBStore = require("connect-mongodb-session")(session);
const { doubleCsrf } = require("csrf-csrf");
const fs = require("fs");
const http = require("http");
const http2 = require("http2");

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
  }),
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

const mongoStore = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

mongoStore.on("error", (error) => {
  console.error("Session store error:", error);
});

server.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoStore,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
    },
  }),
);

server.use(doubleCsrfProtection);

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

const { PORT = 8000, MONGO_URI, SSL_KEY, SSL_CERT } = process.env;

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected successfully");

    if (SSL_KEY && SSL_CERT) {
      const httpsServer = http2.createSecureServer(
        {
          key: fs.readFileSync(SSL_KEY),
          cert: fs.readFileSync(SSL_CERT),
          allowHTTP1: true,
        },
        server,
      );

      return httpsServer.listen(PORT, () => {
        console.log(`HTTP/2 server running on port ${PORT}`);
      });
    }

    const httpServer = http.createServer(server);
    httpServer.listen(PORT, () => {
      console.log(`HTTP server running on port ${PORT}`);
    });
  } catch (e) {
    console.error("Server error:", e.message);
    process.exit(1);
  }
};

startServer();
