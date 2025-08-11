let userType = "";
let recentUsers = [];

// Show popup and hide homepage elements 
function selectUser(type) {
  userType = type;

  const prompt = (type === "new")
    ? "Welcome, Learner!"
    : "Welcome back, Learner!";
  document.getElementById("promptText").textContent = prompt;

  const modal = document.getElementById("nameModal");
  modal.classList.remove("hidden");

  // Lock background scroll
  document.body.style.overflow = "hidden";

  // Hide elements but keep space 
  document.querySelector(".body-container")?.classList.add("hide-keep-space");
  document.getElementById("statusText")?.classList.add("hide-keep-space");

  // Focus input
  document.getElementById("userName").focus();
}

// For name submission
function submitName() {
  const nameEl = document.getElementById("userName");
  const name = nameEl.value.trim();

  if (!name) {
    alert("Please enter your name.");
    nameEl.focus();
    return;
  }

  // Store in localStorage
  localStorage.setItem('userName', name);

  // Redirect to quiz page
  const inSubpage = window.location.pathname.includes("/assets/subpages/");
  const target = inSubpage ? "quiz/quiz.html" : "assets/subpages/quiz/quiz.html";
  window.location.href = target;

  // Update accomplishments
  document.getElementById("accomplishments").innerHTML =
    `📖 Words Learned: 15 <br> 🏆 Quizzes Completed: 3 <br> 📊 Average Score: 75%`;

  updateRecentUsers(name);
  closeModal();
}

// Update recent users list (max 5, newest first)
function updateRecentUsers(name) {
  recentUsers = [name, ...recentUsers.filter(u => u.toLowerCase() !== name.toLowerCase())];
  if (recentUsers.length > 5) recentUsers = recentUsers.slice(0, 5);

  const userList = document.getElementById("userList");
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
  document.body.style.overflow = ""; // Restore scrolling

  // Show elements again
  document.querySelector(".body-container")?.classList.remove("hide-keep-space");
  document.getElementById("statusText")?.classList.remove("hide-keep-space");

  const nameEl = document.getElementById("userName");
  if (nameEl) nameEl.value = "";
}

// Click outside modal closes it
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

// Go Back button
function goBackHome() {
  closeModal();
}

// Footer Ramdom words section
document.addEventListener("DOMContentLoaded", () => {
  const mostUsedWord = "hola";
  const suggestions = ["amigo", "learn", "rápido", "study"];
  const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
  document.getElementById("wordOfDay").textContent = mostUsedWord;
  document.getElementById("suggestedWord").textContent = randomSuggestion;
});
