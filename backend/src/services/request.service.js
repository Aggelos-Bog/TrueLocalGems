import db from "../config/database.js";

export async function createRequest(data) {
  const { title, description, interests, city, country, date_from, date_to } = data;

  // The image shows columns: title, description, interests, city, country, date_from, date_to
  // It also shows rfg_id as PK.
  // We'll insert these fields.
  
  const query = `
    INSERT INTO request (title, description, interests, city, country, date_from, date_to, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    RETURNING *
  `;
  
  const values = [
    title,
    description,
    interests, // Assuming this is a text field, if array we might need to join it or use Array
    city,
    country,
    date_from,
    date_to
  ];

  const result = await db.query(query, values);
  return result.rows[0];
}

export async function getAllRequests() {
  const query = `
    SELECT * FROM request 
    ORDER BY created_at DESC
  `;
  const result = await db.query(query);
  return result.rows;
}
