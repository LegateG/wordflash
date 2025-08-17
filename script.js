let userType = ""; // no longer used
let recentUsers = [];

// Open modal
function selectUser() {
  document.getElementById("promptText").textContent = "Enter name to begin";
  const modal = document.getElementById("nameModal");
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  document.querySelector(".body-container")?.classList.add("hide-keep-space");
  document.querySelectorAll(".status-text")?.forEach(el => el.classList.add("hide-keep-space"));

  const input = document.getElementById("userName");
  if (input) {
    input.placeholder = "e.g., John1234";
    input.value = "";
    setTimeout(() => input.focus(), 0);

    // NEW: allow Enter to submit
    const onKey = (e) => { if (e.key === "Enter") submitName(); };
    input.removeEventListener("keydown", onKey); // avoid duplicates
    input.addEventListener("keydown", onKey);
  }
}

// Require letters + numbers, alphanumeric only, 3–20 chars
function isValidUsername(name) {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,20}$/.test(name);
}

// detect new vs returning
function submitName() {
  const nameEl = document.getElementById("userName");
  const nameRaw = (nameEl?.value || "").trim();

  if (!nameRaw) {
    alert("Enter name to begin.");
    nameEl?.focus();
    return;
  }
  if (!isValidUsername(nameRaw)) {
    alert("Use letters and numbers only (3–20 chars), e.g., Mike1234.");
    nameEl?.focus();
    return;
  }

  // Normalize key; keep original-casing for greetings
  const key = normalizeKey(nameRaw);

  const existingUserData = getUserData(key);
  let userData;

  if (existingUserData) {
    // returning user
    userData = { ...existingUserData, lastPlayed: new Date().toISOString() };
    alert(`Welcome back, ${nameRaw}!`);
  } else {
    // new user
    userData = initializeNewUser(nameRaw);
    alert(`Welcome to WordFlash, ${nameRaw}!`);
  }

  saveUserData(key, userData);
  localStorage.setItem("userName", nameRaw); // cased name for UI
  updateRecentUsers(nameRaw);
  renderUserAccomplishments(); // Update dashboard before redirect
  closeModal();

  // Redirect to quiz
  const inSubpage = window.location.pathname.includes("/assets/subpages/");
  const target = inSubpage ? "quiz/quiz.html" : "assets/subpages/quiz/quiz.html";
  window.location.href = target;
}

// Update recent users list
function updateRecentUsers(name) {
  recentUsers = [name, ...recentUsers.filter(u => u.toLowerCase() !== name.toLowerCase())];
  if (recentUsers.length > 5) recentUsers = recentUsers.slice(0, 5);
  const userList = document.getElementById("userList");
  if (!userList) return;
  userList.innerHTML = "";
  recentUsers.forEach(user => {
    const li = document.createElement("li");
    li.textContent = user;
    userList.appendChild(li);
  });
}

// Close modal
function closeModal() {
  document.getElementById("nameModal").classList.add("hidden");
  document.body.style.overflow = "";
  document.querySelector(".body-container")?.classList.remove("hide-keep-space");
  document.querySelectorAll(".status-text")?.forEach(el => el.classList.remove("hide-keep-space"));
  const nameEl = document.getElementById("userName");
  if (nameEl) nameEl.value = "";
}

// Go Back button
function goBackHome() {
  closeModal();
}

// Storage  
function normalizeKey(name) { return name.toLowerCase(); }

function getUserData(userKeyOrName) {
  const key = normalizeKey(userKeyOrName);
  const all = JSON.parse(localStorage.getItem('wordflash_users') || '{}');
  return all[key] || null;
}

function saveUserData(userKeyOrName, data) {
  const key = normalizeKey(userKeyOrName);
  const all = JSON.parse(localStorage.getItem('wordflash_users') || '{}');
  all[key] = data;
  localStorage.setItem('wordflash_users', JSON.stringify(all));
}

