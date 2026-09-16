import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('strategic_plans')
      .select('id, title')
      .limit(1);

    const durationMs = Date.now() - startTime;

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to query Supabase',
          error: error.message,
          durationMs,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase is active and keep-alive ping succeeded.',
      recordCount: data?.length || 0,
      durationMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        success: false,
        message: 'Unexpected error while pinging Supabase',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
