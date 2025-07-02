// Quiz Questions Data
const quizQuestions = [
    {
        type: 'single',
        question: 'What is the capital of France?',
        options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
        correctAnswer: 'Paris',
        explanation: 'Paris is the capital and most populous city of France.'
    },
    {
        type: 'multi',
        question: 'Which of these are programming languages? (Select all that apply)',
        options: ['JavaScript', 'HTML', 'Python', 'CSS', 'Java'],
        correctAnswer: ['JavaScript', 'Python', 'Java'],
        explanation: 'JavaScript, Python, and Java are programming languages. HTML and CSS are markup and style sheet languages, respectively.'
    },
    {
        type: 'fill-in-the-blanks',
        question: 'The largest planet in our solar system is _____.',
        correctAnswer: ['Jupiter'],
        explanation: 'Jupiter is the largest planet in our solar system by mass and volume.'
    },
    {
        type: 'single',
        question: 'Which of the following is a prime number?',
        options: ['4', '6', '7', '9'],
        correctAnswer: '7',
        explanation: 'A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself. 7 is a prime number.'
    },
    {
        type: 'multi',
        question: 'Which of the following are fruits? (Select all that apply)',
        options: ['Carrot', 'Apple', 'Banana', 'Potato', 'Orange'],
        correctAnswer: ['Apple', 'Banana', 'Orange'],
        explanation: 'Apples, bananas, and oranges are fruits. Carrots and potatoes are vegetables.'
    },
    {
        type: 'fill-in-the-blanks',
        question: 'The chemical symbol for water is _____.',
        correctAnswer: ['H2O', 'h2o'],
        explanation: 'The chemical symbol for water is H2O.'
    },
    {
        type: 'single',
        question: 'What is the smallest ocean in the world?',
        options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Southern Ocean'],
        correctAnswer: 'Arctic Ocean',
        explanation: 'The Arctic Ocean is the smallest and shallowest of the world\'s five major oceans.'
    },
    {
        type: 'multi',
        question: 'Which of these animals lay eggs? (Select all that apply)',
        options: ['Chicken', 'Cow', 'Snake', 'Dog', 'Platypus'],
        correctAnswer: ['Chicken', 'Snake', 'Platypus'],
        explanation: 'Chickens, snakes, and platypuses are oviparous (egg-laying) animals. Cows and dogs are viviparous (live-bearing).'
    },
    {
        type: 'fill-in-the-blanks',
        question: 'The process by which plants make their own food is called _____.',
        correctAnswer: ['Photosynthesis', 'photosynthesis'],
        explanation: 'Photosynthesis is the process used by plants, algae, and cyanobacteria to convert light energy into chemical energy.'
    },
    {
        type: 'single',
        question: 'Who painted the Mona Lisa?',
        options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Claude Monet'],
        correctAnswer: 'Leonardo da Vinci',
        explanation: 'The Mona Lisa was painted by the Italian artist Leonardo da Vinci.'
    }
];

// DOM Elements
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const nextButton = document.getElementById('nextButton');
const restartButton = document.getElementById('restartButton');
const progressBar = document.getElementById('progressBar');
const currentQuestionNumberSpan = document.getElementById('currentQuestionNumber');
const totalQuestionsSpan = document.getElementById('totalQuestions');
const timerBar = document.getElementById('timerBar');
const scoreModalOverlay = document.getElementById('scoreModalOverlay');
const finalScoreDisplay = document.getElementById('finalScore');
const modalRestartButton = document.getElementById('modalRestartButton');
const themeToggle = document.getElementById('themeToggle');
const confettiGlow = document.getElementById('confettiGlow');

// Quiz State Variables
let shuffledQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
const TIME_PER_QUESTION = 15; // seconds

// --- Utility Functions ---