function initializeNewUser(displayName) {
  const newUserData = {
    displayName,      // original-casing for UI
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
  return newUserData;
}

// Footer section
document.addEventListener("DOMContentLoaded", () => {
  const mostUsedWord = "hola";
  const suggestions = ["amigo", "learn", "rápido", "study"];
  const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
  document.getElementById("wordOfDay").textContent = mostUsedWord;
  document.getElementById("suggestedWord").textContent = randomSuggestion;

  // Show stats section if user has data
  const userName = localStorage.getItem('userName');
  if (userName && getUserData(userName)) {
    renderUserAccomplishments();
  }
});

// Click outside modal to closes it
window.addEventListener("click", e => {
  const modal = document.getElementById("nameModal");
  if (e.target === modal) closeModal();
});

// Esc key closes modal
window.addEventListener("keydown", e => {
  if (e.key === "Escape" && !document.getElementById("nameModal").classList.contains("hidden")) {
    closeModal();
  }
});

// User Accomplishments
function findMostRecentUserName() {
  const all = JSON.parse(localStorage.getItem('wordflash_users') || '{}');
  const names = Object.keys(all);
  if (!names.length) return null;
  names.sort((a, b) => {
    const da = Date.parse(all[a]?.lastPlayed || all[a]?.createdAt || 0);
    const db = Date.parse(all[b]?.lastPlayed || all[b]?.createdAt || 0);
    return db - da;
  });
  // return display name 
  const key = names[0];
  return all[key]?.displayName || key;
}

function computeStatsFromUser(user) {
  const quizzes = user.totalQuizzes || 0;
  const totalQ = user.totalQuestions || 0;
  const totalC = user.totalCorrect || 0;

  const avg = totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0;
  const words = user.wordsLearned ?? Math.min(400, (user.totalCorrect || 0) + (user.wrongAnswers?.length || 0));

  let recent = user.recentScores;
  if (!Array.isArray(recent) || !recent.length) {
    recent = Array.from({ length: 7 }, () => Math.max(0, Math.min(100, Math.round(avg + (Math.random() * 16 - 8)))));
  }
  return { quizzes, avg, words, recent };
}

function generateDemoUser() {
  const name = "Guest123";
  const avg = Math.floor(60 + Math.random() * 30);
  const quizzes = Math.floor(3 + Math.random() * 6);
  const totalQ = quizzes * 20;
  const totalC = Math.round(totalQ * (avg / 100));
  const recentScores = Array.from({ length: 7 }, () => Math.max(40, Math.min(100, Math.round(avg + (Math.random() * 20 - 10)))));
  return {
    displayName: name,
    totalQuizzes: quizzes,
    totalCorrect: totalC,
    totalQuestions: totalQ,
    quizTimes: [],
    wrongAnswers: [],
    recentScores,
    wordsLearned: Math.round(50 + Math.random() * 150),
    createdAt: new Date().toISOString(),
    lastPlayed: new Date().toISOString()
  };
}

function renderUserAccomplishments() {
  const card = document.getElementById('uaCard');
  if (!card) return;

  // Use current userName from localStorage
  let displayName = localStorage.getItem('userName');
  let data = displayName ? getUserData(displayName) : null;

  if (!data) {
    const mostRecentDisplay = findMostRecentUserName();
    if (mostRecentDisplay) {
      displayName = mostRecentDisplay;
      data = getUserData(mostRecentDisplay);
    }
  }

  let isDemo = false;
  if (!data) {
    data = generateDemoUser();
    displayName = data.displayName;
    isDemo = true;
  }

  const stats = computeStatsFromUser(data);

  document.getElementById('uaTitle').textContent =
    isDemo ? "Demo Accomplishments" : `${displayName}'s Accomplishments`;
  document.getElementById('uaSub').textContent = isDemo
    ? "No saved data yet"
    : `Last played: ${new Date(data.lastPlayed || data.createdAt).toLocaleString()}`;

  document.getElementById('uaWords').textContent = stats.words.toLocaleString();
  document.getElementById('uaQuizzes').textContent = stats.quizzes.toLocaleString();
  document.getElementById('uaAvg').textContent = `${stats.avg}%`;
  document.getElementById('uaDonut').style.setProperty('--p', stats.avg / 100);

  document.getElementById('uaWordsDelta').textContent = `+${Math.floor(stats.words * 0.02)} this week`;
  document.getElementById('uaQuizzesDelta').textContent = `+${Math.max(0, Math.min(3, Math.round(stats.quizzes * 0.3)))}`;

  const bars = document.getElementById('uaBars');
  if (bars) {
    bars.innerHTML = '';
    stats.recent.slice(-7).forEach((score) => {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.height = `${Math.max(6, score)}%`; // Adjusted to percentage
      bars.appendChild(bar);
    });
  }

  document.getElementById('uaFoot').textContent = isDemo
    ? "Showing demo data. Complete a quiz to save your stats."
    : `Total Questions: ${(data.totalQuestions || 0).toLocaleString()} • Correct: ${(data.totalCorrect || 0).toLocaleString()}`;
}

document.addEventListener('DOMContentLoaded', renderUserAccomplishments);