const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Photo = require("../models/Photo");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// ensure uploads folder exists
if (!fs.existsSync(path.join(__dirname, "../uploads"))) {
  
  fs.mkdirSync(path.join(__dirname, "../uploads"));
}

// Multer config to store file in uploads folder
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "uploads/"),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});
const upload = multer({ storage });

// Upload photo
router.post("/", requireAuth, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });

    const p = await Photo.create({
      uploader: req.session.userId,
      originalName: req.file.originalname,
      filename: req.file.filename,
      filepath: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    const populated = await p.populate({ path: "uploader", select: "username" });
    res.json(populated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Get all photos
router.get("/", async (_, res) => {
  const photos = await Photo.find({})
    .sort({ createdAt: -1 })
    .populate({ path: "uploader", select: "username" })
    .populate({ path: "comments.user", select: "username" });
  res.json(photos);
});

// Like/unlike one user can give one like 
router.post("/:id/like", requireAuth, async (req, res) => {
  const photo = await Photo.findById(req.params.id);
  if (!photo) return res.status(404).json({ error: "Not found" });

  const uid = req.session.userId;
  const idx = photo.likes.findIndex((u) => String(u) === String(uid));

  if (idx === -1) photo.likes.push(uid);
  else photo.likes.splice(idx, 1);

  await photo.save();
  res.json({ likes: photo.likes.length, liked: idx === -1 });
});

// Comment
router.post("/:id/comments", requireAuth, async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: "Empty comment" });

  const photo = await Photo.findById(req.params.id);
  if (!photo) return res.status(404).json({ error: "Not found" });

  photo.comments.push({ user: req.session.userId, text: text.trim() });
  await photo.save();

  const populated = await photo.populate({ path: "comments.user", select: "username" });
  res.json(populated.comments[populated.comments.length - 1]);
});

// Delete
router.delete("/:id", requireAuth, async (req, res) => {
  const photo = await Photo.findById(req.params.id);
  if (!photo) return res.status(404).json({ error: "Not found" });

  if (String(photo.uploader) !== String(req.session.userId)) {
    return res.status(403).json({ error: "Not allowed" });
  }

  if (photo.filepath && fs.existsSync(photo.filepath)) fs.unlinkSync(photo.filepath);
  await photo.deleteOne();
  res.json({ ok: true });
});

// Download
router.get("/:id/download", async (req, res) => {
  const photo = await Photo.findById(req.params.id);
  if (!photo) return res.status(404).send("Not found");
  if (!photo.filepath || !fs.existsSync(photo.filepath)) return res.status(404).send("File missing");

  res.download(photo.filepath, photo.originalName || photo.filename);
});

module.exports = router;
