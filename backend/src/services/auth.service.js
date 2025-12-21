import db from "../config/database.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import { sendVerificationEmail } from "../utils/email.js";
import jwt from "jsonwebtoken";

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

    // Insert user - email_verified defaults to false in DB schema
    const userRes = await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, name, email, role, email_verified`,
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

    // Generate verification token (short lived or just payload with email)
    // We can use the standard generateToken but maybe with a different secret or purpose if we wanted to be strict
    // For simplicity using the same JWT helper but we verify it differently
    const verificationToken = generateToken({ ...newUser, purpose: 'verification' });

    await sendVerificationEmail(newUser.email, verificationToken);

    // If everything succeeded → COMMIT transaction
    await db.query("COMMIT");

    return { message: "Registration successful. Please check your email to verify your account." };

  } catch (err) {

    // If ANYTHING failed → ROLLBACK
    await db.query("ROLLBACK");

    throw err;
  }
}

export async function verifyEmail(token) {
  try {
    // Verify token
    console.log("Verifying token:", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    
    // Update user
    const updateResult = await db.query(
      "UPDATE users SET email_verified = true WHERE user_id = $1 RETURNING *",
      [decoded.id]
    );
    console.log("Update result:", updateResult.rows[0]);
    
    return true;
  } catch (error) {
    throw new Error("Invalid or expired verification token");
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

  if (!user.email_verified) {
    throw new Error("Please verify your email before logging in");
  }

  // Remove password before sending back
  delete user.password;

  // Generate JWT
  const token = generateToken(user);

  return { user, token };
}

export async function getUserById(userId) {
  const result = await db.query(
    "SELECT user_id, name, email, role, email_verified, created_at FROM users WHERE user_id = $1",
    [userId]
  );
  return result.rows[0];
}