# 🗄️ LIFEOS – DATABASE DOCUMENTATION

## 1. Relational Entity Relationship Summary

The LifeOS database is organized into 5 functional clusters across 32 models:

### 1.1 User & Identity Cluster
- `User`: Core authentication record (`id`, `email`, `passwordHash`, `role`, `status`, `referralCode`, `referredById`).
- `UserProfile`: Personal details (`fullName`, `timezone`, `currency`, `onboardingCompleted`, `aiAllowed`).
- `AdminAuditLog`: Records all sensitive admin overrides with admin user ID and JSON details.

### 1.2 SaaS Business Cluster
- `Plan`: Pricing plans (Free, Pro, Premium).
- `PlanFeature`: Dynamic feature flags mapped per plan (`ai_assistant`, `ai_planner`, `export_data`).
- `PlanLimit`: Resource quotas (`projects`, `tasks`, `habits`, `goals`, `documents_mb`, `ai_credits`).
- `Subscription`: Active/past billing cycles, renewal timestamps, provider subscription IDs.
- `SubscriptionEvent`: Lifecycle events audit (created, upgraded, renewed, cancelled).
- `PaymentTransaction`: Payment records with `idempotencyKey`, provider reference, and payment method.
- `Invoice`: Official bill generated for each completed transaction.
- `Coupon` & `CouponRedemption`: Discount promotion system with redemption limits.
- `Referral`: Referral code bindings, qualification status, and reward day grants.

### 1.3 AI System Cluster
- `AICreditLedger`: Full double-entry-like ledger tracking every credit grant, usage, refund, and bonus.
- `AIUsage`: API telemetries tracking input/output tokens, model, and estimated cost in USD.

### 1.4 Life Management Cluster
- `Project`: Workspaces grouping tasks with auto-calculated progress percentage.
- `Task`: Kanban items with priorities (`urgent`, `high`, `medium`, `low`), due dates, and completion status.
- `CalendarEvent`: Scheduled timeline entries with category tags and time ranges.
- `Habit` & `HabitLog`: Habit definitions, daily completion tracking, and streak history.
- `Goal` & `GoalMilestone`: OKR targets with percentage progress bars and sub-milestones.
- `FinanceAccount`: Multi-account balances (Cash, Bank, E-wallet, Credit card).
- `FinanceTransaction`: Incomes, expenses, and transfers with atomic balance adjustments.
- `Budget`: Monthly spending alert thresholds.
- `Debt`: Borrowed and lent loans.
- `Note`: Pinned and tagged markdown notes.
- `JournalEntry`: Daily reflections with 1-5 mood score and gratitude logs.
- `HealthLog`: Sleep, weight, water, and exercise entries.
- `LearningItem`: Books, online courses, and skills study progress.
- `PomodoroSession`: Deep work focus sessions (25m / 5m).
- `Contact`: Personal relationships CRM.

### 1.5 Support & CRM Cluster
- `CustomerCRM`: Customer lifecycle stages (Lead, Registered, Trial, Paid, Active, At Risk, Churned) and Health Score.
- `SupportTicket` & `SupportMessage`: Two-way customer ticket threads between users and support specialists.
- `SystemSetting`: Global SaaS key-value runtime configuration.
