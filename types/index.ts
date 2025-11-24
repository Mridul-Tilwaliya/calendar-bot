export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  allDay?: boolean;
}

export interface ParsedEvent {
  title: string;
  description?: string;
  location?: string;
  startDateTime?: string;
  endDateTime?: string;
  date?: string;
  allDay: boolean;
  confidence: number;
  needsClarification?: boolean;
  clarificationQuestions?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  eventData?: ParsedEvent;
}

export interface DemoSample {
  id: string;
  category: 'school' | 'society' | 'office' | 'friends';
  title: string;
  text: string;
}

