const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express(); 
console.log('🧠 Running correct index.js');  // <-- Initialize app first

const jobsRouter = require('./routes/jobs');

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.send('Express is alive!');
});
// server/index.js
app.get('/ping', (req, res) => res.send('pong'));

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
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', jobsRouter);
app.use('/api/ai', require('./routes/ai'));
app.use('/api/users', require('./routes/users'));

// Start server (only once)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