/**
 * Shuffles an array in place using the Fisher-Yates (Knuth) algorithm.
 * @param {Array} array The array to shuffle.
 * @returns {Array} The shuffled array.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

/**
 * Creates a feedback message element.
 * @param {string} message The text content of the message.
 * @param {boolean} isCorrect True if the answer is correct, false otherwise.
 * @returns {HTMLElement} The feedback message div.
 */
function createFeedbackMessage(message, isCorrect) {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.classList.add('feedback-message');
    feedbackDiv.classList.add(isCorrect ? 'correct' : 'incorrect');
    feedbackDiv.innerHTML = `<span class="icon">${isCorrect ? '&#10003;' : '&#10007;'}</span> ${message}`;
    setTimeout(() => feedbackDiv.classList.add('show'), 10); // Small delay for transition
    return feedbackDiv;
}

/**
 * Generates a random number within a range.
 * @param {number} min The minimum value (inclusive).
 * @param {number} max The maximum value (inclusive).
 * @returns {number} A random number.
 */
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Creates a glowing confetti particle.
 */
function createConfettiGlow() {
    const span = document.createElement('span');
    const size = getRandomNumber(10, 25);
    span.style.width = `${size}px`;
    span.style.height = `${size}px`;
    span.style.left = `${getRandomNumber(0, 100)}%`;
    span.style.top = `${getRandomNumber(0, 100)}%`;
    span.style.animationDelay = `${Math.random() * 0.5}s`;
    confettiGlow.appendChild(span);

    // Remove after animation
    span.addEventListener('animationend', () => {
        span.remove();
    });
}

// --- Core Quiz Logic ---

/**
 * Initializes the quiz, shuffles questions, and displays the first one.
 */
function initQuiz() {
    shuffledQuestions = shuffleArray([...quizQuestions]); // Create a shallow copy to shuffle
    currentQuestionIndex = 0;
    score = 0;
    totalQuestionsSpan.textContent = shuffledQuestions.length;
    nextButton.textContent = 'Next';
    nextButton.disabled = false;
    restartButton.classList.remove('blinking'); // Remove blinking from restart when quiz starts
    scoreModalOverlay.classList.remove('show');
    displayQuestion();
    updateProgressBar();
}

/**
 * Displays the current question and its options/input field.
 */
function displayQuestion() {
    clearTimeout(timer); // Clear any existing timer
    startTimer(); // Start timer for new question

    const questionData = shuffledQuestions[currentQuestionIndex];
    questionText.textContent = questionData.question;
    optionsContainer.innerHTML = ''; // Clear previous options
    currentQuestionNumberSpan.textContent = currentQuestionIndex + 1;

    // Remove any previous feedback messages
    const existingFeedback = document.querySelector('.feedback-message');
    if (existingFeedback) {
        existingFeedback.remove();
    }

    // Temporarily disable next button until an answer is selected/typed
    if (questionData.type !== 'fill-in-the-blanks') {
        nextButton.disabled = true;
    } else {
        nextButton.disabled = false; // Fill-in-the-blanks can be submitted empty
    }

    // Render options based on question type
    if (questionData.type === 'single' || questionData.type === 'multi') {
        const inputType = questionData.type === 'single' ? 'radio' : 'checkbox';
        const nameAttr = questionData.type === 'single' ? 'quizOption' : `quizOption_${currentQuestionIndex}`; // Unique name for multi-select

        const shuffledOptions = shuffleArray([...questionData.options]); // Shuffle options for each question

        shuffledOptions.forEach((option, index) => {
            const label = document.createElement('label');
            label.classList.add('option-label');
            label.setAttribute('tabindex', '0'); // Make label focusable

            const input = document.createElement('input');
            input.type = inputType;
            input.name = nameAttr;
            input.value = option;
            input.id = `option${index}`;

            const span = document.createElement('span');
            span.textContent = option;

            label.appendChild(input);
            label.appendChild(span);
            optionsContainer.appendChild(label);

            // Enable next button when an option is selected
            input.addEventListener('change', () => {
                nextButton.disabled = false;
            });

            // Keyboard accessibility for options
            label.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    input.checked = !input.checked; // Toggle for checkbox, select for radio
                    if (inputType === 'radio') {
                        // For radio, ensure only one is selected
                        document.querySelectorAll(`input[name="${nameAttr}"]`).forEach(radio => {
                            if (radio !== input) radio.checked = false;
                        });
                    }
                    nextButton.disabled = false; // Enable button on selection
                }
            });
        });
    } else if (questionData.type === 'fill-in-the-blanks') {
        const input = document.createElement('input');
        input.type = 'text';
        input.classList.add('fill-in-the-blanks-input');
        input.placeholder = 'Type your answer here...';
        input.id = 'fillInTheBlanksInput';
        optionsContainer.appendChild(input);

        // Focus on the input field
        input.focus();
    }

    // Update button text for the last question
    if (currentQuestionIndex === shuffledQuestions.length - 1) {
        nextButton.textContent = 'Submit Quiz';
    } else {
        nextButton.textContent = 'Next';
    }
}

