const express = require("express");
const router = express.Router();
const axios = require("axios");
const cloudinary = require("../config/cloudinary");
const upload = require("../config/multer");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const fileModel = require("../models/files");
const User = require("../models/user"); 
const authMiddleware = require("../middlewares/auth");

dotenv.config();

// ✅ Fixed /home Route
router.get("/home", authMiddleware, async (req, res) => {
    try {
        // Fetch user files
        const userFiles = await fileModel.find({ email: req.user.email });
        console.log(userFiles);

        res.render("home", { files : userFiles });  // Pass files to frontend
    } catch (error) {
        res.status(500).send("Server Error");
    }
});

// ✅ Fixed /upload Route
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Verify user from JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const foundUser = await User.findOne({ email: decoded.email });
        if (!foundUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Upload file to Cloudinary
        cloudinary.uploader.upload_stream({ resource_type: "auto" }, async (error, result) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            console.log("Cloudinary upload result:", result); 
            // Save file details
            const file = new fileModel({
                email: foundUser.email,
                username: foundUser.username,
                file_url: result.secure_url,
            });

            await file.save();
            res.redirect("/home");
        }).end(req.file.buffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/download", authMiddleware, async (req, res) => {
  try {
      const loggedInUser = req.user.email;
      const fileUrl = req.query.url; // Get file URL from query params

      if (!fileUrl) {
          return res.status(400).json({ error: "File URL is required" });
      }

      const file = await fileModel.findOne({ file_url: fileUrl, email: loggedInUser });

      if (!file) {
          return res.status(404).json({ error: "File not found" });
      }

      // Fetch the file from the URL
      const response = await axios({
          url: file.file_url,
          method: "GET",
          responseType: "stream",
      });

      // Set headers to force download
      res.setHeader("Content-Disposition", `attachment; filename="downloaded_image.png"`);
      res.setHeader("Content-Type", response.headers["content-type"]);

      // Pipe the file data to response
      response.data.pipe(res);
  } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ error: "Failed to download file" });
  }
});



module.exports = router;
