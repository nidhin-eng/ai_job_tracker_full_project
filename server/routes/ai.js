const express = require('express');
const router = express.Router();
const pool = require('../db');
require('dotenv').config();

const { HfInference } = require('@huggingface/inference');

console.log('✅ AI router loaded');

// Test endpoint
router.post('/test', (req, res) => {
  console.log('✅ /api/ai/test called with body:', req.body);
  res.json({ ok: true });
});

router.post('/summary', async (req, res) => {
  try {
    console.log('🟢 AI summary endpoint hit');
    console.log('🔍 /api/ai/summary called. req.body:', req.body);
    const { jd, jobId } = req.body;

    // Validate request body
    if (!jd || !jobId) {
      console.error('❌ Missing jd or jobId:', req.body);
      return res.status(400).json({ error: 'Job description and jobId are required' });
    }

    // Check API key
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.error('❌ Missing Hugging Face API key');
      return res.status(500).json({ error: 'Missing HuggingFace API key' });
    }

    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

    // Ask the model to summarize and give tips
    const result = await hf.text2textGeneration({
      model: 'google/flan-t5-base',
      inputs: `Summarize this job description and suggest 3 resume improvements:\n\n${jd}`
    });

    const aiText = result.generated_text || '';

    // Basic split of summary and tips
    const [summary, ...rest] = aiText.split('2.');
    const suggestions = rest.join('2.');

    // Save results to DB
    await pool.query(
      'UPDATE jobs SET ai_summary = $1, suggestions = $2 WHERE id = $3',
      [summary.trim(), suggestions.trim(), jobId]
    );

    res.json({
      summary: summary.trim(),
      tips: suggestions.trim()
    });
  } catch (err) {
    console.error('❌ AI Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
