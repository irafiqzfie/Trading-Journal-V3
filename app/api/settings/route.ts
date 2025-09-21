import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

const SETTINGS_KEY = 'trading_journal_settings';

/**
 * Handles GET requests to fetch custom setup images settings from the KV store.
 */
export async function GET() {
  try {
    const settings = await kv.get<Record<string, string>>(SETTINGS_KEY);
    return NextResponse.json(settings || {});
  } catch (error) {
    console.error('Failed to fetch settings from Vercel KV:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve settings from the database.' },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to save custom setup images settings to the KV store.
 */
export async function POST(request: Request) {
  try {
    const settings: Record<string, string> = await request.json();

    // Basic validation to ensure it's an object
    if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected a settings object.' },
        { status: 400 }
      );
    }

    await kv.set(SETTINGS_KEY, settings);
    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully.'
    });
  } catch (error) {
    console.error('Failed to save settings to Vercel KV:', error);
    return NextResponse.json(
      { error: 'Failed to save settings to the database.' },
      { status: 500 }
    );
  }
}
