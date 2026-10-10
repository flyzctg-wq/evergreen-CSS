## 2026-10-10 - Omit Password Reset Tokens from API Responses
**Vulnerability:** The password reset request endpoints (`api/auth/reset.js` and `server/server.js`) returned `debugResetUrl` containing the JWT reset token in the JSON response body.
**Learning:** Returning debug reset URLs or tokens in HTTP API responses allows account takeover, as any requester can acquire the reset link for any target email without email inbox access.
**Prevention:** Ensure password reset tokens are sent only out-of-band (e.g. via email) or logged on stdout for local dev/testing, and never returned in API JSON responses.
