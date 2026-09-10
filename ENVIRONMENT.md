# ⚙️ LIFEOS – ENVIRONMENT VARIABLES REFERENCE

| Biến môi trường | Mục đích | Giá trị mẫu | Bắt buộc |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | URL gốc của ứng dụng | `http://localhost:3000` | Có |
| `JWT_SECRET` | Khóa bí mật ký token phiên làm việc | `lifeos-super-secret-jwt-key` | Có |
| `DATABASE_URL` | Chuỗi kết nối cơ sở dữ liệu (SQLite hoặc Postgres) | `file:./dev.db` | Có |
| `NEXT_PUBLIC_SUPABASE_URL` | URL của dự án Supabase | `https://ajpsdqdzeuvykgbvmkea.supabase.co` | Tùy chọn |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Khóa Publishable của Supabase | `sb_publishable_...` | Tùy chọn |
| `OPENAI_API_KEY` | Khóa API OpenAI / OpenRouter cho AI Assistant | `sk-...` | Tùy chọn |
| `VNPAY_TMN_CODE` | Mã website của bạn tại VNPay | `NOT_CONFIGURED` | Tùy chọn |
| `VNPAY_HASH_SECRET` | Chuỗi bí mật tạo chữ ký số SHA512 | `NOT_CONFIGURED` | Tùy chọn |
| `MOMO_PARTNER_CODE` | Mã đối tác MoMo | `MOMO_NOT_CONFIGURED` | Tùy chọn |
| `MOMO_SECRET_KEY` | Khóa bí mật tạo chữ ký HMAC-SHA256 | `NOT_CONFIGURED` | Tùy chọn |
| `STRIPE_SECRET_KEY` | Khóa bí mật Stripe API | `sk_test_...` | Tùy chọn |
| `STRIPE_WEBHOOK_SECRET` | Khóa kiểm tra chữ ký Webhook Stripe | `whsec_...` | Tùy chọn |
