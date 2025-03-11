const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const Image = require("./models/ImageModel"); // Import Image model
const authRoutes = require("./routes/auth"); // Import Auth routes

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ✅ Add Authentication Routes
app.use("/api/auth", authRoutes); // Now, `/signup` and `/login` will work

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ✅ Upload Route (Only stores image)
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const newImage = new Image({
      imageName: req.file.filename,
      imageUrl: `/uploads/${req.file.filename}`,
    });

    await newImage.save();
    res.json({ success: true, message: "Upload successful", data: newImage });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Get Description Route
app.get("/get-description", async (req, res) => {
  const { imageUrl } = req.query;

  try {
    const image = await Image.findOne({ imageUrl });

    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    // 🚀 Fetch description dynamically (Modify this part based on your AI model or external API)
    const generatedDescription = `This is an AI-generated description for the image: ${image.imageName}`;

    res.json({ success: true, description: generatedDescription });
  } catch (error) {
    console.error("Error retrieving description:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/Scene-Solver", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
