import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with Service Role for bypassing RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      if (process.env.NODE_ENV === 'production') {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Generate highly realistic numbers based on current date (seconds since midnight)
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const secondsSinceMidnight = (now.getTime() - midnight.getTime()) / 1000;

    // Realistic global simulated starting values and growth rates (per second)
    const trees = Math.floor(secondsSinceMidnight * 60);
    const energy = Math.floor(secondsSinceMidnight * 270);
    const pets = Math.floor(secondsSinceMidnight * 0.5);
    const plastic = Math.floor(secondsSinceMidnight * 15);
    const meals = Math.floor(secondsSinceMidnight * 80);

    // Optional: Real API Integrations can be layered here if API keys exist
    // if (process.env.TREE_NATION_API_KEY) { /* fetch and override trees */ }
    // if (process.env.ELECTRICITY_MAPS_API_KEY) { /* fetch and override energy */ }
    
    // Upsert into Supabase
    const { data, error } = await supabase
      .from('global_stats')
      .upsert({
        id: 1,
        trees,
        energy,
        pets,
        plastic,
        meals,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error("Supabase upsert error:", error);
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in fetch-stats cron:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
