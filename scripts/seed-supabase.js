const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ajpsdqdzeuvykgbvmkea.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_9PTsLHlLExGiO7w391Z7NA_SAzLfFJX';

const supabase = createClient(url, key);

async function seed() {
  console.log('Seeding initial SaaS Plans into Supabase...');

  // 1. Plans
  const plans = [
    {
      id: 'plan_free',
      name: 'Free',
      slug: 'free',
      description: 'Quản lý cuộc sống cơ bản, miễn phí trọn đời cho cá nhân.',
      price_monthly: 0,
      price_yearly: 0,
      currency: 'VND',
      is_popular: false,
      is_active: true,
      is_public: true,
      sort_order: 1
    },
    {
      id: 'plan_pro',
      name: 'LifeOS Pro',
      slug: 'pro',
      description: 'Dành cho người năng suất cao, không giới hạn công việc & dự án.',
      price_monthly: 199000,
      price_yearly: 1990000,
      currency: 'VND',
      is_popular: true,
      is_active: true,
      is_public: true,
      sort_order: 2
    },
    {
      id: 'plan_premium',
      name: 'LifeOS Premium',
      slug: 'premium',
      description: 'Trải nghiệm đỉnh cao với AI Life Coach, tự động hóa và hỗ trợ VIP.',
      price_monthly: 499000,
      price_yearly: 4990000,
      currency: 'VND',
      is_popular: false,
      is_active: true,
      is_public: true,
      sort_order: 3
    }
  ];

  for (const p of plans) {
    const { data, error } = await supabase.from('plans').upsert(p, { onConflict: 'slug' }).select();
    if (error) {
      console.log(`Error seeding plan ${p.slug}:`, error.message);
    } else {
      console.log(`Seeded plan: ${p.name}`);
    }
  }

  // 2. Coupons
  const coupons = [
    {
      id: 'cpn_welcome20',
      code: 'WELCOME20',
      description: 'Giảm 20% cho thành viên mới',
      discount_type: 'PERCENT',
      discount_value: 20,
      is_active: true,
      max_uses: 1000
    },
    {
      id: 'cpn_pro50k',
      code: 'PRO50K',
      description: 'Giảm ngay 50.000đ khi đăng ký Pro',
      discount_type: 'FIXED',
      discount_value: 50000,
      is_active: true,
      max_uses: 500
    }
  ];

  for (const c of coupons) {
    const { data, error } = await supabase.from('coupons').upsert(c, { onConflict: 'code' }).select();
    if (error) {
      console.log(`Error seeding coupon ${c.code}:`, error.message);
    } else {
      console.log(`Seeded coupon: ${c.code}`);
    }
  }

  console.log('Finished seeding initial data to Supabase!');
}

seed();
