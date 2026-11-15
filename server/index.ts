import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import { requireAuth } from './auth.js';

// Routes
import userRoutes from './routes/users.js';
import bookRoutes from './routes/books.js';
import ritualRoutes from './routes/rituals.js';
import logRoutes from './routes/logs.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Express backend and MongoDB connection are set up!' });
});

app.use('/api', requireAuth);

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/rituals', ritualRoutes);
app.use('/api/logs', logRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});