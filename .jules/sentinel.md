# Sentinel's Security Journal

## 2025-05-18 - Password Reset Token Exposure and Account Enumeration
**Vulnerability:** The password reset request handler returned `debugResetUrl` containing the signed JWT reset token in the HTTP response JSON for existing users, and returned a different message for nonexistent users. This allowed any unauthenticated actor knowing or guessing an email address to obtain the reset URL and take over accounts, as well as enumerate valid user emails.
**Learning:** During development or offline testing, convenience debug parameters (`debugResetUrl`) can easily leak sensitive credentials directly to API clients. Additionally, divergent responses between existing and non-existent users leak account presence.
**Prevention:** Keep password reset link delivery strictly out-of-band (e.g. server-side logging or secure email delivery) and return identical generic success messages for both existing and non-existing accounts.
