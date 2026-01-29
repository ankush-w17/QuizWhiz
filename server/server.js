const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./db");
require("dotenv").config();
require("./config/passport"); 

const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");

const app = express();

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:3000",
  "https://quiz-whiz-sandy.vercel.app" // Add your production domains here
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If specific origin not allowed, check environment
        if (process.env.NODE_ENV !== 'production') {
           // In dev, you might want to be more lenient or just stick to localhost
           return callback(null, true); 
        }
        var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", quizRoutes); // /api prefix for quiz routes to match old structure partly

// Test endpoint
app.get("/", (req, res) => {
  res.json({ message: "Server is running (Restructured Version)" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
