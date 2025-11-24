'use client';

import { ParsedEvent } from '@/types';
import { format } from 'date-fns';
import { X, Calendar, MapPin, Clock, FileText } from 'lucide-react';
import { useState } from 'react';

interface EventConfirmationDialogProps {
  event: ParsedEvent;
  onConfirm: (event: ParsedEvent) => void;
  onCancel: () => void;
  onEdit?: (field: string, value: any) => void;
}

export default function EventConfirmationDialog({
  event,
  onConfirm,
  onCancel,
  onEdit
}: EventConfirmationDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(event);

  const handleConfirm = () => {
    onConfirm(editedEvent);
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditedEvent(prev => ({ ...prev, [field]: value }));
    if (onEdit) {
      onEdit(field, value);
    }
  };

  const displayDate = () => {
    if (editedEvent.startDateTime) {
      return format(new Date(editedEvent.startDateTime), 'PPpp');
    }
    if (editedEvent.date) {
      return format(new Date(editedEvent.date), 'PP');
    }
    return 'Not specified';
  };

  const displayEndDate = () => {
    if (editedEvent.endDateTime) {
      return format(new Date(editedEvent.endDateTime), 'PPpp');
    }
    return 'Not specified';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Confirm Event Details
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4" />
              Title
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedEvent.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            ) : (
              <p className="text-gray-900 dark:text-gray-100 font-medium">{editedEvent.title}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="w-4 h-4" />
              Date & Time
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Start</label>
                  <input
                    type={editedEvent.allDay ? 'date' : 'datetime-local'}
                    value={editedEvent.startDateTime ? new Date(editedEvent.startDateTime).toISOString().slice(0, editedEvent.allDay ? 10 : 16) : editedEvent.date || ''}
                    onChange={(e) => {
                      if (editedEvent.allDay) {
                        handleFieldChange('date', e.target.value);
                      } else {
                        handleFieldChange('startDateTime', new Date(e.target.value).toISOString());
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                {!editedEvent.allDay && (
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">End</label>
                    <input
                      type="datetime-local"
                      value={editedEvent.endDateTime ? new Date(editedEvent.endDateTime).toISOString().slice(0, 16) : ''}
                      onChange={(e) => handleFieldChange('endDateTime', new Date(e.target.value).toISOString())}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                )}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editedEvent.allDay}
                    onChange={(e) => handleFieldChange('allDay', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">All Day Event</span>
                </label>
              </div>
            ) : (
              <div>
                <p className="text-gray-900 dark:text-gray-100">{displayDate()}</p>
                {editedEvent.endDateTime && !editedEvent.allDay && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    End: {displayEndDate()}
                  </p>
                )}
              </div>
            )}
          </div>

          {editedEvent.location && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedEvent.location || ''}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100">{editedEvent.location}</p>
              )}
            </div>
          )}

          {editedEvent.description && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4" />
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={editedEvent.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{editedEvent.description}</p>
              )}
            </div>
          )}

          {editedEvent.clarificationQuestions && editedEvent.clarificationQuestions.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                Please clarify:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                {editedEvent.clarificationQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {isEditing ? 'Done Editing' : 'Edit Details'}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Confirm & Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

