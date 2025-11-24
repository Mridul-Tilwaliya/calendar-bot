'use client';

import { useState, useEffect } from 'react';
import { ChatMessage, ParsedEvent, CalendarEvent } from '@/types';
import ChatInterface from '@/components/ChatInterface';
import EventConfirmationDialog from '@/components/EventConfirmationDialog';
import DemoSamplesPanel from '@/components/DemoSamplesPanel';
import { demoSamples } from '@/lib/demo-samples';
import { DemoSample } from '@/types';
import { 
  Calendar, 
  LogIn, 
  LogOut, 
  BookOpen, 
  List,
  RefreshCw 
} from 'lucide-react';
import { format } from 'date-fns';

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<ParsedEvent | null>(null);
  const [showDemoSamples, setShowDemoSamples] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEvents, setShowEvents] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await checkAuth();
      
      // Handle OAuth callback messages
      const urlParams = new URLSearchParams(window.location.search);
      const authStatus = urlParams.get('auth');
      const error = urlParams.get('error');
      
      if (authStatus === 'success') {
        const message: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: '✅ Successfully connected to Google Calendar! You can now create and manage events.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, message]);
        await checkAuth();
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      } else if (error) {
        const message: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ Authentication failed: ${error}. Please try logging in again.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, message]);
        window.history.replaceState({}, '', window.location.pathname);
      }
    };
    
    initialize();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/events/list?maxResults=1');
      if (response.ok) {
        setIsAuthenticated(true);
        loadEvents();
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/login');
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      addMessage('assistant', 'Failed to initiate login. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setMessages([]);
      setEvents([]);
      addMessage('assistant', 'You have been logged out successfully.');
    } catch (error) {
      addMessage('assistant', 'Failed to logout. Please try again.');
    }
  };

  const addMessage = (role: 'user' | 'assistant', content: string, eventData?: ParsedEvent) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      eventData
    };
    setMessages(prev => [...prev, message]);
  };

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/events/list?maxResults=10');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!isAuthenticated) {
      addMessage('assistant', 'Please login with Google Calendar first to use this feature.');
      return;
    }

    addMessage('user', content);
    setIsLoading(true);

    try {
      // Check if it's a command to list events
      if (content.toLowerCase().includes('list') || content.toLowerCase().includes('show') || content.toLowerCase().includes('view')) {
        const response = await fetch('/api/events/list?maxResults=10');
        if (response.ok) {
          const eventList = await response.json();
          setEvents(eventList);
          if (eventList.length === 0) {
            addMessage('assistant', 'You have no upcoming events.');
          } else {
            let eventText = 'Here are your upcoming events:\n\n';
            eventList.forEach((event: CalendarEvent, index: number) => {
              const startDate = event.start.dateTime 
                ? format(new Date(event.start.dateTime), 'PPpp')
                : event.start.date 
                ? format(new Date(event.start.date), 'PP')
                : 'Date TBD';
              eventText += `${index + 1}. ${event.title}\n   ${startDate}\n   ${event.location ? `📍 ${event.location}\n` : ''}`;
            });
            addMessage('assistant', eventText);
          }
        } else {
          addMessage('assistant', 'Failed to retrieve events. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      // Check if it's an update command
      if (content.toLowerCase().includes('update') || content.toLowerCase().includes('change') || content.toLowerCase().includes('modify') || content.toLowerCase().includes('edit')) {
        await handleUpdateEvent(content);
        setIsLoading(false);
        return;
      }

      // Parse the command
      const parseResponse = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content, type: 'command' })
      });

      if (!parseResponse.ok) {
        throw new Error('Failed to parse command');
      }

      const parsedEvent: ParsedEvent = await parseResponse.json();

      // If clarification is needed
      if (parsedEvent.needsClarification && parsedEvent.clarificationQuestions && parsedEvent.clarificationQuestions.length > 0) {
        let clarificationText = 'I need some clarification:\n\n';
        parsedEvent.clarificationQuestions.forEach((q, i) => {
          clarificationText += `${i + 1}. ${q}\n`;
        });
        clarificationText += '\nPlease provide the missing information.';
        addMessage('assistant', clarificationText, parsedEvent);
        setIsLoading(false);
        return;
      }

      // If confidence is low, ask for confirmation
      if (parsedEvent.confidence < 0.7) {
        addMessage('assistant', 'I\'m not entirely sure I understood correctly. Please review the details below and confirm if this is what you meant.', parsedEvent);
        setPendingEvent(parsedEvent);
        setIsLoading(false);
        return;
      }

      // Show confirmation dialog
      setPendingEvent(parsedEvent);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error processing message:', error);
      addMessage('assistant', `Sorry, I encountered an error: ${error.message}. Please try again.`);
      setIsLoading(false);
    }
  };

  const handleUpdateEvent = async (command: string) => {
    try {
      // First, get the list of events to find which one to update
      const eventsResponse = await fetch('/api/events/list?maxResults=20');
      if (!eventsResponse.ok) {
        addMessage('assistant', 'Failed to retrieve events. Please try again.');
        return;
      }

      const allEvents = await eventsResponse.json();
      if (allEvents.length === 0) {
        addMessage('assistant', 'You have no events to update. Create an event first.');
        return;
      }

      // Parse the update command to understand what to update
      const parseResponse = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: command, type: 'command' })
      });

      if (!parseResponse.ok) {
        addMessage('assistant', 'I had trouble understanding your update request. Please be more specific, for example: "Update the meeting tomorrow to 4pm" or "Change the location of the party to my house".');
        return;
      }

      const parsedUpdate: ParsedEvent = await parseResponse.json();

      // Try to find matching event by title or date
      let eventToUpdate: CalendarEvent | null = null;
      
      // If title is mentioned, try to match by title
      if (parsedUpdate.title && parsedUpdate.title.length > 3) {
        const titleMatch = allEvents.find((e: CalendarEvent) => 
          e.title.toLowerCase().includes(parsedUpdate.title.toLowerCase()) ||
          parsedUpdate.title.toLowerCase().includes(e.title.toLowerCase())
        );
        if (titleMatch) {
          eventToUpdate = titleMatch;
        }
      }

      // If no title match and date is mentioned, try to match by date
      if (!eventToUpdate && (parsedUpdate.startDateTime || parsedUpdate.date)) {
        const targetDate = parsedUpdate.startDateTime 
          ? new Date(parsedUpdate.startDateTime).toDateString()
          : parsedUpdate.date 
          ? new Date(parsedUpdate.date).toDateString()
          : null;

        if (targetDate) {
          const dateMatch = allEvents.find((e: CalendarEvent) => {
            const eventDate = e.start.dateTime 
              ? new Date(e.start.dateTime).toDateString()
              : e.start.date 
              ? new Date(e.start.date).toDateString()
              : null;
            return eventDate === targetDate;
          });
          if (dateMatch) {
            eventToUpdate = dateMatch;
          }
        }
      }

      // If still no match, use the most recent event or ask user
      if (!eventToUpdate) {
        if (allEvents.length === 1) {
          eventToUpdate = allEvents[0];
        } else {
          let eventList = 'I found multiple events. Please specify which one:\n\n';
          allEvents.slice(0, 5).forEach((e: CalendarEvent, i: number) => {
            const date = e.start.dateTime 
              ? format(new Date(e.start.dateTime), 'PPpp')
              : e.start.date 
              ? format(new Date(e.start.date), 'PP')
              : 'Date TBD';
            eventList += `${i + 1}. ${e.title} - ${date}\n`;
          });
          eventList += '\nOr say "update [event name]" to be more specific.';
          addMessage('assistant', eventList);
          return;
        }
      }

      if (!eventToUpdate || !eventToUpdate.id) {
        addMessage('assistant', 'I couldn\'t find the event to update. Please list your events first or be more specific.');
        return;
      }

      // Prepare update data - only include fields that are being changed
      const updateData: Partial<CalendarEvent> = {};
      
      if (parsedUpdate.title && parsedUpdate.title !== eventToUpdate.title) {
        updateData.title = parsedUpdate.title;
      }
      if (parsedUpdate.location !== undefined && parsedUpdate.location !== eventToUpdate.location) {
        updateData.location = parsedUpdate.location || '';
      }
      if (parsedUpdate.description !== undefined && parsedUpdate.description !== eventToUpdate.description) {
        updateData.description = parsedUpdate.description || '';
      }
      if (parsedUpdate.allDay !== undefined) {
        updateData.allDay = parsedUpdate.allDay;
      }
      if (parsedUpdate.startDateTime || parsedUpdate.date) {
        if (parsedUpdate.allDay && parsedUpdate.date) {
          updateData.start = { date: parsedUpdate.date };
          updateData.end = { date: parsedUpdate.date };
        } else if (parsedUpdate.startDateTime) {
          updateData.start = {
            dateTime: parsedUpdate.startDateTime,
            timeZone: 'Asia/Kolkata'
          };
          updateData.end = {
            dateTime: parsedUpdate.endDateTime || new Date(new Date(parsedUpdate.startDateTime).getTime() + 60 * 60 * 1000).toISOString(),
            timeZone: 'Asia/Kolkata'
          };
        }
      }

      // If no actual changes detected, ask for clarification
      if (Object.keys(updateData).length === 0) {
        addMessage('assistant', `I found the event "${eventToUpdate.title}", but I'm not sure what you want to change. Please specify: title, date, time, location, or description.`);
        return;
      }

      // Execute the update
      const updateResponse = await fetch('/api/events/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: eventToUpdate.id,
          event: updateData
        })
      });

      if (updateResponse.ok) {
        const updatedEvent = await updateResponse.json();
        addMessage('assistant', `✅ Successfully updated event "${updatedEvent.title}"!`);
        loadEvents();
      } else {
        const error = await updateResponse.json();
        addMessage('assistant', `Failed to update event: ${error.error || 'Unknown error'}. Please try again.`);
      }
    } catch (error: any) {
      console.error('Error updating event:', error);
      addMessage('assistant', `Sorry, I encountered an error while updating: ${error.message}. Please try again with a more specific command.`);
    }
  };

  const handleConfirmEvent = async (event: ParsedEvent) => {
    setIsLoading(true);
    try {
      // Convert ParsedEvent to CalendarEvent
      const calendarEvent: CalendarEvent = {
        title: event.title,
        description: event.description || '',
        location: event.location || '',
        allDay: event.allDay,
        start: {},
        end: {}
      };

      if (event.allDay && event.date) {
        calendarEvent.start.date = event.date;
        calendarEvent.end.date = event.date;
      } else if (event.startDateTime) {
        calendarEvent.start.dateTime = event.startDateTime;
        calendarEvent.start.timeZone = 'Asia/Kolkata';
        calendarEvent.end.dateTime = event.endDateTime || new Date(new Date(event.startDateTime).getTime() + 60 * 60 * 1000).toISOString();
        calendarEvent.end.timeZone = 'Asia/Kolkata';
      } else {
        throw new Error('Invalid event date/time');
      }

      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calendarEvent)
      });

      if (response.ok) {
        const createdEvent = await response.json();
        addMessage('assistant', `✅ Event "${createdEvent.title}" has been successfully added to your calendar!`);
        loadEvents();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create event');
      }
    } catch (error: any) {
      addMessage('assistant', `Failed to create event: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemoSample = async (sample: DemoSample) => {
    addMessage('user', `Extract event from: ${sample.text}`);
    setIsLoading(true);

    try {
      const parseResponse = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sample.text, type: 'text' })
      });

      if (!parseResponse.ok) {
        throw new Error('Failed to parse text');
      }

      const parsedEvent: ParsedEvent = await parseResponse.json();
      addMessage('assistant', `I've extracted the following event details from the text:`, parsedEvent);
      
      if (parsedEvent.needsClarification && parsedEvent.clarificationQuestions && parsedEvent.clarificationQuestions.length > 0) {
        let clarificationText = '\n\nHowever, I need clarification on:\n';
        parsedEvent.clarificationQuestions.forEach((q, i) => {
          clarificationText += `${i + 1}. ${q}\n`;
        });
        addMessage('assistant', clarificationText);
      } else {
        setPendingEvent(parsedEvent);
      }
    } catch (error: any) {
      addMessage('assistant', `Failed to extract event: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Calendar Bot
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI-Powered Calendar Assistant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowEvents(!showEvents)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <List className="w-4 h-4" />
                  Events ({events.length})
                </button>
                <button
                  onClick={loadEvents}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Login with Google
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          <div className="flex-1 overflow-hidden">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <button
              onClick={() => setShowDemoSamples(true)}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Try Demo Event Samples
            </button>
          </div>
        </div>

        {/* Events Sidebar */}
        {showEvents && isAuthenticated && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Upcoming Events
              </h2>
              <button
                onClick={() => setShowEvents(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            {events.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No upcoming events
              </p>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {event.start.dateTime
                        ? format(new Date(event.start.dateTime), 'PPpp')
                        : event.start.date
                        ? format(new Date(event.start.date), 'PP')
                        : 'Date TBD'}
                    </p>
                    {event.location && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        📍 {event.location}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Event Confirmation Dialog */}
      {pendingEvent && (
        <EventConfirmationDialog
          event={pendingEvent}
          onConfirm={(event) => {
            handleConfirmEvent(event);
            setPendingEvent(null);
          }}
          onCancel={() => setPendingEvent(null)}
          onEdit={(field, value) => {
            setPendingEvent(prev => prev ? { ...prev, [field]: value } : null);
          }}
        />
      )}

      {/* Demo Samples Panel */}
      <DemoSamplesPanel
        isOpen={showDemoSamples}
        onClose={() => setShowDemoSamples(false)}
        onSelectSample={handleSelectDemoSample}
      />
    </div>
  );
}
