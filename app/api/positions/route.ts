import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import type { Position } from '../../../types';

const NAMESPACE = process.env.APP_NAMESPACE || 'default';
const POSITIONS_KEY = `${NAMESPACE}:trading_journal_positions`;

/**
 * Handles GET requests to fetch all trading positions from the KV store.
 */
export async function GET() {
  try {
    const positions = await kv.get<Position[]>(POSITIONS_KEY);
    return NextResponse.json(positions || []);
  } catch (error) {
    console.error('Failed to fetch positions from Vercel KV:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve data from the database.' },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to save the entire list of trading positions to the KV store.
 */
export async function POST(request: Request) {
  try {
    const positions: Position[] = await request.json();

    if (!Array.isArray(positions)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected an array of positions.' },
        { status: 400 }
      );
    }

    await kv.set(POSITIONS_KEY, positions);
    return NextResponse.json({
      success: true,
      message: `Positions saved successfully for namespace: ${NAMESPACE}`
    });
  } catch (error) {
    console.error('Failed to save positions to Vercel KV:', error);
    return NextResponse.json(
      { error: 'Failed to save data to the database.' },
      { status: 500 }
    );
  }
}
