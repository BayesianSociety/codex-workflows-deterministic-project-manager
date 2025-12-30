(() => {
  const ROUND_DURATION = 20; // seconds
  const BUG_INTERVAL = 800; // ms
  const LOCAL_STORAGE_KEY = 'bug-busters-local-scores';

  const timerEl = document.querySelector('[data-role="timer"]');
  const scoreEl = document.querySelector('[data-role="score"]');
  const bugEl = document.querySelector('[data-role="bug"]');
  const stageEl = document.querySelector('[data-role="stage"]');
  const cueEl = document.querySelector('[data-role="cue"]');
  const replayButton = document.querySelector('[data-role="replay"]');
  const finalScorePanel = document.querySelector('[data-role="final-score"]');
  const finalScoreValueEl = document.querySelector('[data-role="final-score-value"]');
  const leaderboardRowsEl = document.querySelector('[data-role="leaderboard-rows"]');
  const leaderboardStatusEl = document.querySelector('[data-role="leaderboard-status"]');
  const scoreForm = document.querySelector('[data-role="score-form"]');
  const nicknameInput = scoreForm.querySelector('input');
  const submitButton = scoreForm.querySelector('button');
  const formHintEl = document.querySelector('[data-role="form-hint"]');

  let countdownId = null;
  let moverId = null;
  let roundActive = false;
  let timeLeft = ROUND_DURATION;
  let score = 0;
  let lastFinalScore = 0;
  let leaderboardOnline = false;
  let cueTimeout = null;

  const formatTime = (seconds) => `00:${String(Math.max(0, seconds)).padStart(2, '0')}`;

  const updateScoreDisplay = () => {
    scoreEl.textContent = `Score: ${score}`;
  };

  const updateTimerDisplay = () => {
    timerEl.textContent = formatTime(timeLeft);
  };

  const showCue = (message) => {
    if (!cueEl) return;
    cueEl.textContent = message;
    cueEl.classList.add('visible');
    clearTimeout(cueTimeout);
    cueTimeout = setTimeout(() => cueEl.classList.remove('visible'), 800);
  };

  const moveBugRandomly = () => {
    const stageRect = stageEl.getBoundingClientRect();
    const bugWidth = bugEl.offsetWidth;
    const bugHeight = bugEl.offsetHeight;
    const maxLeft = Math.max(0, stageRect.width - bugWidth);
    const maxTop = Math.max(0, stageRect.height - bugHeight);
    const nextLeft = Math.random() * maxLeft;
    const nextTop = Math.random() * maxTop;
    bugEl.style.left = `${nextLeft}px`;
    bugEl.style.top = `${nextTop}px`;
  };

  const stopMovement = () => {
    clearInterval(moverId);
    moverId = null;
  };

  const startMovement = () => {
    moveBugRandomly();
    stopMovement();
    moverId = setInterval(moveBugRandomly, BUG_INTERVAL);
  };

  const clearCountdown = () => {
    clearInterval(countdownId);
    countdownId = null;
  };

  const resetRound = () => {
    score = 0;
    timeLeft = ROUND_DURATION;
    updateScoreDisplay();
    updateTimerDisplay();
    stageEl.classList.remove('ended');
    finalScorePanel.hidden = true;
    replayButton.textContent = 'Replay Round';
    replayButton.disabled = false;
    lastFinalScore = 0;
    updateFormAvailability();
  };

  const endRound = () => {
    if (!roundActive) return;
    roundActive = false;
    clearCountdown();
    stopMovement();
    stageEl.classList.add('ended');
    finalScoreValueEl.textContent = score;
    finalScorePanel.hidden = false;
    replayButton.disabled = false;
    lastFinalScore = score;
    showCue(`You scored ${score}!`);
    updateFormAvailability();
  };

  const startRound = () => {
    if (roundActive) return;
    resetRound();
    roundActive = true;
    replayButton.disabled = true;
    finalScorePanel.hidden = true;
    showCue('Go!');
    startMovement();
    clearCountdown();
    countdownId = setInterval(() => {
      timeLeft -= 1;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        endRound();
      }
    }, 1000);
  };

  const setLeaderboardStatus = (isOnline) => {
    leaderboardOnline = isOnline;
    leaderboardStatusEl.textContent = isOnline ? 'Online' : 'Offline mode';
    leaderboardStatusEl.classList.toggle('online', isOnline);
    leaderboardStatusEl.classList.toggle('offline', !isOnline);
    updateFormAvailability();
  };

  const getLocalScores = () => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  };

  const saveLocalScore = (entry) => {
    const existing = getLocalScores();
    existing.unshift(entry);
    const trimmed = existing.slice(0, 10);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trimmed));
  };

  const updateLeaderboardRows = (scores) => {
    const rows = Array.isArray(scores) ? scores : [];
    leaderboardRowsEl.innerHTML = '';
    if (!rows.length) {
      const fallback = document.createElement('tr');
      fallback.innerHTML = '<td colspan="3">Waiting for scores...</td>';
      leaderboardRowsEl.appendChild(fallback);
      return;
    }

    rows.slice(0, 10).forEach((entry, index) => {
      const row = document.createElement('tr');
      const place = document.createElement('td');
      place.textContent = index + 1;
      const nameCell = document.createElement('td');
      nameCell.textContent = entry.name || 'Player';
      const scoreCell = document.createElement('td');
      scoreCell.textContent = entry.score;
      row.append(place, nameCell, scoreCell);
      leaderboardRowsEl.appendChild(row);
    });
  };

  const updateFormAvailability = () => {
    const hasScore = lastFinalScore > 0;
    const canSubmit = leaderboardOnline && hasScore;
    nicknameInput.disabled = !canSubmit;
    submitButton.disabled = !canSubmit;
    submitButton.title = leaderboardOnline ? '' : 'Leaderboard offline';
    if (!hasScore) {
      formHintEl.textContent = 'Finish a round to submit your score.';
    } else if (!leaderboardOnline) {
      formHintEl.textContent = 'Leaderboard offline - scores stored locally until reconnected.';
    } else {
      formHintEl.textContent = 'Enter a nickname and share your score!';
    }
  };

  const fetchScores = async () => {
    try {
      const response = await fetch('/scores');
      if (!response.ok) throw new Error('Failed to fetch scores');
      const data = await response.json();
      updateLeaderboardRows(data);
      setLeaderboardStatus(true);
    } catch (err) {
      updateLeaderboardRows(getLocalScores());
      setLeaderboardStatus(false);
    }
  };

  const submitScore = async (event) => {
    event.preventDefault();
    if (submitButton.disabled) return;
    const name = nicknameInput.value.trim() || 'Bug Buster';
    const payload = { name, score: lastFinalScore };
    submitButton.disabled = true;
    formHintEl.textContent = 'Submitting...';
    try {
      const response = await fetch('/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Request failed');
      nicknameInput.value = '';
      formHintEl.textContent = 'Score submitted! Check the leaderboard.';
      fetchScores();
    } catch (err) {
      saveLocalScore(payload);
      updateLeaderboardRows(getLocalScores());
      formHintEl.textContent = 'Saved locally - sync when back online.';
      setLeaderboardStatus(false);
    } finally {
      updateFormAvailability();
    }
  };

  bugEl.addEventListener('click', () => {
    if (!roundActive) return;
    score += 1;
    updateScoreDisplay();
    showCue('Great hit!');
  });

  replayButton.addEventListener('click', startRound);
  scoreForm.addEventListener('submit', submitScore);

  // Initial state setup
  updateScoreDisplay();
  updateTimerDisplay();
  updateFormAvailability();
  showCue('Tap the bug to start!');
  updateLeaderboardRows(getLocalScores());
  fetchScores();
})();
