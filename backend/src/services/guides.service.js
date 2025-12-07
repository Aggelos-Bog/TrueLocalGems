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

export async function getAllPublicGuides(currentUserId = null) {
  let query = `
    SELECT 
      g.guide_id,
      u.name,
      g.city,
      g.country,
      g.price_per_hour,
      g.img_url,
      g.rating_avg,
      g.interests
      ${currentUserId ? ", (CASE WHEN pg.guide_id IS NOT NULL THEN true ELSE false END) as is_favorite" : ""}
    FROM guides g
    JOIN users u ON u.user_id = g.guide_id
    ${currentUserId ? "LEFT JOIN preferable_guide pg ON pg.guide_id = g.guide_id AND pg.user_id = $1" : ""}
    WHERE g.public_enable = true
  `;

  const params = currentUserId ? [currentUserId] : [];
  const result = await db.query(query, params);

  return result.rows;
}

export async function getGuidesByCountry(country, currentUserId = null) {
  let query = `
    SELECT 
      g.guide_id,
      u.name,
      g.city,
      g.country,
      g.price_per_hour,
      g.img_url,
      g.rating_avg,
      g.interests
      ${currentUserId ? ", (CASE WHEN pg.guide_id IS NOT NULL THEN true ELSE false END) as is_favorite" : ""}
    FROM guides g
    JOIN users u ON u.user_id = g.guide_id
    ${currentUserId ? "LEFT JOIN preferable_guide pg ON pg.guide_id = g.guide_id AND pg.user_id = $2" : ""}
    WHERE g.public_enable = true AND g.country = $1
  `;

  const params = currentUserId ? [country, currentUserId] : [country];
  const result = await db.query(query, params);

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



// ----------------------------------------------------------------------
// FAVORITES
// ----------------------------------------------------------------------
export async function addFavorite(userId, guideId) {
  await db.query(
    `INSERT INTO preferable_guide (user_id, guide_id) VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [userId, guideId]
  );
}

export async function removeFavorite(userId, guideId) {
  await db.query(
    `DELETE FROM preferable_guide WHERE user_id = $1 AND guide_id = $2`,
    [userId, guideId]
  );
}

export async function checkFavorite(userId, guideId) {
  const result = await db.query(
    `SELECT 1 FROM preferable_guide WHERE user_id = $1 AND guide_id = $2`,
    [userId, guideId]
  );
  return result.rows.length > 0;
}

export async function getFavoriteGuides(userId) {
  const result = await db.query(
    `SELECT 
      g.guide_id,
      u.name,
      g.city,
      g.country,
      g.price_per_hour,
      g.img_url,
      g.rating_avg,
      g.interests,
      true as is_favorite
     FROM guides g
     JOIN users u ON u.user_id = g.guide_id
     JOIN preferable_guide pg ON pg.guide_id = g.guide_id
     WHERE pg.user_id = $1 AND g.public_enable = true`,
    [userId]
  );
  return result.rows;
}
