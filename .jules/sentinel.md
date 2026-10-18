# Sentinel Security Journal

## 2026-10-18 - Password Reset Token Response Leak
**Vulnerability:** The password reset request endpoint (`/api/auth/reset` and server express route) included `debugResetUrl: resetUrl` containing the JWT reset token directly in the JSON response payload.
**Learning:** Returning debug reset URLs or tokens in API responses allows arbitrary account password resets and account takeover by anyone who knows a user's email address.
**Prevention:** Never include sensitive reset tokens or authentication URLs in API responses. Tokens should only be delivered out-of-band (e.g. email) or logged strictly to server logs during local dev/debugging.
