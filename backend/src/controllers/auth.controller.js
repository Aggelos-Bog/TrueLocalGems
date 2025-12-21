import * as authService from "../services/auth.service.js";

// Register controller
export async function register(req, res) {
  try {
    // Call service to register user
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Verify Email controller
export async function verifyEmail(req, res) {
  try {
    const { token } = req.query;
    if (!token) throw new Error("Token missing");

    await authService.verifyEmail(token);
    
    // Redirect to frontend homepage after successful verification
    res.redirect('http://localhost:5173/'); 
  } catch (err) {
    res.status(400).send(`<h1>Verification failed: ${err.message}</h1>`);
  }
}

// Login controller
export async function login(req, res) {
  try {
    // Call service to login user
    const { user, token } = await authService.login(req.body);
    res.status(200).json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Get Current User (Me)
export async function getMe(req, res) {
  try {
    const userId = req.user.id;
    const user = await authService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user details" });
  }
}