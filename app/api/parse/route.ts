import { NextRequest, NextResponse } from 'next/server';
import { parseChatCommand, parseEventFromText } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, type } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    let parsedEvent;
    if (type === 'command') {
      parsedEvent = await parseChatCommand(text);
    } else {
      parsedEvent = await parseEventFromText(text);
    }

    return NextResponse.json(parsedEvent);
  } catch (error: any) {
    console.error('Error parsing:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse text' },
      { status: 500 }
    );
  }
}

