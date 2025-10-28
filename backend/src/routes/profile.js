import { Router } from "express";

const router = Router();

// POST /api/profile/basic
router.post("/basic", (req, res) => {
  const { fullName, email, phone, city, state, headline, bio, industry, experience } = req.body || {};

  // Validaciones mínimas
  if (!fullName || !email || !industry || !experience) {
    return res.status(400).json({ ok: false, error: "Missing required fields" });
  }
  if ((bio || "").length > 500) {
    return res.status(400).json({ ok: false, error: "Bio too long" });
  }

  console.log("📩 Perfil recibido:", { fullName, email, phone, city, state, headline, bio, industry, experience });

  // Simulación de guardado OK
  return res.status(200).json({
    ok: true,
    profile: { fullName, email, phone, city, state, headline, bio, industry, experience },
  });
});

export default router;   // 👈 IMPORTANTE: export default
