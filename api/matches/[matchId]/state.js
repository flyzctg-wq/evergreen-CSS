/**
 * api/matches/[matchId]/state.js
 *
 * Vercel serverless function — handles GET and POST for match state.
 * Persists state in Vercel KV (Upstash Redis under the hood).
 *
 * Setup: In your Vercel project dashboard → Storage → Create a KV store
 * and connect it to this project. The environment variables are added
 * automatically:  KV_REST_API_URL  and  KV_REST_API_TOKEN
 *
 * GET  /api/matches/:matchId/state         → returns current snapshot
 * POST /api/matches/:matchId/state  {writeKey, snapshot} → stores snapshot
 */

const MATCH_TTL_SECONDS = 24 * 60 * 60; // 24 hours

// Lazy-load @vercel/kv so the file still parses when KV isn't configured.
function getKV() {
  try {
    return require("@vercel/kv").kv;
  } catch {
    return null;
  }
}

module.exports = async function handler(req, res) {
  // CORS preflight
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Normalise matchId from the dynamic path segment
  const matchId = (req.query.matchId || "").toUpperCase().trim();
  if (!matchId) return res.status(400).json({ error: "Missing matchId." });

  const kv = getKV();
  const kvReady =
    kv &&
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN;

  if (!kvReady) {
    // KV not configured — return a helpful message.
    // The scorer and viewer still work fully offline (BroadcastChannel /
    // localStorage). Remote sync requires Vercel KV to be set up.
    return res.status(503).json({
      error:
        "Remote sync storage not configured. " +
        "In your Vercel project → Storage, create a KV store and connect it " +
        "to this project. No other changes are needed."
    });
  }

  const key = `match:${matchId}`;

  try {
    // ── GET ──────────────────────────────────────────────────────────────────
    if (req.method === "GET") {
      const entry = await kv.get(key);
      if (!entry || !entry.snapshot) {
        return res
          .status(404)
          .json({ error: "No live match found for this code." });
      }
      return res.json({ snapshot: entry.snapshot, updatedAt: entry.updatedAt });
    }

    // ── POST ─────────────────────────────────────────────────────────────────
    if (req.method === "POST") {
      const body = req.body || {};
      const { writeKey, snapshot } = body;

      if (!writeKey || typeof writeKey !== "string") {
        return res.status(400).json({ error: "writeKey is required." });
      }
      if (!snapshot || typeof snapshot !== "object") {
        return res.status(400).json({ error: "snapshot is required." });
      }

      // Validate write key against existing entry (if any)
      const existing = await kv.get(key);
      if (existing && existing.writeKey !== writeKey) {
        return res
          .status(403)
          .json({ error: "Invalid write key for this match." });
      }

      const entry = {
        writeKey,
        snapshot: { ...snapshot, __ts: Date.now() },
        updatedAt: Date.now()
      };

      // Store with TTL so old matches auto-expire
      await kv.set(key, entry, { ex: MATCH_TTL_SECONDS });

      return res.json({ ok: true, updatedAt: entry.updatedAt });
    }

    return res.status(405).json({ error: "Method not allowed." });
  } catch (err) {
    console.error("[match-state] KV error:", err);
    return res
      .status(500)
      .json({ error: "Storage error. Please try again." });
  }
};
