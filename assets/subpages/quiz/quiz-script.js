

/*  Globals Variables */
let dictionary = null;
let currentPhase = 'learning';
let currentCardIndex = 0;
let currentQuestionIndex = 0;

let learningCards = [];
let quizQuestions = [];

let score = 0;
let isLoaded = false;

let cardTimer = null;
let currentTime = 0;

let totalStartTime = 0;
let quizTimer = null;
let quizTimePerQuestion = 30; // seconds per question
let questionStartTime = 0;
let quizQuestionTimes = [];   // per-question seconds
let wrongAnswers = [];        // array of question objects answered wrong

/*  Small Helpers  */
function $(id) { return document.getElementById(id); }
function text(el, val) { if (el) el.textContent = val; }

/*  Show current user on quiz page  */
function displayUserName() {
  const userName = localStorage.getItem('userName') || '';
  const userNameDisplay = $('userNameDisplay');
  if (userName && userNameDisplay) userNameDisplay.textContent = userName;
}

/*  Load dictionary  */
window.addEventListener('DOMContentLoaded', () => {
  loadDictionary();
  displayUserName();
  // Footer random words (quiz page footer)
  const mostUsedWord = "hola";
  const suggestions = ["amigo", "learn", "rápido", "study"];
  const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
  const w1 = $('wordOfDay'); const w2 = $('suggestedWord');
  if (w1) w1.textContent = mostUsedWord;
  if (w2) w2.textContent = randomSuggestion;
});

