const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express(); 
console.log('🧠 Running correct index.js');  

// Routers
const jobsRouter = require('./routes/jobs');
const authRouter = require('./routes/auth');
const aiRouter = require('./routes/ai');
const usersRouter = require('./routes/users');

// ✅ Configure CORS
const allowedOrigins = [
  'http://localhost:3000', 
  'https://<your-netlify-site>.netlify.app'
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Middleware
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.send('Express is alive!');
});

// Health routes
app.get('/ping', (req, res) => res.send('pong'));
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Logger
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// DB check
pool.query('SELECT NOW()')
  .then(() => console.log("✅ DB Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err.stack));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/users', usersRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
