import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import guideRoutes from "./routes/guides.routes.js";
import requestRoutes from "./routes/request.routes.js";
import guideBookmarksRoutes from "./routes/guideBookmarks.routes.js";
import messagesRoutes from "./routes/messages.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import reviewRoutes from "./routes/review.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/public", express.static("Public"));

// Mount routes here
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/guide-bookmarks", guideBookmarksRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/guides", guideRoutes);

export default app;
