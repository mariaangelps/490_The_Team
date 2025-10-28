// backend/src/routes/profile.js
import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

// --- auth guard mínimo ---
function requireLogin(req, _res, next) {
  // Si usas passport:
  const uid = req.session?.passport?.user?.id || req.user?._id;
  if (!uid) return next(new Error("LOGIN_REQUIRED"));
  req.userId = uid;
  next();
}

// --- modelo Profile ---
const Profile =
  mongoose.models.Profile ||
  mongoose.model(
    "Profile",
    new mongoose.Schema(
      {
        userId: { type: mongoose.Schema.Types.ObjectId, index: true, unique: true },
        fullName: String,
        email: String,
        phone: String,
        city: String,
        state: String,
        headline: String,
        bio: String,
        industry: String,
        level: String, // Entry | Mid | Senior | Executive
      },
      { timestamps: true }
    )
  );

// Guardar / actualizar (upsert)
router.put("/basic", requireLogin, async (req, res) => {
  try {
    const data = req.body || {};
    const doc = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { $set: data },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({ ok: true, profile: doc });
  } catch (e) {
    console.error("PROFILE_SAVE_ERROR", e);
    res.status(500).json({ ok: false, error: "SAVE_FAILED" });
  }
});

// Obtener (para prellenar si quieres)
router.get("/basic", requireLogin, async (req, res) => {
  const doc = await Profile.findOne({ userId: req.userId }).lean();
  res.json({ ok: true, profile: doc || null });
});

export default router;