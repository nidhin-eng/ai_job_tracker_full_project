// routes/ai.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
require('dotenv').config();

const HuggingFaceInference = (await import('@langchain/community/llms/hf')).HuggingFaceInference;
const { ChatPromptTemplate } = await import('@langchain/core/prompts');
const { RunnableSequence } = await import('@langchain/core/runnables');

router.post('/summary', async (req, res) => {
  const { jd, jobId } = req.body;

  if (!jd || !jobId) {
    return res.status(400).json({ error: 'Job description and jobId are required' });
  }

  try {
    const model = new HuggingFaceInference({
      model: 'tiiuae/falcon-7b-instruct',
      apiKey: process.env.HUGGINGFACE_API_KEY,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful assistant that summarizes job descriptions and gives resume suggestions."],
      ["human", "Given this job description:\n\"{input}\"\n1. Provide a short summary.\n2. Suggest 3 resume improvements."],
    ]);

    const chain = RunnableSequence.from([prompt, model]);
    const aiResponse = await chain.invoke({ input: jd });

    // Optional: Parse summary & resume tips from the AI response (simple method)
    const [summary, ...rest] = aiResponse.split('2.'); // crude split
    const resumeTips = rest.join('2.');

    // Update the job row with AI result
    await pool.query(
      'UPDATE jobs SET ai_summary = $1, resume_tips = $2 WHERE id = $3',
      [summary.trim(), resumeTips.trim(), jobId]
    );

    res.json({ summary: summary.trim(), tips: resumeTips.trim() });
  } catch (err) {
    console.error('❌ AI Error:', err.message || err);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

module.exports = router;
