## 2025-05-18 - Constant-Time Comparison for HMAC Signatures and Password Hashes
**Vulnerability:** Standard string equality (`===`) in JWT signature and PBKDF2 password hash comparisons allowed timing side-channel attacks.
**Learning:** `crypto.timingSafeEqual` throws a `RangeError` if Buffer lengths differ, so length check and string type verification must precede the comparison.
**Prevention:** Use a `safeCompare` helper that validates string type and byte lengths before calling `crypto.timingSafeEqual`.
