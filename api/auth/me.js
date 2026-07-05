/**
 * api/auth/me.js
 * Vercel Serverless Function for fetching current user profile
 */

const authUtils = require("../auth_utils");

function getCookie(req, name) {
  const rc = req.headers.cookie;
  if (!rc) return null;
  const list = {};
  rc.split(";").forEach(cookie => {
    const parts = cookie.split("=");
    list[parts.shift().trim()] = decodeURIComponent(parts.join("="));
  });
  return list[name] || null;
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
