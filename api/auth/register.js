/**
 * api/auth/register.js
 * Vercel Serverless Function for registration
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

  const { email, password, name, role } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and name are required." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  const pwError = authUtils.validatePassword(password);
  if (pwError) {
    return res.status(400).json({ error: pwError });
  }

  try {
    const existing = await authUtils.getUser(email);
    if (existing) {
      return res.status(409).json({ error: "User already exists with this email." });
    }

    const userRole = role === "administrator" ? "administrator" : "standard";

    const newUser = {
      email: email.toLowerCase().trim(),
      name: name.trim(),
      passwordHash: authUtils.hashPassword(password),
      role: userRole,
      createdAt: Date.now()
    };

    await authUtils.saveUser(newUser);
    return res.json({ success: true, message: "Registration successful." });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error: " + err.message });
  }
};
