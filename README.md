# Calendar Bot - AI-Powered Calendar Assistant

An intelligent chatbot that enables users to create, view, and update Google Calendar events through natural language conversations. Built with Next.js, Google Calendar API, and Google Gemini AI.

**Repository**: [https://github.com/Mridul-Tilwaliya/calendar-bot](https://github.com/Mridul-Tilwaliya/calendar-bot)

## Features

- 🤖 **Natural Language Processing**: Parse plain-English commands like "Schedule meeting with Priya tomorrow 3pm"
- 📅 **Google Calendar Integration**: Full OAuth 2.0 integration with Google Calendar API
- ✨ **Event Extraction**: Extract event details from long text samples (emails, messages, etc.)
- ✅ **Confirmation Flow**: Review and confirm event details before creating
- ❓ **Clarifying Questions**: Ask for missing information when requests are ambiguous
- 📋 **Demo Samples**: 10 pre-loaded sample events from different categories (school, society, office, friends)
- 🔄 **Event Management**: Create, list, and update calendar events
- 🎨 **Modern UI**: Clean, responsive interface with dark mode support

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI/LLM**: Google Gemini 1.5 Flash (Free tier)
- **Calendar API**: Google Calendar API v3
- **Authentication**: OAuth 2.0

## Prerequisites

1. **Node.js** 18+ and npm
2. **Google Cloud Project** with Calendar API enabled
3. **Google Gemini API Key** (free tier available)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Mridul-Tilwaliya/calendar-bot.git
cd calendar-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Calendar API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - For local: `http://localhost:3000/api/auth/callback`
     - For production: `https://your-domain.com/api/auth/callback`
   - Save the **Client ID** and **Client Secret**

### 4. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

### 5. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# OAuth Redirect URI
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Session secret (generate a random string)
SESSION_SECRET=your_random_session_secret_here
```

**Note**: For production, update `NEXT_PUBLIC_REDIRECT_URI` to your production domain.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### 1. Login

Click "Login with Google" and authorize the application to access your Google Calendar.

### 2. Create Events via Chat

Type natural language commands like:
- "Schedule meeting with Priya tomorrow 3pm"
- "Add dentist appointment next Monday at 10am"
- "Create all-day event for my birthday on December 25th"

### 3. Extract Events from Text

1. Click "Try Demo Event Samples"
2. Select a sample from the categories (School, Society, Office, Friends)
3. Review the extracted event details
4. Confirm to add to calendar

### 4. View Events

- Say "list my events" or "show upcoming events"
- Click the "Events" button in the header
- View up to 10 upcoming events

### 5. Update Events

Use commands like:
- "Update the meeting tomorrow to 4pm"
- "Change the location of the party to my house"

## Project Structure

```
calendar-bot/
├── app/
│   ├── api/
│   │   ├── auth/          # OAuth authentication routes
│   │   ├── events/        # Calendar event CRUD operations
│   │   └── parse/         # LLM parsing endpoint
│   ├── page.tsx           # Main chat interface
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── ChatInterface.tsx      # Main chat component
│   ├── ChatMessage.tsx        # Individual message component
│   ├── EventConfirmationDialog.tsx  # Event confirmation modal
│   └── DemoSamplesPanel.tsx   # Demo samples selector
├── lib/
│   ├── calendar.ts        # Google Calendar API utilities
│   ├── gemini.ts          # Gemini AI integration
│   └── demo-samples.ts    # Pre-loaded event samples
├── types/
│   └── index.ts           # TypeScript type definitions
└── README.md
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Update `NEXT_PUBLIC_REDIRECT_URI` to your Vercel domain
5. Update the redirect URI in Google Cloud Console
6. Deploy!

### Manual Deployment

```bash
npm run build
npm start
```

## Security Considerations

- ✅ OAuth 2.0 with secure token storage
- ✅ Environment variables for sensitive data
- ✅ HTTP-only cookies for access tokens
- ✅ Secure redirect URIs validation
- ✅ No secrets in client-side code

## Demo Account Setup

For demonstration purposes, create a dedicated Google account:

1. Create a new Gmail account (e.g., `calendarbot.demo@gmail.com`)
2. Use this account's credentials in Google Cloud Console
3. Share the account credentials securely for demo purposes

## Troubleshooting

### OAuth Errors

- Ensure redirect URI matches exactly in Google Cloud Console
- Check that Calendar API is enabled
- Verify client ID and secret are correct

### Gemini API Errors

- Verify API key is valid
- Check API quota limits (free tier: 60 requests/minute)
- Ensure internet connection is stable

### Event Creation Fails

- Verify OAuth token is valid
- Check event date/time format
- Ensure required fields (title, date) are provided

## Future Enhancements

- [ ] Multi-user support with database
- [ ] Event update functionality via chat
- [ ] Recurring events support
- [ ] Email notifications
- [ ] Voice input support
- [ ] Multi-language support
- [ ] Integration with other calendar services

## License

This project is created for assignment purposes.

## Contact

For questions or issues, please refer to the project documentation or contact the development team.

---

**Note**: This application uses free-tier services (Google Gemini API) and should be suitable for demonstration purposes. For production use, consider upgrading to paid tiers for better rate limits and reliability.
