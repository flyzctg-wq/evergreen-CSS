/**
 * api/auth/login.js
 * Vercel Serverless Function for login
 */

const authUtils = require("../auth_utils");

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

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await authUtils.getUser(email);
    if (!user || !authUtils.verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const tokenPayload = { email: user.email, name: user.name, role: user.role };
    const accessToken = authUtils.signJWT(tokenPayload, authUtils.JWT_SECRET, 900);
    const refreshToken = authUtils.signJWT({ email: user.email }, authUtils.REFRESH_SECRET, 604800);

    const cookieOptions = "HttpOnly; Path=/; SameSite=Lax; Secure";
    res.setHeader("Set-Cookie", [
      `accessToken=${accessToken}; Max-Age=900; ${cookieOptions}`,
      `refreshToken=${refreshToken}; Max-Age=604800; ${cookieOptions}`
    ]);

    return res.json({
      success: true,
      user: tokenPayload
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error: " + err.message });
  }
};
