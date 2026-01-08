import db from "../config/database.js";

export async function toggleBookmark(guideId, requestId) {
  // Check if bookmark exists
  const checkValues = [guideId, requestId];
  const checkQuery = `
    SELECT * FROM guide_bookmarks_request 
    WHERE guide_id = $1 AND request_id = $2
  `;
  const result = await db.query(checkQuery, checkValues);

  if (result.rows.length > 0) {
    // Delete it
    const deleteQuery = `
      DELETE FROM guide_bookmarks_request 
      WHERE guide_id = $1 AND request_id = $2
    `;
    await db.query(deleteQuery, checkValues);
    return { bookmarked: false, message: "Bookmark removed" };
  } else {
    // Insert it
    const insertQuery = `
      INSERT INTO guide_bookmarks_request (guide_id, request_id, created_at)
      VALUES ($1, $2, NOW())
    `;
    await db.query(insertQuery, checkValues);
    return { bookmarked: true, message: "Bookmark added" };
  }
}

export async function getBookmarks(guideId) {
  const query = `
    SELECT 
      r.*, 
      u.name as user_name,
      true as is_bookmarked
    FROM guide_bookmarks_request gbr
    JOIN request r ON r.rfg_id = gbr.request_id
    JOIN user_does_request udr ON udr.request_id = r.rfg_id
    JOIN users u ON u.user_id = udr.user_id
    WHERE gbr.guide_id = $1
    ORDER BY gbr.created_at DESC
  `;
  const result = await db.query(query, [guideId]);
  return result.rows;
}
