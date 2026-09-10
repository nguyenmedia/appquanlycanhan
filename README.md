# 🚀 LIFEOS – Personal Life Management SaaS Multi-User

> **"Everything for your life, organized in one place."**

LifeOS là nền tảng SaaS thương mại hoàn chỉnh giúp người dùng cá nhân quản lý toàn diện mọi mặt cuộc sống: Công việc, Dự án, Lịch biểu, Thói quen, Mục tiêu (OKR), Tài chính cá nhân, Ghi chú, Nhật ký, Pomodoro, Sức khỏe, Học tập và Trợ lý AI.

Nền tảng tích hợp đầy đủ hệ thống kinh doanh SaaS doanh nghiệp: Phân tầng gói cước (Free, Pro, Premium), Đăng ký định kỳ (Subscription), Tích hợp cổng thanh toán (VNPay, MoMo, Stripe), Mã giảm giá (Coupons), Chương trình giới thiệu bạn bè (Referrals), Sổ cái hạn ngạch AI Credits Ledger, Customer CRM và Bảng điều khiển quản trị Admin toàn diện.

---

## 🌟 Tính Năng Nổi Bật

### 1. Hệ Thống Quản Lý Cuộc Sống (14 Module Chuyên Sâu)
- **Dashboard Tổng Quan**: Lịch trình trong ngày, việc khẩn cấp, điểm danh thói quen, tài sản ròng và kế hoạch AI đề xuất.
- **Công Việc (Tasks)**: Chế độ Kanban Board & Danh sách, phân loại ưu tiên (Khẩn cấp, Cao, Bình thường, Thấp), nhãn dán, liên kết dự án.
- **Dự Án (Projects)**: Theo dõi mục tiêu lớn với thanh tiến độ tự động tính theo tỷ lệ hoàn thành công việc.
- **Lịch Biểu (Calendar)**: Sắp xếp sự kiện, cuộc hẹn, phân loại công việc và cá nhân.
- **Thói Quen (Habits)**: Theo dõi chuỗi streak liên tục, lưới lịch sử 14 ngày (heatmap), điểm danh tức thì.
- **Mục Tiêu & OKR (Goals)**: Phân rã mục tiêu lớn thành các cột mốc (Milestones), cập nhật % tiến độ tự động.
- **Tài Chính Cá Nhân (Finance)**: Quản lý đa tài khoản (Ngân hàng, Ví MoMo, Tiền mặt), thu chi, ngân sách và theo dõi nợ.
- **Ghi Chú (Notes)**: Soạn thảo văn bản, tìm kiếm tức thì, ghim bài viết quan trọng, phân loại thư mục.
- **Nhật Ký Phản Tư (Journal)**: Ghi lại tâm trạng 1-5 sao, cảm xúc trong ngày, 3 điều biết ơn và bài học rút ra.
- **Đồng Hồ Tập Trung (Pomodoro)**: Chế độ 25 phút làm việc sâu / 5 phút nghỉ ngơi, theo dõi tổng số phút Deep Work.
- **Theo Dõi Sức Khỏe (Health)**: Ghi nhận cân nặng, giấc ngủ, lượng nước uống và thời gian tập thể dục mỗi ngày.
- **Học Tập & Kỹ Năng (Learning)**: Theo dõi tiến độ đọc sách, khóa học trực tuyến và đánh giá sao.
- **Danh Bạ Cá Nhân (Contacts)**: Quản lý mối quan hệ bạn bè, đối tác, khách hàng và nhật ký liên hệ.
- **Báo Cáo Năng Suất (Analytics)**: Điểm số hiệu suất tổng quan (Productivity Score), tỷ lệ hoàn thành và phân tích dòng tiền.

### 2. Nền Tảng Kinh Doanh SaaS (Business Engine)
- **Hệ Thống Phân Tầng Gói Cước**: Free, Pro (199.000đ/tháng), Premium (499.000đ/tháng), tiết kiệm 20% khi đóng theo năm.
- **Feature Entitlement & Usage Limits**: Kiểm tra quyền hạn tính năng tập trung (`hasFeature`, `checkLimit`), popup nâng cấp mượt mà không làm mất dữ liệu người dùng.
- **Cổng Thanh Toán Đa Kênh**:
  - **VNPay** (Việt Nam): Chữ ký số HMAC-SHA512, mã hóa chuẩn giao dịch ngân hàng & QR.
  - **MoMo** (Việt Nam): Chữ ký bảo mật HMAC-SHA256, xử lý IPN Webhook.
  - **Stripe** (Quốc tế): Hỗ trợ thanh toán thẻ quốc tế Visa/Mastercard, Webhook signature verification.
  - **Cơ chế Idempotency**: Chống xử lý thanh toán trùng lặp, tự động sinh Hóa đơn (Invoice) chuẩn.
