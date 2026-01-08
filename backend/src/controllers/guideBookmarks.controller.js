import * as guideBookmarksService from "../services/guideBookmarks.service.js";

export async function toggleBookmark(req, res) {
  try {
    const guideId = req.user.id;
    const { requestId } = req.params;

    if (!requestId) {
      return res.status(400).json({ error: "Request ID is required" });
    }

    const result = await guideBookmarksService.toggleBookmark(guideId, requestId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getBookmarks(req, res) {
  try {
    const guideId = req.user.id;
    const bookmarks = await guideBookmarksService.getBookmarks(guideId);
    res.status(200).json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