/**
 * Starts the countdown timer for the current question.
 */
function startTimer() {
    let timeLeft = TIME_PER_QUESTION;
    timerBar.style.width = '100%';
    timerBar.style.backgroundColor = 'var(--timer-fill)'; // Reset color

    timer = setInterval(() => {
        timeLeft--;
        const percentage = (timeLeft / TIME_PER_QUESTION) * 100;
        timerBar.style.width = `${percentage}%`;

        if (timeLeft <= 5) { // Change color to alert when time is low
            timerBar.style.backgroundColor = 'var(--incorrect-color)';
        }

        if (timeLeft <= 0) {
            clearInterval(timer);
            checkAnswer(true); // Auto-submit with no answer
        }
    }, 1000);
}

/**
 * Checks the user's answer(s) and updates the score.
 * @param {boolean} isTimedOut True if the timer ran out, false otherwise.
 */
function checkAnswer(isTimedOut = false) {
    clearInterval(timer); // Stop the timer

    const questionData = shuffledQuestions[currentQuestionIndex];
    let isCorrect = false;
    let userAnswer = [];

    if (questionData.type === 'single') {
        const selectedOption = document.querySelector('input[name="quizOption"]:checked');
        if (selectedOption) {
            userAnswer.push(selectedOption.value);
            isCorrect = (selectedOption.value === questionData.correctAnswer);
        }
    } else if (questionData.type === 'multi') {
        const selectedOptions = document.querySelectorAll(`input[name="quizOption_${currentQuestionIndex}"]:checked`);
        userAnswer = Array.from(selectedOptions).map(input => input.value);

        // Check if all correct answers are selected and no incorrect ones
        const correctSet = new Set(questionData.correctAnswer);
        const userSet = new Set(userAnswer);

        isCorrect = (userSet.size === correctSet.size &&
                     [...userSet].every(item => correctSet.has(item)));
    } else if (questionData.type === 'fill-in-the-blanks') {
        const inputField = document.getElementById('fillInTheBlanksInput');
        if (inputField) {
            const typedAnswer = inputField.value.trim();
            userAnswer.push(typedAnswer);
            isCorrect = questionData.correctAnswer.some(ans => ans.toLowerCase() === typedAnswer.toLowerCase());
        }
    }

    if (isCorrect && !isTimedOut) {
        score++;
    }

    highlightAnswers(questionData, isCorrect, userAnswer, isTimedOut);

    // Disable all inputs after checking answer
    const inputs = optionsContainer.querySelectorAll('input');
    inputs.forEach(input => input.disabled = true);
    nextButton.disabled = false; // Re-enable next button to proceed
}

/**
 * Highlights correct/incorrect answers and shows feedback.
 * @param {Object} questionData The current question data.
 * @param {boolean} isCorrect True if the user's answer was correct.
 * @param {Array} userAnswer The user's selected/typed answer(s).
 * @param {boolean} isTimedOut True if the timer ran out.
 */
