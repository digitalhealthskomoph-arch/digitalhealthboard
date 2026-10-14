-- =========================================================
-- Database Schema for IT Systems Inventory (9 Hospitals)
-- ทะเบียนระบบสารสนเทศ 9 โรงพยาบาล จ.สระแก้ว
-- =========================================================

-- 1. Hospitals Table (ตารางรายชื่อโรงพยาบาล)
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT,
  district TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert 9 Community/General Hospitals in Sa Kaeo Province if not exist
INSERT INTO hospitals (name, short_name, district, order_index)
SELECT 'โรงพยาบาลสมเด็จพระยุพราชสระแก้ว', 'รพร.สระแก้ว', 'เมืองสระแก้ว', 1
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name LIKE '%สมเด็จพระยุพราชสระแก้ว%');

INSERT INTO hospitals (name, short_name, district, order_index)
SELECT 'โรงพยาบาลคลองหาด', 'รพ.คลองหาด', 'คลองหาด', 2
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name LIKE '%คลองหาด%');

INSERT INTO hospitals (name, short_name, district, order_index)
SELECT 'โรงพยาบาลตาพระยา', 'รพ.ตาพระยา', 'ตาพระยา', 3
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name LIKE '%ตาพระยา%');

INSERT INTO hospitals (name, short_name, district, order_index)
SELECT 'โรงพยาบาลวังน้ำเย็น', 'รพ.วังน้ำเย็น', 'วังน้ำเย็น', 4
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name LIKE '%วังน้ำเย็น%');

INSERT INTO hospitals (name, short_name, district, order_index)
SELECT 'โรงพยาบาลวัฒนานคร', 'รพ.วัฒนานคร', 'วัฒนานคร', 5
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name LIKE '%วัฒนานคร%');

INSERT INTO hospitals (name, short_name, district, order_index)
SELECT 'โรงพยาบาลอรัญประเทศ', 'รพ.อรัญประเทศ', 'อรัญประเทศ', 6
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name LIKE '%อรัญประเทศ%');

INSERT INTO hospitals (name, short_name, district, order_index)
SELECT 'โรงพยาบาลเขาฉกรรจ์', 'รพ.เขาฉกรรจ์', 'เขาฉกรรจ์', 7
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name LIKE '%เขาฉกรรจ์%');

INSERT INTO hospitals (name, short_name, district, order_index)
SELECT 'โรงพยาบาลโคกสูง', 'รพ.โคกสูง', 'โคกสูง', 8
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name LIKE '%โคกสูง%');

INSERT INTO hospitals (name, short_name, district, order_index)
SELECT 'โรงพยาบาลวังสมบูรณ์', 'รพ.วังสมบูรณ์', 'วังสมบูรณ์', 9
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name LIKE '%วังสมบูรณ์%');


-- 2. Category Status per Hospital (สถานะของแต่ละหมวดในแต่ละ รพ. เช่น มีระบบ, ยังไม่มีระบบ, อยู่ระหว่างจัดหา)
CREATE TABLE IF NOT EXISTS hospital_it_category_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'has_system', -- 'has_system', 'no_system', 'in_procurement'
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_hospital_category UNIQUE(hospital_id, category_id)
);


-- 3. Systems Items (รายการระบบย่อยในแต่ละหมวดของแต่ละ รพ.)
CREATE TABLE IF NOT EXISTS hospital_it_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  system_name TEXT NOT NULL,
  sub_type_tag TEXT,
  developer_type TEXT DEFAULT 'vendor', -- 'in_house', 'vendor', 'central', 'other'
  vendor_name TEXT,
  go_live_year TEXT,
  deployment_type TEXT DEFAULT 'on_premise', -- 'on_premise', 'cloud', 'subscription', 'local', 'other'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hospital_it_systems_hosp ON hospital_it_systems(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_it_systems_cat ON hospital_it_systems(category_id);
CREATE INDEX IF NOT EXISTS idx_hospital_it_cat_status_hosp ON hospital_it_category_status(hospital_id);


-- 4. Enable RLS and Permissive Policies (ให้ anon และ auth อ่าน/เขียนได้)
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_it_category_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_it_systems ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for anon" ON hospitals;
CREATE POLICY "Enable all access for anon" ON hospitals FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for authenticated" ON hospitals;
CREATE POLICY "Enable all access for authenticated" ON hospitals FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for anon" ON hospital_it_category_status;
CREATE POLICY "Enable all access for anon" ON hospital_it_category_status FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for authenticated" ON hospital_it_category_status;
CREATE POLICY "Enable all access for authenticated" ON hospital_it_category_status FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for anon" ON hospital_it_systems;
CREATE POLICY "Enable all access for anon" ON hospital_it_systems FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for authenticated" ON hospital_it_systems;
CREATE POLICY "Enable all access for authenticated" ON hospital_it_systems FOR ALL TO authenticated USING (true) WITH CHECK (true);
