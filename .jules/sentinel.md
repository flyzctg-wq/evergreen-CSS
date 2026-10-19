## 2026-10-19 - Do Not Expose Password Reset Tokens in API Responses
**Vulnerability:** The password reset request endpoint returned `debugResetUrl` containing the signed reset JWT in the JSON response payload.
**Learning:** Returning debug reset URLs or tokens in JSON responses exposes password recovery links to any requester, bypassing email delivery and enabling account takeover.
**Prevention:** Never include password reset links or authorization tokens in API responses. Log recovery links strictly on backend console for offline dev/test if needed, or send via secure email delivery only.
