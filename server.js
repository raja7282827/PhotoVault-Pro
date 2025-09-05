const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,   // <-- hardcoded ki jagah env se le
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Render free plan ke liye false
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);


// static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connect with DotEnv
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB Atlas connected"))
  .catch((err) => console.error(" MongoDB error:", err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/photos", require("./routes/photos"));

// Start server
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
