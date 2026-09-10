# 🔄 LIFEOS – SUBSCRIPTIONS & LIFECYCLE MANAGEMENT

## 1. Subscription Lifecycle States
- `trialing`: User on active 14-day Pro trial.
- `active`: Subscribed user in good standing.
- `past_due`: Renewal payment pending or failed.
- `paused`: Temporarily halted subscription.
- `cancelled`: Flagged `cancelAtPeriodEnd = true`, user retains access until period end.
- `expired`: Subscription period ended, automatically downgrades to Free.

## 2. No Data Loss on Downgrade Policy
- When a user downgrades from Pro to Free, all existing tasks, projects, notes, and habits are preserved.
- The system only blocks the creation of new items beyond the Free plan quota.
- Full data viewing and export remain accessible at all times.

## 3. Churn Prevention Flow
When a user clicks "Hủy đăng ký" in the Billing Portal:
1. Modal collects specific churn reason ("Too expensive", "Not enough time", "Missing features").
2. Dynamic retention offer presented: 20% discount coupon (`WELCOME20`) for the next billing cycle.
3. If user confirms, subscription is cancelled at the period end without immediate disruption.
