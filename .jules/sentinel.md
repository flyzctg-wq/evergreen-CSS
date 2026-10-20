## 2025-05-18 - Constant-Time Comparison for Passwords and JWT Verification

**Vulnerability:** String comparison operators (`===` and `!==`) were used for comparing hashed password strings and HMAC signatures during JWT verification in `api/auth_utils.js`. Standard string equality comparison leaks timing information based on how many initial characters match before a mismatch is found, opening up timing side-channel attacks.

**Learning:** When verifying cryptographic values (hashes, tokens, HMAC signatures), standard string equality operator returns early on the first byte mismatch. An attacker can exploit this timing discrepancy to guess valid signatures or password hashes byte by byte.

**Prevention:** Always use `crypto.timingSafeEqual` (or a helper function that checks string lengths before calling `crypto.timingSafeEqual`) when comparing sensitive cryptographic data like password hashes, API keys, and JWT signatures.
