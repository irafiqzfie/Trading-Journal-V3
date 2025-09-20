import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // The filename is passed via a custom header from the client
  const filename = request.headers.get('x-vercel-filename');

  if (!filename || !request.body) {
    return NextResponse.json({ message: 'No filename or file body provided.' }, { status: 400 });
  }

  try {
    // Upload the file to Vercel Blob storage
    const blob = await put(filename, request.body, {
      access: 'public',
    });
    
    // Return the blob details (including the public URL) to the client
    return NextResponse.json(blob);

  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json({ message: 'Failed to upload file.' }, { status: 500 });
  }
}
