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
