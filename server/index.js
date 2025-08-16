const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express(); 
console.log('🧠 Running correct index.js');  // <-- Initialize app first

const jobsRouter = require('./routes/jobs');

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {

  res.send('Express is alive!');
});
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});
pool.query('SELECT NOW()')
  .then(() => console.log("✅ DB Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err.stack));


// Use routers AFTER app is defined
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', jobsRouter);
app.use('/api/ai', require('./routes/ai'));
app.use('/api/users', require('./routes/users'));

app.listen(5000, () => console.log('Server running on port 5000'));

