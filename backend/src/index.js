import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "./passport.js"; 

// load env vars
dotenv.config();

const app = express();

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

// ========== PASSPORT AUTH ==========
app.use(passport.initialize());
app.use(passport.session());

// ========== ROUTES ==========
import authRoutes from "./routes/auth.js";
import profileUploadRoutes from "./routes/profileupload.js";

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileUploadRoutes);

// ========== TEST ROUTE ==========
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ========== DATABASE & SERVER START ==========
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/projectdb")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
