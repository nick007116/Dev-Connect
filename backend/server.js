require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { initializeFirebaseAdmin, getFirestore } = require('./services/firebaseService');
const { verifyToken } = require('./middlewares/authMiddleware');
const { handleSocketConnection } = require('./utils/socketUtils');
const apiRoutes = require('./routes/apiRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

// Initialize Firebase Admin
initializeFirebaseAdmin();

// Test Firestore connection
(async () => {
  try {
    const db = getFirestore();
    const testDoc = await db.collection('test').doc('connection').set({
      timestamp: new Date(),
      status: 'connected'
    });
    console.log('Firestore connection test successful');
  } catch (error) {
    console.error('Firestore connection test failed:', error.message);
  }
})();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL || "https://devconnect-three.vercel.app",
  "http://localhost:3000"
];

// Configure Socket.IO with authentication
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10kb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use(errorMiddleware);

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const user = await verifyToken(token);
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Unauthorized'));
  }
});

// Handle socket connections
io.on('connection', (socket) => handleSocketConnection(socket, io));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated');
  });
});