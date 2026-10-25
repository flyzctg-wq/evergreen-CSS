## 2026-10-25 - Password Reset Token Exposure in API Responses
**Vulnerability:** The password recovery request API (`/api/auth/reset`) included `debugResetUrl` in the JSON response payload, exposing JWT reset tokens to HTTP responses.
**Learning:** Returning debug fields with sensitive tokens in API responses enables account takeover even when backend logging or email sending is intended.
**Prevention:** Ensure debug fields containing secret or sensitive tokens are never returned in production API response bodies.
