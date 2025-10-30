// backend/src/routes/education.js
import express from "express";
import Education from "../models/Education.js";

const router = express.Router(); // 👈 ESTO CREA 'router'

// helper auth (igual que empleo)
function requireAuth(req, res, next) {
  const u = req.session?.passport?.user;
  if (!u?.id) return res.status(401).json({ error: { message: "Login required" } });
  req.userId = u.id;
  next();
}

// Validación básica
function validateEducation(body) {
  const errors = [];
  const reqd = ["institution", "degreeType", "fieldOfStudy", "level"];
  for (const k of reqd) if (!String(body[k] || "").trim()) errors.push(`${k} is required`);

  if (body.currentlyEnrolled !== true) {
    if (!String(body.graduationDate || "").trim())
      errors.push("graduationDate is required when not currently enrolled");
  }
  if (body.gpa != null && body.gpa !== "") {
    const g = Number(body.gpa);
    if (Number.isNaN(g) || g < 0 || g > 5) errors.push("gpa must be a number between 0 and 5");
  }
  return errors;
}

function sortEntries(list) {
  return list.sort((a, b) => {
    const Aend = a.currentlyEnrolled ? "9999-12" : (a.graduationDate || "0000-00");
    const Bend = b.currentlyEnrolled ? "9999-12" : (b.graduationDate || "0000-00");
    if (Aend !== Bend) return Bend.localeCompare(Aend);
    const Astart = a.startDate || "0000-00";
    const Bstart = b.startDate || "0000-00";
    return Bstart.localeCompare(Astart);
  });
}

// GET /api/education/list
router.get("/list", requireAuth, async (req, res) => {
  const docs = await Education.find({ userId: req.userId }).lean();
  const entries = sortEntries(docs).map((e) => ({
    id: String(e._id),
    institution: e.institution,
    degreeType: e.degreeType,
    fieldOfStudy: e.fieldOfStudy,
    level: e.level,
    startDate: e.startDate || "",
    graduationDate: e.graduationDate || "",
    currentlyEnrolled: !!e.currentlyEnrolled,
    gpa: e.gpa ?? null,
    gpaPrivate: !!e.gpaPrivate,
    honors: e.honors || "",
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  }));
  res.json({ entries });
});

// POST /api/education
router.post("/", requireAuth, async (req, res) => {
  const errors = validateEducation(req.body || {});
  if (errors.length) return res.status(400).json({ error: { message: errors.join("; ") } });
  const doc = await Education.create({ ...req.body, userId: req.userId });
  res.status(201).json({ id: String(doc._id) });
});

// PUT /api/education/:id
router.put("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const errors = validateEducation(req.body || {});
  if (errors.length) return res.status(400).json({ error: { message: errors.join("; ") } });
  const updated = await Education.findOneAndUpdate({ _id: id, userId: req.userId }, req.body, { new: true });
  if (!updated) return res.status(404).json({ error: { message: "Education not found" } });
  res.json({ ok: true });
});

// DELETE /api/education/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const del = await Education.findOneAndDelete({ _id: id, userId: req.userId });
  if (!del) return res.status(404).json({ error: { message: "Education not found" } });
  res.json({ ok: true });
});

export default router; // 👈 EXPORTA EL ROUTER
