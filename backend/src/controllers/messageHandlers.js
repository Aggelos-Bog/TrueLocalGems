import db from "../config/database.js";
import * as messagesService from "../services/messages.service.js";

/**
 * Set up WebSocket event handlers for messaging
 * @param {Server} io - Socket.IO server instance
 */
export function setupMessageHandlers(io) {
  // Track connected users: { userId: socketId }
  const userSockets = new Map();

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    console.log(`User connected: ${userId}`);
    
    // Track this user's socket
    userSockets.set(userId, socket.id);

    /**
     * Join a chat room for a specific request and guide
     */
    socket.on("join_room", async ({ request_id, guide_id }) => {
      try {
        const userId = socket.user.id;
        const userRole = socket.user.role;
        
        // Get traveller
        const travellerResult = await db.query(
          "SELECT user_id FROM user_does_request WHERE request_id = $1",
          [request_id]
        );

        if (travellerResult.rows.length === 0) {
          socket.emit("error", { message: "Request not found" });
          return;
        }

        const traveller_id = travellerResult.rows[0].user_id;

        // Determine guide_id if not provided
        let actual_guide_id = guide_id;
        if (!actual_guide_id) {
          if (userRole === 1) {
            actual_guide_id = userId;
          } else {
            socket.emit("error", { message: "guide_id required for travelers" });
            return;
          }
        }

        // Authorization
        const isTraveller = userId === traveller_id;
        const isGuide = userRole === 1 && userId === actual_guide_id;

        if (!isTraveller && !isGuide) {
          socket.emit("error", { message: "Unauthorized" });
          return;
        }

        // Derive chat_room_id with guide
        const chat_room_id = `request:${request_id}:guide:${actual_guide_id}`;

        // Join WebSocket room
        socket.join(chat_room_id);
        socket.emit("room_joined", { request_id, guide_id: actual_guide_id, room: chat_room_id });

        console.log(`User ${userId} joined room: ${chat_room_id}`);
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    /**
     * Send a message
     */
    socket.on("send_message", async ({ request_id, guide_id, content }) => {
      try {
        const sender_id = socket.user.id;
        const senderRole = socket.user.role;

        if (!content || !content.trim()) {
          socket.emit("error", { message: "Message content is required" });
          return;
        }

        // Get traveller for this request
        const travellerResult = await db.query(
          "SELECT user_id FROM user_does_request WHERE request_id = $1",
          [request_id]
        );

        if (travellerResult.rows.length === 0) {
          socket.emit("error", { message: "Request not found" });
          return;
        }

        const traveller_id = travellerResult.rows[0].user_id;

        // Determine receiver and actual_guide_id
        let receiver_id;
        let actual_guide_id;
        
        if (sender_id === traveller_id) {
          if (!guide_id) {
            socket.emit("error", { message: "guide_id required" });
            return;
          }
          receiver_id = guide_id;
          actual_guide_id = guide_id;
          
        } else if (senderRole === 1) {
          receiver_id = traveller_id;
          actual_guide_id = sender_id;
          
        } else {
          socket.emit("error", { message: "Unauthorized" });
          return;
        }

        // Derive chat_room_id with guide
        const chat_room_id = `request:${request_id}:guide:${actual_guide_id}`;

        // Insert message with chat_room_id
        const message = await messagesService.insertMessage(
          sender_id,
          receiver_id,
          chat_room_id,
          content.trim()
        );

        const messageData = {
          message_id: message.message_id,
          sender_id: message.sender_id,
          receiver_id: message.receiver_id,
          chat_room_id: message.chat_room_id,
          content: message.content,
          send_at: message.send_at,
        };

        // Broadcast to room (for users already in the room)
        io.to(chat_room_id).emit("new_message", messageData);

        // Also send directly to receiver ONLY if they're NOT in the room (for live contact updates)
        const receiverSocketId = userSockets.get(receiver_id);
        if (receiverSocketId) {
          const receiverSocket = io.sockets.sockets.get(receiverSocketId);
          // Check if receiver is NOT in this room
          if (receiverSocket && !receiverSocket.rooms.has(chat_room_id)) {
            io.to(receiverSocketId).emit("new_message", messageData);
          }
        }

        console.log(`Message sent in room ${chat_room_id} by user ${sender_id}`);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    /**
     * Booking offer created - notify traveller
     */
    socket.on("booking_offer_created", async ({ request_id, guide_id, booking }) => {
      try {
        const chat_room_id = `request:${request_id}:guide:${guide_id}`;
        
        // Broadcast to room (both guide and traveller if they're in the room)
        io.to(chat_room_id).emit("new_booking_offer", {
          request_id,
          guide_id,
          booking,
        });

        console.log(`Booking offer created in room ${chat_room_id}`);
      } catch (error) {
        console.error("Error broadcasting booking offer:", error);
      }
    });

    /**
     * Booking offer accepted - notify guide
     */
    socket.on("booking_offer_accepted", async ({ request_id, booking_id }) => {
      try {
        // Get booking to find guide_id
        const bookingResult = await db.query(
          "SELECT guide_id, agreed, status FROM booking WHERE booking_id = $1",
          [booking_id]
        );
        
        if (bookingResult.rows.length > 0) {
          const { guide_id, agreed, status } = bookingResult.rows[0];
          const chat_room_id = `request:${request_id}:guide:${guide_id}`;
          
          io.to(chat_room_id).emit("booking_offer_updated", {
            booking_id,
            agreed,
            status,
          });

          console.log(`Booking ${booking_id} accepted, status: ${status}, agreed: ${agreed}`);
        }
      } catch (error) {
        console.error("Error broadcasting booking acceptance:", error);
      }
    });

    /**
     * Booking offer declined - notify guide
     */
    socket.on("booking_offer_declined", async ({ request_id, booking_id }) => {
      try {
        // Get booking to find guide_id
        const bookingResult = await db.query(
          "SELECT guide_id, status FROM booking WHERE booking_id = $1",
          [booking_id]
        );
        
        if (bookingResult.rows.length > 0) {
          const { guide_id, status } = bookingResult.rows[0];
          const chat_room_id = `request:${request_id}:guide:${guide_id}`;
          
          io.to(chat_room_id).emit("booking_offer_updated", {
            booking_id,
            status,
          });

          console.log(`Booking ${booking_id} declined, status: ${status}`);
        }
      } catch (error) {
        console.error("Error broadcasting booking decline:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`);
      userSockets.delete(userId);
    });
  });
}
