import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "./passport.js";               // <-- OK

dotenv.config();

const app = express();

// core middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// session
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || "mongodb://localhost:27017/projectdb",
    }),
  })
);

// db
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/projectdb")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// passport
app.use(passport.initialize());
app.use(passport.session());

// routes (IMPORTA BIEN Y MONTA CON NOMBRES CONSISTENTES)
import authRoutes from "./routes/auth.js";
import employmentRoutes from "./routes/employment.js";  // <-- CORRECTO

app.use("/api/auth", authRoutes);
app.use("/api/employment", employmentRoutes);          // <-- CORRECTO

// healthcheck
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
