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
    const storage = await mockableStorageGet(['frictionMode']);
    frictionMode = storage.frictionMode || 'normal';

    setupListeners();
}

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

function checkInput(text) {
    const requiredPhrase = targetPhraseEl.innerText;

    if (text === requiredPhrase) {
        inputPhrase.style.borderColor = '#4CAF50';
        inputPhrase.disabled = true;
        grantAccess();
    } else {
        inputPhrase.style.borderColor = '#333';
    }
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
