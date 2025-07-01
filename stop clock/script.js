// Get DOM elements
const hoursDisplay = document.getElementById('hours');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const millisecondsDisplay = document.getElementById('milliseconds');

const startPauseBtn = document.getElementById('startPauseBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const clearLapsBtn = document.getElementById('clearLapsBtn');
const lapList = document.getElementById('lapList');
const themeToggleBtn = document.getElementById('theme-toggle');

// Stopwatch state variables
let startTime = 0;
let elapsedTime = 0;
let timerInterval;
let isRunning = false;
let lapCounter = 0;
let laps = []; // Array to store lap times

// --- Helper Functions --- 

/**
 * Formats a given number of milliseconds into HH:MM:SS.ms format.
 * @param {number} ms - The total milliseconds.
 * @returns {string} Formatted time string.
 */
function formatTime(ms) {
    // Calculate hours, minutes, seconds, and milliseconds 
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000)); // Keep full milliseconds for internal use

    // Pad with leading zeros if necessary 
    const pad = (num, length = 2) => num.toString().padStart(length, '0');

    return {
        hours: pad(hours),
        minutes: pad(minutes),
        seconds: pad(seconds),
        milliseconds: pad(milliseconds, 3) // Milliseconds needs 3 digits 
    };
}

/**
 * Updates the stopwatch display with the current elapsed time.
 */
function updateDisplay() {
    const currentTime = isRunning ? Date.now() - startTime + elapsedTime : elapsedTime;
    const formatted = formatTime(currentTime);

    hoursDisplay.textContent = formatted.hours;
    minutesDisplay.textContent = formatted.minutes;
    secondsDisplay.textContent = formatted.seconds;
    millisecondsDisplay.textContent = formatted.milliseconds;
}

/**
 * Plays a subtle beep sound.
 */
function playBeep() {
    // Check if AudioContext is available 
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
        const audioContext = new (AudioContext || webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine'; // Sine wave for a clean beep 
        oscillator.frequency.value = 440; // A4 note 
        gainNode.gain.value = 0.1; // Volume 

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1); // Beep for 0.1 seconds 
    } else {
        console.warn('Web Audio API not supported in this browser.');
    }
}

// --- Core Stopwatch Functions --- 

/**
 * Starts or resumes the stopwatch.
 */
function startTimer() {
    if (!isRunning) {
        startTime = Date.now(); // Record the current time 
        timerInterval = setInterval(updateDisplay, 10); // Update every 10 milliseconds 
        isRunning = true;
        startPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        startPauseBtn.classList.add('paused');
        lapBtn.disabled = false;
        resetBtn.disabled = false;
        saveState(); // Save state to localStorage 
    }
}

/**
 * Pauses the stopwatch.
 */
function pauseTimer() {
    if (isRunning) {
        clearInterval(timerInterval); // Stop the interval 
        elapsedTime += Date.now() - startTime; // Add elapsed time since start 
        isRunning = false;
        startPauseBtn.innerHTML = '<i class="fas fa-play"></i> Start';
        startPauseBtn.classList.remove('paused');
        saveState(); // Save state to localStorage 
    }
}

/**
 * Resets the stopwatch to zero and clears all laps.
 */
function resetTimer() {
    clearInterval(timerInterval);
    startTime = 0;
    elapsedTime = 0;
    isRunning = false;
    lapCounter = 0;
    laps = [];
    updateDisplay(); // Update display to 00:00:00.000 
    renderLaps(); // Clear lap list display 
    startPauseBtn.innerHTML = '<i class="fas fa-play"></i> Start';
    startPauseBtn.classList.remove('paused');
    lapBtn.disabled = true;
    resetBtn.disabled = true;
    clearLapsBtn.disabled = true;
    localStorage.removeItem('stopwatchState'); // Clear state from localStorage 
    localStorage.removeItem('lapTimes'); // Clear lap times from localStorage 
}

/**
 * Records a lap time.
 */
function recordLap() {
    if (isRunning) {
        playBeep(); // Play beep sound for lap 
        lapCounter++;
        const currentTotalTime = Date.now() - startTime + elapsedTime;
        const previousTotalTime = laps.length > 0 ? laps[laps.length - 1].totalTime : 0;
        const lapDuration = currentTotalTime - previousTotalTime;

        laps.push({
            number: lapCounter,
            totalTime: currentTotalTime,
            duration: lapDuration
        });
        renderLaps(); // Re-render the lap list 
        clearLapsBtn.disabled = false;
        saveState(); // Save state to localStorage 
    }
}

