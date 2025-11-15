import * as authService from "../services/auth.service.js";

// Register controller
export async function register(req, res) {
  try {
    // Call service to register user
    const { user, token } = await authService.register(req.body);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
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