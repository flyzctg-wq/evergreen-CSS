## 2026-10-13 - Replace static hardcoded secrets with random runtime fallbacks
**Vulnerability:** Static fallback secret keys for JWT, refresh tokens, and password reset tokens in `api/auth_utils.js` could allow attackers to forge valid tokens if environment variables are omitted.
**Learning:** Hardcoded default secrets in application code create significant risks if environment variables are unset or misconfigured.
**Prevention:** Always fallback to process-lifetime cryptographically secure random bytes (`crypto.randomBytes(32).toString("hex")`) if environment variables are absent.
