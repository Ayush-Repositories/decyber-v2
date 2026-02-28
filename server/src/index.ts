import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { addClient, broadcastState } from "./ws.js";
import { sql } from "./db.js";
import teamsRouter from "./routes/teams.js";
import questionsRouter from "./routes/questions.js";
import gameRouter from "./routes/game.js";
import submissionsRouter from "./routes/submissions.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

// REST routes
app.use("/api/teams", teamsRouter);
app.use("/api/questions", questionsRouter);
app.use("/api/game", gameRouter);
app.use("/api/submissions", submissionsRouter);

// Create HTTP server and attach WebSocket
const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  addClient(ws);
  broadcastState();
});

// Run migrations then start server
async function start() {
  // Add session_token column if it doesn't exist
  await sql`ALTER TABLE teams ADD COLUMN IF NOT EXISTS session_token TEXT`;
  console.log("Migration: session_token column ensured");

  server.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`WebSocket running on ws://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
