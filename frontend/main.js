const bug = document.getElementById('bug');
const playfield = document.getElementById('playfield');
const startBtn = document.getElementById('start-btn');
const scoreValue = document.getElementById('score-value');
const timerDisplay = document.getElementById('timer-display');
const timerChipValue = document.getElementById('timer-chip-value');
const overlay = document.getElementById('end-overlay');
const finalScoreEl = document.getElementById('final-score');
const scoreForm = document.getElementById('score-form');
const playerNameInput = document.getElementById('player-name');
const submitScoreBtn = document.getElementById('submit-score');
const statusText = document.getElementById('status-text');
const leaderboardList = document.getElementById('leaderboard-list');
const leaderboardNote = document.getElementById('leaderboard-note');
const refreshLeaderboardBtn = document.getElementById('refresh-leaderboard');
const backendStatusChip = document.getElementById('backend-status');
const issuerContent = document.getElementById('issuer-content');
const reloadIssuersBtn = document.getElementById('reload-issuers');
const issuerDataElement = document.getElementById('issuer-data');

let score = 0;
let timeLeft = 20;
let timerInterval = null;
let bugTimeout = null;
let gameActive = false;
let latestFinalScore = null;
let issuerCache = null;

function setStatus(message) {
  statusText.textContent = message;
}

function updateScoreDisplay() {
  scoreValue.textContent = score;
}

function updateTimerVisuals() {
  const text = `${timeLeft}s`;
  timerDisplay.textContent = text;
  timerChipValue.textContent = text;

  let color = '#c7d2f8';
  if (timeLeft <= 3) {
    color = '#f44336';
  } else if (timeLeft <= 10) {
    color = '#f9a825';
  } else {
    color = '#4caf50';
  }
  timerDisplay.style.background = color;
  timerDisplay.style.color = '#ffffff';
}

function resetTimers() {
  clearInterval(timerInterval);
  clearTimeout(bugTimeout);
  timerInterval = null;
  bugTimeout = null;
}

function moveBug() {
  const maxX = playfield.clientWidth - bug.offsetWidth;
  const maxY = playfield.clientHeight - bug.offsetHeight;
  const nextX = Math.random() * maxX;
  const nextY = Math.random() * maxY;
  bug.style.left = `${nextX}px`;
  bug.style.top = `${nextY}px`;
}

function scheduleBugMovement() {
  if (!gameActive) return;
  moveBug();
  bugTimeout = setTimeout(scheduleBugMovement, 600 + Math.random() * 300);
}

function startGame() {
  gameActive = true;
  score = 0;
  timeLeft = 20;
  latestFinalScore = null;
  overlay.classList.add('hidden');
  bug.disabled = false;
  startBtn.disabled = true;
  startBtn.textContent = 'Playing…';
  submitScoreBtn.disabled = true;
  playerNameInput.disabled = true;
  updateScoreDisplay();
  updateTimerVisuals();
  scheduleBugMovement();
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    if (timeLeft <= 0) {
      timeLeft = 0;
      updateTimerVisuals();
      endGame();
      return;
    }
    updateTimerVisuals();
  }, 1000);
  setStatus('Game started. Keep clicking the bug!');
}

function endGame() {
  if (!gameActive) return;
  gameActive = false;
  resetTimers();
  bug.disabled = true;
  overlay.classList.remove('hidden');
  finalScoreEl.textContent = score;
  startBtn.textContent = 'Play Again';
  startBtn.disabled = false;
  latestFinalScore = score;
  submitScoreBtn.disabled = false;
  playerNameInput.disabled = false;
  playerNameInput.focus();
  setStatus('Round finished. Submit your score or play again.');
}

bug.addEventListener('click', () => {
  if (!gameActive) return;
  score += 1;
  updateScoreDisplay();
  bug.classList.add('hit');
  moveBug();
  setTimeout(() => bug.classList.remove('hit'), 150);
});

startBtn.addEventListener('click', () => {
  resetTimers();
  startGame();
});

scoreForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (latestFinalScore === null) {
    setStatus('Play a round before submitting a score.');
    return;
  }
  const player = playerNameInput.value.trim().toUpperCase();
  if (!player) {
    setStatus('Please enter your initials.');
    playerNameInput.focus();
    return;
  }
  submitScoreBtn.disabled = true;
  setStatus('Submitting score…');
  try {
    const response = await fetch('/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: player, score: latestFinalScore })
    });
    if (!response.ok) throw new Error('Server error');
    playerNameInput.value = '';
    latestFinalScore = null;
    setStatus('Score submitted successfully!');
    await loadLeaderboard();
  } catch (error) {
    setStatus('Unable to submit score. Backend may be offline.');
  } finally {
    submitScoreBtn.disabled = latestFinalScore === null;
  }
});

refreshLeaderboardBtn.addEventListener('click', () => {
  loadLeaderboard(true);
});

async function loadLeaderboard(manual = false) {
  try {
    const response = await fetch('/scores');
    if (!response.ok) throw new Error('Request failed');
    const payload = await response.json();
    const scores = Array.isArray(payload) ? payload : payload.scores || [];
    renderLeaderboard(scores);
    leaderboardNote.textContent = `Updated ${new Date().toLocaleTimeString()}`;
    if (manual) setStatus('Leaderboard refreshed.');
  } catch (error) {
    leaderboardList.innerHTML = '<li>Backend unavailable. Please try again.</li>';
    leaderboardNote.textContent = '';
    if (manual) setStatus('Unable to refresh leaderboard.');
  }
}

function renderLeaderboard(scores) {
  if (!scores.length) {
    leaderboardList.innerHTML = '<li>No scores yet. Play to set the record!</li>';
    return;
  }
  leaderboardList.innerHTML = '';
  scores.slice(0, 10).forEach((entry, index) => {
    const li = document.createElement('li');
    const name = (entry.name || '???').toUpperCase();
    const scoreText = typeof entry.score === 'number' ? entry.score : '—';
    li.innerHTML = `<span>${index + 1}. ${name}</span><span>${scoreText}</span>`;
    leaderboardList.appendChild(li);
  });
}

async function checkBackendHealth() {
  try {
    const response = await fetch('/health');
    if (!response.ok) throw new Error('Health check failed');
    backendStatusChip.textContent = 'Backend: Online';
    backendStatusChip.style.background = '#e5f7ed';
    backendStatusChip.style.color = '#146c2e';
  } catch (error) {
    backendStatusChip.textContent = 'Backend: Offline';
    backendStatusChip.style.background = '#fdecea';
    backendStatusChip.style.color = '#b3261e';
  }
}

function parseIssuerData() {
  if (issuerCache) return issuerCache;
  try {
    issuerCache = JSON.parse(issuerDataElement.textContent);
  } catch (error) {
    issuerCache = null;
  }
  return issuerCache;
}

function renderIssuers() {
  const data = parseIssuerData();
  if (!data || !Array.isArray(data.items)) {
    issuerContent.innerHTML = '<div class="issuer-error">Issuer list unavailable. Showing cached data when available.</div>';
    return;
  }
  if (!data.items.length) {
    issuerContent.innerHTML = '<div class="issuer-empty">No issuer data found.</div>';
    return;
  }
  issuerContent.innerHTML = '';
  data.items.forEach((item) => {
    const block = document.createElement('article');
    block.className = 'issuer-block';

    const header = document.createElement('header');
    const period = document.createElement('div');
    period.textContent = item.period || 'Unknown period';
    const count = document.createElement('small');
    count.textContent = `${item.issuer_count || (item.issuers ? item.issuers.length : 0)} issuers`;
    header.append(period, count);

    const list = document.createElement('ul');
    if (Array.isArray(item.issuers) && item.issuers.length) {
      item.issuers.forEach((issuer) => {
        const li = document.createElement('li');
        li.textContent = issuer;
        list.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = 'No issuers reported.';
      list.appendChild(li);
    }

    block.append(header, list);
    issuerContent.appendChild(block);
  });
}

reloadIssuersBtn.addEventListener('click', () => {
  issuerCache = null;
  renderIssuers();
  setStatus('Issuer panel reloaded.');
});

function init() {
  renderIssuers();
  updateScoreDisplay();
  updateTimerVisuals();
  loadLeaderboard();
  checkBackendHealth();
  setInterval(checkBackendHealth, 10000);
}

init();