function highlightAnswers(questionData, isCorrect, userAnswer, isTimedOut) {
    let feedbackMessage = '';
    if (isTimedOut) {
        feedbackMessage = 'Time\'s up! ';
    } else if (isCorrect) {
        feedbackMessage = 'Correct! ';
    } else {
        feedbackMessage = 'Incorrect. ';
    }
    feedbackMessage += questionData.explanation;

    // Add feedback message below options
    optionsContainer.appendChild(createFeedbackMessage(feedbackMessage, isCorrect || isTimedOut)); // If timed out, show explanation as if incorrect

    if (questionData.type === 'single' || questionData.type === 'multi') {
        const optionLabels = optionsContainer.querySelectorAll('.option-label');
        optionLabels.forEach(label => {
            const input = label.querySelector('input');
            const optionValue = input.value;

            // Check if this option is part of the correct answer(s)
            const isOptionCorrectAnswer = Array.isArray(questionData.correctAnswer)
                ? questionData.correctAnswer.includes(optionValue)
                : questionData.correctAnswer === optionValue;

            // Check if this option was selected by the user
            const isOptionSelectedByUser = userAnswer.includes(optionValue);

            if (isOptionCorrectAnswer) {
                label.style.backgroundColor = 'rgba(76, 175, 80, 0.3)'; // Green for correct
                label.style.border = '1px solid var(--correct-color)';
            } else if (isOptionSelectedByUser && !isOptionCorrectAnswer) {
                label.style.backgroundColor = 'rgba(244, 67, 54, 0.3)'; // Red for incorrect selection
                label.style.border = '1px solid var(--incorrect-color)';
            }
            // Disable hover effect after answer is checked
            label.style.pointerEvents = 'none';
            label.style.cursor = 'default';
        });
    } else if (questionData.type === 'fill-in-the-blanks') {
        const inputField = document.getElementById('fillInTheBlanksInput');
        if (inputField) {
            inputField.disabled = true; // Disable input after submission
            if (isCorrect) {
                inputField.style.borderColor = 'var(--correct-color)';
                inputField.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.3)';
            } else {
                inputField.style.borderColor = 'var(--incorrect-color)';
                inputField.style.boxShadow = '0 0 0 3px rgba(244, 67, 54, 0.3)';
                // Optionally show the correct answer
                const correctAnswerSpan = document.createElement('span');
                correctAnswerSpan.style.marginTop = '10px';
                correctAnswerSpan.style.fontSize = '0.9em';
                correctAnswerSpan.style.color = 'var(--correct-color)';
                correctAnswerSpan.textContent = `Correct Answer: ${questionData.correctAnswer[0]}`; // Show first correct answer
                optionsContainer.appendChild(correctAnswerSpan);
            }
        }
    }
}

/**
 * Updates the progress bar at the top.
 */
function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

/**
 * Displays the final score modal.
 */
function showScore() {
    finalScoreDisplay.textContent = `${score} / ${shuffledQuestions.length}`;
    scoreModalOverlay.classList.add('show');
    // Trigger confetti/glow effect
    for (let i = 0; i < 30; i++) {
        createConfettiGlow();
    }
}

// --- Event Listeners ---

nextButton.addEventListener('click', () => {
    // If it's the last question, check answer and show score
    if (currentQuestionIndex === shuffledQuestions.length - 1) {
        checkAnswer();
        setTimeout(showScore, 800); // Small delay for visual feedback
    } else {
        // Check answer for current question before moving to next
        checkAnswer();
        setTimeout(() => {
            currentQuestionIndex++;
            displayQuestion();
            updateProgressBar();
        }, 800); // Small delay for visual feedback
    }
});

restartButton.addEventListener('click', initQuiz);
modalRestartButton.addEventListener('click', initQuiz);

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
});

// Initial call to set up the quiz
initQuiz();

// Add initial blinking effect to restart button
restartButton.classList.add('blinking');
