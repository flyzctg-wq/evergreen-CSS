## 2026-03-31 - Optimize User Lookup Caching & Base64URL JWT Encoding

**Learning:** `fs.readFileSync` calls on every fallback `getUser` request create significant I/O overhead (~400ms per 10k ops). Utilizing Node's native `base64url` Buffer encoding eliminates regex replace overhead for JWT signing/verification (~35% speedup).

**Action:** Maintain an in-memory Map for fallback user lookups and use native `base64url` in crypto digests and Buffer conversions.
