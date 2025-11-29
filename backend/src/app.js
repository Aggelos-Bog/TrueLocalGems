import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import guideRoutes from "./routes/guides.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/public", express.static("Public"));

// Mount routes here
app.use("/api/auth", authRoutes);
app.use("/guides", guideRoutes);

export default app;
