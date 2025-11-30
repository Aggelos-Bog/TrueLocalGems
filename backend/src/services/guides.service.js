import db from "../config/database.js";

// ----------------------------------------------------------------------
// GET
// ----------------------------------------------------------------------
export async function getGuide(id) {
  const result = await db.query(
    `SELECT 
      g.guide_id,
      g.languages,
      g.city,
      g.country,
      g.img_url,
      g.bio,
      g.price_per_hour,
      g.public_enable,
      g.rating_avg,
      g.interests,
      u.name AS user_name
     FROM guides g
     JOIN users u ON u.user_id = g.guide_id
     WHERE g.guide_id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

export async function getAllPublicGuides() {
  const result = await db.query(
    `SELECT 
      u.name,
      g.city,
      g.country,
      g.price_per_hour,
      g.img_url,
      g.rating_avg
     FROM guides g
     JOIN users u ON u.user_id = g.guide_id
     WHERE g.public_enable = true`
  );

  return result.rows;
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
    interests,
    user_name   // 👈 ADD THIS
  } = updates;

  // 1️⃣ Update guides table
  const guideResult = await db.query(
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
     RETURNING guide_id`,
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

  if (guideResult.rows.length === 0) {
    throw new Error("Guide not found");
  }

  // 2️⃣ Update user name ONLY if provided
  if (user_name !== undefined) {
    await db.query(
      `UPDATE users SET
         name = COALESCE($1, name)
       WHERE user_id = $2`,
      [user_name, id]
    );
  }

  // 3️⃣ Return updated joined data
  const fullResult = await db.query(
    `SELECT 
        g.*,
        u.name AS user_name
     FROM guides g
     JOIN users u ON u.user_id = g.guide_id
     WHERE g.guide_id = $1`,
    [id]
  );

  return fullResult.rows[0];
}


