# Sentinel's Journal

## 2025-05-18 - Password Reset Token Exposure in API Responses
**Vulnerability:** The password reset request handler returned `debugResetUrl` directly in the HTTP JSON response payload. This allowed any unauthenticated user to request a password reset for any known email address and immediately receive the reset token, enabling full account takeover.
**Learning:** During offline development and testing of auth flows, developers frequently echo tokens or reset links in API responses for convenience, inadvertently leaving high-severity account takeover vectors exposed in production endpoints.
**Prevention:** Never include password recovery tokens, magic links, or debug URLs in HTTP API responses. For development/testing environments, restrict output to server logs and deliver tokens in production exclusively through out-of-band communication channels (e.g. email or SMS).
