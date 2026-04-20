import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/auth/google`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: 'Google auth failed' },
      { status: 500 }
    );
  }
}