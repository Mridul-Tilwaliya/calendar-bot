'use client';

import { ChatMessage as ChatMessageType } from '@/types';
import { format } from 'date-fns';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-500' : 'bg-gray-500'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>
      <div className={`flex-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
        }`}>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        {message.eventData && (
          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 max-w-[80%]">
            <p className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
              Extracted Event Details:
            </p>
            <div className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Title:</strong> {message.eventData.title}</p>
              {message.eventData.location && (
                <p><strong>Location:</strong> {message.eventData.location}</p>
              )}
              {message.eventData.startDateTime && (
                <p><strong>Start:</strong> {format(new Date(message.eventData.startDateTime), 'PPpp')}</p>
              )}
              {message.eventData.endDateTime && (
                <p><strong>End:</strong> {format(new Date(message.eventData.endDateTime), 'PPpp')}</p>
              )}
              {message.eventData.date && (
                <p><strong>Date:</strong> {format(new Date(message.eventData.date), 'PP')}</p>
              )}
              {message.eventData.allDay && <p><strong>All Day:</strong> Yes</p>}
              {message.eventData.description && (
                <p><strong>Description:</strong> {message.eventData.description}</p>
              )}
            </div>
          </div>
        )}
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {format(message.timestamp, 'HH:mm')}
        </span>
      </div>
    </div>
  );
}

