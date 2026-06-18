/**
 * api/matches/[matchId]/state.js
 *
 * GET  /api/matches/:matchId/state         → returns current snapshot
 * POST /api/matches/:matchId/state         → stores snapshot (requires writeKey)
 *
 * Storage priority:
 *   1. Vercel KV  (if KV_REST_API_URL + KV_REST_API_TOKEN are set)
 *   2. In-memory  (best-effort — works within a single warm Vercel container)
 *
 * The in-memory fallback is reliable enough for a single scorer + a few viewers
 * on Vercel's hobby tier (which typically keeps one warm container).
 * For guaranteed cross-instance persistence, connect a Vercel KV store.
 */

// ── In-memory fallback ────────────────────────────────────────────────────────
// Module-level so it persists across requests on the same warm container instance.
const memStore = new Map();
const MATCH_TTL_SECONDS = 24 * 60 * 60; // 24 h

// ── KV helper (lazy) ──────────────────────────────────────────────────────────
function getKV() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null;
  try {
    return require("@vercel/kv").kv;
  } catch {
    return null;
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const matchId = (req.query.matchId || "").toUpperCase().trim();
  if (!matchId) return res.status(400).json({ error: "Missing matchId." });

  const kv = getKV();
  const key = `match:${matchId}`;

  // ── GET ───────────────────────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      // Try KV first
      if (kv) {
        const entry = await kv.get(key);
        if (entry && entry.snapshot) {
          return res.json({ snapshot: entry.snapshot, updatedAt: entry.updatedAt, via: "kv" });
        }
      }
      // Fallback to in-memory
      const mem = memStore.get(key);
      if (mem && mem.snapshot) {
        return res.json({ snapshot: mem.snapshot, updatedAt: mem.updatedAt, via: "mem" });
      }
      return res.status(404).json({ error: "No live match found for this code." });
    } catch (err) {
      // KV error — try memory
      const mem = memStore.get(key);
      if (mem && mem.snapshot) {
        return res.json({ snapshot: mem.snapshot, updatedAt: mem.updatedAt, via: "mem-fallback" });
      }
      return res.status(404).json({ error: "No live match found for this code." });
    }
  }

  // ── POST ──────────────────────────────────────────────────────────────────
  if (req.method === "POST") {
    const { writeKey, snapshot } = req.body || {};
    if (!writeKey || typeof writeKey !== "string")
      return res.status(400).json({ error: "writeKey is required." });
    if (!snapshot || typeof snapshot !== "object")
      return res.status(400).json({ error: "snapshot is required." });

    const now = Date.now();
    const entry = {
      writeKey,
      snapshot: { ...snapshot, __ts: now },
      updatedAt: now
    };

    // Always write to in-memory (fast, no failure modes)
    const existing = memStore.get(key);
    if (existing && existing.writeKey !== writeKey) {
      return res.status(403).json({ error: "Invalid write key for this match." });
    }
    memStore.set(key, entry);

    // Also write to KV if available (persistent across instances)
    if (kv) {
      try {
        await kv.set(key, entry, { ex: MATCH_TTL_SECONDS });
      } catch (e) {
        // KV write failed — in-memory already saved, continue
      }
    }

    return res.json({ ok: true, updatedAt: now, via: kv ? "kv+mem" : "mem" });
  }

  return res.status(405).json({ error: "Method not allowed." });
};
