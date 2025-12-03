import * as guideService from "../services/guides.service.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { verifyToken } from "../utils/jwt.js";

export async function getGuide(req, res) {
  try {
    const guideId = req.params.id;
    const guide = await guideService.getGuide(guideId);

    if (!guide) {
      return res.status(404).json({ error: "Guide not found" });
    }

    res.status(200).json(guide);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getAllPublicGuides(req, res) {
  try {
    let currentUserId = null;
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token) {
      const user = verifyToken(token);
      if (user) currentUserId = user.id;
    }

    const guides = await guideService.getAllPublicGuides(currentUserId);
    res.status(200).json(guides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function searchGuides(req, res) {
  try {
    const { country } = req.query;
    if (!country) {
      return res.status(400).json({ error: "Country parameter is required" });
    }

    let currentUserId = null;
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token) {
      const user = verifyToken(token);
      if (user) currentUserId = user.id;
    }

    const guides = await guideService.getGuidesByCountry(country, currentUserId);
    res.status(200).json(guides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateGuide(req, res) {
  try {
    const guideId = req.params.id;

    // 🛑 Only the guide who owns this profile can update it
    if (req.user.id != guideId) {
      return res.status(403).json({ error: "Forbidden: You cannot update another guide." });
    }

    const updated = await guideService.updateGuide(guideId, req.body);

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ------------------------------
// MULTER SETUP FOR FILE UPLOADS
// ------------------------------



// Configure multer to store uploaded photos on disk
const storage = multer.diskStorage({

  // ---------------------------
  // 1. Destination folder setup
  // ---------------------------
  destination: function (req, file, cb) {
    // Folder where images will be saved
    const dir = "Public/guideImages";

    // Check if folder exists; if not, create it
    if (!fs.existsSync(dir)) {
      // recursive:true → creates parent folders if necessary
      fs.mkdirSync(dir, { recursive: true });
    }

    // Tell multer to store files in this folder
    cb(null, dir);
  },

  // ---------------------------
  // 2. Filename formatting
  // ---------------------------
  filename: function (req, file, cb) {
    // Create a unique suffix for filenames:
    //    current timestamp + random large number
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    // File extension of the uploaded file (.jpg, .png, etc.)
    const extension = path.extname(file.originalname);

    // Final filename format:
    //     <guideId>-<uniqueSuffix><extension>
    // Example:
    //     15-1712345678-918273645.png
    const finalFileName =
      req.params.id + "-" + uniqueSuffix + extension;

    // Pass filename to multer
    cb(null, finalFileName);
  }
});

// Multer middleware that accepts ONE file named "photo"
const upload = multer({ storage: storage }).single("photo");


// --------------------------------------
// CONTROLLER: Handle photo upload request
// --------------------------------------
export const uploadPhoto = (req, res) => {

  // Run the multer upload process
  upload(req, res, async function (err) {

    // Handle multer-specific errors (e.g. limits)
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ error: err.message });
    }

    // Handle any other upload errors
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // If no file was uploaded at all
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // The guide ID comes from the URL: /guides/:id/photo
      const guideId = req.params.id;

      
      // 🔒 Prevent uploading for someone else's guide
      if (req.user.id != guideId) {
        return res.status(403).json({ error: "Forbidden: You cannot upload for another guide." });
      }
      
      // Build the URL where the image will be publicly accessible.
      // Since Express typically serves /public as a static folder, this URL can be used in the frontend.
      const imgUrl = `http://localhost:3000/public/guideImages/${req.file.filename}`;

      // Save the image URL in database under the guide's record
      await guideService.updateGuide(guideId, { img_url: imgUrl });

      // Respond to client with the URL of the newly uploaded image
      res.status(200).json({ img_url: imgUrl });

    } catch (dbErr) {
      // Handle database update errors
      res.status(500).json({ error: dbErr.message });
    }
  });
};

// --------------------------------------
// CONTROLLER: Toggle Favorite
// --------------------------------------
export async function toggleFavorite(req, res) {
  try {
    const userId = req.user.id;
    const guideId = req.params.id;

    // Check if already favorite
    const isFavorite = await guideService.checkFavorite(userId, guideId);

    if (isFavorite) {
      await guideService.removeFavorite(userId, guideId);
      res.status(200).json({ is_favorite: false, message: "Removed from favorites" });
    } else {
      await guideService.addFavorite(userId, guideId);
      res.status(200).json({ is_favorite: true, message: "Added to favorites" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

