const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_SCORES = 10;
const scores = [];

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/scores', (req, res) => {
  res.json({ scores });
});

app.post('/scores', (req, res) => {
  const { name, score } = req.body || {};
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const numericScore = typeof score === 'number' ? score : Number(score);

  if (!trimmedName) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  if (!Number.isFinite(numericScore) || numericScore < 0) {
    return res.status(400).json({ error: 'Score must be a non-negative number.' });
  }

  scores.push({
    name: trimmedName.slice(0, 50),
    score: Math.floor(numericScore),
    submittedAt: new Date().toISOString()
  });

  scores.sort((a, b) => b.score - a.score);
  if (scores.length > MAX_SCORES) {
    scores.length = MAX_SCORES;
  }

  res.status(201).json({ scores });
});

app.use((err, req, res, next) => {
  console.error('Unexpected error in request handler:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Bug Busters backend listening on port ${PORT}`);
});
