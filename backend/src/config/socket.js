import { Server } from "socket.io";
import { createServer } from "http";
import { verifyToken } from "../utils/jwt.js";

/**
 * Initialize Socket.IO server with JWT authentication
 * @param {Express} app - Express application
 * @returns {Object} - { httpServer, io }
 */
export function initializeSocketServer(app) {
  // Create HTTP server
  const httpServer = createServer(app);

  // Initialize Socket.IO with CORS
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // In production, specify exact origins
      methods: ["GET", "POST"],
    },
  });

  // JWT Authentication Middleware for WebSocket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    const user = verifyToken(token);
    if (!user) {
      return next(new Error("Invalid or expired token"));
    }

    // Attach user to socket
    socket.user = user;
    next();
  });

  return { httpServer, io };
}
