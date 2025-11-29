import * as guideService from "../services/guides.service.js";

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

export async function updateGuide(req, res) {
  try {
    const guideId = req.params.id;
    const updated = await guideService.updateGuide(guideId, req.body);

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Multer setup
import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "Public/guideImages";
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Use guide ID + timestamp + extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.params.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage }).single('photo');

export const uploadPhoto = (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const guideId = req.params.id;
      // Construct URL (assuming server runs on localhost:3000)
      // We store the relative path or full URL. 
      // User said: "backend should send the path of the image to the db"
      // And "when I need the image I should call my already existing guide route"
      // Let's store the full URL or relative path that can be used directly in src.
      // Since we serve /public, the URL is http://localhost:3000/public/guideImages/filename
      
      const imgUrl = `http://localhost:3000/public/guideImages/${req.file.filename}`;

      await guideService.updateGuide(guideId, { img_url: imgUrl });

      res.status(200).json({ img_url: imgUrl });
    } catch (dbErr) {
      res.status(500).json({ error: dbErr.message });
    }
  });
};
