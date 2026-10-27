# Sentinel Security Journal

## 2025-05-10 - Constant-Time String Comparison for Password Verification and JWT Signatures
**Vulnerability:** Non-constant-time string comparison (`===` and `!==`) was used for verifying PBKDF2 password hashes and HMAC-SHA256 JWT signatures in `api/auth_utils.js`.
**Learning:** Standard string comparisons terminate early on the first mismatched byte, creating timing side-channel vulnerabilities where microsecond timing differences reveal valid hash or signature prefixes.
**Prevention:** Always use constant-time string comparison (`crypto.timingSafeEqual`) with pre-checked length matching for cryptographic token and password hash verifications.
