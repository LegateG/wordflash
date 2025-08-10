// Global variables
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
let quizTimePerQuestion = 30; // 30 seconds per question

// Load dictionary on page load
window.addEventListener('DOMContentLoaded', function() {
    loadDictionary();
});

async function loadDictionary() {
    try {
        const response = await fetch('spanish-dictionary.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        dictionary = await response.json();
        
        if (!dictionary || !dictionary.words || dictionary.words.length === 0) {
            throw new Error('Invalid dictionary format or empty dictionary');
        }
        
        // Dictionary loaded successfully
        isLoaded = true;
        document.getElementById('loadingText').style.display = 'none';
        document.getElementById('startText').style.display = 'inline';
        document.getElementById('startButton').disabled = false;
        
    } catch (error) {
        console.error('Error loading dictionary:', error);
        showError('Failed to load dictionary. Please make sure spanish-dictionary.json is in the same folder.');
    }
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    document.getElementById('loadingText').textContent = 'Error Loading';
    document.getElementById('startButton').disabled = true;
}

function startQuiz() {
    if (!isLoaded) {
        showError('Dictionary is still loading. Please wait...');
        return;
    }
    
    // Hide welcome screen and show quiz container
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';
    
    // Select 20 random words for learning phase
    learningCards = getRandomWords(20);
    
    // Initialize learning phase
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
    document.getElementById('learningPhase').style.display = 'block';
    document.getElementById('quizPhase').style.display = 'none';
    document.getElementById('timerDisplay').style.display = 'block';
    const skipBtn = document.getElementById('skipBtn');
    if (skipBtn) skipBtn.style.display = 'block';
    document.getElementById('phaseTitle').textContent = 'Learning Phase';
    document.getElementById('phaseSubtitle').textContent = 'Cards will auto-flip after 3-5 seconds';
    
    showLearningCard();
}

function showLearningCard() {
    if (currentCardIndex >= learningCards.length) {
        startQuizPhase();
        return;
    }

    const card = learningCards[currentCardIndex];
    const flashcard = document.getElementById('flashcard');
    
    // Reset flip state
    flashcard.classList.remove('flipped');
    
    // Update card content
    document.getElementById('spanishWord').textContent = card.spanish;
    document.getElementById('englishWord').textContent = card.english;
    
    // Update progress
    document.getElementById('currentCard').textContent = currentCardIndex + 1;
    updateProgressBar();
    
    // Start timer for auto-flip
    startCardTimer();
}

function startCardTimer() {
    const randomTime = Math.floor(Math.random() * 3) + 3; // 3-5 seconds
    currentTime = randomTime;
    
    const timerElement = document.getElementById('timer');
    const timerLabel = document.getElementById('timerLabel');
    
    timerElement.textContent = currentTime;
    timerElement.classList.remove('warning');
    timerLabel.textContent = 'seconds remaining';
    
    cardTimer = setInterval(() => {
        currentTime--;
        timerElement.textContent = currentTime;
        
        if (currentTime <= 2) {
            timerElement.classList.add('warning');
        }
        
        if (currentTime === Math.floor(randomTime / 2)) {
            // Auto-flip at halfway point
            document.getElementById('flashcard').classList.add('flipped');
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
    const confirmed = confirm("Are you sure you want to skip the remaining cards and go straight to the quiz?");
    if (confirmed) {
        clearInterval(cardTimer);
        startQuizPhase();
    }
}

function updateProgressBar() {
    const totalCards = currentPhase === 'learning' ? learningCards.length : quizQuestions.length;
    const currentIndex = currentPhase === 'learning' ? currentCardIndex : currentQuestionIndex;
    const progress = (currentIndex / totalCards) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

function startQuizPhase() {
    clearInterval(cardTimer);
    currentPhase = 'quiz';
    currentQuestionIndex = 0;
    score = 0;
    
    // Hide learning phase and show quiz phase
    document.getElementById('learningPhase').style.display = 'none';
    document.getElementById('quizPhase').style.display = 'block';
    document.getElementById('scoreStat').style.display = 'block';
    document.getElementById('timerDisplay').style.display = 'block';
    
    // Update header
    document.getElementById('phaseTitle').textContent = 'Quiz Phase';
    document.getElementById('phaseSubtitle').textContent = 'Choose the correct translation';
    document.getElementById('totalCards').textContent = learningCards.length;
    
    // Use the same words from learning phase for quiz
    quizQuestions = [...learningCards];
    
    showQuizQuestion();
}

function showQuizQuestion() {
    if (currentQuestionIndex >= quizQuestions.length) {
        showResults();
        return;
    }

    const question = quizQuestions[currentQuestionIndex];
    
    // Update question
    document.getElementById('quizWord').textContent = question.spanish;
    document.getElementById('currentCard').textContent = currentQuestionIndex + 1;
    document.getElementById('currentScore').textContent = score;
    updateProgressBar();
    
    // Start quiz timer for this question
    startQuizTimer();
    
    // Generate options (1 correct + 3 incorrect)
    const options = generateOptions(question);
    const optionElements = document.querySelectorAll('.option');
    
    optionElements.forEach((option, index) => {
        option.textContent = options[index].text;
        option.className = 'option'; // Reset classes
        option.onclick = () => selectOption(option, index);
        option.setAttribute('data-correct', options[index].correct);
    });
    
    // Hide next button
    document.getElementById('nextBtn').classList.remove('show');
}

function startQuizTimer() {
    currentTime = quizTimePerQuestion;
    
    const timerElement = document.getElementById('timer');
    const timerLabel = document.getElementById('timerLabel');
    
    timerElement.textContent = currentTime;
    timerElement.classList.remove('warning');
    timerLabel.textContent = 'seconds to answer';
    
    quizTimer = setInterval(() => {
        currentTime--;
        timerElement.textContent = currentTime;
        
        if (currentTime <= 10) {
            timerElement.classList.add('warning');
        }
        
        if (currentTime <= 0) {
            clearInterval(quizTimer);
            // Auto-move to next question if time runs out
            const options = document.querySelectorAll('.option');
            options.forEach(opt => opt.onclick = null);
            
            // Show correct answer
            options.forEach(opt => {
                if (opt.getAttribute('data-correct') === 'true') {
                    opt.classList.add('correct');
                }
            });
            
            setTimeout(() => {
                document.getElementById('nextBtn').classList.add('show');
            }, 1000);
        }
    }, 1000);
}

function generateOptions(correctWord) {
    // Get 3 random incorrect answers from the full dictionary
    const incorrect = dictionary.words
        .filter(word => word.english !== correctWord.english)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
    
    // Create options array with correct answer and 3 incorrect ones
    const options = [
        { text: correctWord.english, correct: true },
        { text: incorrect[0].english, correct: false },
        { text: incorrect[1].english, correct: false },
        { text: incorrect[2].english, correct: false }
    ];
    
    // Shuffle the options so correct answer isn't always in the same position
    return options.sort(() => 0.5 - Math.random());
}

function selectOption(element, index) {
    // Stop the quiz timer
    clearInterval(quizTimer);
    
    const options = document.querySelectorAll('.option');
    
    // Disable all options to prevent multiple clicks
    options.forEach(opt => opt.onclick = null);
    
    // Check if selected answer is correct
    const isCorrect = element.getAttribute('data-correct') === 'true';
    
    if (isCorrect) {
        element.classList.add('correct');
        score++;
        document.getElementById('currentScore').textContent = score;
    } else {
        element.classList.add('incorrect');
        // Highlight the correct answer
        options.forEach(opt => {
            if (opt.getAttribute('data-correct') === 'true') {
                opt.classList.add('correct');
            }
        });
    }
    
    // Show next button after a short delay
    setTimeout(() => {
        document.getElementById('nextBtn').classList.add('show');
    }, 1000);
}

function nextQuestion() {
    currentQuestionIndex++;
    showQuizQuestion();
}

function showResults() {
    // Clear any running timers
    clearInterval(cardTimer);
    clearInterval(quizTimer);
    
    currentPhase = 'results';
    
    // Hide quiz phase and show results
    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('resultsScreen').style.display = 'block';
    
    // Calculate and display results
    const totalQuestions = quizQuestions.length;
    const correctAnswers = score;
    const incorrectAnswers = totalQuestions - score;
    const percentage = Math.round((score / totalQuestions) * 100);
    
    // Calculate total time
    const totalTimeMs = Date.now() - totalStartTime;
    const minutes = Math.floor(totalTimeMs / 60000);
    const seconds = Math.floor((totalTimeMs % 60000) / 1000);
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Update results display with calculated values
    document.getElementById('finalScore').textContent = percentage + '%';
    document.getElementById('correctAnswers').textContent = correctAnswers;
    document.getElementById('incorrectAnswers').textContent = incorrectAnswers;
    document.getElementById('totalTime').textContent = timeString;
}

function restartQuiz() {
    // Clear any running timers
    if (cardTimer) {
        clearInterval(cardTimer);
    }
    if (quizTimer) {
        clearInterval(quizTimer);
    }
    
    // Reset all variables
    currentPhase = 'learning';
    currentCardIndex = 0;
    currentQuestionIndex = 0;
    score = 0;
    learningCards = [];
    quizQuestions = [];
    currentTime = 0;
    totalStartTime = 0;
    
    // Hide results and show welcome
    document.getElementById('resultsScreen').style.display = 'none';
    document.getElementById('welcomeScreen').style.display = 'block';
    
    // Reset progress bar
    document.getElementById('progressBar').style.width = '0%';
}

// Manual card flipping during learning phase (optional)
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('flashcard').addEventListener('click', () => {
        if (currentPhase === 'learning') {
            const flashcard = document.getElementById('flashcard');
            flashcard.classList.toggle('flipped');
        }
    });
});

