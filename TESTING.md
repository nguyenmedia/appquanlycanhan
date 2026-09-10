# LifeOS – Testing & Quality Assurance Guide

This document outlines the testing strategy, test coverage, test scripts, and automated quality assurance mechanisms implemented in LifeOS.

---

## 1. Test Suite Overview

LifeOS uses the native high-performance Node.js test runner (`node:test` + `node:assert/strict`) for deterministic and lightning-fast unit and integration testing without heavy external dependencies.

Run all tests via:
```bash
npm test
# OR directly
node --test tests/lifeos.test.js
```

---

## 2. Test Coverage Matrix

| Test Suite | Test Case Description | Verified Behavior | Status |
| :--- | :--- | :--- | :---: |
| **Coupons Engine** | Percentage Discount (`WELCOME20`) | Correctly discounts 20% on 199,000 VND -> 159,200 VND | ✅ PASS |
| **Coupons Engine** | Fixed Discount (`PRO50K`) | Correctly discounts 50,000 VND on 199,000 VND -> 149,000 VND | ✅ PASS |
| **Coupons Engine** | Discount Cap Protection | Prevents discount from creating negative payable amounts | ✅ PASS |
| **AI Credit Ledger** | Credit Debit & Balance Tracking | Successfully deducts credits and maintains positive ledger | ✅ PASS |
| **AI Credit Ledger** | Insufficient Balance Guard | Halts AI operations when balance is below feature cost | ✅ PASS |
| **Entitlement & Quotas**| Free Plan Limit Restriction | Blocks resource creation when quota reaches max limit | ✅ PASS |
| **Entitlement & Quotas**| Pro Plan Unlimited Bypass | Allows infinite creation when limit = -1 | ✅ PASS |
| **Payment Gateways** | VNPay HMAC-SHA512 Signature | Verifies cryptographic request & callback signature integrity | ✅ PASS |
| **Payment Gateways** | MoMo HMAC-SHA256 Signature | Verifies cryptographic payload hashing for callback safety | ✅ PASS |
| **Growth & Referral** | 7-Day Pro Referral Grant | Automatically calculates and extends subscription end date by 7 days | ✅ PASS |
| **SaaS Metrics** | MRR & ARR Financial Calculation | Accurately normalizes monthly and yearly billing intervals into MRR/ARR | ✅ PASS |

---

## 3. Production Build Validation

In addition to unit testing, the entire TypeScript compilation and Next.js App Router tree are validated:

```bash
npm run build
```

Expected Output:
```
✓ Compiled successfully
✓ Generating static pages (64/64)
✓ Finalizing page optimization
Exit Code: 0
```

All 64 routes (Landing, Auth, Onboarding, 14 Life Modules, Billing, AI Coaching, Referrals, Admin Dashboard, CRM, Support Desk, API endpoints) compile without warnings or unhandled exceptions.

---

## 4. Manual QA Verification Checklist

### Authentication & RBAC
- [x] Register new user -> redirects to `/onboarding`.
- [x] Completed onboarding -> grants 50 free AI credits and redirects to `/dashboard`.
- [x] Unauthenticated access to `/dashboard` -> 307 redirect to `/login`.
- [x] Non-admin access to `/admin` -> returns 403 Forbidden.
- [x] Admin login (`admin@lifeos.app` / `Admin@123456`) -> full access to `/admin` metrics, users, CRM, and system settings.

### Life Management Modules
- [x] **Tasks**: Kanban / List view, status toggling, priority, tags, project assignment.
- [x] **Habits**: Daily streak counters, check-in completion toggling.
- [x] **Finance**: Multi-account balance aggregation, income/expense logging, budget alerts.
- [x] **Projects & Goals**: Milestone tracking and progress bars.
- [x] **Notes & Journal**: Tagging, pinned notes, rich reflection logging.
- [x] **Pomodoro**: Focus timer, break cycles, completed session history.
- [x] **Health, Learning, Contacts**: Specialized category tracking and status filters.

### AI Engine & Credit Ledger
- [x] Deducts appropriate credits per action (`/api/ai/chat` costs 2 credits).
- [x] Rejects request when credit balance reaches 0 with upgrade prompt.
- [x] Logs full prompt and response token usage to `AIUsage` audit table.

### Payments & Invoicing
- [x] Stripe Checkout / Webhook simulator: Idempotent processing using transaction ref.
- [x] VNPay SHA-512 callback verification.
- [x] MoMo SHA-256 callback verification.
- [x] Automatic `Invoice` creation with sequential number (`INV-XXXXXX`).
- [x] Automatic `Subscription` upgrade to Pro/Premium.
