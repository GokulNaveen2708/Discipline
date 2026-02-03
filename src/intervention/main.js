// main.js - The Brain of the Intervention UI

// 1. Elements
const stageReflection = document.getElementById('stage-reflection');
const stageChallenge = document.getElementById('stage-challenge');
const stageBoredom = document.getElementById('stage-boredom');
const inputPhrase = document.getElementById('input-phrase');
const targetPhraseEl = document.getElementById('target-phrase');
const errorMsg = document.getElementById('error-msg');
const btnClose = document.getElementById('btn-close');
const btnProceed = document.getElementById('btn-proceed');

// 2. State
let targetUrl = '';
let unlockDuration = 10 * 60 * 1000; // 10 minutes
let frictionMode = 'normal'; // 'normal' | 'depletion'
let boredomSeconds = 30;
let timerInterval = null;

// Initialize
async function init() {
    const params = new URLSearchParams(window.location.search);
    targetUrl = params.get('target');

    // Load Settings
    const storage = await mockableStorageGet(['frictionMode', 'visitCounts', 'unlockDurationMinutes']);
    frictionMode = storage.frictionMode || 'normal';

    // Set dynamic duration
    const minutes = storage.unlockDurationMinutes || 10;
    unlockDuration = minutes * 60 * 1000;


    // -- USAGE TRACKING DISPLAY --
    const counts = storage.visitCounts || {};
    let count = 0;

    // Fuzzy Lookup: Find ANY key in counts that matches the current URL
    // This solves the 'www' vs 'non-www' vs 'subdomain' mismatch forever.
    const cleanKeys = Object.keys(counts);
    for (const key of cleanKeys) {
        if (targetUrl.includes(key)) {
            count = counts[key];
            console.log(`Matched usage count for ${key}: ${count}`);
            break;
        }
    }
    const countEl = document.getElementById('usage-count');
    if (countEl) countEl.innerText = count;

    setupListeners();
}

// 1. Elements
const confirmationModal = document.getElementById('confirmation-modal');
const btnConfirmYes = document.getElementById('btn-confirm-yes');
const btnConfirmNo = document.getElementById('btn-confirm-no');

function setupListeners() {
    btnClose.addEventListener('click', () => {
        window.close();
    });

    btnProceed.addEventListener('click', () => {
        // DECISION TREE
        if (frictionMode === 'depletion') {
            startBoredomProtocol();
        } else {
            showStage(stageChallenge); // Normal mode
            setTimeout(() => inputPhrase.focus(), 100);
        }
    });

    inputPhrase.addEventListener('input', (e) => {
        checkInput(e.target.value);
    });

    // -- MODAL LISTENERS --
    btnConfirmYes.addEventListener('click', () => {
        grantAccess();
    });

    btnConfirmNo.addEventListener('click', () => {
        window.close();
    });
}

function checkInput(text) {
    const requiredPhrase = targetPhraseEl.innerText;

    if (text === requiredPhrase) {
        inputPhrase.style.borderColor = '#4CAF50';
        inputPhrase.disabled = true;

        // Show the Conscious Confirmation Modal instead of immediate grant
        confirmationModal.classList.remove('hidden');
    } else {
        inputPhrase.style.borderColor = '#333';
    }
}

function startBoredomProtocol() {
    showStage(stageBoredom);
    const timerEl = document.getElementById('boredom-timer');
    let timeLeft = boredomSeconds;

    timerEl.innerText = timeLeft;

    // Prevent cheating: reset if visibility changes (user switches tabs)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            timeLeft = boredomSeconds; // Reset!
            timerEl.innerText = timeLeft;
            timerEl.style.color = 'red';
            setTimeout(() => timerEl.style.color = '#444', 500);
        }
    });

    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            // After boredom, we STILL require the typing (Double Friction)
            // Or we can just unlock. Let's make them type to wake up their brain.
            showStage(stageChallenge);
            setTimeout(() => inputPhrase.focus(), 100);
        }
    }, 1000);
}

function showStage(stageElement) {
    document.querySelectorAll('.stage').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.stage').forEach(el => el.classList.remove('active'));

    stageElement.classList.remove('hidden');
    stageElement.classList.add('active');
}



async function grantAccess() {
    const now = Date.now();
    const expiry = now + unlockDuration;

    await mockableStorageSet({ unlockExpireTime: expiry });

    if (targetUrl) {
        window.location.href = targetUrl;
    } else {
        window.location.href = "https://google.com";
    }
}

// --- Dev Mode Helpers ---
async function mockableStorageGet(keys) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return chrome.storage.local.get(keys);
    } else {
        console.log("DEV: Mocking storage.get");
        return { frictionMode: 'depletion' }; // Default to depletion for testing
    }
}

// --- Dev Mode Helpers ---
async function mockableStorageSet(data) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return chrome.storage.local.set(data);
    } else {
        console.log("DEV MODE: Mocking chrome.storage.local.set", data);
        return Promise.resolve();
    }
}

// Override close for dev testing if needed
if (typeof chrome === 'undefined' || !chrome.runtime) {
    // Mock visual feedback for close
    btnClose.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        alert("DEV MODE: Tab would close now.");
    });
}

// Run the script
init();

// --- Zooming Quotes Animation ---
const QUOTES = [
    // Motivational
    "Focus", "Is this urgent?", "Create, don't consume", "Breathe",
    "Time is currency", "Do the hard work", "Stay conscious", "You are in control",
    "Why are you here?", "Discipline equals freedom", "Scroll less, live more",
    "Deep work", "Be present", "Don't be a zombie", "What is your goal?", "Legacy over likes",

    // Aggressive / "Mean"
    "You are wasting your life", "Stop being average", "Nobody cares about your excuses",
    "Get back to work", "This is why you fail", "Comfort is a trap", "Do you want to be a loser?",
    "Tick tock, time is running out", "Mediocrity loves company", "Stop seeking validation",
    "Your competition is working", "Sleep when you're dead", "Pain is temporary",
    "Don't be pathetic", "Stop whining", "Execution over excuses", "Hungry dogs run faster",
    "Be a warrior, not a worrier", "Suffer the pain of discipline", "Or suffer the pain of regret",
    "You are capable of more", "Don't disappoint your future self", "Quit slackin'",
    "Focus or fail", "Cheap dopamine is killing you", "Be better"
];

function initFallingQuotes() {
    // Spawn frequently
    setInterval(spawnQuote, 2000);
    spawnQuote();
}

function spawnQuote() {
    const text = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    const el = document.createElement('div');
    el.classList.add('falling-text');
    el.innerText = text;

    // Randomize 2D position (since we are zooming from back)
    const left = Math.random() * 90; // 0-90% width
    const top = Math.random() * 90;  // 0-90% height

    const duration = 10 + Math.random() * 10; // 10s to 20s
    const size = 0.8 + Math.random() * 1.0; // Random size

    el.style.left = `${left}%`;
    el.style.top = `${top}%`;
    el.style.animationDuration = `${duration}s`;
    el.style.fontSize = `${size}rem`;

    // Random delay to desync
    el.style.animationDelay = `${Math.random() * 5}s`;

    document.body.appendChild(el);

    // Cleanup
    setTimeout(() => {
        el.remove();
    }, (duration + 5) * 1000);
}

// Start animation
initFallingQuotes();
