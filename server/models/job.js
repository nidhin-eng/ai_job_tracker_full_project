const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobsByUser,
  updateAISummary,
  deleteJob
} = require('../models/job'); // model functions
const authenticate = require('../middleware/auth');

const pool = require('../db');

async function createJob(title, company, jd, userId) {
  const result = await pool.query(
    'INSERT INTO jobs (title, company, jd, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [title, company, jd, userId]
  );
  return result.rows[0];
}

async function getJobsByUser(userId) {
  const result = await pool.query(
    'SELECT * FROM jobs WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

async function updateAISummary(jobId, summary) {
  await pool.query('UPDATE jobs SET ai_summary = $1 WHERE id = $2', [summary, jobId]);
}

async function deleteJob(jobId) {
  await pool.query('DELETE FROM jobs WHERE id = $1', [jobId]);
}

module.exports = {
  createJob,
  getJobsByUser,
  updateAISummary,
  deleteJob,
};

// ✅ GET all jobs for a user
router.get('/', authenticate, async (req, res) => {
  try {
    const jobs = await getJobsByUser(req.user.id);
    res.json(jobs);
  } catch (err) {
    console.error('Fetch jobs error:', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// ✅ POST create a new job
router.post('/', authenticate, async (req, res) => {
  const { title, company, jd } = req.body;
  const userId = req.user.id;

  if (!title || !company || !jd) {
    return res.status(400).json({ error: 'Missing title, company, or jd' });
  }

  try {
    const newJob = await createJob(title, company, jd, userId);
    res.json(newJob);
  } catch (err) {
    console.error('Job creation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ PATCH: Save AI summary
router.patch('/:id/ai-summary', authenticate, async (req, res) => {
  const { summary } = req.body;
  try {
    await updateAISummary(req.params.id, summary);
    res.json({ message: 'AI summary saved' });
  } catch (err) {
    console.error('AI summary update error:', err);
    res.status(500).json({ error: 'Failed to save AI summary' });
  }
});

// ✅ DELETE a job
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await deleteJob(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error('Delete job error:', err);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

module.exports = router;
