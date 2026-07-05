/**
 * api/auth/refresh.js
 * Vercel Serverless Function to refresh access tokens
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
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const refresh = getCookie(req, "refreshToken");
  if (!refresh) {
    return res.status(401).json({ error: "Refresh token is missing." });
  }

  try {
    const payload = authUtils.verifyJWT(refresh, authUtils.REFRESH_SECRET);
    if (!payload || !payload.email) {
      return res.status(403).json({ error: "Invalid or expired refresh token." });
    }

    const user = await authUtils.getUser(payload.email);
    if (!user) {
      return res.status(403).json({ error: "User no longer exists." });
    }

    const tokenPayload = { email: user.email, name: user.name, role: user.role };
    const newAccess = authUtils.signJWT(tokenPayload, authUtils.JWT_SECRET, 900);
    const newRefresh = authUtils.signJWT({ email: user.email }, authUtils.REFRESH_SECRET, 604800);

    const cookieOptions = "HttpOnly; Path=/; SameSite=Lax; Secure";
    res.setHeader("Set-Cookie", [
      `accessToken=${newAccess}; Max-Age=900; ${cookieOptions}`,
      `refreshToken=${newRefresh}; Max-Age=604800; ${cookieOptions}`
    ]);

    return res.json({ success: true, user: tokenPayload });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error: " + err.message });
  }
};
