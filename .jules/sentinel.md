## 2026-10-21 - Remove Sensitive Password Reset Link Exposure
**Vulnerability:** Password reset endpoint (`/api/auth/reset`) returned `debugResetUrl` containing full JWT reset tokens in HTTP responses.
**Learning:** Returning debug reset URLs in API responses allows unauthorized actors to reset passwords for any account if email addresses are known.
**Prevention:** Never include password reset links or secret tokens in API response payloads; send reset links via secure channels (such as out-of-band email) or log strictly server-side in non-production environments.
