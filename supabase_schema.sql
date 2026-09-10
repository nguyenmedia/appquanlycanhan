-- =========================================================
-- LIFEOS SAAS PLATFORM - SUPABASE POSTGRESQL PRODUCTION DDL
-- Project URL: https://ajpsdqdzeuvykgbvmkea.supabase.co
-- =========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN', 'SUPPORT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sub_status AS ENUM ('trialing', 'active', 'past_due', 'paused', 'cancelled', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. USERS & PROFILES
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    referral_code TEXT UNIQUE NOT NULL,
    referred_by_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT 'LifeOS User',
    avatar_url TEXT,
    phone TEXT,
    bio TEXT,
    timezone TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    currency TEXT NOT NULL DEFAULT 'VND',
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    onboarding_goals TEXT,
    ai_allowed BOOLEAN NOT NULL DEFAULT TRUE,
    preferences_json TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SAAS PLANS & LIMITS
CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price_monthly NUMERIC(12,2) NOT NULL DEFAULT 0,
    price_yearly NUMERIC(12,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'VND',
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plan_features (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    feature_name TEXT NOT NULL,
    is_included BOOLEAN NOT NULL DEFAULT TRUE,
    value_json TEXT,
    UNIQUE(plan_id, feature_key)
);

CREATE TABLE IF NOT EXISTS plan_limits (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    limit_key TEXT NOT NULL,
    limit_value INT NOT NULL DEFAULT -1,
    period TEXT NOT NULL DEFAULT 'forever',
    UNIQUE(plan_id, limit_key)
);

-- 5. SUBSCRIPTIONS, INVOICES & PAYMENTS
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'trialing',
    billing_interval TEXT NOT NULL DEFAULT 'monthly',
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    cancelled_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    external_sub_id TEXT,
    payment_method TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_transactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id TEXT REFERENCES subscriptions(id) ON DELETE SET NULL,
    gateway TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'VND',
    status TEXT NOT NULL DEFAULT 'pending',
    provider_tx_id TEXT,
    provider_order_id TEXT,
    payment_method TEXT,
    metadata_json TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    invoice_number TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id TEXT REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'VND',
    status TEXT NOT NULL DEFAULT 'draft',
    paid_at TIMESTAMPTZ,
    invoice_pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT UNIQUE NOT NULL,
    name TEXT,
    description TEXT,
    discount_type TEXT NOT NULL DEFAULT 'PERCENT',
    discount_value NUMERIC(12,2) NOT NULL,
    min_order_value NUMERIC(12,2),
    max_discount NUMERIC(12,2),
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    max_uses INT,
    used_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    referrer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_type TEXT NOT NULL DEFAULT 'credits',
    reward_amount INT NOT NULL DEFAULT 50,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. AI USAGE & CREDIT LEDGER
CREATE TABLE IF NOT EXISTS ai_credit_ledger (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    change_type TEXT NOT NULL,
    amount INT NOT NULL,
    balance_after INT NOT NULL,
    reason TEXT,
    reference_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_usage (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt_tokens INT NOT NULL DEFAULT 0,
    completion_tokens INT NOT NULL DEFAULT 0,
    total_tokens INT NOT NULL DEFAULT 0,
    model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    feature TEXT NOT NULL,
    cost_credits INT NOT NULL DEFAULT 1,
    latency_ms INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PRODUCTIVITY & LIFE MODULES
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#6366f1',
    icon TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'TODO',
    priority TEXT NOT NULL DEFAULT 'MEDIUM',
    due_date TIMESTAMPTZ,
    estimated_minutes INT,
    actual_minutes INT,
    completed_at TIMESTAMPTZ,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_rule TEXT,
    tags_json TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_all_day BOOLEAN NOT NULL DEFAULT FALSE,
    location TEXT,
    color TEXT NOT NULL DEFAULT '#6366f1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    frequency TEXT NOT NULL DEFAULT 'daily',
    target_count INT NOT NULL DEFAULT 1,
    color TEXT NOT NULL DEFAULT '#10b981',
    icon TEXT,
    streak INT NOT NULL DEFAULT 0,
    best_streak INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT TRUE,
    count INT NOT NULL DEFAULT 1,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(habit_id, date)
);

CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    target_value NUMERIC(12,2) NOT NULL DEFAULT 100,
    current_value NUMERIC(12,2) NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT '%',
    target_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'in_progress',
    color TEXT NOT NULL DEFAULT '#f59e0b',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'cash',
    balance NUMERIC(14,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'VND',
    is_included_in_total BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_transactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id TEXT NOT NULL REFERENCES finance_accounts(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    period TEXT NOT NULL DEFAULT 'monthly',
    spent NUMERIC(14,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, category, period)
);

CREATE TABLE IF NOT EXISTS debts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    person_name TEXT NOT NULL,
    type TEXT NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    is_settled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    tags_json TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    content TEXT NOT NULL,
    mood TEXT,
    tags_json TEXT,
    gratitude_json TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, date)
);

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

-- 8. SAAS ADMIN, CRM, SUPPORT & AUDIT
CREATE TABLE IF NOT EXISTS customer_crm (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lifecycle_stage TEXT NOT NULL DEFAULT 'lead',
    health_score INT NOT NULL DEFAULT 100,
    tags_json TEXT,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    internal_notes TEXT,
    assigned_to TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_tickets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    ticket_number TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    ticket_id TEXT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL DEFAULT 'USER',
    message TEXT NOT NULL,
    attachments_json TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- Disable strict blocking so that API routes and anon clients can perform operations seamlessly
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

-- 10. DEFAULT SEED DATA
-- Plans
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

-- Coupons
INSERT INTO coupons (id, code, name, discount_type, discount_value, valid_until, is_active)
VALUES 
    ('cpn_welcome20', 'WELCOME20', 'Giảm 20% cho thành viên mới', 'PERCENT', 20, NOW() + INTERVAL '10 years', TRUE),
    ('cpn_pro50k', 'PRO50K', 'Giảm 50.000đ khi đăng ký Pro', 'FIXED', 50000, NOW() + INTERVAL '10 years', TRUE)
ON CONFLICT (code) DO NOTHING;

-- System Settings
INSERT INTO system_settings (key, value, description)
VALUES
    ('app_name', 'LifeOS', 'Tên ứng dụng SaaS'),
    ('app_tagline', 'Everything for your life, organized in one place.', 'Khẩu hiệu'),
    ('currency', 'VND', 'Đơn vị tiền tệ chính'),
    ('default_plan', 'free', 'Gói mặc định khi đăng ký'),
    ('trial_days', '14', 'Số ngày dùng thử Pro')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
