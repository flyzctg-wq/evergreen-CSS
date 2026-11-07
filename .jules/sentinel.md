## 2026-11-07 - Password Reset Token Exposure in Response Payload
**Vulnerability:** In both `api/auth/reset.js` and `server/server.js`, requesting a password reset generated a signed recovery token and inadvertently included `debugResetUrl: resetUrl` in the client HTTP response payload.
**Learning:** Development and debug conveniences left in API response structures allow unauthenticated attackers to retrieve security-sensitive tokens directly and hijack accounts without out-of-band email or server access.
**Prevention:** Never return password recovery URLs or reset tokens in API responses. Log recovery URLs exclusively to server logs in development/offline modes, or deliver them through authenticated out-of-band communication channels.
