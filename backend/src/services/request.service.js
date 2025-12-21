import db from "../config/database.js";

export async function createRequest(data, userId) {
  const { title, description, interests, city, country, date_from, date_to } = data;

  // 1. Insert Request
  const queryRequest = `
    INSERT INTO request (title, description, interests, city, country, date_from, date_to, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    RETURNING *
  `;
  
  const valuesRequest = [
    title,
    description,
    interests, 
    city,
    country,
    date_from,
    date_to
  ];

  const result = await db.query(queryRequest, valuesRequest);
  const newRequest = result.rows[0];

  // 2. Link User to Request (if userId provided)
  if (userId && newRequest.rfg_id) {
    const queryLink = `
      INSERT INTO user_does_request (user_id, request_id, created_at)
      VALUES ($1, $2, NOW())
    `;
    await db.query(queryLink, [userId, newRequest.rfg_id]);
  }

  return newRequest;
}

export async function getAllRequests(country) {
  let query = `
    SELECT r.*, u.name as user_name
    FROM request r
    JOIN user_does_request udr ON r.rfg_id = udr.request_id
    JOIN users u ON udr.user_id = u.user_id
  `;

  const values = [];

  if (country) {
    query += ` WHERE r.country ILIKE $1`;
    values.push(`%${country}%`);
  }

  query += ` ORDER BY r.created_at DESC`;

  const result = await db.query(query, values);
  return result.rows;
}

export async function getRequestById(id) {
  const query = `
    SELECT r.*, u.name as user_name
    FROM request r
    JOIN user_does_request udr ON r.rfg_id = udr.request_id
    JOIN users u ON udr.user_id = u.user_id
    WHERE r.rfg_id = $1
  `;
  const result = await db.query(query, [id]);
  return result.rows[0];
}

export async function getRequestsByUserId(userId) {
  const query = `
    SELECT r.*, u.name as user_name
    FROM request r
    JOIN user_does_request udr ON r.rfg_id = udr.request_id
    JOIN users u ON udr.user_id = u.user_id
    WHERE udr.user_id = $1
    ORDER BY r.created_at DESC
  `;
  const result = await db.query(query, [userId]);
  return result.rows;
}
