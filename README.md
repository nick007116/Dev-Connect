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

The frontend is a read-only workspace showcase populated with sample data. Set the Vercel project's Root Directory to `frontend`; its `vercel.json` builds this showcase, which does not import or call Firebase, a backend, or sign-in. No frontend environment variables or Firebase credentials are needed. Chat messages, diagrams, projects, and learning progress shown there are examples only and are not saved.

The optional backend is separate and is not needed to host the Vercel showcase.

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

Environment variables are not needed for the read-only frontend showcase. The optional backend retains its own `.env.example`.

### Running Tests

```bash
npm test
```

## License

MIT
