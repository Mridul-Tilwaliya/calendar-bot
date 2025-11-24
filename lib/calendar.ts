import { google } from 'googleapis';
import { CalendarEvent } from '@/types';

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/api/auth/callback'
  );
}

export function getAuthUrl(): string {
  const oauth2Client = getOAuth2Client();
  
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
}

export async function getCalendarClient(accessToken: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export async function createCalendarEvent(
  accessToken: string,
  event: CalendarEvent
): Promise<CalendarEvent> {
  const calendar = await getCalendarClient(accessToken);
  
  const eventData: any = {
    summary: event.title,
    description: event.description || '',
    location: event.location || '',
  };

  if (event.allDay) {
    eventData.start = { date: event.start.date };
    eventData.end = { date: event.end.date || event.start.date };
  } else {
    eventData.start = {
      dateTime: event.start.dateTime,
      timeZone: event.start.timeZone || 'Asia/Kolkata'
    };
    eventData.end = {
      dateTime: event.end.dateTime,
      timeZone: event.end.timeZone || 'Asia/Kolkata'
    };
  }

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: eventData
  });

  return {
    id: response.data.id || undefined,
    title: response.data.summary || '',
    description: response.data.description || '',
    location: response.data.location || '',
    start: {
      dateTime: response.data.start?.dateTime || undefined,
      date: response.data.start?.date || undefined,
      timeZone: response.data.start?.timeZone || undefined
    },
    end: {
      dateTime: response.data.end?.dateTime || undefined,
      date: response.data.end?.date || undefined,
      timeZone: response.data.end?.timeZone || undefined
    },
    allDay: !!response.data.start?.date
  };
}

export async function listCalendarEvents(
  accessToken: string,
  maxResults: number = 10
): Promise<CalendarEvent[]> {
  const calendar = await getCalendarClient(accessToken);
  
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime'
  });

  return (response.data.items || []).map(item => ({
    id: item.id || undefined,
    title: item.summary || 'Untitled Event',
    description: item.description || '',
    location: item.location || '',
    start: {
      dateTime: item.start?.dateTime || undefined,
      date: item.start?.date || undefined,
      timeZone: item.start?.timeZone || undefined
    },
    end: {
      dateTime: item.end?.dateTime || undefined,
      date: item.end?.date || undefined,
      timeZone: item.end?.timeZone || undefined
    },
    allDay: !!item.start?.date
  }));
}

export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  event: Partial<CalendarEvent>
): Promise<CalendarEvent> {
  const calendar = await getCalendarClient(accessToken);
  
  // First, get the existing event
  const existing = await calendar.events.get({
    calendarId: 'primary',
    eventId
  });

  const eventData: any = {
    summary: event.title ?? existing.data.summary,
    description: event.description ?? existing.data.description ?? '',
    location: event.location ?? existing.data.location ?? '',
  };

  if (event.allDay !== undefined) {
    if (event.allDay) {
      const date = event.start?.date || existing.data.start?.date || new Date().toISOString().split('T')[0];
      eventData.start = { date };
      eventData.end = { date: event.end?.date || date };
    } else {
      eventData.start = {
        dateTime: event.start?.dateTime || existing.data.start?.dateTime,
        timeZone: event.start?.timeZone || existing.data.start?.timeZone || 'Asia/Kolkata'
      };
      eventData.end = {
        dateTime: event.end?.dateTime || existing.data.end?.dateTime,
        timeZone: event.end?.timeZone || existing.data.end?.timeZone || 'Asia/Kolkata'
      };
    }
  } else {
    // Keep existing format
    if (existing.data.start?.date) {
      eventData.start = { date: event.start?.date || existing.data.start.date };
      eventData.end = { date: event.end?.date || existing.data.end?.date || existing.data.start.date };
    } else {
      eventData.start = {
        dateTime: event.start?.dateTime || existing.data.start?.dateTime,
        timeZone: event.start?.timeZone || existing.data.start?.timeZone || 'Asia/Kolkata'
      };
      eventData.end = {
        dateTime: event.end?.dateTime || existing.data.end?.dateTime,
        timeZone: event.end?.timeZone || existing.data.end?.timeZone || 'Asia/Kolkata'
      };
    }
  }

  const response = await calendar.events.update({
    calendarId: 'primary',
    eventId,
    requestBody: eventData
  });

  return {
    id: response.data.id || undefined,
    title: response.data.summary || '',
    description: response.data.description || '',
    location: response.data.location || '',
    start: {
      dateTime: response.data.start?.dateTime || undefined,
      date: response.data.start?.date || undefined,
      timeZone: response.data.start?.timeZone || undefined
    },
    end: {
      dateTime: response.data.end?.dateTime || undefined,
      date: response.data.end?.date || undefined,
      timeZone: response.data.end?.timeZone || undefined
    },
    allDay: !!response.data.start?.date
  };
}

