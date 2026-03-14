// server/index.js — CallCoach Backend (OpenAI + Smallest AI TTS)

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const PORT = process.env.PORT || 3001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SMALLEST_API_KEY = process.env.SMALLEST_API_KEY;

// ─── Health check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    openai: !!OPENAI_API_KEY,
    smallest: !!SMALLEST_API_KEY
  });
});

// ─── Chat with AI Customer (via OpenAI) ───────────────────
app.post('/api/chat', async (req, res) => {
  const { messages, systemPrompt } = req.body;
  const key = OPENAI_API_KEY;

  if (!key) {
    return res.status(400).json({ error: 'No OPENAI_API_KEY in .env file' });
  }

  try {
    const openaiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 500,
        messages: openaiMessages
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('OpenAI error:', data.error);
      return res.status(400).json({ error: data.error.message });
    }

    res.json({
      text: data.choices?.[0]?.message?.content || "I'm sorry, could you repeat that?"
    });
  } catch (err) {
    console.error('OpenAI API error:', err);
    res.status(500).json({ error: 'Failed to reach AI service' });
  }
});

// ─── TTS via Smallest AI Lightning v2 (REST, optimized) ──
app.post('/api/tts', async (req, res) => {
  const { text, voiceId = 'ryan' } = req.body;
  const key = SMALLEST_API_KEY;

  if (!key) {
    return res.status(400).json({ error: 'No Smallest AI API key' });
  }

  const startTime = Date.now();

  try {
    // Use Lightning v2 REST endpoint (faster model)
    const response = await fetch('https://waves-api.smallest.ai/api/v1/lightning-v2/get_speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        voice_id: voiceId,
        text: text,
        sample_rate: 16000,
        speed: 1.15,
        language: 'en'
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Lightning v2 TTS error:', errText);

      // Fallback to original Lightning model
      console.log('Trying Lightning v1 fallback...');
      const fallback = await fetch('https://waves-api.smallest.ai/api/v1/lightning/get_speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          voice_id: voiceId,
          text: text,
          sample_rate: 16000,
          add_wav_header: true,
          speed: 1.1
        })
      });

      if (!fallback.ok) {
        return res.status(500).json({ error: 'TTS failed on both models' });
      }

      console.log(`🐢 v1 TTS: ${Date.now() - startTime}ms | "${text.substring(0, 40)}..."`);
      res.setHeader('Content-Type', 'audio/wav');
      const buffer = await fallback.arrayBuffer();
      return res.send(Buffer.from(buffer));
    }

    console.log(`⚡ v2 TTS: ${Date.now() - startTime}ms | "${text.substring(0, 40)}..."`);
    res.setHeader('Content-Type', 'audio/wav');
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('TTS error:', err);
    res.status(500).json({ error: 'TTS unavailable' });
  }
});

// ─── Score a session (via OpenAI) ─────────────────────────
app.post('/api/score', async (req, res) => {
  const { transcript, scenario } = req.body;
  const key = OPENAI_API_KEY;

  if (!key) {
    return res.status(400).json({ error: 'No OPENAI_API_KEY in .env file' });
  }

  const scoringPrompt = `You are an expert customer service trainer evaluating a trainee's performance.

SCENARIO: ${scenario.title} — ${scenario.description}
CUSTOMER PERSONA: ${scenario.customerPersona.name} (${scenario.customerPersona.mood})

SCORING CRITERIA:
${scenario.scoringCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

TRANSCRIPT:
${transcript}

Evaluate the agent's performance. Respond in EXACTLY this JSON format (no markdown, no backticks):
{
  "overallScore": <number 0-100>,
  "criteria": [${scenario.scoringCriteria.map(c => `{"text": "${c}", "met": <true/false>}`).join(',')}],
  "feedback": "<2-3 sentences of constructive feedback>"
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: 'You are a customer service training evaluator. Respond ONLY with valid JSON, no markdown formatting.' },
          { role: 'user', content: scoringPrompt }
        ]
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '{}';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    res.json(parsed);
  } catch (err) {
    console.error('Scoring error:', err);
    res.status(500).json({ error: 'Scoring failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🎯 CallCoach API running on port ${PORT}`);
  console.log(`   OpenAI: ${OPENAI_API_KEY ? '✓ Key loaded' : '✗ Missing'}`);
  console.log(`   Smallest AI: ${SMALLEST_API_KEY ? '✓ Key loaded' : '✗ Missing'}`);
});