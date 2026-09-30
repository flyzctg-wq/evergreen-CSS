# Sentinel Security Journal

## 2026-09-30 - Leaking Authentication Reset Tokens in API Response Payload
**Vulnerability:** The password reset request handlers in `server/server.js` and `api/auth/reset.js` returned `debugResetUrl` (containing a signed reset JWT token) directly in the HTTP JSON response. Any user or attacker could request a password reset for any registered email and retrieve the reset token directly from the API response body to overwrite the user's password.
**Learning:** Debug or convenience fields added during development for testing local flows can easily bypass authentication boundaries if included in production HTTP responses.
**Prevention:** Never include sensitive tokens, secrets, or reset URLs in client-facing API responses. Debug information containing secrets must only be emitted to secure server console logs or omitted entirely.
