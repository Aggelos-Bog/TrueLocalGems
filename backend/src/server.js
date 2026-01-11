import app from "./app.js";
import { initializeSocketServer } from "./config/socket.js";
import { setupMessageHandlers } from "./controllers/messageHandlers.js";

const port = 3000;

// Initialize Socket.IO with HTTP server
const { httpServer, io } = initializeSocketServer(app);

// Set up message event handlers
setupMessageHandlers(io);

// Start server
httpServer.listen(port, () => {
  console.log("Server running on port", port);
  console.log("WebSocket server ready");
});
