import express from "express";
import { Router } from "express";
import Employment from "../models/Employment.js";

const router = express.Router();
// helper: require login (session-based)
function requireAuth(req, res, next) {
  const u = req.session?.passport?.user;
  if (!u?.id) return res.status(401).json({ error: { message: "Login required" } });
  req.userId = u.id;
  next();
}

// GET /api/employment/list  → reverse-chronological
router.get("/list", requireAuth, async (req, res) => {
  const items = await Employment.find({ userId: req.userId }).lean();
  items.sort((a, b) => {
    // current first, then by endDate (desc), then startDate (desc)
    const Aend = a.current ? "9999-12-31" : (a.endDate || "0000-00-00");
    const Bend = b.current ? "9999-12-31" : (b.endDate || "0000-00-00");
    if (Aend !== Bend) return Bend.localeCompare(Aend);
    return (b.startDate || "").localeCompare(a.startDate || "");
  });
  res.json({ entries: items });
});

// PUT /api/employment/:id  → update one
router.put("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { title, company, location, startDate, endDate, current, description } = req.body || {};

  // minimal validation
  if (!title?.trim() || !company?.trim() || !startDate?.trim()) {
    return res.status(400).json({ error: { message: "Missing required fields" } });
  }
  // if current == true, force endDate = null
  const payload = {
    title: title.trim(),
    company: company.trim(),
    location: (location || "").trim(),
    startDate: startDate.trim(),
    endDate: current ? null : (endDate || null),
    current: !!current,
    description: (description || "").trim(),
  };

  const updated = await Employment.findOneAndUpdate(
    { _id: id, userId: req.userId },
    { $set: payload },
    { new: true }
  ).lean();

  if (!updated) return res.status(404).json({ error: { message: "Not found" } });
  res.json({ entry: updated });
});

// (Optional) POST create – handy for seeding
router.post("/", requireAuth, async (req, res) => {
  const body = req.body || {};
  if (!body.title || !body.company || !body.startDate) {
    return res.status(400).json({ error: { message: "Missing required fields" } });
  }
  if (body.current) body.endDate = null;
  const created = await Employment.create({ ...body, userId: req.userId });
  res.status(201).json({ entry: created });
});


// DELETE /api/employment/:id → permanente, con guarda de "solo-una"
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // ¿cuántas entradas tiene este usuario?
    const total = await Employment.countDocuments({ userId: req.userId });
    if (total <= 1) {
      return res.status(400).json({
        error: { message: "No delete option if only one entry exists" },
        code: "ONLY_ONE_ENTRY_LEFT",
      });
    }

    // borrar solo si pertenece al usuario
    const deleted = await Employment.findOneAndDelete({ _id: id, userId: req.userId }).lean();
    if (!deleted) return res.status(404).json({ error: { message: "Not found" } });

    return res.json({ ok: true, deletedId: id });
  } catch (err) {
    console.error("DELETE /api/employment/:id", err);
    return res.status(500).json({ error: { message: "Server error" } });
  }
});

// ⬇️ IMPORTANTE: default export para que el import en index.js funcione
export default router;
