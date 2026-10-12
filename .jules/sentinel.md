## 2026-10-12 - PBKDF2 Iteration Count & Password Policy Alignment
**Vulnerability:** Weak PBKDF2 iteration count (1,000 iterations) in password hashing permitted fast offline brute-force attacks, and `validatePassword` previously enforced a 6-digit PIN rather than strong password complexity rules.
**Learning:** Legacy password hashing methods with low iteration counts need fallback verification support so existing user hashes continue working when updating key derivation security.
**Prevention:** Always use at least 100,000 iterations for PBKDF2-SHA512 (or Argon2/bcrypt), align validation helpers with documented policy rules, and maintain backward-compatible hash verification logic during upgrades.
