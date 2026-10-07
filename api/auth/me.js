/**
 * api/auth/me.js
 * Vercel Serverless Function for fetching current user profile
 */

const authUtils = require("../auth_utils");

// Fast, targeted cookie scanner to avoid string splits and object allocations
function getCookie(req, name) {
  const header = req.headers.cookie;
  if (!header) return null;
  const target = name + "=";
  let start = 0;
  while (start < header.length) {
    while (start < header.length && header.charCodeAt(start) <= 32) start++;
    if (header.startsWith(target, start)) {
      const valueStart = start + target.length;
      let end = header.indexOf(";", valueStart);
      if (end === -1) end = header.length;
      const rawVal = header.slice(valueStart, end);
      try {
        return decodeURIComponent(rawVal);
      } catch {
        return rawVal;
      }
    }
    const nextSemi = header.indexOf(";", start);
    if (nextSemi === -1) break;
    start = nextSemi + 1;
  }
  return null;
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const token = getCookie(req, "accessToken");
  if (!token) {
    return res.status(401).json({ error: "Access token required. Please log in." });
  }

  const payload = authUtils.verifyJWT(token, authUtils.JWT_SECRET);
  if (!payload) {
    return res.status(403).json({ error: "Invalid or expired access token." });
  }

  return res.json({ user: payload });
};
