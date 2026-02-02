# EventHub - Your Ultimate Event Planning Companion 🎉

A modern, full-featured event planning application built with React, Vite, and Tailwind CSS. EventHub connects to a serverless backend (AWS Lambda + API Gateway) and integrates Gemini AI for intelligent event planning assistance.

![EventHub](https://via.placeholder.com/1200x400/0ea5e9/ffffff?text=EventHub+-+Event+Planning+Made+Easy)

## ✨ Features

### Core Features
- **🔐 User Authentication** - Secure signup/login with JWT
- **📅 Event Management** - Create, edit, and manage events
- **👥 Guest Management** - Invite guests and manage RSVPs
- **🎟️ Ticket Booking** - Book tickets with real-time availability
- **💬 Event Messaging** - Built-in chat for hosts and attendees
- **📱 Responsive Design** - Works seamlessly on all devices

### AI-Powered Features (Gemini AI)
- **🤖 Smart Date Suggestions** - AI recommends optimal event dates
- **📝 Description Generator** - Auto-generate engaging event descriptions
- **🏢 Venue Recommendations** - Get venue suggestions based on event type
- **✅ Planning Checklist** - AI-generated event planning timeline
- **💡 Vendor Suggestions** - Recommendations for event services

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **date-fns** - Date manipulation
- **React Hot Toast** - Beautiful notifications
- **Heroicons** - Beautiful hand-crafted SVG icons

### Backend Integration
- **AWS Lambda** - Serverless Python function (single handler)
- **API Gateway** - RESTful API with 17 endpoints
- **DynamoDB** - NoSQL database (5 tables)
- **JWT Authentication** - Secure HMAC-based tokens (1 hour expiry)

### AI Integration
- **Google Gemini AI** - Advanced AI capabilities

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **AWS Account** (for backend deployment)
- **Gemini API Key** (for AI features)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Eventhub-2
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com/prod

# Gemini AI Configuration
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

**How to get your API keys:**

**AWS API Gateway URL:**
1. Deploy your Lambda function (Python 3.x)
2. Create DynamoDB tables (see [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md))
3. Create API Gateway REST API with Lambda Proxy Integration
4. Configure all 17 endpoints (see Lambda function routes)
5. Deploy API to `prod` stage and copy the invoke URL

**Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key"
4. Copy your API key

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📦 Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` folder.

## 🚀 Deployment on AWS Amplify

### Option 1: Deploy via Amplify Console (Recommended)

1. **Push to Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Amplify**
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click "New app" → "Host web app"
   - Choose your Git provider (GitHub, GitLab, etc.)
   - Select your repository and branch
   - Amplify will auto-detect Vite configuration

3. **Configure Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

4. **Add Environment Variables**
   - In Amplify Console, go to "Environment variables"
   - Add `VITE_API_BASE_URL`
   - Add `VITE_GEMINI_API_KEY`

5. **Deploy**
   - Click "Save and deploy"
   - Amplify will build and deploy your app
   - You'll get a live URL like `https://main.xxxxx.amplifyapp.com`

### Option 2: Deploy via Amplify CLI

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure

# Initialize Amplify project
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

## � Backend Integration

This frontend integrates with your **AWS Lambda + DynamoDB** backend. See **[BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)** for:
- Complete API Gateway setup
- DynamoDB table schemas  
- Field mapping documentation
- CORS configuration
- Testing guide

**Your Lambda handles all backend logic** - authentication, events, tickets, RSVPs, and messaging.

## �📁 Project Structure

```
Eventhub-2/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.jsx
│   │   ├── EventCard.jsx
│   │   ├── Modal.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/               # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Events.jsx
│   │   ├── EventDetails.jsx
│   │   ├── CreateEvent.jsx
│   │   ├── MyEvents.jsx
│   │   ├── MyTickets.jsx
│   │   └── Profile.jsx
│   ├── services/            # API and external services
│   │   ├── api.js           # API calls to Lambda
│   │   └── geminiAI.js      # Gemini AI integration
│   ├── store/               # State management
│   │   └── authStore.js     # Zustand auth store
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # App entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🔌 API Endpoints

The application connects to the following endpoints:

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Events
- `GET /events` - Get all events
- `POST /events` - Create event
- `GET /events/{eventId}` - Get event details
- `PUT /events/{eventId}` - Update event
- `DELETE /events/{eventId}` - Delete event
- `GET /events/{eventId}/availability` - Check availability

### User
- `GET /users/me/events` - Get user's events
- `GET /users/me/tickets` - Get user's tickets

### RSVP
- `POST /events/{eventId}/rsvp` - Submit RSVP
- `GET /events/{eventId}/rsvps` - Get event RSVPs

### Tickets
- `POST /events/{eventId}/tickets` - Book tickets

### Messages
- `POST /events/{eventId}/messages` - Send message
- `GET /events/{eventId}/messages` - Get messages

## 🎨 Customization

### Changing Theme Colors
Edit `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: {
        50: '#your-color',
        // ... rest of shades
      },
    },
  },
}
```

### Adding New Event Types
Edit the `eventTypes` array in components like `CreateEvent.jsx` and `Events.jsx`.

## 🧪 Testing

```bash
# Run tests (if configured)
npm test

# Run linting
npm run lint
```

## 📱 Features Walkthrough

### 1. Authentication
- Users can sign up with email and password
- Secure JWT-based authentication
- Protected routes for authenticated users

### 2. Dashboard
- Overview of upcoming events
- Quick stats (events, tickets)
- Quick action buttons

### 3. Event Discovery
- Browse all available events
- Search by title, description, or location
- Filter by event type
- View detailed event information

### 4. Event Creation
- Create events with comprehensive details
- AI-powered description generation
- AI-suggested optimal dates
- Image upload support

### 5. Guest Management
- RSVP to events (Going/Maybe/Not Going)
- View list of attendees
- Send messages to event participants

### 6. Ticket Booking
- Real-time availability checking
- Book multiple tickets
- View booking confirmation
- Download tickets

### 7. My Events
- View all events you've created
- Filter by upcoming/past events
- Edit or delete your events

### 8. My Tickets
- View all booked tickets
- See ticket details and QR codes
- Download tickets for entry

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Gemini AI](https://ai.google.dev/)
- [Heroicons](https://heroicons.com/)
- [AWS Amplify](https://aws.amazon.com/amplify/)

