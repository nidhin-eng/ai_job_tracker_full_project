const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const pool = require('../db');

// ✅ Create Job
async function createJob(title, company, jd, skills, status, userId) {
  const result = await pool.query(
    `INSERT INTO jobs (title, company, jd, skills, status, user_id) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [title, company, jd, skills, status, userId]
  );
  return result.rows[0];
}

// ✅ Get Jobs for a User
async function getJobsByUser(userId) {
  const result = await pool.query(
    'SELECT * FROM jobs WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

// ✅ Update AI Summary
async function updateAISummary(jobId, summary) {
  await pool.query('UPDATE jobs SET ai_summary = $1 WHERE id = $2', [summary, jobId]);
}

// ✅ Delete Job
async function deleteJob(jobId) {
  await pool.query('DELETE FROM jobs WHERE id = $1', [jobId]);
}

// ✅ GET all jobs
router.get('/', authenticate, async (req, res) => {
  try {
    const jobs = await getJobsByUser(req.user.id);
    res.json(jobs);
  } catch (err) {
    console.error('Fetch jobs error:', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// ✅ POST create new job
router.post('/', authenticate, async (req, res) => {
  const { title, company, jd, skills, status, applied_date } = req.body;
  const userId = req.user.id;

  if (!title || !company || !jd) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newJob = await createJob(
      title,
      company,
      jd,
      skills || [],
      status || 'Applied',
      applied_date || new Date(),
      userId
    );
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
