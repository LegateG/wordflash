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

  // Lock background scroll so the modal stays centered
  document.body.style.overflow = "hidden";

  document.querySelector(".body-container")?.classList.add("hidden");
  document.getElementById("statusText")?.classList.add("hidden");

  // Focus the popup
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

  const greetMessage = (userType === "new")
    ? `Welcome, ${name}! Your quiz will begin shortly.`
    : `Welcome back, ${name}! Your quiz will begin shortly.`;

  alert(greetMessage);
  console.log(greetMessage);



  // accomplishments section
  document.getElementById("accomplishments").innerHTML =
    `📖 Words Learned: 15 <br> 🏆 Quizzes Completed: 3 <br> 📊 Average Score: 75%`;

  updateRecentUsers(name);
  closeModal();
}

// Update recent users list (keep max 5, newest first)
function updateRecentUsers(name) {
  // De-duplicate by case-insensitive match
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


// Close modal function
function closeModal() {
  document.getElementById("nameModal").classList.add("hidden");
  document.body.style.overflow = ""; // restore scrolling
  const nameEl = document.getElementById("userName");
  if (nameEl) nameEl.value = "";
  document.querySelector(".body-container")?.classList.remove("hidden");
  document.getElementById("statusText")?.classList.remove("hidden");
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

// Go Back to home from inside modal
function goBackHome() {
  closeModal();
}




// Footer section
// Set Word of the Day and Suggested Word
document.addEventListener("DOMContentLoaded", () => {
  const mostUsedWord = "hola";
  const suggestions = ["amigo", "learn", "rápido", "study"];
  const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
  document.getElementById("wordOfDay").textContent = mostUsedWord;
  document.getElementById("suggestedWord").textContent = randomSuggestion;
});
