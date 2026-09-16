// scripts/keep-alive.mjs
// Lightweight script to ping Supabase REST API and prevent project auto-pause

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qmizczkkoizqskburrgd.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_pBu35ni4KVfjH6fQ99vutg_-yL2WyF8';

async function pingSupabase() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Pinging Supabase REST API (${SUPABASE_URL})...`);

  try {
    const startTime = Date.now();
    const response = await fetch(`${SUPABASE_URL}/rest/v1/strategic_plans?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[${new Date().toISOString()}] ✅ Supabase is active! Received response in ${elapsed}ms. (Records found: ${data.length})`);
    process.exit(0);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ❌ Failed to ping Supabase:`, err.message);
    process.exit(1);
  }
}

pingSupabase();
