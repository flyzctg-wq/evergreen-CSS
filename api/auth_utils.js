/**
 * api/auth_utils.js
 *
 * Cryptographic helpers for password hashing, JWT signing/verification,
 * and unified database access (Vercel KV with local JSON file/memory fallback).
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Secrets
const JWT_SECRET = process.env.JWT_SECRET || "evergreen-access-secret-key-109283-a7";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "evergreen-refresh-secret-key-483748-b2";
const RESET_SECRET = process.env.RESET_SECRET || "evergreen-reset-secret-key-928374-c3";

// Local file DB path for user storage fallback (used when Vercel KV is offline)
const LOCAL_DB_PATH = path.join(__dirname, "..", "server", "users.json");

// In-memory fallback if file system is read-only
let memoryUsers = new Map();

/**
 * Validates password strength:
 * Minimum 8 characters, at least one uppercase, one lowercase, one number, and one special character.
 */
function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return "Password must be a string.";
  }
  if (!/^\d{6}$/.test(password)) {
    return "Password must be exactly 6 digits.";
  }
  return null;
}

/**
 * Hashes password using native PBKDF2 with a secure salt.
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verifies password matching.
 */
function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === checkHash;
}

/**
 * Base64url encoding helpers
 */
function base64UrlEncode(obj) {
  return Buffer.from(JSON.stringify(obj))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return JSON.parse(Buffer.from(base64, "base64").toString("utf8"));
}

/**
 * Signs a JWT with HMAC-SHA256.
 */
function signJWT(payload, secret, expiresInSeconds) {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };
  
  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(fullPayload);
  
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
    
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verifies a JWT.
 */
function verifyJWT(token, secret) {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerStr, payloadStr, signatureStr] = parts;
    
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${headerStr}.${payloadStr}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
      
    if (signatureStr !== expectedSignature) return null;
    
    const payload = base64UrlDecode(payloadStr);
    if (payload.exp && Date.now() / 1000 > payload.exp) return null; // Expired
    return payload;
  } catch (e) {
    return null;
  }
}

// Helper to check if Vercel KV is available
function getKV() {
  if (process.env.UPSTASH_REDIS_REST_URL && !process.env.KV_REST_API_URL) {
    process.env.KV_REST_API_URL = process.env.UPSTASH_REDIS_REST_URL;
  }
  if (process.env.UPSTASH_REDIS_REST_TOKEN && !process.env.KV_REST_API_TOKEN) {
    process.env.KV_REST_API_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
  }

  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null;
  try {
    return require("@vercel/kv").kv;
  } catch {
    return null;
  }
}

// PERFORMANCE OPTIMIZATION:
// In-memory cache for local file-based users map and last modified timestamp (mtimeMs).
// Prevents redundant synchronous disk I/O (fs.readFileSync) and JSON parsing on every user lookup call.
let fileUsersCache = null;
let fileUsersMtime = 0;

/**
 * Local file-based user loading with in-memory caching.
 */
function loadUsersFromFile() {
  try {
    const stat = fs.statSync(LOCAL_DB_PATH);
    if (fileUsersCache && stat.mtimeMs === fileUsersMtime) {
      return fileUsersCache;
    }
    const data = fs.readFileSync(LOCAL_DB_PATH, "utf8");
    const list = JSON.parse(data);
    const map = new Map();
    list.forEach(u => map.set(u.email.toLowerCase(), u));
    fileUsersCache = map;
    fileUsersMtime = stat.mtimeMs;
    return fileUsersCache;
  } catch (e) {
    if (e.code !== "ENOENT") {
      console.error("Failed to load users from file", e);
    }
  }
  return fileUsersCache || new Map();
}

/**
 * Local file-based user saving. Updates in-memory cache synchronously.
 */
function saveUsersToFile(map) {
  try {
    const list = Array.from(map.values());
    // Ensure parent directory exists
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(list, null, 2), "utf8");
    fileUsersCache = map;
    try {
      fileUsersMtime = fs.statSync(LOCAL_DB_PATH).mtimeMs;
    } catch {
      fileUsersMtime = Date.now();
    }
  } catch (e) {
    console.error("Failed to write users to file", e);
  }
}

/**
 * Retrieves a user profile by email.
 */
async function getUser(email) {
  if (!email) return null;
  const key = email.toLowerCase().trim();
  
  // 1. Try Vercel KV
  const kv = getKV();
  if (kv) {
    try {
      const user = await kv.get(`user:${key}`);
      if (user) return user;
    } catch (e) {
      console.warn("Vercel KV user read error, falling back", e);
    }
  }
  
  // 2. Try file system
  const fileUsers = loadUsersFromFile();
  if (fileUsers.has(key)) {
    return fileUsers.get(key);
  }
  
  // 3. Try memory map
  return memoryUsers.get(key) || null;
}

/**
 * Saves or updates a user profile.
 */
async function saveUser(user) {
  if (!user || !user.email) return false;
  const key = user.email.toLowerCase().trim();
  
  const isVercel = process.env.VERCEL === "1" || !!process.env.NOW_REGION;
  const kv = getKV();
  
  if (isVercel && !kv) {
    throw new Error("Vercel KV database is not configured. Please create and connect a KV database in your Vercel project dashboard (Storage tab) to enable persistent registration/resets.");
  }
  
  // Update memory state
  memoryUsers.set(key, user);
  
  // 1. Save to Vercel KV
  let savedKV = false;
  if (kv) {
    try {
      await kv.set(`user:${key}`, user);
      savedKV = true;
    } catch (e) {
      console.warn("Vercel KV user write error", e);
    }
  }
  
  // 2. Save to local file system
  const fileUsers = loadUsersFromFile();
  fileUsers.set(key, user);
  saveUsersToFile(fileUsers);
  
  return true;
}

module.exports = {
  JWT_SECRET,
  REFRESH_SECRET,
  RESET_SECRET,
  validatePassword,
  hashPassword,
  verifyPassword,
  signJWT,
  verifyJWT,
  getUser,
  saveUser
};
