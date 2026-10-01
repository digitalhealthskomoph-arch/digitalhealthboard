// scripts/keep-alive.mjs
// Resilient multi-target keep-alive script to prevent Supabase auto-pause

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qmizczkkoizqskburrgd.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_pBu35ni4KVfjH6fQ99vutg_-yL2WyF8';
const APP_URL = process.env.APP_URL || 'https://digitalhealthboard.vercel.app/api/keep-alive';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pingSupabaseDirect(retryCount = 3) {
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] (Attempt ${attempt}/${retryCount}) Pinging Supabase REST API directly: ${SUPABASE_URL}...`);

    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${SUPABASE_URL}/rest/v1/strategic_plans?select=id&limit=1`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const elapsed = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[${new Date().toISOString()}] ✅ Supabase Direct Ping Successful! (${elapsed}ms, ${data.length} records returned)`);
      return true;
    } catch (err) {
      console.warn(`[${new Date().toISOString()}] ⚠️ Attempt ${attempt} failed: ${err.message}`);
      if (attempt < retryCount) {
        await wait(2000 * attempt);
      }
    }
  }
  return false;
}

async function pingAppEndpoint(retryCount = 3) {
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] (Attempt ${attempt}/${retryCount}) Pinging Next.js Keep-Alive endpoint: ${APP_URL}...`);

    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(APP_URL, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const elapsed = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      console.log(`[${new Date().toISOString()}] ✅ Web App Keep-Alive Ping Successful! (${elapsed}ms) Status:`, json.message);
      return true;
    } catch (err) {
      console.warn(`[${new Date().toISOString()}] ⚠️ Web App Attempt ${attempt} failed: ${err.message}`);
      if (attempt < retryCount) {
        await wait(2000 * attempt);
      }
    }
  }
  return false;
}

async function main() {
  console.log('====================================================');
  console.log('🚀 Starting Supabase Keep-Alive Health Checks');
  console.log('====================================================');

  const directSuccess = await pingSupabaseDirect(3);

  if (directSuccess) {
    console.log('🎉 Primary target (Supabase REST API) responded successfully.');
    // Also ping app endpoint to warm up Vercel function and double-ensure Supabase activity
    await pingAppEndpoint(2);
    process.exit(0);
  }

  console.warn('⚠️ Direct Supabase REST call failed. Triggering fallback via Web App API route...');
  const appSuccess = await pingAppEndpoint(3);

  if (appSuccess) {
    console.log('🎉 Fallback target (Next.js API route) successfully contacted Supabase!');
    process.exit(0);
  }

  console.error('❌ All keep-alive attempts failed.');
  process.exit(1);
}

main();
