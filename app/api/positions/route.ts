import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import type { Position } from '../../../types';

const POSITIONS_KEY = 'trading_journal_positions';

/**
 * Handles GET requests to fetch all trading positions from the KV store.
 */
export async function GET() {
  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.error('Vercel KV environment variables not found. Ensure the project is linked to a Vercel KV store in the Vercel dashboard.');
      return NextResponse.json({ error: 'Database connection is not configured on the server.' }, { status: 500 });
    }
    const positions = await kv.get<Position[]>(POSITIONS_KEY);
    return NextResponse.json(positions || []);
  } catch (error) {
    console.error('Failed to fetch positions from Vercel KV:', error);
    // This will now likely show the UpstashError with 'WRONGPASS' in the server logs if the config is still wrong.
    return NextResponse.json({ error: 'Failed to retrieve data from the database. This could be due to incorrect environment variable configuration. Please check server logs.' }, { status: 500 });
  }
}

/**
 * Handles POST requests to save the entire list of trading positions to the KV store.
 */
export async function POST(request: Request) {
  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.error('Vercel KV environment variables not found. Ensure the project is linked to a Vercel KV store in the Vercel dashboard.');
      return NextResponse.json({ error: 'Database connection is not configured on the server.' }, { status: 500 });
    }
    const positions: Position[] = await request.json();
    
    if (!Array.isArray(positions)) {
      return NextResponse.json({ error: 'Invalid data format. Expected an array of positions.' }, { status: 400 });
    }

    await kv.set(POSITIONS_KEY, positions);
    return NextResponse.json({ success: true, message: 'Positions saved successfully.' });
  } catch (error) {
    console.error('Failed to save positions to Vercel KV:', error);
    return NextResponse.json({ error: 'Failed to save data to the database. This could be due to incorrect environment variable configuration. Please check server logs.' }, { status: 500 });
  }
}
