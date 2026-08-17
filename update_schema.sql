-- ==========================================
-- Database Schema Update for Strategic Plan Book
-- ==========================================

-- 1. Strategic Plans (เก็บข้อมูลส่วนที่ 1 - 3 แบบภาพรวม)
CREATE TABLE IF NOT EXISTS strategic_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL DEFAULT 'แผนยุทธศาสตร์สุขภาพดิจิทัล',
  rationale TEXT,
  scope JSONB DEFAULT '[]'::jsonb,
  alignment TEXT,
  swot_s JSONB DEFAULT '[]'::jsonb,
  swot_w JSONB DEFAULT '[]'::jsonb,
  swot_o JSONB DEFAULT '[]'::jsonb,
  swot_t JSONB DEFAULT '[]'::jsonb,
  vision TEXT,
  vision_definition TEXT,
  missions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Objectives (เป้าประสงค์ ภายใต้ยุทธศาสตร์ - ส่วนที่ 3.3)
CREATE TABLE IF NOT EXISTS objectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Action Plans (แผนปฏิบัติการ - ส่วนที่ 5)
CREATE TABLE IF NOT EXISTS action_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  responsible_person TEXT,
  quarter TEXT, -- e.g. "Q1", "Q1-Q2"
  budget NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Alter Strategies (เพิ่มข้อมูล นิยาม และ มาตรการ - ส่วนที่ 4)
ALTER TABLE strategies 
ADD COLUMN IF NOT EXISTS definition JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS measures JSONB DEFAULT '[]'::jsonb;

-- 5. Alter KPIs (เพิ่มข้อมูล Data Dictionary - ส่วนที่ 4)
ALTER TABLE kpis 
ADD COLUMN IF NOT EXISTS objective_id UUID REFERENCES objectives(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS readiness_status TEXT,
ADD COLUMN IF NOT EXISTS op_definition TEXT,
ADD COLUMN IF NOT EXISTS calc_formula TEXT,
ADD COLUMN IF NOT EXISTS numerator TEXT,
ADD COLUMN IF NOT EXISTS denominator TEXT,
ADD COLUMN IF NOT EXISTS inclusion_criteria TEXT,
ADD COLUMN IF NOT EXISTS exclusion_criteria TEXT,
ADD COLUMN IF NOT EXISTS data_source TEXT,
ADD COLUMN IF NOT EXISTS extraction_method TEXT,
ADD COLUMN IF NOT EXISTS cutoff_date TEXT,
ADD COLUMN IF NOT EXISTS frequency TEXT,
ADD COLUMN IF NOT EXISTS responsible_person TEXT,
ADD COLUMN IF NOT EXISTS target_2570 TEXT,
ADD COLUMN IF NOT EXISTS target_2571 TEXT,
ADD COLUMN IF NOT EXISTS target_2572 TEXT,
ADD COLUMN IF NOT EXISTS reason TEXT,
ADD COLUMN IF NOT EXISTS precautions TEXT,
ADD COLUMN IF NOT EXISTS risk_distortion TEXT,
ADD COLUMN IF NOT EXISTS prerequisites TEXT;


-- ==========================================
-- Enable RLS & Add Anon Policies
-- ==========================================
ALTER TABLE strategic_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for anon" ON strategic_plans;
CREATE POLICY "Enable all access for anon" ON strategic_plans FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for anon" ON objectives;
CREATE POLICY "Enable all access for anon" ON objectives FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for anon" ON action_plans;
CREATE POLICY "Enable all access for anon" ON action_plans FOR ALL TO anon USING (true) WITH CHECK (true);

-- Insert a default strategic plan if not exists
INSERT INTO strategic_plans (title)
SELECT 'ร่างแผนยุทธศาสตร์สุขภาพดิจิทัล'
WHERE NOT EXISTS (SELECT 1 FROM strategic_plans);
