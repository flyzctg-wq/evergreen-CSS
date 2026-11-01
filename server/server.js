const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server: SocketIOServer } = require("socket.io");
const authUtils = require("../api/auth_utils");

const PORT = Number(process.env.PORT) || 3847;
const HOST = process.env.HOST || "0.0.0.0";
const MATCH_TTL_MS = Number(process.env.MATCH_TTL_MS) || 24 * 60 * 60 * 1000;

const app = express();
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"], credentials: true }
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));

// ── Cookie Parser Helper ──────────────────────────────────────────────────────
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

// Helper to set cookies with standard parameters
function setAuthCookies(res, accessToken, refreshToken) {
  const cookieOptions = "HttpOnly; Path=/; SameSite=Lax; Secure"; // Secure is ignored on localhost HTTP
  const headers = [];
  if (accessToken) {
    headers.push(`accessToken=${accessToken}; Max-Age=900; ${cookieOptions}`);
  }
  if (refreshToken) {
    headers.push(`refreshToken=${refreshToken}; Max-Age=604800; ${cookieOptions}`);
  }
  if (headers.length > 0) {
    res.setHeader("Set-Cookie", headers);
  }
}

// Helper to clear cookies
function clearAuthCookies(res) {
  res.setHeader("Set-Cookie", [
    "accessToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
    "refreshToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
  ]);
}

// ── Authentication Middleware ─────────────────────────────────────────────────
function authenticateToken(req, res, next) {
  const token = getCookie(req, "accessToken");
  if (!token) {
    return res.status(401).json({ error: "Access token required. Please log in." });
  }
  const payload = authUtils.verifyJWT(token, authUtils.JWT_SECRET);
  if (!payload) {
    return res.status(403).json({ error: "Invalid or expired access token. Please refresh session." });
  }
  req.user = payload;
  next();
}

/** @type {Map<string, { writeKey: string, snapshot: object|null, updatedAt: number }>} */
const matches = new Map();

function pruneExpiredMatches() {
  const cutoff = Date.now() - MATCH_TTL_MS;
  for (const [id, entry] of matches) {
    if (entry.updatedAt < cutoff) matches.delete(id);
  }
}

setInterval(pruneExpiredMatches, 60 * 60 * 1000);

