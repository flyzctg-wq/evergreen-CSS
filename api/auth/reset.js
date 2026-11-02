/**
 * api/auth/reset.js
 * Vercel Serverless Function to request or confirm password reset
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

  const { action, email, token, newPassword } = req.body || {};

  try {
    if (action === "request") {
      if (!email) return res.status(400).json({ error: "Email is required." });
      
      const user = await authUtils.getUser(email);
      if (!user) {
        // Obfuscate to prevent account enumeration
        return res.json({ success: true, message: "If this email is registered, a password recovery link has been generated." });
      }

      const resetToken = authUtils.signJWT({ email: user.email }, authUtils.RESET_SECRET, 3600);
      
      // Security: Do not expose reset tokens in the response or logs to prevent account takeover
      console.log(`\n🔑 Password reset requested for ${email}`);

      return res.json({
        success: true,
        message: "If this email is registered, a password recovery link has been generated."
      });
    }

    if (action === "confirm") {
      if (!token || !newPassword) {
        return res.status(400).json({ error: "Token and new password are required." });
      }

      const payload = authUtils.verifyJWT(token, authUtils.RESET_SECRET);
      if (!payload || !payload.email) {
        return res.status(400).json({ error: "Invalid or expired recovery token." });
      }

      const pwError = authUtils.validatePassword(newPassword);
      if (pwError) {
        return res.status(400).json({ error: pwError });
      }

      const user = await authUtils.getUser(payload.email);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      user.passwordHash = authUtils.hashPassword(newPassword);
      await authUtils.saveUser(user);

      return res.json({ success: true, message: "Password has been successfully updated." });
    }

    return res.status(400).json({ error: "Invalid action." });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error: " + err.message });
  }
};
