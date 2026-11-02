## 2026-11-02 - Password Reset Token Exposure in API Response and Logs
**Vulnerability:** The password reset request endpoint returned a `debugResetUrl` containing the signed recovery JWT in the JSON response body and printed the full URL to stdout, enabling arbitrary account takeover for any known email address.
**Learning:** Development/debug helpers such as returning mock or test URLs in JSON responses frequently persist into production code paths unless explicitly separated or removed.
**Prevention:** Never include authentication or recovery tokens directly in unauthenticated API responses or console logs. Keep token distribution restricted to out-of-band communication channels (e.g., email / SMS).
