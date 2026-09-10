# 🛡️ LIFEOS – SECURITY & COMPLIANCE

## 1. Authentication & Session Defense
- **Bcrypt Hashing**: Passwords stored using 10 rounds of salt.
- **JWT HTTP-Only Cookies**: JWT tokens delivered via `httpOnly`, `sameSite=lax`, and `secure` (in production) cookies to eliminate XSS token theft.
- **Role-Based Access Control (RBAC)**: All administrative routes (`/admin/*` and `/api/admin/*`) strictly validated server-side against user roles (`ADMIN`, `SUPER_ADMIN`, `SUPPORT`).

## 2. Payment & Financial Security
- **HMAC Signatures**: Every incoming payment callback from VNPay (SHA-512) and MoMo (SHA-256) is cryptographically validated using shared secret keys before altering subscription status.
- **Idempotency Keys**: Every payment request is bound to a unique idempotency key to prevent double-charging or race conditions.

## 3. Data Privacy & Isolation
- Multi-tenant tenant queries strictly scoped by `userId`.
- No user can view or manipulate data belonging to another user.
- Admin user inspection masks personal credentials and passwords.
