// backend/src/routes/skills.js  (ESM)
import express from "express";
import { Skill, PROFICIENCIES, CATEGORIES } from "../models/Skill.js";
import { ensureAuthed } from "../middleware/auth.js"; // <— usar el real

const router = express.Router();

// Listar skills del usuario
router.get("/", ensureAuthed, async (req, res) => {
  const skills = await Skill.find({ user: req.user._id })
    .sort({ category: 1, normalizedName: 1 })
    .lean();
  res.json({ skills, meta: { proficiencies: PROFICIENCIES, categories: CATEGORIES } });
});

// Crear skill
router.post("/", ensureAuthed, async (req, res) => {
  try {
    const { name, category, proficiency } = req.body || {};
    if (!name || !category || !proficiency) {
      return res.status(400).json({ error: "name, category, and proficiency are required" });
    }
    if (!CATEGORIES.includes(category)) return res.status(400).json({ error: "Invalid category" });
    if (!PROFICIENCIES.includes(proficiency)) return res.status(400).json({ error: "Invalid proficiency" });

    const skill = await Skill.create({
      user: req.user._id,
      name: String(name).trim(),
      category,
      proficiency,
    });
    res.status(201).json({ skill });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: "Duplicate skill for this user" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Actualizar proficiency/categoría
router.put("/:id", ensureAuthed, async (req, res) => {
  const { proficiency, category } = req.body || {};
  const update = {};
  if (proficiency) {
    if (!PROFICIENCIES.includes(proficiency)) return res.status(400).json({ error: "Invalid proficiency" });
    update.proficiency = proficiency;
  }
  if (category) {
    if (!CATEGORIES.includes(category)) return res.status(400).json({ error: "Invalid category" });
    update.category = category;
  }
  const skill = await Skill.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: update },
    { new: true }
  ).lean();
  if (!skill) return res.status(404).json({ error: "Not found" });
  res.json({ skill });
});

// Eliminar skill
router.delete("/:id", ensureAuthed, async (req, res) => {
  const r = await Skill.deleteOne({ _id: req.params.id, user: req.user._id });
  if (!r.deletedCount) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

export default router;
