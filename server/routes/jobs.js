const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../db');

// Get all jobs for a user
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM jobs WHERE user_id = $1 ORDER BY applied_on DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});
  
// Add a new job
router.post('/', auth, async (req, res) => {
  const {
    company,
    role,
    jd,
    status,
    applied_on,       // format: 'YYYY-MM-DD'
    ai_summary,
    skills             // pass as JS array (e.g., ["Node.js", "SQL"])
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO jobs 
        (company, role, jd, status, applied_on, ai_summary, skills, user_id)
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [company, role, jd, status, applied_on, ai_summary, skills, req.userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// PUT /api/jobs/:id - Update job by ID
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { company, role, jd, status, applied_on, skills, ai_summary } = req.body;

  try {
    const result = await pool.query(
      `UPDATE jobs SET company=$1, role=$2, jd=$3, status=$4, applied_on=$5, skills=$6, ai_summary=$7
       WHERE id=$8 AND user_id=$9 RETURNING *`,
      [company, role, jd, status, applied_on, skills, ai_summary, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found or not authorized' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating job:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/jobs/:id - Delete job by ID
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM jobs WHERE id=$1 AND user_id=$2 RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found or not authorized' });
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    console.error('Error deleting job:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
