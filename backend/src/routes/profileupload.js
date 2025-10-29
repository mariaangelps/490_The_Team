import express from "express";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

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
    const userId = req.user.id;
    const filename = `${userId}_avatar.png`;
    const filepath = path.join("uploads", filename);
    await sharp(req.file.buffer).resize(256, 256).png().toFile(filepath);
    res.json({ url: `/uploads/${filename}` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/upload", (req, res) => {
  const filepath = path.join("uploads", `${req.user.id}_avatar.png`);
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  res.json({ message: "Avatar removed" });
});

export default router;
