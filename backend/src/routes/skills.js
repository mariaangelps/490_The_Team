import { Router } from "express";
import Skill, { PROFICIENCIES_LIST, CATEGORIES_LIST } from "../models/Skill.js";

// Si ya tienes un middleware de auth tipo ensureAuth, impórtalo.
// Si no, este fallback asume req.user._id cargado por tu sesión/passport.
const ensureAuth = (req, res, next) => {
  if (req.user?._id) return next();
  return res.status(401).json({ error: "Unauthorized" });
};

const router = Router();

// GET /api/skills/list
router.get("/list", ensureAuth, async (req, res) => {
  const skills = await Skill.find({ userId: req.user._id }).sort({ category: 1, name: 1 });
  res.json({ entries: skills });
});

// POST /api/skills
router.post("/", ensureAuth, async (req, res) => {
  try {
    const { name, category, proficiency } = req.body || {};
    if (!name || !category || !proficiency) {
      return res.status(400).json({ error: "Missing fields" });
    }
    if (!CATEGORIES_LIST.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }
    if (!PROFICIENCIES_LIST.includes(proficiency)) {
      return res.status(400).json({ error: "Invalid proficiency" });
    }

    const doc = await Skill.create({
      userId: req.user._id,
      name: String(name).trim(),
      category,
      proficiency,
    });
    res.status(201).json({ entry: doc });
  } catch (e) {
    // error por índice único (duplicado)
    if (e?.code === 11000) {
      return res.status(409).json({ error: "Duplicate skill for this category" });
    }
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/skills/:id  (editar nivel o nombre/categoría si quieres)
router.put("/:id", ensureAuth, async (req, res) => {
  try {
    const { name, category, proficiency } = req.body || {};
    const update = {};
    if (name != null) update.name = String(name).trim();
    if (category != null) {
      if (!CATEGORIES_LIST.includes(category)) {
        return res.status(400).json({ error: "Invalid category" });
      }
      update.category = category;
    }
    if (proficiency != null) {
      if (!PROFICIENCIES_LIST.includes(proficiency)) {
        return res.status(400).json({ error: "Invalid proficiency" });
      }
      update.proficiency = proficiency;
    }

    const doc = await Skill.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: update },
      { new: true, runValidators: true, context: "query" }
    ).collation({ locale: "en", strength: 2 }); // respeta índice case-insensitive
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ entry: doc });
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(409).json({ error: "Duplicate skill for this category" });
    }
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/skills/:id
router.delete("/:id", ensureAuth, async (req, res) => {
  const r = await Skill.deleteOne({ _id: req.params.id, userId: req.user._id });
  if (!r.deletedCount) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

// Autocomplete simple: estático y/o filtrable por q
const COMMON_SKILLS = [
  // Technical
  "JavaScript","TypeScript","React","Node.js","Express","MongoDB","SQL","Python","Django","Flask","Java",
  "C++","C","Git","Docker","Kubernetes","AWS","GCP","Azure","Linux","TensorFlow","PyTorch",
  // Soft
  "Communication","Teamwork","Leadership","Problem Solving","Time Management","Adaptability",
  // Languages
  "English","Spanish","French","German","Portuguese","Italian","Mandarin","Arabic",
  // Industry
  "Accounting","Project Management","Salesforce","Figma","AutoCAD","SolidWorks","Data Analysis"
];

// GET /api/skills/suggest?q=rea
router.get("/suggest", ensureAuth, (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const matches = COMMON_SKILLS
    .filter(s => s.toLowerCase().includes(q))
    .slice(0, 15);
  res.json({ suggestions: matches });
});

export default router;
