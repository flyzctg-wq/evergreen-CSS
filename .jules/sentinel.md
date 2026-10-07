## 2026-10-07 - Production Fallback Secrets Guard
**Vulnerability:** Hardcoded secret fallback strings for JWT access, refresh, and reset tokens allowed signature forgery if environment variables were omitted.
**Learning:** Hardcoded fallback strings in auth utilities can easily slip into production silently if env vars are missing.
**Prevention:** Enforce strict error throwing in production when secrets are missing and use `crypto.randomBytes` ephemeral keys for dev/test environments.