async function loadDictionary() {
  try {
    const response = await fetch('spanish-dictionary.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    dictionary = await response.json();
    if (!dictionary || !Array.isArray(dictionary.words) || dictionary.words.length === 0) {
      throw new Error('Invalid dictionary format or empty dictionary');
    }

    isLoaded = true;
    const loadingText = $('loadingText');
    const startText = $('startText');
    const startButton = $('startButton');
    if (loadingText) loadingText.style.display = 'none';
    if (startText) startText.style.display = 'inline';
    if (startButton) startButton.disabled = false;

  } catch (err) {
    console.error('Error loading dictionary:', err);
    showError('Failed to load dictionary. Ensure spanish-dictionary.json is in the same folder as quiz.html.');
  }
}

function showError(message) {
  const errorElement = $('errorMessage');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
  const loadingText = $('loadingText');
  const startButton = $('startButton');
  if (loadingText) loadingText.textContent = 'Error Loading';
  if (startButton) startButton.disabled = true;
}

/*  Start / Phases  */
function restartLearningPhase() {
  clearInterval(cardTimer);
  currentCardIndex = 0;
  initializeLearningPhase();
}

function startQuiz() {
  if (!isLoaded) { showError('Dictionary is still loading. Please wait...'); return; }

  // Swap welcome quiz container
  const welcome = $('welcomeScreen'); const qc = $('quizContainer');
  if (welcome) welcome.style.display = 'none';
  if (qc) qc.style.display = 'block';

  const lp = $('learningPhase');
  if (lp) lp.style.display = 'block';

  // Select 20 random words
  learningCards = getRandomWords(20);

  initializeLearningPhase();
  totalStartTime = Date.now();
}

function getRandomWords(count) {
  const shuffled = [...dictionary.words].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function initializeLearningPhase() {
  currentPhase = 'learning';
  currentCardIndex = 0;

  const lp = $('learningPhase'); const qp = $('quizPhase');
  if (lp) lp.style.display = 'block';
  if (qp) qp.style.display = 'none';

  const timerDisplay = $('timerDisplay');
  if (timerDisplay) timerDisplay.style.display = 'block';

  const skipBtn = $('skipBtn');
  if (skipBtn) skipBtn.style.display = 'block';

  text($('phaseTitle'), 'Learning Phase');
  text($('phaseSubtitle'), 'Cards will auto-flip after 3-5 seconds');

  showLearningCard();
}

function showLearningCard() {
  if (currentCardIndex >= learningCards.length) { startQuizPhase(); return; }

  const card = learningCards[currentCardIndex];
  const flashcard = $('flashcard');
  if (flashcard) flashcard.classList.remove('flipped');

  text($('spanishWord'), card.spanish);
  text($('englishWord'), card.english);

  text($('currentCard'), currentCardIndex + 1);
  updateProgressBar();

  startCardTimer();
}

function startCardTimer() {
  const randomTime = Math.floor(Math.random() * 3) + 3; 
  currentTime = randomTime;

  const timerElement = $('timer');
  const timerLabel = $('timerLabel');
  if (timerElement) timerElement.textContent = currentTime;
  if (timerElement) timerElement.classList.remove('warning');
  if (timerLabel) timerLabel.textContent = 'seconds remaining';

  cardTimer = setInterval(() => {
    currentTime--;
    if (timerElement) timerElement.textContent = currentTime;

    if (currentTime <= 2 && timerElement) timerElement.classList.add('warning');

    if (currentTime === Math.floor(randomTime / 2)) {
      const flashcard = $('flashcard');
      if (flashcard) flashcard.classList.add('flipped');
    }

    if (currentTime <= 0) {
      clearInterval(cardTimer);
      setTimeout(() => {
        currentCardIndex++;
        showLearningCard();
      }, 500);
    }
  }, 1000);
}

function confirmSkip() {
  if (confirm("Skip remaining cards and go to the quiz?")) {
    clearInterval(cardTimer);
    startQuizPhase();
  }
}

function updateProgressBar() {
  const totalCards = currentPhase === 'learning' ? learningCards.length : quizQuestions.length;
  const currentIndex = currentPhase === 'learning' ? currentCardIndex : currentQuestionIndex;
  const progress = (currentIndex / totalCards) * 100;
  const bar = $('progressBar');
  if (bar) bar.style.width = progress + '%';
}

function startQuizPhase() {
  clearInterval(cardTimer);
  currentPhase = 'quiz';
  currentQuestionIndex = 0;
  score = 0;

  const lp = $('learningPhase'); const qp = $('quizPhase');
  if (lp) lp.style.display = 'none';
  if (qp) qp.style.display = 'block';

  const scoreStat = $('scoreStat'); const timerDisplay = $('timerDisplay');
  if (scoreStat) scoreStat.style.display = 'block';
  if (timerDisplay) timerDisplay.style.display = 'block';

  text($('phaseTitle'), 'Quiz Phase');
  text($('phaseSubtitle'), 'Choose the correct translation');
  text($('totalCards'), learningCards.length);

  quizQuestions = [...learningCards];
  quizQuestionTimes = [];
  wrongAnswers = [];

  showQuizQuestion();
}

function showQuizQuestion() {
  if (currentQuestionIndex >= quizQuestions.length) { showResults(); return; }

  const question = quizQuestions[currentQuestionIndex];

  text($('quizWord'), question.spanish);
  text($('currentCard'), currentQuestionIndex + 1);
  text($('currentScore'), score);

  updateProgressBar();
  startQuizTimer();

  const options = generateOptions(question);
  const optionEls = document.querySelectorAll('.option');

  optionEls.forEach((opt, idx) => {
    opt.textContent = options[idx].text;
    opt.className = 'option';
    opt.onclick = () => selectOption(opt, idx);
    opt.setAttribute('data-correct', options[idx].correct);
  });

  const nextBtn = $('nextBtn');
  if (nextBtn) nextBtn.classList.remove('show');
}

function startQuizTimer() {
  currentTime = quizTimePerQuestion;
  questionStartTime = Date.now();

  const timerElement = $('timer');
  const timerLabel = $('timerLabel');

  if (timerElement) timerElement.textContent = currentTime;
  if (timerElement) timerElement.classList.remove('warning');
  if (timerLabel) timerLabel.textContent = 'seconds to answer';

  quizTimer = setInterval(() => {
    currentTime--;
    if (timerElement) timerElement.textContent = currentTime;

    if (currentTime <= 10 && timerElement) timerElement.classList.add('warning');

    if (currentTime <= 0) {
      clearInterval(quizTimer);
      const options = document.querySelectorAll('.option');
      options.forEach(opt => opt.onclick = null);
      options.forEach(opt => {
        if (opt.getAttribute('data-correct') === 'true') opt.classList.add('correct');
      });
      setTimeout(() => { const n = $('nextBtn'); if (n) n.classList.add('show'); }, 1000);
    }
  }, 1000);
}

function generateOptions(correctWord) {
  const incorrect = dictionary.words
    .filter(w => w.english !== correctWord.english)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  const opts = [
    { text: correctWord.english, correct: true },
    { text: incorrect[0].english, correct: false },
    { text: incorrect[1].english, correct: false },
    { text: incorrect[2].english, correct: false }
  ];
  return opts.sort(() => 0.5 - Math.random());
}

function selectOption(el) {
  clearInterval(quizTimer);

  const questionTime = (Date.now() - questionStartTime) / 1000;
  quizQuestionTimes.push(questionTime);

  const options = document.querySelectorAll('.option');
  options.forEach(opt => opt.onclick = null);

  const isCorrect = el.getAttribute('data-correct') === 'true';
  if (isCorrect) {
    el.classList.add('correct');
    score++;
    text($('currentScore'), score);
  } else {
    el.classList.add('incorrect');
    const question = quizQuestions[currentQuestionIndex];
    wrongAnswers.push(question);
    options.forEach(opt => {
      if (opt.getAttribute('data-correct') === 'true') opt.classList.add('correct');
    });
  }

  setTimeout(() => { const n = $('nextBtn'); if (n) n.classList.add('show'); }, 1000);
}

function nextQuestion() {
  currentQuestionIndex++;
  showQuizQuestion();
}

/*  Persist to localStorage for Home Page */


function qz_getAllUsers() {
  return JSON.parse(localStorage.getItem('wordflash_users') || '{}');
}
function qz_saveAllUsers(obj) {
  localStorage.setItem('wordflash_users', JSON.stringify(obj));
}
function qz_getOrInitUser(name) {
  const all = qz_getAllUsers();
  if (!all[name]) {
    all[name] = {
      totalQuizzes: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      quizTimes: [],        
      wrongAnswers: [],     
      recentScores: [],     
      wordsLearned: 0,
      createdAt: new Date().toISOString(),
      lastPlayed: new Date().toISOString()
    };
  }
  return all[name];
}
function qz_addQuizResult({ name, correct, total, totalSeconds, wrongs }) {
  const all = qz_getAllUsers();
  const user = qz_getOrInitUser(name);

  user.totalQuizzes += 1;
  user.totalCorrect += correct;
  user.totalQuestions += total;

  user.quizTimes.push(Math.round(totalSeconds));

  const pct = Math.round((correct / total) * 100);
  user.recentScores = Array.isArray(user.recentScores) ? user.recentScores : [];
  user.recentScores.push(pct);
  if (user.recentScores.length > 7) user.recentScores = user.recentScores.slice(-7);

  user.wrongAnswers = Array.isArray(wrongs) ? wrongs.slice(0, 20) : [];
  user.wordsLearned = Math.max(user.wordsLearned || 0, user.totalCorrect);

  user.lastPlayed = new Date().toISOString();
  all[name] = user;
  qz_saveAllUsers(all);
}

function showResults() {
  clearInterval(cardTimer);
  clearInterval(quizTimer);

  currentPhase = 'results';

  const qc = $('quizContainer'); const rs = $('resultsScreen');
  if (qc) qc.style.display = 'none';
  if (rs) rs.style.display = 'block';

  const totalQuestions = quizQuestions.length;
  const correctAnswers = score;
  const incorrectAnswers = totalQuestions - score;
  const percentage = Math.round((score / totalQuestions) * 100);

  const totalTimeMs = Date.now() - totalStartTime;
  const minutes = Math.floor(totalTimeMs / 60000);
  const seconds = Math.floor((totalTimeMs % 60000) / 1000);
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  text($('finalScore'), percentage + '%');
  text($('correctAnswers'), correctAnswers);
  text($('incorrectAnswers'), incorrectAnswers);
  text($('totalTime'), timeString);

  // Remove any existing Avg Time node to avoid duplicates
  const resultsStatsContainer = document.querySelector('.results-stats');
  const existingAvgTime = $('avgTimeDisplay');
  if (existingAvgTime) existingAvgTime.remove();

  const totalQuestionTime = quizQuestionTimes.reduce((sum, t) => sum + t, 0);
  const averageTime = quizQuestionTimes.length ? (totalQuestionTime / quizQuestionTimes.length) : 0;

  const avgTimeDisplay = document.createElement('div');
  avgTimeDisplay.id = 'avgTimeDisplay';
  avgTimeDisplay.className = 'result-stat';
  avgTimeDisplay.innerHTML = `<div class="result-stat-value" style="color:#667eea;">${averageTime.toFixed(1)}s</div><div class="result-stat-label">Avg. Time per Q</div>`;
  if (resultsStatsContainer) resultsStatsContainer.appendChild(avgTimeDisplay);

  // Wrong answers list
  if (wrongAnswers.length > 0) {
    const listContainer = $('incorrectAnswersList');
    const ul = $('wrongWords');
    if (ul) {
      ul.innerHTML = '';
      wrongAnswers.forEach(word => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="spanish">${word.spanish}</span> -> <span class="english">${word.english}</span>`;
        ul.appendChild(li);
      });
    }
    if (listContainer) listContainer.style.display = 'block';
  } else {
    const listContainer = $('incorrectAnswersList');
    if (listContainer) listContainer.style.display = 'none';
  }

  /*  Persist the quiz result so the Home page can show it  */
  const currentUserName = localStorage.getItem('userName') || 'Guest123';
  qz_addQuizResult({
    name: currentUserName,
    correct: correctAnswers,
    total: totalQuestions,
    totalSeconds: totalTimeMs / 1000,
    wrongs: wrongAnswers
  });
}

/*  Restart  */
function restartQuiz() {
  if (cardTimer) clearInterval(cardTimer);
  if (quizTimer) clearInterval(quizTimer);

  currentPhase = 'learning';
  currentCardIndex = 0;
  currentQuestionIndex = 0;
  score = 0;
  learningCards = [];
  quizQuestions = [];
  currentTime = 0;
  totalStartTime = 0;

  const rs = $('resultsScreen'); const ws = $('welcomeScreen');
  if (rs) rs.style.display = 'none';
  if (ws) ws.style.display = 'block';

  const bar = $('progressBar');
  if (bar) bar.style.width = '0%';
}

/*  Manual card flip in learning phase  */
document.addEventListener('DOMContentLoaded', () => {
  const fc = $('flashcard');
  if (fc) {
    fc.addEventListener('click', () => {
      if (currentPhase === 'learning') fc.classList.toggle('flipped');
    });
  }
});

/* Expose needed functions to window  */
window.startQuiz = startQuiz;
window.confirmSkip = confirmSkip;
window.nextQuestion = nextQuestion;
window.restartQuiz = restartQuiz;

