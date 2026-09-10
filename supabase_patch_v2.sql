-- =========================================================
-- LIFEOS SAAS - SUPABASE SQL PATCH (V2)
-- Copy and paste this into Supabase SQL Editor and click RUN
-- =========================================================

-- 1. ADD MISSING LIFE MODULE TABLES
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    duration_minutes INT NOT NULL DEFAULT 25,
    type TEXT NOT NULL DEFAULT 'work',
    completed BOOLEAN NOT NULL DEFAULT TRUE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS health_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    weight_kg NUMERIC(6,2),
    sleep_hours NUMERIC(4,2),
    water_ml INT,
    exercise_minutes INT,
    mood_score INT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS learning_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'book',
    author TEXT,
    total_units INT NOT NULL DEFAULT 100,
    completed_units INT NOT NULL DEFAULT 0,
    unit_type TEXT NOT NULL DEFAULT 'pages',
    status TEXT NOT NULL DEFAULT 'reading',
    notes TEXT,
    rating INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    size_bytes INT NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'Uncategorized',
    tags_json TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    role TEXT,
    relationship TEXT,
    notes TEXT,
    tags_json TEXT,
    last_contact_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    target_audience TEXT NOT NULL DEFAULT 'all',
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    cta_text TEXT,
    cta_link TEXT,
    priority TEXT NOT NULL DEFAULT 'info',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcement_reads (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    announcement_id TEXT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(announcement_id, user_id)
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    admin_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details_json TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_settings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ĐẢM BẢO BẢNG COUPONS CÓ CẢ CỘT NAME VÀ DESCRIPTION & DROP NOT NULL CHO VALID_UNTIL
ALTER TABLE IF EXISTS coupons ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE IF EXISTS coupons ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE IF EXISTS coupons ALTER COLUMN valid_until DROP NOT NULL;

-- 3. CẤP QUYỀN RLS MỞ CHO TẤT CẢ CÁC BẢNG ĐỂ CLIENT HOẠT ĐỘNG
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'users', 'user_profiles', 'plans', 'plan_features', 'plan_limits',
        'subscriptions', 'payment_transactions', 'invoices', 'coupons', 'referrals',
        'ai_credit_ledger', 'ai_usage', 'projects', 'tasks', 'calendar_events',
        'habits', 'habit_logs', 'goals', 'finance_accounts', 'finance_transactions',
        'budgets', 'debts', 'notes', 'journal_entries', 'pomodoro_sessions',
        'health_logs', 'learning_items', 'document_items', 'contacts',
        'customer_crm', 'support_tickets', 'support_messages', 'announcements',
        'announcement_reads', 'admin_audit_logs', 'system_settings'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
            EXECUTE format('DROP POLICY IF EXISTS "Public full access" ON %I;', tbl);
            EXECUTE format('CREATE POLICY "Public full access" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl);
        EXCEPTION
            WHEN OTHERS THEN null;
        END;
    END LOOP;
END $$;

-- 4. INSERT DỮ LIỆU GÓI CƯỚC & COUPON MẶC ĐỊNH
INSERT INTO plans (id, name, slug, description, price_monthly, price_yearly, currency, is_popular, is_active, is_public, sort_order)
VALUES 
    ('plan_free', 'Free', 'free', 'Quản lý cuộc sống cơ bản, miễn phí trọn đời cho cá nhân.', 0, 0, 'VND', FALSE, TRUE, TRUE, 1),
    ('plan_pro', 'LifeOS Pro', 'pro', 'Dành cho người năng suất cao, không giới hạn công việc & dự án.', 199000, 1990000, 'VND', TRUE, TRUE, TRUE, 2),
    ('plan_premium', 'LifeOS Premium', 'premium', 'Trải nghiệm đỉnh cao với AI Life Coach, tự động hóa và hỗ trợ VIP.', 499000, 4990000, 'VND', FALSE, TRUE, TRUE, 3)
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly;

INSERT INTO coupons (id, code, name, discount_type, discount_value, valid_until, is_active)
VALUES 
    ('cpn_welcome20', 'WELCOME20', 'Giảm 20% cho thành viên mới', 'PERCENT', 20, NOW() + INTERVAL '10 years', TRUE),
    ('cpn_pro50k', 'PRO50K', 'Giảm 50.000đ khi đăng ký Pro', 'FIXED', 50000, NOW() + INTERVAL '10 years', TRUE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO system_settings (key, value, description)
VALUES
    ('app_name', 'LifeOS', 'Tên ứng dụng SaaS'),
    ('app_tagline', 'Everything for your life, organized in one place.', 'Khẩu hiệu'),
    ('currency', 'VND', 'Đơn vị tiền tệ chính'),
    ('default_plan', 'free', 'Gói mặc định khi đăng ký'),
    ('trial_days', '14', 'Số ngày dùng thử Pro')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
