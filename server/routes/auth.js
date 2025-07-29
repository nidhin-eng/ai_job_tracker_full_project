const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../db');

// Register Route
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  console.log('📨 Registering:', email);

  try {
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.log('⚠️ Email already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
      [email, hashedPassword]
    );

    const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    console.log('✅ Registered successfully');
    res.status(201).json({ token });
  } catch (error) {
    console.error('❌ Register error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



// Login Route

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('🔐 Login attempt for:', email);

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    console.log('📦 DB user fetched:', result.rows);

    if (result.rows.length === 0) {
      console.log('❌ User not found');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    console.log('✅ Login successful, token generated');
    res.json({ token });
  } catch (error) {
    console.error('🚨 Login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
