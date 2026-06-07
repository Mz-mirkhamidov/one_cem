# Sellora Plus CRM

Shaxsiy CRM tizimi — Lidlar, Mijozlar, Zakazlar, Follow-up va Telegram bot.

## Tech Stack

- **Frontend:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **UI:** Tailwind CSS + Custom components
- **Deploy:** Vercel (GitHub bilan ulangan)
- **Bot:** Supabase Edge Functions (har kuni 09:00 Toshkent)

---

## Setup (Bir martalik)

### 1. Supabase sozlash

1. supabase.com → loyihangizni oching
2. SQL Editor → `supabase/migrations/001_initial.sql` faylini to'liq run qiling
3. Authentication → Users → Add user: `mz@crm.uz` + parolingiz

**Kerakli keys (Settings → API):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Vercel deploy

1. Bu reponi GitHub ga push qiling
2. Vercel → New Project → repo tanlash
3. Environment Variables qo'shing (yuqoridagi 2 ta)
4. Deploy — tayyor!

### 3. Telegram Bot (har kuni 09:00)

```bash
# Supabase CLI
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_ID

# Secrets
supabase secrets set TELEGRAM_BOT_TOKEN=your_token
supabase secrets set TELEGRAM_CHAT_ID=your_chat_id
supabase secrets set SUPABASE_URL=https://xxx.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key

# Deploy
supabase functions deploy telegram-daily
```

Cron: Supabase Dashboard → Edge Functions → telegram-daily → Schedule: `0 4 * * *`

---

## Login

| Panel | Email | Parol |
|-------|-------|-------|
| CRM (/login) | mz@crm.uz | Supabase Auth da o'rnating |

---

## Funksiyalar

- Dashboard: statistika + 7 kunlik grafik + bugungi ro'yxatlar
- Lidlar: CRUD + filter + zakaz berish + follow-up
- Mijozlar: CRUD + zakaz + follow-up
- Zakazlar: barcha zakazlar + keyinroqilar ajratilgan
- Follow-ups: bugungi (qizil) + kechikkanlar (sariq) + bajarildi belgisi
- Telegram: har kuni 09:00 da avtomatik xabar
