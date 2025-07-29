const { ChatOpenAI } = require("@langchain/openai");
require('dotenv').config();

const model = new ChatOpenAI({
  temperature: 0.5,
  openAIApiKey: process.env.OPENAI_API_KEY
});

async function analyzeJD(jdText) {
  const prompt = `You're an AI career assistant. Given this job description, provide:
1. A 2-line summary of the role
2. A list of technical and soft skills required
3. 3 personalized suggestions for interview preparation

JD:
${jdText}`;

  const result = await model.call(prompt);
  return { summary: result };
}

module.exports = { analyzeJD };
