import db from "../config/database.js";

// ----------------------------------------------------------------------
// GET
// ----------------------------------------------------------------------
export async function getGuide(id) {
  const result = await db.query(
    `SELECT 
      guide_id, languages, city, country, img_url, bio,
      price_per_hour, public_enable, rating_avg, interests
     FROM guides 
     WHERE guide_id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

// ----------------------------------------------------------------------
// UPDATE
// ----------------------------------------------------------------------
export async function updateGuide(id, updates) {
  const {
    languages,
    city,
    country,
    img_url,
    bio,
    price_per_hour,
    public_enable,
    interests
  } = updates;

  const result = await db.query(
    `UPDATE guides SET
      languages = COALESCE($1, languages),
      city = COALESCE($2, city),
      country = COALESCE($3, country),
      img_url = COALESCE($4, img_url),
      bio = COALESCE($5, bio),
      price_per_hour = COALESCE($6, price_per_hour),
      public_enable = COALESCE($7, public_enable),
      interests = COALESCE($8, interests)
     WHERE guide_id = $9
     RETURNING *`,
    [
      languages,
      city,
      country,
      img_url,
      bio,
      price_per_hour,
      public_enable,
      interests,
      id
    ]
  );

  if (result.rows.length === 0) {
    throw new Error("Guide not found");
  }

  return result.rows[0];
}
