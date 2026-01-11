import db from "../config/database.js";

/**
 * Insert a new message into the database
 * @param {number} sender_id - User ID of the sender
 * @param {number} receiver_id - User ID of the receiver
 * @param {string} chat_room_id - Chat room identifier (e.g., "request:42")
 * @param {string} content - Message content
 * @returns {Promise<Object>} - The inserted message record
 */
export async function insertMessage(sender_id, receiver_id, chat_room_id, content) {
  const query = `
    INSERT INTO messages (sender_id, receiver_id, chat_room_id, content, send_at)
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    RETURNING message_id, sender_id, receiver_id, chat_room_id, content, send_at
  `;
  
  const result = await db.query(query, [sender_id, receiver_id, chat_room_id, content]);
  return result.rows[0];
}

/**
 * Get message history for a specific chat room
 * @param {string} chat_room_id - Chat room identifier
 * @returns {Promise<Array>} - Array of messages ordered by send_at
 */
export async function getMessageHistory(chat_room_id) {
  const query = `
    SELECT message_id, sender_id, receiver_id, chat_room_id, content, send_at
    FROM messages
    WHERE chat_room_id = $1
    ORDER BY send_at ASC
  `;
  
  const result = await db.query(query, [chat_room_id]);
  return result.rows;
}
