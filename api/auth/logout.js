/**
 * api/auth/logout.js
 * Vercel Serverless Function to logout
 */

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

  res.setHeader("Set-Cookie", [
    "accessToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
    "refreshToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
  ]);

  return res.json({ success: true, message: "Logged out successfully." });
};
