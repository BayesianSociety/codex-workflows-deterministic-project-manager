const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable JSON payloads and permissive CORS for local frontend development.
app.use(cors());
app.use(express.json());

// Simple in-memory leaderboard store.
const scores = [];

const isValidName = (value) => typeof value === 'string' && value.trim().length > 0;
const isValidScore = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0;

const getTopScores = () => scores.slice(0, 10);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/scores', (_req, res) => {
  res.json({ scores: getTopScores() });
});

app.post('/scores', (req, res) => {
  const { name, score } = req.body || {};

  if (!isValidName(name) || !isValidScore(score)) {
    return res.status(400).json({ error: 'Name (string) and score (non-negative number) are required.' });
  }

  const entry = {
    name: name.trim().slice(0, 40),
    score: Math.round(score),
    submittedAt: new Date().toISOString(),
  };

  scores.push(entry);
  scores.sort((a, b) => b.score - a.score || new Date(a.submittedAt) - new Date(b.submittedAt));
  scores.splice(10);

  res.status(201).json({ score: entry, scores: getTopScores() });
});

app.use((err, _req, res, _next) => {
  console.error('Unexpected server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Bug Busters backend running on http://localhost:${PORT}`);
  console.log('Use POST /scores with JSON { "name": "Player", "score": 10 } to submit.');
});
