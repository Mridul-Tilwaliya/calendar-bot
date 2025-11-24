import { NextRequest, NextResponse } from 'next/server';
import { listCalendarEvents } from '@/lib/calendar';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('google_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const maxResults = parseInt(searchParams.get('maxResults') || '10');

    const events = await listCalendarEvents(accessToken, maxResults);
    
    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Error listing events:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list events' },
      { status: 500 }
    );
  }
}

