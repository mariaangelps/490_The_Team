import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "./passport.js"; // ✅ Make sure this file exists and sets up GoogleStrategy
import educationRoutes from "./routes/education.js";
import profileRoutes from "./routes/profile.js";


//import { connectDB, wireDBSignals } from "./db.js"; // ✅ conexión modular


// ========== LOAD ENV VARS ==========
dotenv.config();

const app = express();
console.log('GOOGLE_CALLBACK =', process.env.GOOGLE_CALLBACK);
console.log('GOOGLE_CLIENT_ID (prefix) =', process.env.GOOGLE_CLIENT_ID?.slice(0,12));


// ========== MIDDLEWARES ==========
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ========== SESSION SETUP ==========
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // use true if deploying with HTTPS
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || "mongodb://localhost:27017/projectdb",
    }),
  })
);

// database connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/projectdb")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// passport setup
import passport from "./passport.js";
app.use(passport.initialize());
app.use(passport.session());

// ========== ROUTES ==========
import authRoutes from "./routes/auth.js";
import profileUploadRoutes from "./routes/profileupload.js";
import userRouter from "./routes/user.js";

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileUploadRoutes);
app.use("/api/users", userRouter);
import userRouter from "./routes/user.js";
import employmentRoutes from "./routes/employment.js";
import skillsRouter from "./routes/skills.js";

app.use("/api/auth", authRoutes);
app.use("/api/users", userRouter);
app.use("/api/employment", employmentRoutes);
app.use("/api/skills", skillsRouter);
app.use("/api/education", educationRoutes);
app.use("/api/profile", profileRoutes);



// ========== TEST ROUTE ==========
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
