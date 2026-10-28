## 2026-10-28 - Constant-Time Cryptographic Token & Hash Verification
**Vulnerability:** Non-constant time string comparison (`===` and `!==`) in `verifyPassword` and `verifyJWT` exposed the authentication system to timing side-channel attacks.
**Learning:** Using JavaScript standard string equality allows subtle variations in comparison duration based on matching characters, enabling potential byte-by-byte reconstruction of signatures or hashes.
**Prevention:** Always convert strings/hashes to `Buffer` and verify length equality before applying `crypto.timingSafeEqual` for all cryptographic checks.
