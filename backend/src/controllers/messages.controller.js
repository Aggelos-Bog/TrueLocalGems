import * as messagesService from "../services/messages.service.js";
import db from "../config/database.js";

/**
 * Get all active chats for the authenticated user
 * Returns requests where user is either traveller or guide (with offer/booking)
 */
export async function getMyChats(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let chats = [];

    if (userRole === 0) {
      // Traveller: get all (request, guide) pairs where guide messaged me
      const query = `
        SELECT DISTINCT
          r.rfg_id as request_id,
          r.title,
          r.city,
          r.country,
          r.date_from,
          r.date_to,
          r.created_at,
          m.guide_id::integer as guide_id,
          g.img_url as guide_avatar,
          u.name as guide_name
        FROM request r
        JOIN user_does_request udr ON r.rfg_id = udr.request_id
        LEFT JOIN (
          SELECT DISTINCT
            split_part(chat_room_id, ':', 4)::integer as guide_id,
            split_part(chat_room_id, ':', 2)::integer as request_id_from_room
          FROM messages
          WHERE chat_room_id LIKE 'request:%:guide:%'
            AND (sender_id = $1 OR receiver_id = $1)
        ) m ON m.request_id_from_room = r.rfg_id
        LEFT JOIN guides g ON g.guide_id = m.guide_id
        LEFT JOIN users u ON u.user_id = g.guide_id
        WHERE udr.user_id = $1
          AND m.guide_id IS NOT NULL
        ORDER BY r.created_at DESC
      `;

      const result = await db.query(query, [userId]);
      chats = result.rows;
    } else if (userRole === 1) {
      // Guide: get requests where I've sent or received messages
      const query = `
        SELECT DISTINCT
          r.rfg_id as request_id,
          r.title,
          r.city,
          r.country,
          r.date_from,
          r.date_to,
          r.created_at,
          udr.user_id as traveller_id,
          u.name as traveller_name
        FROM request r
        JOIN user_does_request udr ON r.rfg_id = udr.request_id
        JOIN users u ON u.user_id = udr.user_id
        WHERE EXISTS (
          SELECT 1 FROM messages
          WHERE chat_room_id = 'request:' || r.rfg_id::text || ':guide:' || $1::text
            AND (sender_id = $2 OR receiver_id = $2)
        )
        ORDER BY r.created_at DESC
      `;

      const result = await db.query(query, [userId, userId]);
      chats = result.rows;
    }

    res.status(200).json(chats);
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
}

/**
 * Get chat history for a specific request and guide
 * Uses chat_room_id for message retrieval
 */
export async function getChatHistory(req, res) {
  try {
    const { request_id } = req.params;
    const { guide_id } = req.query;  // Get guide_id from query parameter
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get traveller
    const travellerResult = await db.query(
      "SELECT user_id FROM user_does_request WHERE request_id = $1",
      [request_id]
    );

    if (travellerResult.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    const traveller_id = travellerResult.rows[0].user_id;

    // Determine actual_guide_id
    let actual_guide_id;
    if (userRole === 1) {
      // User is guide
      actual_guide_id = userId;
    } else if (userRole === 0 && guide_id) {
      // Traveler provided guide_id
      actual_guide_id = guide_id;
    } else {
      return res.status(400).json({ error: "guide_id required for travelers" });
    }

    // Authorization: traveller owns request OR user is the guide
    const isTraveller = userId === traveller_id;
    const isGuide = userRole === 1 && userId === actual_guide_id;

    if (!isTraveller && !isGuide) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Derive chat_room_id with guide
    const chat_room_id = `request:${request_id}:guide:${actual_guide_id}`;

    // Get messages by chat_room_id
    const messages = await messagesService.getMessageHistory(chat_room_id);

    res.status(200).json({
      request_id: parseInt(request_id),
      guide_id: actual_guide_id,
      chat_room_id,
      traveller_id,
      messages,
    });
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
}
