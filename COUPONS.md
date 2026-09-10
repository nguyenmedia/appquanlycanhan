# 🏷️ LIFEOS – COUPON & PROMOTION ENGINE

## 1. Structure
- `code`: Unique uppercase promotion string (e.g. `WELCOME20`, `PRO50K`).
- `discountType`: `"percentage"` (%) or `"fixed"` (VND).
- `discountValue`: Numerical value (20 for 20%, 50000 for 50.000đ).
- `maxRedemptions`: Total allowable redemptions across all users.
- `perUserLimit`: Per-user redemption limit (default 1).
- `validFrom` & `validUntil`: Active date range.
- `minimumAmount`: Minimum order value required for redemption.

## 2. Server-Side Recalculation Rule
The frontend calculates a preview for responsiveness, but the backend **always** recalculates the discount and final amount upon checkout to prevent client-side tampering.
