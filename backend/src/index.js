// backend/src/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "./passport.js";
import { connectDB, wireDBSignals } from "./db.js"; // ✅ conexión modular

dotenv.config();

const app = express();

// ================================================
//  GLOBAL MIDDLEWARE
// ================================================
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Vite dev server
    credentials: true,
  })
);

// ================================================
//  DATABASE CONNECTION (Atlas / local)
// ================================================
(async () => {
  try {
    await connectDB();      // ✅ conecta mongoose usando tu db.js
    wireDBSignals();        // logs + manejo de SIGINT
  } catch (err) {
    console.error("❌ Could not connect to MongoDB:", err.message);
    process.exit(1);
  }
})();

// ================================================
//  SESSION + MONGO STORE
// ================================================
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,       // true en producción con HTTPS
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,   // ✅ usa Atlas desde .env
      ttl: 60 * 60 * 24 * 7,              // 7 días
    }),
  })
);

// ================================================
//  PASSPORT AUTH
// ================================================
app.use(passport.initialize());
app.use(passport.session());

// ================================================
//  ROUTES
// ================================================
import authRoutes from "./routes/auth.js";
import userRouter from "./routes/user.js";
import employmentRouter from "./routes/employment.js"; // ✅ UC-021 / 023 / 024 / 025

app.use("/api/auth", authRoutes);
app.use("/api/users", userRouter);
app.use("/api/employment", employmentRouter);

// TEST HEALTH ENDPOINT
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ================================================
//  START SERVER
// ================================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
