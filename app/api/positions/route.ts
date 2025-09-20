import { createClient } from '@vercel/kv';
import { NextResponse } from 'next/server';
import type { Position } from '../../../types';

// Explicitly create a Vercel KV client to ensure the correct environment variables are used.
// This prevents potential conflicts if other Redis-related variables (e.g., UPSTASH_REDIS_REST_URL) are present.
const kv = createClient({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});


// Define a consistent key for storing positions in the KV store.
const POSITIONS_KEY = 'trading_journal_positions';

/**
 * Handles GET requests to fetch all trading positions from the KV store.
 */
export async function GET() {
  try {
    // Check if the required environment variables are set before attempting to connect.
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
        console.error('Vercel KV environment variables KV_REST_API_URL and KV_REST_API_TOKEN are not set.');
        return NextResponse.json({ error: 'Database connection is not configured correctly on the server.' }, { status: 500 });
    }
    const positions = await kv.get<Position[]>(POSITIONS_KEY);
    // If no positions are found, return an empty array to ensure the client receives a valid JSON response.
    return NextResponse.json(positions || []);
  } catch (error) {
    console.error('Failed to fetch positions from Vercel KV:', error);
    const errorMessage = "Failed to fetch data. The server's database connection configuration may be incorrect.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * Handles POST requests to save the entire list of trading positions to the KV store.
 * This will overwrite any existing data under the POSITIONS_KEY.
 */
export async function POST(request: Request) {
  try {
    // Check if the required environment variables are set before attempting to connect.
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
        console.error('Vercel KV environment variables KV_REST_API_URL and KV_REST_API_TOKEN are not set.');
        return NextResponse.json({ error: 'Database connection is not configured correctly on the server.' }, { status: 500 });
    }
    const positions: Position[] = await request.json();
    
    // Validate that the incoming data is an array before saving.
    if (!Array.isArray(positions)) {
        return NextResponse.json({ error: 'Invalid data format. Expected an array of positions.' }, { status: 400 });
    }

    await kv.set(POSITIONS_KEY, positions);
    return NextResponse.json({ success: true, message: 'Positions saved successfully.' });
  } catch (error) {
    console.error('Failed to save positions to Vercel KV:', error);
    const errorMessage = "Failed to save data. The server's database connection configuration may be incorrect.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}