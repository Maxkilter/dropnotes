require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const app = express();
app.use(helmet());
app.use(cors(corsOptions));

app.use(express.json({ extended: true }));

app.use(morgan("combined"));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/notes", require("./routes/note.routes"));

app.use(express.static(path.join(__dirname, "public")));
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const { PORT = 8080, MONGO_URI } = process.env;

const start = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    app.listen(PORT, () =>
      console.log(`App has been started on port ${PORT}...`)
    );
  } catch (e) {
    console.log("Server error", e.message);
    process.exit(1);
  }
};

(async () => await start())();
