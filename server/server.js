const path = require("path");
const express = require("express");
const cors = require("cors");

const PORT = Number(process.env.PORT) || 3847;
const HOST = process.env.HOST || "0.0.0.0";
const MATCH_TTL_MS = Number(process.env.MATCH_TTL_MS) || 24 * 60 * 60 * 1000;

const app = express();
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

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, matches: matches.size });
});

/** Viewers: read-only live state */
app.get("/api/matches/:matchId/state", (req, res) => {
  const entry = matches.get(req.params.matchId.toUpperCase());
  if (!entry || !entry.snapshot) {
    return res.status(404).json({ error: "No live match found for this code." });
  }
  res.json({
    snapshot: entry.snapshot,
    updatedAt: entry.updatedAt
  });
});

/** Scorer: push updates (write key required) */
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
  res.json({ ok: true, updatedAt: entry.updatedAt });
});

app.use(express.static(path.join(__dirname, "..")));

app.listen(PORT, HOST, () => {
  console.log(`Evergreen Club sync server running at http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
  console.log(`Open scorer:  http://localhost:${PORT}/EvergreenClub.html?role=scorer`);
  console.log(`Health:     http://localhost:${PORT}/api/health`);
});
