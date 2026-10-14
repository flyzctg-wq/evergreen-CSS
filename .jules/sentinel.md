## 2026-10-14 - [Sensitive Token Leak in Password Reset Response]
**Vulnerability:** The password reset request endpoint returned `debugResetUrl` containing the JWT password reset token directly in the JSON API response payload.
**Learning:** Returning debug reset URLs in API responses allows attackers to reset any user's password without needing email delivery access.
**Prevention:** Do not include sensitive reset links or tokens in HTTP API responses.
