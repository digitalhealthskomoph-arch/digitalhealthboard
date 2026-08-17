-- Fix RLS Policies for Anon (Since there's no auth yet)
DO $$ 
DECLARE 
  t text;
BEGIN 
  FOR t IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
  LOOP 
    -- Create policy for anon
    EXECUTE format('DROP POLICY IF EXISTS "Enable all access for anon" ON %I;', t);
    EXECUTE format('CREATE POLICY "Enable all access for anon" ON %I FOR ALL TO anon USING (true) WITH CHECK (true);', t);
  END LOOP; 
END $$;
