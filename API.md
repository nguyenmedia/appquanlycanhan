# 🌐 LIFEOS – API SPECIFICATION

All endpoints return JSON responses. Protected endpoints expect the `lifeos_token` cookie or `Authorization: Bearer <token>` header.

## 1. Authentication
- `POST /api/auth/register`: Create user account with referral attribution and initial AI credits.
- `POST /api/auth/login`: Authenticate email/password and set secure HTTP-only session cookie.
- `POST /api/auth/logout`: Clear session cookie.
- `GET /api/auth/me`: Current session user, active plan, entitlements, and credit balance.
- `POST /api/onboarding`: Save onboarding survey choices.

## 2. SaaS Billing & Subscriptions
- `GET /api/pricing`: List all active pricing plans with feature matrix and limits.
- `POST /api/coupons/validate`: Validate coupon code against selected plan.
- `POST /api/payments/checkout`: Initiate payment with VNPay, MoMo, or Stripe; apply coupon, create idempotency record.
- `GET /api/payments/callback/[provider]`: User redirect return handler from payment gateway.
- `POST /api/payments/webhook/[provider]`: Server-to-server IPN webhook handler with signature validation.
- `GET /api/usage`: Current resource consumption against active plan limits.
- `GET /api/referrals`: User referral link, stats, and Pro days reward history.

## 3. Artificial Intelligence
- `POST /api/ai/chat`: Execute AI prompt (`ai_chat`, `ai_planner`, `ai_review`, `ai_finance`, `ai_coach`), deduct credits from ledger.

## 4. Life Management Modules
- `GET, POST, PATCH, DELETE /api/tasks`: Manage tasks and Kanban status.
- `GET, POST, DELETE /api/projects`: Manage projects with progress tracking.
- `GET, POST, DELETE /api/calendar`: Manage calendar events and schedules.
- `GET, POST, DELETE /api/habits`: Manage habits and frequency.
- `POST /api/habits/check`: Toggle daily habit completion and recalculate streaks.
- `GET, POST, PATCH, DELETE /api/goals`: Manage goals and milestone items.
- `GET, POST /api/finance`: Manage accounts, transactions (with atomic balance updates), budgets, and debts.
- `GET, POST, PATCH, DELETE /api/notes`: Manage markdown notes and pinning.
- `GET, POST /api/journal`: Daily journal reflections and 1-5 mood score.
- `GET, POST, DELETE /api/contacts`: Manage personal contacts CRM.
- `GET, POST /api/health`: Daily health metrics (weight, sleep, water, exercise).
- `GET, POST, PATCH, DELETE /api/learning`: Track books and course units.
- `GET, POST /api/pomodoro`: Log completed 25m/5m Pomodoro sessions.
- `GET, POST /api/support`: User support ticket creation and conversation messaging.

## 5. Admin SaaS & CRM
- `GET /api/admin/metrics`: MRR, ARR, Churn, Conversion, Total Users, AI API cost.
- `GET, PATCH /api/admin/users`: User directory, plan override, account suspend.
- `GET, PATCH /api/admin/crm`: Customer lifecycle pipeline and Health Score.
- `GET, PATCH /api/admin/plans`: Dynamic Plan Builder (prices, limits).
- `GET, POST, PATCH /api/admin/coupons`: Coupon Builder (discount %/fixed, expiry).
- `GET, POST /api/admin/support`: Admin support desk (ticket replies, status transitions).
- `GET, POST /api/admin/settings`: System settings and runtime feature flags.
