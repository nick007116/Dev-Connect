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

#### Configure environment variables

Copy each example file to `.env` in the same directory, then fill in the values:

```powershell
Copy-Item frontend/.env.example frontend/.env
Copy-Item backend/.env.example backend/.env
```

In `frontend/.env`, add the Firebase web app configuration from **Firebase Console → Project settings → Your apps**. Add the Realtime Database URL if you use a non-default database. Add a Gemini API key for AI generation and an ImgBB API key for profile-picture uploads.

For demo access, enable **Anonymous** under **Firebase Console → Authentication → Sign-in method**. Google sign-in also requires enabling the Google provider. The frontend Firebase web API key is public in a browser build; restrict it using Firebase API-key and authorized-domain settings, and never put a service-account key in the frontend.

In `backend/.env`, `FIREBASE_SERVICE_ACCOUNT_PATH` must point to a Firebase Admin service-account JSON file (the default is `backend/config/firebase-service-account.json`). Keep that file private and out of version control. Configure the Firebase Realtime Database and Firestore, and ensure your security rules allow authenticated users to access the data they need.

#### Vercel deployment

Deploy the backend separately to a Node.js host that supports persistent Socket.IO connections. In Vercel's frontend project settings, add the frontend variables from `frontend/.env.example` and set both `REACT_APP_BACKEND_URL` and `REACT_APP_SOCKET_URL` to the deployed backend's HTTPS origin (for example, `https://your-api.example.com`). Add the Vercel frontend origin to the backend's comma-separated `FRONTEND_URL`, and redeploy both projects after changing environment values. The production frontend does not fall back to `localhost`.

In Firebase Console, enable the **Anonymous** provider, add the deployed Vercel domain under Authentication's authorized domains, and configure Firestore/Realtime Database rules to allow the intended authenticated-user operations. Firebase client configuration alone does not grant database access; permission rules must authorize each query and write.

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

Use the `.env.example` files as templates. Restart the frontend after changing its `.env` file; Create React App reads these variables at startup.

### Running Tests

```bash
npm test
```

## License

MIT
