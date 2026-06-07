-- =============================================
-- SELLORA PLUS CRM — Supabase Schema
-- =============================================

-- 1. LEADS TABLE
CREATE TABLE IF NOT EXISTS leads (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  address     TEXT,
  tag         TEXT,
  status      TEXT NOT NULL DEFAULT 'Yangi'
              CHECK (status IN ('Yangi', 'Ko''rib chiqilmoqda', 'Kelishildi', 'Rad etildi', 'Buyurtma berilgan')),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. CLIENTS TABLE
CREATE TABLE IF NOT EXISTS clients (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  address     TEXT,
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source_type   TEXT NOT NULL CHECK (source_type IN ('lead', 'client')),
  source_id     UUID NOT NULL,
  source_name   TEXT NOT NULL,
  product       TEXT NOT NULL CHECK (product IN ('AJR Sedan', 'AJR MEN', 'AJR Women', 'AJR Kids', 'Estet')),
  price         DECIMAL(15, 2) NOT NULL DEFAULT 0,
  order_type    TEXT NOT NULL DEFAULT 'Hozirgi' CHECK (order_type IN ('Hozirgi', 'Keyinroqi')),
  scheduled_at  TIMESTAMPTZ,
  comment       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. FOLLOW_UPS TABLE
CREATE TABLE IF NOT EXISTS follow_ups (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source_type   TEXT NOT NULL CHECK (source_type IN ('lead', 'client')),
  source_id     UUID NOT NULL,
  source_name   TEXT NOT NULL,
  source_phone  TEXT NOT NULL,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  note          TEXT,
  status        TEXT NOT NULL DEFAULT 'Kutilmoqda'
                CHECK (status IN ('Kutilmoqda', 'Bajarildi')),
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE leads     ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients   ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;

-- Policies: user can only access their own data
CREATE POLICY "leads_owner" ON leads
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "clients_owner" ON clients
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "orders_owner" ON orders
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "follow_ups_owner" ON follow_ups
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- INDEXES (performance)
-- =============================================

CREATE INDEX IF NOT EXISTS idx_leads_user_id     ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at  ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_status      ON leads(status);

CREATE INDEX IF NOT EXISTS idx_clients_user_id   ON clients(user_id);

CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_source     ON orders(source_id, source_type);
CREATE INDEX IF NOT EXISTS idx_orders_scheduled  ON orders(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_follow_ups_user_id   ON follow_ups(user_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_scheduled ON follow_ups(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status    ON follow_ups(status);

-- =============================================
-- AUTO-UPDATE updated_at trigger
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at     BEFORE UPDATE ON leads     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER clients_updated_at   BEFORE UPDATE ON clients   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at    BEFORE UPDATE ON orders    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER follow_ups_updated_at BEFORE UPDATE ON follow_ups FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- SETUP NOTES:
-- 1. Run this SQL in Supabase Dashboard → SQL Editor
-- 2. Then create your user in Authentication → Users:
--    Email: mz@crm.uz  |  Password: (your choice)
-- 3. Copy your SUPABASE_URL and keys to Vercel env vars
-- =============================================
