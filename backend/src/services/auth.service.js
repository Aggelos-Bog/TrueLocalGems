import db from "../config/database.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";

export async function register({ name, email, password, role, guideDetails }) {
  // Normalize role
  if (role === "traveller") role = 0;
  if (role === "guide") role = 1;

  if (![0, 1].includes(role)) {
    throw new Error("Invalid role value");
  }

  // Start transaction
  await db.query("BEGIN");

  try {
    // Check duplicate email
    const exists = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (exists.rows.length > 0) {
      throw new Error("Email already registered");
    }

    // Hash password
    const hashed = await hashPassword(password);

    // Insert user
    const userRes = await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, name, email, role`,
      [name, email, hashed, role]
    );

    const newUser = userRes.rows[0];

    // ------------------------------------------------------------------
    // INSERT GUIDE DETAILS ONLY IF ROLE = GUIDE
    // ------------------------------------------------------------------
    if (role === 1) {
      if (!guideDetails) {
        throw new Error("Guide details missing");
      }

      const { language, from, about, interests, city } = guideDetails;

      await db.query(
        `INSERT INTO guides (
           guide_id, languages, city, country, img_url, bio, price_per_hour, public_enable, interests
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          newUser.user_id,
          language || [],
          city || "",
          from || "",
          null,
          about || "",
          0,
          true,
          interests || []
        ]
      );
    }

    // If everything succeeded → COMMIT transaction
    await db.query("COMMIT");

    const token = generateToken(newUser);

    return { user: newUser, token };

  } catch (err) {

    // If ANYTHING failed → ROLLBACK
    await db.query("ROLLBACK");

    throw err;
  }
}



export async function login({ email, password }) {
  // Check if user exists
  const result = await db.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = result.rows[0];

  // Compare password
  const match = await comparePassword(password, user.password);
  if (!match) {
    throw new Error("Invalid email or password");
  }

  // Remove password before sending back
  delete user.password;

  // Generate JWT
  const token = generateToken(user);

  return { user, token };
}