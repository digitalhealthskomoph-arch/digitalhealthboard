import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log("Migrating Strategies and KPIs...");
  
  const rawData = fs.readFileSync('kpis.json', 'utf-8');
  let kpiRecords = JSON.parse(rawData);

  // Filter out empty/null rows or rows that don't have a strategy number
  kpiRecords = kpiRecords.filter(row => row['Unnamed: 1'] && !isNaN(parseInt(row['Unnamed: 1'])));

  const uniqueStrategies = [...new Set(kpiRecords.map(row => row['Unnamed: 1']))];
  console.log(`Found ${uniqueStrategies.length} unique strategies:`, uniqueStrategies);

  // Insert strategies
  for (const stratId of uniqueStrategies) {
    const sId = parseInt(stratId);
    
    // Check if exists
    const { data: existing } = await supabase.from('strategies').select('*').eq('name', `ยุทธศาสตร์ที่ ${sId}`).single();
    
    if (!existing) {
      await supabase.from('strategies').insert({
        name: `ยุทธศาสตร์ที่ ${sId}`,
        description: `แผนยุทธศาสตร์ที่ ${sId}`,
        year_start: 2568,
        year_end: 2570
      });
      console.log(`Inserted Strategy ${sId}`);
    }
  }

  // Get all strategies to map IDs
  const { data: strategies } = await supabase.from('strategies').select('*');
  const stratMap = {};
  if (strategies) {
    strategies.forEach(s => {
      // extract number from "ยุทธศาสตร์ที่ 1"
      const match = s.name.match(/ที่\s*(\d+)/);
      if (match) {
        stratMap[match[1]] = s.id;
      }
    });
  }

  // Prepare KPIs
  const kpisToInsert = kpiRecords.map(row => {
    const stratNum = String(parseInt(row['Unnamed: 1']));
    const stratId = stratMap[stratNum];
    
    if (!stratId) {
      console.error(`Strategy ID not found for ${stratNum}`);
    }
    
    const baseline = row['Unnamed: 3'] || '';
    const note = row['Unnamed: 8'] || '';
    const owner = row['Unnamed: 9'] || '';
    
    return {
      strategy_id: stratId,
      name: row['Unnamed: 2'] || 'ไม่ระบุชื่อ',
      description: `Baseline: ${baseline}\nหมายเหตุ: ${note}\nผู้รับผิดชอบ: ${owner}`,
      target_value: String(row['Unnamed: 6'] || row['Unnamed: 5'] || row['Unnamed: 4'] || ''),
      unit: String(row['Unnamed: 6'] || '').includes('%') ? '%' : ''
    };
  });

  // Insert KPIs
  const { data, error } = await supabase.from('kpis').insert(kpisToInsert);
  
  if (error) {
    console.error("Error inserting KPIs:", error);
  } else {
    console.log(`Successfully inserted ${kpisToInsert.length} KPIs!`);
  }
}

migrate();