// ── Auth Endpoints ────────────────────────────────────────────────────────────

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name, role } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and name are required." });
  }

  // Email format validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  // Password strength validation
  const pwError = authUtils.validatePassword(password);
  if (pwError) {
    return res.status(400).json({ error: pwError });
  }

  // Check existence
  const existing = await authUtils.getUser(email);
  if (existing) {
    return res.status(409).json({ error: "User already exists with this email." });
  }

  // Roles default to standard (administrator, standard, guest)
  const userRole = role === "administrator" ? "administrator" : "standard";

  const newUser = {
    email: email.toLowerCase().trim(),
    name: name.trim(),
    passwordHash: authUtils.hashPassword(password),
    role: userRole,
    createdAt: Date.now()
  };

  try {
    await authUtils.saveUser(newUser);
    res.json({ success: true, message: "Registration successful." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = await authUtils.getUser(email);
  if (!user || !authUtils.verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  // Sign access token (15 mins) and refresh token (7 days)
  const tokenPayload = { email: user.email, name: user.name, role: user.role };
  const accessToken = authUtils.signJWT(tokenPayload, authUtils.JWT_SECRET, 900);
  const refreshToken = authUtils.signJWT({ email: user.email }, authUtils.REFRESH_SECRET, 604800);

  setAuthCookies(res, accessToken, refreshToken);

  res.json({
    success: true,
    user: tokenPayload
  });
});

app.get("/api/auth/me", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

app.post("/api/auth/refresh", async (req, res) => {
  const refresh = getCookie(req, "refreshToken");
  if (!refresh) {
    return res.status(401).json({ error: "Refresh token is missing." });
  }

  const payload = authUtils.verifyJWT(refresh, authUtils.REFRESH_SECRET);
  if (!payload || !payload.email) {
    return res.status(403).json({ error: "Invalid or expired refresh token." });
  }

  const user = await authUtils.getUser(payload.email);
  if (!user) {
    return res.status(403).json({ error: "User no longer exists." });
  }

  // Rotate tokens
  const tokenPayload = { email: user.email, name: user.name, role: user.role };
  const newAccess = authUtils.signJWT(tokenPayload, authUtils.JWT_SECRET, 900);
  const newRefresh = authUtils.signJWT({ email: user.email }, authUtils.REFRESH_SECRET, 604800);

  setAuthCookies(res, newAccess, newRefresh);

  res.json({ success: true, user: tokenPayload });
});

app.post("/api/auth/logout", (req, res) => {
  clearAuthCookies(res);
  res.json({ success: true, message: "Logged out successfully." });
});

// Password recovery reset link and application
app.post("/api/auth/reset", async (req, res) => {
  const { action, email, token, newPassword } = req.body || {};
  
  if (action === "request") {
    if (!email) return res.status(400).json({ error: "Email is required." });
    const user = await authUtils.getUser(email);
    if (!user) {
      // Return positive message anyway to prevent email enumeration
      return res.json({ success: true, message: "If this email is registered, a password recovery link has been generated." });
    }

    const resetToken = authUtils.signJWT({ email: user.email }, authUtils.RESET_SECRET, 3600); // 1h expiry
    const resetUrl = `http://localhost:${PORT}/EvergreenClub.html?resetToken=${resetToken}`;
    
    console.log(`\n🔑 PASSWORD RESET REQUEST RECEIVED for ${email}`);
    console.log(`Reset URL: ${resetUrl}\n`);

    // Security: Do NOT leak resetUrl or token in the HTTP response; it is only logged
    // on the server console for local administration/testing to prevent account takeover.
    return res.json({
      success: true,
      message: "Password recovery link generated successfully."
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

    try {
      user.passwordHash = authUtils.hashPassword(newPassword);
      await authUtils.saveUser(user);
      return res.json({ success: true, message: "Password has been successfully updated." });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(400).json({ error: "Invalid action." });
});

// ── Health ──────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, matches: matches.size, transport: "socket.io + http-poll" });
});

// ── Viewers: read-only HTTP poll (fallback / backward compat) ────────
app.get("/api/matches/:matchId/state", (req, res) => {
  const entry = matches.get(req.params.matchId.toUpperCase());
  if (!entry || !entry.snapshot) {
    return res.status(404).json({ error: "No live match found for this code." });
  }
  res.json({ snapshot: entry.snapshot, updatedAt: entry.updatedAt });
});

// ── Scorer: push updates (writeKey required, protected by authentication) ───
app.post("/api/matches/:matchId/state", authenticateToken, (req, res) => {
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

  // Push to all Socket.io viewers watching this match in real-time
  io.to(`match:${matchId}`).emit("score_update", entry.snapshot);

  res.json({ ok: true, updatedAt: entry.updatedAt });
});

// ── Socket.io: real-time viewers ─────────────────────────────────────
io.on("connection", (socket) => {
  socket.on("join_match", ({ matchId } = {}) => {
    if (!matchId || typeof matchId !== "string") return;
    const id = matchId.toUpperCase().trim();
    socket.join(`match:${id}`);
    // Immediately send current state so the page shows something right away
    const entry = matches.get(id);
    if (entry && entry.snapshot) {
      socket.emit("score_update", entry.snapshot);
    } else {
      socket.emit("waiting", { matchId: id });
    }
  });
});

// ── Static files (serves EvergreenClub.html, Viewer.html, etc.) ──────
app.use(express.static(path.join(__dirname, "..")));

httpServer.listen(PORT, HOST, () => {
  const host = HOST === "0.0.0.0" ? "localhost" : HOST;
  console.log(`\n🏏  Evergreen Team sync server  →  http://${host}:${PORT}`);
  console.log(`   Scorer:   http://${host}:${PORT}/EvergreenClub.html`);
  console.log(`   Viewer:   http://${host}:${PORT}/Viewer.html?match=CODE&server=http://${host}:${PORT}`);
  console.log(`   Health:   http://${host}:${PORT}/api/health`);
  console.log(`   Transport: Socket.io (real-time push) + HTTP poll fallback\n`);
});

