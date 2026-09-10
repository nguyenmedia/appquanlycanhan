# 🏛️ LIFEOS – SYSTEM ARCHITECTURE

## 1. High-Level Architecture

```text
                               ┌─────────────────────────────┐
                               │   Client Layer (Next.js 15) │
                               │  Tailwind CSS + Lucide Icons│
                               │  Desktop & Mobile PWA UX    │
                               └──────────────┬──────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────┐
                               │       App Router API        │
                               │   Middleware & Auth Guard   │
                               │   Rate Limit & Entitlements │
                               └──────────────┬──────────────┘
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     ▼                                                 ▼
      ┌─────────────────────────────┐                   ┌─────────────────────────────┐
      │     Personal Life Modules   │                   │    SaaS Business Engine     │
      ├─────────────────────────────┤                   ├─────────────────────────────┤
      │ • Tasks (Kanban / List)     │                   │ • Plans & Limits Config     │
      │ • Projects Management       │                   │ • Subscription Lifecycle    │
      │ • Interactive Calendar      │                   │ • Payments (VNPay/MoMo/     │
      │ • Habits & Streak Engine    │                   │   Stripe)                   │
      │ • Goals & OKR Milestones    │                   │ • Coupon & Discount Engine  │
      │ • Finance & Budget Control  │                   │ • Referral Anti-Abuse       │
      │ • Notes, Journal & Contacts │                   │ • AI Credit Ledger          │
      │ • Pomodoro Deep Work Timer  │                   │ • Customer CRM & Health     │
      │ • Health & Learning Track   │                   │ • Support Desk & Ticketing  │
      │ • Analytics & Insights      │                   │ • Admin SaaS Metrics        │
      └──────────────┬──────────────┘                   └──────────────┬──────────────┘
                     │                                                 │
                     └────────────────────────┬────────────────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────┐
                               │       Prisma ORM Layer      │
                               │   SQLite (Zero-Latency Dev) │
                               │   Postgres/Supabase (Prod)  │
                               └─────────────────────────────┘
```

## 2. Authentication & Authorization Flow

1. User requests `/api/auth/login` or `/api/auth/register`.
2. Password verified using `bcryptjs` with salt round 10.
3. System issues signed JWT token stored in secure, `httpOnly`, `sameSite=lax` cookie (`lifeos_token`).
4. Every protected API route invokes `requireAuth(req)` or `requireRole(req, ['ADMIN', 'SUPER_ADMIN'])`.

## 3. SaaS Business Flow

```text
User Selects Pro Plan
  ↓
Cart Checkout (/api/payments/checkout)
  ↓
Apply Coupon (Backend Recalculates Discount)
  ↓
Create Pending PaymentTransaction with Unique Idempotency Key
  ↓
Redirect to Payment Gateway (VNPay / MoMo / Stripe)
  ↓
Payment Gateway Callback & Webhook Verification
  ↓
Verify Cryptographic Signature (HMAC-SHA512 for VNPay, HMAC-SHA256 for MoMo)
  ↓
Activate Subscription & Extend Expiry Date
  ↓
Generate Official Invoice Record
  ↓
Grant AI Monthly Credits Allocation
  ↓
Qualify Referral (Reward Referrer with +7 Days Pro & 50 Credits)
  ↓
Update Customer CRM Lifecycle Stage to "Paid" (Health Score: 100)
```
