require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Endpoint to analyze assignment content
app.post('/analyze', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Example: using Chat Completion to analyze content
    const completion = await openai.chat.completions.create({
      model: 'gpt-4', // or gpt-3.5-turbo
      messages: [
        { role: 'system', content: 'You are an assignment analyzer for students.' },
        { role: 'user', content: `Analyze this assignment for correctness and plagiarism. Return JSON with keys: correctness, plagiarism_percentage. Content: ${content}` }
      ]
    });

    const responseText = completion.choices[0].message.content;
    // Try parsing JSON from AI response
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { correctness: responseText, plagiarism_percentage: 'N/A' };
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI analysis failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
