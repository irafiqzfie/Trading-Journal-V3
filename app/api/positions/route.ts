
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import type { Position } from '../../../types';

const POSITIONS_KEY = 'trading_journal_positions';

// GET
export async function GET() {
  try {
    // @vercel/kv automatically reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env.
    const positions = await kv.get<Position[]>(POSITIONS_KEY);
    return NextResponse.json(positions || []);
  } catch (error) {
    console.error('Failed to fetch positions from Vercel KV:', error);
    return NextResponse.json({ error: 'Failed to retrieve data.' }, { status: 500 });
  }
}

// POST
export async function POST(request: Request) {
  try {
    const positions: Position[] = await request.json();

    if (!Array.isArray(positions)) {
      return NextResponse.json({ error: 'Invalid data format. Expected an array of positions.' }, { status: 400 });
    }

    await kv.set(POSITIONS_KEY, positions);
    return NextResponse.json({ success: true, message: 'Positions saved successfully.' });
  } catch (error) {
    console.error('Failed to save positions to Vercel KV:', error);
    return NextResponse.json({ error: 'Failed to save data.' }, { status: 500 });
  }
}
