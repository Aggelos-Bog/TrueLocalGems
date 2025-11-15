import db from "../config/database.js";
import { hashPassword } from "../utils/hash.js";
import { comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";

export async function register({ name, email, password, role }) {

  
  // 🔥 Normalize / validate role
  if (role === "traveller") role = 0;
  if (role === "guide") role = 1;

  if (![0, 1].includes(role)) {
    throw new Error("Invalid role value");
  }

  // Check if email exists
  const exists = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  if (exists.rows.length > 0) {
    throw new Error("Email already registered");
  }

  // Hash password
  const hashed = await hashPassword(password);

  // Save user
  const result = await db.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING user_id, name, email, role`,
    [name, email, hashed, role]
  );

  

  const newUser = result.rows[0];

  // Create JWT token
  const token = generateToken(newUser);

  return { user: newUser, token };
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