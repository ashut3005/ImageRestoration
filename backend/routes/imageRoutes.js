const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const imageController = require("../controllers/imageController");

// Multer setup
const storage = multer.diskStorage({
  destination: "static/uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage });

// Route
router.post("/upload", upload.single("image"), imageController.uploadAndProcessImage);

module.exports = router;
