## 2025-05-18 - Timing Attack Vulnerability in PBKDF2 Password and JWT Signature Comparisons
**Vulnerability:** String equality comparison (`===` and `!==`) was used in `api/auth_utils.js` for checking PBKDF2 password hashes (`hash === checkHash`) and JWT signature HMACs (`signatureStr !== expectedSignature`).
**Learning:** Standard string comparisons in JavaScript short-circuit upon encountering the first non-matching byte or character, exposing cryptographic hash and token signature checks to timing side-channel attacks.
**Prevention:** Always use Node.js `crypto.timingSafeEqual()` (with Buffer conversion and byte-length parity checks) when comparing password hashes, HMAC signatures, or token secrets.
