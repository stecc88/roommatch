import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes.js';
import listingRoutes from './routes/listing.routes.js';
import matchRoutes from './routes/match.routes.js';
import chatRoutes from './routes/chat.routes.js';
import userRoutes from './routes/user.routes.js';
import { getDiscover } from './controllers/user.controller.js';
import { authenticateToken } from './middleware/auth.middleware.js';


const app = express();
const httpServer = createServer(app);
const envOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

const isAllowedOrigin = (origin) => {
  if (!origin) return true
  if (envOrigins.includes(origin)) return true
  if (/^https?:\/\/.*\.vercel\.app$/.test(origin)) return true
  if (origin.startsWith('http://localhost:')) return true
  return false
}

const io = new Server(httpServer, {
    cors: {
        origin: (origin, callback) => {
          if (isAllowedOrigin(origin)) return callback(null, true)
          callback(new Error('Not allowed by CORS'))
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId.toString());
        console.log(`User ${userId} joined room ${userId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.use(cors({ origin: (origin, callback) => {
  if (isAllowedOrigin(origin)) return callback(null, true)
  callback(new Error('Not allowed by CORS'))
}, credentials: true }));
app.options('*', cors({ origin: (origin, callback) => {
  if (isAllowedOrigin(origin)) return callback(null, true)
  callback(new Error('Not allowed by CORS'))
}, credentials: true }))
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.get('/api/discover', authenticateToken, getDiscover)
app.use('/api/listings', listingRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
    res.send('RoomMatch Backend is running');
});

export { app, httpServer, io };
