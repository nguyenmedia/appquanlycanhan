# 🎁 LIFEOS – REFERRAL PROGRAM ARCHITECTURE

## 1. Mechanics
- Every registered user is assigned a unique alphanumeric referral code (e.g. `USERLIFE26`).
- Referral URL format: `https://lifeos.app/register?ref=USERLIFE26`.
- Registration endpoint automatically binds the new user's `referredById` to the referrer's `userId`.

## 2. Anti-Abuse & Fraud Protection
- **Self-referral prevention**: Users cannot refer their own email address or device identity.
- **Qualification condition**: Rewards are not granted simply upon free registration; rewards only unlock when the referred friend upgrades to any paid plan.
- **One-time reward**: Accounts cannot be referred more than once.

## 3. Automated Rewards
Upon successful qualification:
- Referrer receives **+7 days Pro subscription extension**.
- Referrer receives **+50 bonus AI Credits**.
