# DevConnect

A collaborative development platform featuring real-time chat, remote desktop sharing, diagram tools, and AI-powered learning resources.

## Project Structure

```
devconnect/
├── backend/        # Node.js/Express server
├── frontend/       # React application
└── README.md       # This file
```

## Features

- **Real-time Chat** - WebSocket-based messaging system
- **Remote Desktop Sharing** - WebRTC-powered screen sharing
- **Diagram & Whiteboard Tools** - Create and collaborate on diagrams
- **AI Project Kickstarter** - AI-assisted project generation
- **Learning Hub** - Smart learning resources
- **Developer Tools** - Color gradients, QR code generation, and more

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation

#### Vercel deployment

Set the Vercel project's Root Directory to `frontend`. The normal landing page and Google sign-in remain available; visitors can choose **Explore Demo** to view the main workspace shell with sample data. Demo browsing does not authenticate, make Firebase/backend requests, or save changes. Configure the Firebase web app values from `frontend/.env.example` in Vercel to enable Google sign-in for real users.

The optional backend is separate. Chat, AI, and live remote-desktop features need their corresponding backend/API configuration; they are disabled in demo mode.

#### Backend
```bash
cd backend
npm install
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## Technology Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express
- **Real-time:** Socket.IO, WebRTC
- **Database:** Firebase
- **AI:** Google Gemini API

## Development

### Environment Variables

Use the frontend and backend `.env.example` files as templates. Frontend Firebase values must be configured in Vercel to enable real-user Google authentication.

### Running Tests

```bash
npm test
```

## License

MIT