/**
 * Clears all recorded lap times.
 */
function clearLaps() {
    laps = [];
    lapCounter = 0;
    renderLaps(); // Clear lap list display 
    clearLapsBtn.disabled = true;
    saveState(); // Save state to localStorage 
}

/**
 * Renders the lap times in the lap list.
 */
function renderLaps() {
    lapList.innerHTML = ''; // Clear existing laps 
    if (laps.length === 0) {
        lapList.innerHTML = '<li class="lap-item" style="justify-content: center; color: var(--text-color); opacity: 0.7;">No laps recorded yet.</li>';
        return;
    }

    // Iterate in reverse to show latest lap at the top 
    for (let i = laps.length - 1; i >= 0; i--) {
        const lap = laps[i];
        const lapItem = document.createElement('li');
        lapItem.classList.add('lap-item');

        const formattedTotalTime = formatTime(lap.totalTime);
        const formattedLapDuration = formatTime(lap.duration);

        lapItem.innerHTML = `
            <span class="lap-number">Lap ${lap.number}</span>
            <span class="lap-time">
                Total: ${formattedTotalTime.hours}:${formattedTotalTime.minutes}:${formattedTotalTime.seconds}.${formattedTotalTime.milliseconds}
                <br>
                Duration: ${formattedLapDuration.hours}:${formattedLapDuration.minutes}:${formattedLapDuration.seconds}.${formattedLapDuration.milliseconds}
            </span>
        `;
        lapList.appendChild(lapItem);
    }
}

// --- Theme Toggle --- 

/**
 * Toggles between dark and light themes.
 */
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeToggleBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', isDark ? 'dark' : 'light'); // Save theme preference 
}

/**
 * Loads the saved theme preference from localStorage.
 */
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// --- Persistence (localStorage) --- 

/**
 * Saves the current stopwatch state and lap times to localStorage.
 */
function saveState() {
    const state = {
        elapsedTime: elapsedTime,
        isRunning: isRunning,
        lapCounter: lapCounter,
        laps: laps,
        // If running, store the time when it started to resume correctly 
        startTimeOffset: isRunning ? Date.now() - startTime : 0
    };
    localStorage.setItem('stopwatchState', JSON.stringify(state));
}

/**
 * Loads the stopwatch state and lap times from localStorage.
 */
function loadState() {
    const savedState = localStorage.getItem('stopwatchState');
    if (savedState) {
        const state = JSON.parse(savedState);
        elapsedTime = state.elapsedTime;
        isRunning = state.isRunning;
        lapCounter = state.lapCounter;
        laps = state.laps || []; // Ensure laps is an array 

        if (isRunning) {
            // Recalculate startTime based on saved offset 
            startTime = Date.now() - state.startTimeOffset;
            startTimer(); // Resume the timer 
        } else {
            updateDisplay(); // Just update display if paused 
        }

        renderLaps(); // Render loaded laps 
        if (laps.length > 0) {
            clearLapsBtn.disabled = false;
        }
        if (elapsedTime > 0 || isRunning) {
            resetBtn.disabled = false;
        }
    }
}

// --- Event Listeners --- 

// Start/Pause button click 
startPauseBtn.addEventListener('click', () => {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
});

// Lap button click 
lapBtn.addEventListener('click', recordLap);

// Reset button click 
resetBtn.addEventListener('click', resetTimer);

// Clear Laps button click 
clearLapsBtn.addEventListener('click', clearLaps);

// Theme toggle button click 
themeToggleBtn.addEventListener('click', toggleTheme);

// Keyboard shortcuts 
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'Space':
            event.preventDefault(); // Prevent scrolling 
            if (isRunning) {
                pauseTimer();
            } else {
                startTimer();
            }
            break;
        case 'KeyL':
            if (isRunning && !lapBtn.disabled) {
                recordLap();
            }
            break;
        case 'KeyR':
            if (!resetBtn.disabled) {
                resetTimer();
            }
            break;
    }
});

// --- Initialization --- 

// Load theme and stopwatch state when the page loads 
window.onload = () => {
    loadTheme();
    loadState();
    // Initial display update to show 00:00:00.000 if no state loaded 
    if (elapsedTime === 0 && !isRunning) {
        updateDisplay();
    }
};