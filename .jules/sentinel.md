## 2026-10-09 - Sensitive Reset Token Leakage in Password Recovery Response
**Vulnerability:** The POST `/api/auth/reset` endpoint returned a `debugResetUrl` containing full JWT password recovery tokens in the HTTP JSON response body when requesting password reset links.
**Learning:** Returning debug reset URLs in HTTP responses to assist local development creates a critical account takeover vulnerability where any user can request a reset for arbitrary email addresses and capture the recovery link.
**Prevention:** Password recovery tokens and debug links must only be logged to server-side stdout or transmitted via secure out-of-band mechanisms (such as email), never included in client-facing HTTP API responses.
