import express from "express";
import ProfileBasic from "../models/ProfileBasic.js";

const router = express.Router();

// igual que en tus otras rutas
function requireAuth(req, res, next) {
  const u = req.session?.passport?.user;
  if (!u?.id) return res.status(401).json({ error: { message: "Login required" } });
  req.userId = u.id;
  next();
}

// GET /api/profile/basic  → devuelve el perfil básico
router.get("/basic", requireAuth, async (req, res) => {
  const doc = await ProfileBasic.findOne({ userId: req.userId }).lean();
  res.json({ profile: doc || null });
});

// POST /api/profile/basic → crea/actualiza (upsert) el perfil
router.post("/basic", requireAuth, async (req, res) => {
  const {
    fullName, email, phone, city, state, headline, bio, industry, experience,
  } = req.body || {};

  // validaciones mínimas de backend
  if (!fullName?.trim() || !email?.trim() || !industry || !experience) {
    return res.status(400).json({ error: { message: "Missing required fields" } });
  }
  if (bio && bio.length > 500) {
    return res.status(400).json({ error: { message: "Bio too long (max 500)" } });
  }

  const payload = {
    fullName: fullName.trim(),
    email: email.trim(),
    phone: (phone || "").trim(),
    city: (city || "").trim(),
    state: (state || "").trim(),
    headline: (headline || "").trim(),
    bio: (bio || "").trim(),
    industry,
    experience,
  };

  const profile = await ProfileBasic.findOneAndUpdate(
    { userId: req.userId },
    { $set: payload, $setOnInsert: { userId: req.userId } },
    { new: true, upsert: true }
  ).lean();

  res.status(201).json({ profile });
});

export default router;
