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
- Firebase credentials

### Installation

#### Backend
```bash
cd backend
npm install
cp config/firebase-service-account.json.example config/firebase-service-account.json
# Add your Firebase credentials
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

Create `.env` files in both backend and frontend directories with necessary configuration.

### Running Tests

```bash
npm test
```

## License

MIT
