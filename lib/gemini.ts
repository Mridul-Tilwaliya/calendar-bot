import { GoogleGenerativeAI } from '@google/generative-ai';
import { ParsedEvent } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function parseEventFromText(text: string): Promise<ParsedEvent> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are an AI assistant that extracts event information from text. Analyze the following text and extract event details. Return ONLY a valid JSON object with this exact structure:

{
  "title": "event title",
  "description": "full description or summary",
  "location": "location if mentioned",
  "startDateTime": "ISO 8601 format if specific time, or null",
  "endDateTime": "ISO 8601 format if specific time, or null",
  "date": "YYYY-MM-DD format if only date mentioned, or null",
  "allDay": true or false,
  "confidence": 0.0 to 1.0,
  "needsClarification": true or false,
  "clarificationQuestions": ["question1", "question2"] or []
}

Rules:
1. If the text mentions a specific date and time, use startDateTime and endDateTime in ISO 8601 format (e.g., "2024-11-15T14:00:00")
2. If only a date is mentioned without time, use the "date" field and set allDay to true
3. If time is ambiguous or missing, set needsClarification to true and add questions
4. If location is mentioned, extract it
5. Extract a meaningful title (not just "Meeting" or "Event")
6. Set confidence based on how clear the information is (0.9+ for clear info, 0.5-0.8 for partial, <0.5 for unclear)
7. If any critical info is missing (date, time, title), set needsClarification to true

Current date context: ${new Date().toISOString()}

Text to analyze:
${text}

Return ONLY the JSON object, no other text:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text().trim();
    
    // Clean the response (remove markdown code blocks if present)
    const cleanedJson = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsed = JSON.parse(cleanedJson) as ParsedEvent;
    
    // Ensure allDay is boolean
    parsed.allDay = parsed.allDay ?? false;
    parsed.confidence = parsed.confidence ?? 0.5;
    parsed.needsClarification = parsed.needsClarification ?? false;
    parsed.clarificationQuestions = parsed.clarificationQuestions ?? [];
    
    return parsed;
  } catch (error) {
    console.error('Error parsing event:', error);
    throw new Error('Failed to parse event from text');
  }
}

export async function parseChatCommand(command: string): Promise<ParsedEvent> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are an AI assistant that parses natural language commands to create calendar events. Analyze the following command and extract event details. Return ONLY a valid JSON object with this exact structure:

{
  "title": "event title",
  "description": "description if mentioned",
  "location": "location if mentioned",
  "startDateTime": "ISO 8601 format if specific time, or null",
  "endDateTime": "ISO 8601 format if specific time, or null",
  "date": "YYYY-MM-DD format if only date mentioned, or null",
  "allDay": true or false,
  "confidence": 0.0 to 1.0,
  "needsClarification": true or false,
  "clarificationQuestions": ["question1", "question2"] or []
}

Rules:
1. Parse relative dates like "tomorrow", "next week", "Monday" based on current date
2. Parse times like "3pm", "15:00", "3:00 PM"
3. If duration is mentioned (e.g., "1 hour", "2 hours"), calculate endDateTime
4. If time is missing, set needsClarification to true
5. Extract title from the command
6. Set confidence based on clarity
7. If ambiguous, add clarification questions

Current date context: ${new Date().toISOString()}

Command: ${command}

Return ONLY the JSON object, no other text:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text().trim();
    
    const cleanedJson = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanedJson) as ParsedEvent;
    
    parsed.allDay = parsed.allDay ?? false;
    parsed.confidence = parsed.confidence ?? 0.5;
    parsed.needsClarification = parsed.needsClarification ?? false;
    parsed.clarificationQuestions = parsed.clarificationQuestions ?? [];
    
    return parsed;
  } catch (error) {
    console.error('Error parsing command:', error);
    throw new Error('Failed to parse command');
  }
}

