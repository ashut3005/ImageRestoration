const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const Image = require("../models/imageModel");

// Convert image to base64
const convertImageToBase64 = (filePath) => {
  const imageBuffer = fs.readFileSync(filePath);
  return imageBuffer.toString("base64");
};

exports.uploadAndProcessImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const inputPath = req.file.path;
  const fileName = path.basename(req.file.filename);
  const outputName = "cleaned_" + fileName;
  const outputPath = path.join("static/results", outputName);

  console.log("📥 File received:", inputPath);
  console.log("⚙️  Running Python model...");

  const python = spawn("python", [path.join(__dirname, "../run_model.py"), inputPath, outputPath]);

  python.stdout.on("data", (data) => console.log(`🐍 stdout: ${data}`));
  python.stderr.on("data", (data) => console.error(`🐍 stderr: ${data}`));

  python.on("close", async (code) => {
    console.log(`🐍 Python process exited with code ${code}`);

    if (code === 0) {
      const originalBase64 = convertImageToBase64(inputPath);
      const cleanedBase64 = convertImageToBase64(outputPath);

      const newImage = new Image({
        originalBuffer: Buffer.from(originalBase64, "base64"),
        cleanedBuffer: Buffer.from(cleanedBase64, "base64"),
        originalUrl: `/static/uploads/${fileName}`,
        cleanedUrl: `/static/results/${outputName}`,
      });

      try {
        await newImage.save();
        console.log("✅ Images saved to database");

        const latestImage = await Image.findOne().sort({ uploadedAt: -1 });

        res.json({
          success: true,
          images: latestImage ? [{
            originalUrl: latestImage.originalUrl,
            cleanedUrl: latestImage.cleanedUrl,
          }] : []
        });
      } catch (error) {
        console.error("❌ Error saving to DB:", error);
        res.status(500).json({ success: false, message: "Database error" });
      }
    } else {
      res.status(500).json({ success: false, message: "Python model failed" });
    }
  });
};
