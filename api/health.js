// api/health.js — Vercel serverless function
module.exports = function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json({
    ok: true,
    transport: "http-poll (Vercel serverless)",
    ts: Date.now()
  });
};
