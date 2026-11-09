# Sentinel Security Journal

## 2026-07-06 - Timing attack prevention in cryptographic verification
**Vulnerability:** String comparison (`===`) in `verifyPassword` and `verifyJWT` was vulnerable to timing attacks, allowing attackers to measure execution differences to infer hash or signature bytes.
**Learning:** Custom JWT verification and password verification functions implemented in Node.js should always use `crypto.timingSafeEqual` with buffer length validation rather than standard equality operators.
**Prevention:** Always compare sensitive cryptographic hashes, MACs, and signatures using `crypto.timingSafeEqual(bufA, bufB)` after ensuring equal buffer byte lengths.
