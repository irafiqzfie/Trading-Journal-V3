import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import type { Position } from '../../../types';

// Define a consistent key for storing positions in the KV store.
const POSITIONS_KEY = 'trading_journal_positions';

/**
 * Handles GET requests to fetch all trading positions from the KV store.
 */
export async function GET() {
  try {
    const positions = await kv.get<Position[]>(POSITIONS_KEY);
    // If no positions are found, return an empty array to ensure the client receives a valid JSON response.
    return NextResponse.json(positions || []);
  } catch (error) {
    console.error('Failed to fetch positions from Vercel KV:', error);
    // Enhanced logging for debugging environment variable issues
    const urlIsSet = !!process.env.KV_REST_API_URL;
    const tokenIsSet = !!process.env.KV_REST_API_TOKEN;
    console.error(`KV Env Check: KV_REST_API_URL is ${urlIsSet ? 'set' : 'NOT SET'}. KV_REST_API_TOKEN is ${tokenIsSet ? 'set' : 'NOT SET'}.`);
    
    const errorMessage = "Failed to fetch data. This is likely an issue with the server's environment configuration for the database connection.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * Handles POST requests to save the entire list of trading positions to the KV store.
 * This will overwrite any existing data under the POSITIONS_KEY.
 */
export async function POST(request: Request) {
  try {
    const positions: Position[] = await request.json();
    
    // Validate that the incoming data is an array before saving.
    if (!Array.isArray(positions)) {
        return NextResponse.json({ error: 'Invalid data format. Expected an array of positions.' }, { status: 400 });
    }

    await kv.set(POSITIONS_KEY, positions);
    return NextResponse.json({ success: true, message: 'Positions saved successfully.' });
  } catch (error) {
    console.error('Failed to save positions to Vercel KV:', error);
    // Enhanced logging for debugging environment variable issues
    const urlIsSet = !!process.env.KV_REST_API_URL;
    const tokenIsSet = !!process.env.KV_REST_API_TOKEN;
    console.error(`KV Env Check: KV_REST_API_URL is ${urlIsSet ? 'set' : 'NOT SET'}. KV_REST_API_TOKEN is ${tokenIsSet ? 'set' : 'NOT SET'}.`);

    const errorMessage = "Failed to save data. This is likely an issue with the server's environment configuration for the database connection.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}