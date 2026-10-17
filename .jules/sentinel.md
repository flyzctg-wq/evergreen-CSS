## 2025-05-18 - Password Reset Token Exposure in API Responses
**Vulnerability:** The password reset request endpoint returned `debugResetUrl` in the JSON response payload containing a valid reset token JWT, allowing account takeover for any registered email address.
**Learning:** Returning debug reset links in HTTP responses for development convenience leaks sensitive authentication tokens to callers.
**Prevention:** Always log debug links to server stdout/stderr only; never include reset tokens or password reset URLs in API response bodies.
