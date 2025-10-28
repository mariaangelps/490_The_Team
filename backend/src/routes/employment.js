import { Router } from "express";
const router = Router();

router.post("/add", (req, res) => {
  const { title, company, startDate, endDate, current, description, location } = req.body || {};

  if (!title || !company || !startDate) {
    return res.status(400).json({ ok: false, error: "Missing required fields" });
  }

  if (!current && !endDate) {
    return res.status(400).json({ ok: false, error: "End date required unless current" });
  }

  return res.status(200).json({
    ok: true,
    entry: { title, company, startDate, endDate: current ? null : endDate, current, description, location },
  });
});

export default router;
