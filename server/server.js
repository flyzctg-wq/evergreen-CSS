const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server: SocketIOServer } = require("socket.io");

const PORT = Number(process.env.PORT) || 3847;
const HOST = process.env.HOST || "0.0.0.0";
const MATCH_TTL_MS = Number(process.env.MATCH_TTL_MS) || 24 * 60 * 60 * 1000;

const app = express();
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json({ limit: "2mb" }));

/** @type {Map<string, { writeKey: string, snapshot: object|null, updatedAt: number }>} */
const matches = new Map();

function pruneExpiredMatches() {
  const cutoff = Date.now() - MATCH_TTL_MS;
  for (const [id, entry] of matches) {
    if (entry.updatedAt < cutoff) matches.delete(id);
  }
}

setInterval(pruneExpiredMatches, 60 * 60 * 1000);

// ── Health ──────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, matches: matches.size, transport: "socket.io + http-poll" });
});

// ── Viewers: read-only HTTP poll (fallback / backward compat) ────────
app.get("/api/matches/:matchId/state", (req, res) => {
  const entry = matches.get(req.params.matchId.toUpperCase());
  if (!entry || !entry.snapshot) {
    return res.status(404).json({ error: "No live match found for this code." });
  }
  res.json({ snapshot: entry.snapshot, updatedAt: entry.updatedAt });
});

// ── Scorer: push updates (writeKey required) ─────────────────────────
app.post("/api/matches/:matchId/state", (req, res) => {
  const matchId = req.params.matchId.toUpperCase();
  const { writeKey, snapshot } = req.body || {};

  if (!writeKey || typeof writeKey !== "string") {
    return res.status(400).json({ error: "writeKey is required." });
  }
  if (!snapshot || typeof snapshot !== "object") {
    return res.status(400).json({ error: "snapshot is required." });
  }

  let entry = matches.get(matchId);
  if (!entry) {
    entry = { writeKey, snapshot: null, updatedAt: 0 };
    matches.set(matchId, entry);
  }

  if (entry.writeKey !== writeKey) {
    return res.status(403).json({ error: "Invalid write key for this match." });
  }

  entry.snapshot = { ...snapshot, __ts: Date.now() };
  entry.updatedAt = Date.now();

  // Push to all Socket.io viewers watching this match in real-time
  io.to(`match:${matchId}`).emit("score_update", entry.snapshot);

  res.json({ ok: true, updatedAt: entry.updatedAt });
});

// ── Socket.io: real-time viewers ─────────────────────────────────────
io.on("connection", (socket) => {
  socket.on("join_match", ({ matchId } = {}) => {
    if (!matchId || typeof matchId !== "string") return;
    const id = matchId.toUpperCase().trim();
    socket.join(`match:${id}`);
    // Immediately send current state so the page shows something right away
    const entry = matches.get(id);
    if (entry && entry.snapshot) {
      socket.emit("score_update", entry.snapshot);
    } else {
      socket.emit("waiting", { matchId: id });
    }
  });
});

// ── Static files (serves EvergreenClub.html, Viewer.html, etc.) ──────
app.use(express.static(path.join(__dirname, "..")));

httpServer.listen(PORT, HOST, () => {
  const host = HOST === "0.0.0.0" ? "localhost" : HOST;
  console.log(`\n🏏  Evergreen Team sync server  →  http://${host}:${PORT}`);
  console.log(`   Scorer:   http://${host}:${PORT}/EvergreenClub.html`);
  console.log(`   Viewer:   http://${host}:${PORT}/Viewer.html?match=CODE&server=http://${host}:${PORT}`);
  console.log(`   Health:   http://${host}:${PORT}/api/health`);
  console.log(`   Transport: Socket.io (real-time push) + HTTP poll fallback\n`);
});
