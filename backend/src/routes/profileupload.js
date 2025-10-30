import express from "express";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import User from "../models/User.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Invalid file type"));
    cb(null, true);
  },
});

router.post("/upload", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Login required" });
    const userId = req.user.id;
    const filename = `${userId}_avatar.png`;
    const dir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filepath = path.join(dir, filename);
    await sharp(req.file.buffer).resize(256, 256).png().toFile(filepath);
    // Optionally save picture URL to user
    await User.findByIdAndUpdate(userId, { picture: `/uploads/${filename}` });
    res.json({ url: `/uploads/${filename}` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/upload", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Login required" });
  const filepath = path.join(process.cwd(), "uploads", `${req.user.id}_avatar.png`);
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  // remove picture from user record
  User.findByIdAndUpdate(req.user.id, { $unset: { picture: 1 } }).catch(() => {});
  res.json({ message: "Avatar removed" });
});

// Get profile by id (used by frontend)
router.get("/:id", async (req, res) => {
  try {
    const u = await User.findById(req.params.id).select("firstName lastName picture email");
    if (!u) return res.status(404).json({ error: "User not found" });
    res.json({ id: String(u._id), firstName: u.firstName, lastName: u.lastName, picture: u.picture, email: u.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
