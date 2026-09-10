# 🧠 LIFEOS – AI ENGINE & CREDIT LEDGER

## 1. Credit Economics & Pricing Matrix

| Tính năng AI | Chi phí Credits | Quyền hạn tối thiểu | Mô tả |
| :--- | :---: | :---: | :--- |
| **AI Chat Assistant** | 1 | Free, Pro, Premium | Hỏi đáp thông tin, tư vấn phương pháp sống |
| **AI Daily Planner** | 3 | Pro, Premium | Lập kế hoạch phân bổ khung giờ Deep Work trong ngày |
| **AI Weekly Review** | 5 | Pro, Premium | Đánh giá năng suất tuần, phát hiện nút thắt |
| **AI Finance Insights** | 5 | Pro, Premium | Phân tích cơ cấu chi tiêu & dòng tiền cá nhân |
| **AI Life Coach** | 10 | Premium | Lập chiến lược phát triển cá nhân và OKR quý |

## 2. Double-Entry AI Credit Ledger
Every debit or credit transaction is immutably logged into `AICreditLedger`:
- `grant`: Monthly plan credit allocation (+20 Free, +300 Pro, +1000 Premium).
- `bonus`: +50 credits from referral rewards.
- `usage`: Deduction when invoking AI tools (-1, -3, -5, -10 credits).
- `refund`: Returned credits if an upstream AI provider errors.

## 3. Strict Context Isolation & User Privacy
- AI operations only aggregate data belonging to the authenticated `user.id`.
- Users can disable AI analysis at any time via Privacy Settings (`aiAllowed: false`).
- Sensitive card numbers and passwords are never passed to AI prompts.