- **Chương Trình Giới Thiệu (Referral)**: Mỗi người dùng sở hữu mã và liên kết giới thiệu riêng; cơ chế chống gian lận, tự động thưởng +7 ngày Pro và 50 AI Credits.
- **Mã Giảm Giá (Coupons)**: Áp dụng chiết khấu % hoặc số tiền cố định, kiểm tra hạn mức số lần dùng và đơn hàng tối thiểu.
- **Sổ Cái AI Credit Ledger**: Hạch toán minh bạch từng lượt sử dụng AI (Chat = 1c, Planner = 3c, Review = 5c, Finance = 5c, Coach = 10c).
- **Cổng Quản Trị Khách Hàng (Customer Billing Portal)**: Tự quản lý gói, xem đồng hồ đo tài nguyên, tải hóa đơn, xử lý quy trình hủy đăng ký thông minh (Churn Retention).

### 3. Bộ Công Cụ Quản Trị SaaS Admin & CRM
- **SaaS Executive Dashboard**: Đo lường thời gian thực các chỉ số sống còn: MRR, ARR, Churn Rate, Conversion Rate, Chi phí AI API.
- **Quản Trị Người Dùng (Users)**: Khóa/Mở khóa tài khoản, can thiệp gói cước thủ công có ghi vết Audit Log.
- **Customer CRM Pipeline**: Quản lý vòng đời khách hàng qua các trạng thái (Lead, Registered, Trial, Paid, Active, At Risk, Churned) và chấm điểm sức khỏe khách hàng (Health Score).
- **Trình Cấu Hình Gói (Plan Builder)**: Thay đổi giá bán, hạn ngạch tài nguyên trực tiếp từ giao diện Admin.
- **Trình Quản Trị Coupon**: Tạo mã khuyến mãi mới, kiểm soát số lượt đổi mã.
- **Bàn Hỗ Trợ Khách Hàng (Support Desk)**: Tiếp nhận ticket, trò chuyện giải đáp người dùng, phân loại mức độ khẩn cấp.
- **Cài Đặt Hệ Thống & Feature Flags**: Bật/Tắt chế độ bảo trì, bật/tắt đăng ký, điều chỉnh ngày dùng thử.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend & Server Engine**: Next.js 15+ (App Router), React 19, TypeScript.
- **Styling & UI**: Tailwind CSS v4, Lucide React Icons, Glassmorphism design tokens.
- **Database & ORM**: Prisma ORM, SQLite cho môi trường local/testing tức thì + Supabase PostgreSQL DDL (`supabase_schema.sql`) sẵn sàng triển khai đám mây.
- **Xác Thực & Bảo Mật**: JWT HTTP-only Cookies, Bcrypt Password Hashing, RBAC 4 vai trò (USER, SUPPORT, ADMIN, SUPER_ADMIN).
- **Kiểm Thử Tự Động**: Node Test Runner (`node --test tests/lifeos.test.js`).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Cấu hình biến môi trường
Sao chép `.env.example` thành `.env`:
```bash
cp .env.example .env
```
*(File `.env` đã được điền sẵn URL và Publishable Key của dự án Supabase)*

### 3. Đồng bộ Database & Nạp Dữ Liệu Mẫu
```bash
# Khởi tạo bảng cơ sở dữ liệu
npx prisma db push

# Nạp dữ liệu cấu hình ban đầu (Gói cước, Tài khoản mẫu, Coupon)
node prisma/seed.js
```

### 4. Khởi động môi trường phát triển
```bash
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:3000`

---

## 🔑 Tài Khoản Mẫu Có Sẵn

Sau khi chạy lệnh seed, hệ thống tạo sẵn các tài khoản thử nghiệm:

| Vai trò | Email | Mật khẩu | Chức năng truy cập |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@lifeos.app` | `Admin@123456` | Toàn quyền hệ thống, Bảng điều khiển `/admin` |
| **Customer Support** | `support@lifeos.app` | `Support@123456` | Tiếp nhận và xử lý Support Tickets, xem CRM |
| **User (Gói Pro)** | `user@lifeos.app` | `User@123456` | Đầy đủ dữ liệu mẫu về Tasks, Thói quen, Tài chính, AI |

---

## 🧪 Chạy Kiểm Thử Tự Động

```bash
npm test
```
Toàn bộ 11 bài kiểm thử tự động (Tính giá coupon, Trừ AI credit, Hạn mức gói cước, Chữ ký VNPay SHA512, Chữ ký MoMo HMAC-SHA256, Thưởng giới thiệu, Công thức MRR/ARR) đều vượt qua 100%.
