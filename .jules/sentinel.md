# Sentinel Security Journal

## 2026-07-06 - Password Reset Token Exposure in API Responses
**Vulnerability:** The password reset request endpoints (`api/auth/reset.js` and `server/server.js`) included `debugResetUrl` containing the signed recovery JWT in the JSON response body. This allowed any unauthenticated client requesting a password reset for any registered email to immediately obtain the valid reset token and take over the account without having access to the user's email or server console.
**Learning:** Development and debugging conveniences (such as echoing back reset URLs or tokens in API responses when an email delivery service is not configured) can inadvertently bypass authentication boundaries in production or shared environments.
**Prevention:** Never include sensitive tokens, secrets, or temporary authorization links in API responses. In local/testing environments without email providers, deliver or log reset tokens strictly via out-of-band channels (such as stdout/server console logs) accessible only to administrators.
