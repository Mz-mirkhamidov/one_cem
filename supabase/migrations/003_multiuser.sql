-- =============================================
-- 003: Ko'p foydalanuvchi tizimi
-- =============================================

-- 1. OPERATORS TABLE
CREATE TABLE IF NOT EXISTS operators (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone      TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  password   TEXT NOT NULL,  -- SHA256(password + 'crm_salt_2026')
  role       TEXT DEFAULT 'operator' CHECK (role IN ('admin', 'operator')),
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON operators TO anon;

-- 2. Add operator_id to all data tables
ALTER TABLE leads      ADD COLUMN IF NOT EXISTS operator_id UUID;
ALTER TABLE clients    ADD COLUMN IF NOT EXISTS operator_id UUID;
ALTER TABLE orders     ADD COLUMN IF NOT EXISTS operator_id UUID;
ALTER TABLE follow_ups ADD COLUMN IF NOT EXISTS operator_id UUID;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_leads_operator   ON leads(operator_id);
CREATE INDEX IF NOT EXISTS idx_leads_phone      ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_clients_operator ON clients(operator_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone    ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_orders_operator  ON orders(operator_id);
CREATE INDEX IF NOT EXISTS idx_fu_operator      ON follow_ups(operator_id);

-- 4. LOGIN function (SECURITY DEFINER — password safe)
CREATE OR REPLACE FUNCTION check_login(p_phone TEXT, p_password_hash TEXT)
RETURNS JSON AS $$
DECLARE op RECORD;
BEGIN
  SELECT id, name, phone, role INTO op
  FROM operators
  WHERE phone = p_phone AND password = p_password_hash AND is_active = true
  LIMIT 1;
  IF op.id IS NULL THEN
    RETURN json_build_object('success', false);
  END IF;
  RETURN json_build_object('success', true, 'id', op.id, 'name', op.name, 'phone', op.phone, 'role', op.role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION check_login TO anon;

-- 5. GLOBAL PHONE CHECK function
CREATE OR REPLACE FUNCTION check_phone_global(p_phone TEXT, p_exclude_operator UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE result JSON;
BEGIN
  SELECT json_build_object('found', true, 'owner_name', op.name, 'source', 'lidi')
  INTO result FROM leads l
  JOIN operators op ON op.id = l.operator_id
  WHERE l.phone = p_phone AND (p_exclude_operator IS NULL OR l.operator_id != p_exclude_operator)
  LIMIT 1;
  IF result IS NOT NULL THEN RETURN result; END IF;

  SELECT json_build_object('found', true, 'owner_name', op.name, 'source', 'mijozi')
  INTO result FROM clients c
  JOIN operators op ON op.id = c.operator_id
  WHERE c.phone = p_phone AND (p_exclude_operator IS NULL OR c.operator_id != p_exclude_operator)
  LIMIT 1;
  IF result IS NOT NULL THEN RETURN result; END IF;

  RETURN json_build_object('found', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION check_phone_global TO anon;

-- 6. GLOBAL SEARCH function
CREATE OR REPLACE FUNCTION search_phone_global(p_phone TEXT)
RETURNS TABLE(source_type TEXT, source_id UUID, source_name TEXT, phone TEXT, operator_name TEXT, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT 'lid'::TEXT, l.id, l.name, l.phone, op.name, l.created_at
  FROM leads l JOIN operators op ON op.id = l.operator_id
  WHERE l.phone ILIKE '%' || p_phone || '%';

  RETURN QUERY
  SELECT 'mijoz'::TEXT, c.id, c.name, c.phone, op.name, c.created_at
  FROM clients c JOIN operators op ON op.id = c.operator_id
  WHERE c.phone ILIKE '%' || p_phone || '%';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION search_phone_global TO anon;

-- 7. DEFAULT ADMINS
INSERT INTO operators (phone, name, password, role) VALUES
  ('+998889997777', 'Muzaffar', '2d569c0481db7775a576d15eb571df74bac6f1ad4133c2273371bea0833ab85f', 'admin'),
  ('887067372',     'TheXan',   'adf3ccd0f2e05cbdf0f5e957eefb1ba2cf96c5fa27ca6d82914646753b4776f0', 'admin')
ON CONFLICT (phone) DO NOTHING;

-- 8. Migrate existing data to first admin
UPDATE leads      SET operator_id = (SELECT id FROM operators WHERE phone = '+998889997777') WHERE operator_id IS NULL;
UPDATE clients    SET operator_id = (SELECT id FROM operators WHERE phone = '+998889997777') WHERE operator_id IS NULL;
UPDATE orders     SET operator_id = (SELECT id FROM operators WHERE phone = '+998889997777') WHERE operator_id IS NULL;
UPDATE follow_ups SET operator_id = (SELECT id FROM operators WHERE phone = '+998889997777') WHERE operator_id IS NULL;
