# 🚀 LIFEOS – DEPLOYMENT GUIDE

## 1. Vercel Deployment (Frontend & Serverless API)
1. Push this repository to GitHub / GitLab.
2. Import project into Vercel.
3. Configure environment variables in Vercel Project Settings (from `.env.example`).
4. Build command: `npm run build`
5. Output directory: Default (`.next`).

## 2. Supabase PostgreSQL Deployment (Cloud Database)
1. Navigate to your Supabase Project: `https://ajpsdqdzeuvykgbvmkea.supabase.co`.
2. Open the **SQL Editor**.
3. Copy and execute the provided `supabase_schema.sql` script.
4. In Vercel environment variables, set `DATABASE_URL` to your Supabase Transaction/Session pooler connection string.
5. Run `npx prisma generate` during build.

## 3. Scheduled Cron Jobs
Configure Vercel Cron or GitHub Actions to hit scheduled maintenance endpoints:
- AI credit monthly resets
- Expired subscription checks
- Daily reminder emails.
