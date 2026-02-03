// options/main.js
console.log("Options Script Loaded: " + new Date().toISOString());

// 1. Defaults
const DEFAULT_BLOCKED = ["instagram.com", "youtube.com", "twitter.com"];
const DEFAULT_MODE = "normal";

// Elements
const siteListEl = document.getElementById('site-list');
const newSiteInput = document.getElementById('new-site');
const btnAdd = document.getElementById('btn-add');
const btnSave = document.getElementById('btn-save');
const statusMsg = document.getElementById('status-msg');
const durationSlider = document.getElementById('duration-slider');
const durationValueEl = document.getElementById('duration-value');

let currentSites = [];
let currentMode = DEFAULT_MODE;
let currentDuration = 10;

// 2. Initialize
async function init() {
    // Load from storage
    const data = await chrome.storage.local.get(['blockedSites', 'frictionMode', 'unlockDurationMinutes']);

    currentSites = data.blockedSites || DEFAULT_BLOCKED;
    currentMode = data.frictionMode || DEFAULT_MODE;
    currentDuration = data.unlockDurationMinutes || 10;

    renderSites();
    setModeRadio(currentMode);

    // Set slider
    if (durationSlider) {
        durationSlider.value = currentDuration;
        durationValueEl.innerText = currentDuration;
    }

    setupListeners();
}

// 3. Render List
function renderSites() {
    siteListEl.innerHTML = '';

    currentSites.forEach(site => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${site}</span>
            <button class="btn-remove" data-site="${site}">Remove</button>
        `;
        siteListEl.appendChild(li);
    });
}

function setModeRadio(mode) {
    const radio = document.querySelector(`input[name="mode"][value="${mode}"]`);
    if (radio) radio.checked = true;
}

// 4. Listeners
function setupListeners() {
    // Slider Change
    if (durationSlider) {
        durationSlider.addEventListener('input', (e) => {
            durationValueEl.innerText = e.target.value;
        });
    }

    // NAVIGATION Logic
    const navLinks = document.querySelectorAll('.sidebar nav a');
    const sections = document.querySelectorAll('.tab-content');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // 1. Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // 2. Determine target ID
            // Use the data-attribute we added to HTML
            const targetId = link.getAttribute('data-tab');

            // 3. Hide all sections
            sections.forEach(sec => sec.classList.add('hidden'));

            // 4. Show target section
            if (targetId) {
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    targetEl.classList.remove('hidden');
                }

                // Refresh stats if opening stats
                if (targetId === 'section-stats') loadStats();
            }
        });
    });

    // Add new site
    btnAdd.addEventListener('click', () => {
        const site = newSiteInput.value.trim().toLowerCase();
        if (site && !currentSites.includes(site)) {
            currentSites.push(site);
            renderSites();
            newSiteInput.value = '';
        }
    });

    // Remove site (Event Delegation)
    siteListEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove')) {
            const siteToRemove = e.target.getAttribute('data-site');
            currentSites = currentSites.filter(s => s !== siteToRemove);
            renderSites();
        }
    });

    // Save everything
    btnSave.addEventListener('click', async () => {
        // Get selected radio
        const selectedMode = document.querySelector('input[name="mode"]:checked').value;
        const selectedDuration = durationSlider ? parseInt(durationSlider.value) : 10;

        // Save to Chrome Storage
        await chrome.storage.local.set({
            blockedSites: currentSites,
            frictionMode: selectedMode,
            unlockDurationMinutes: selectedDuration
        });

        // Notify Background Script to update (optional, but good practice)
        // chrome.runtime.sendMessage({ type: 'SETTINGS_UPDATED' });

        showStatus();
    });
}

async function loadStats() {
    const statsList = document.getElementById('stats-list');
    statsList.innerHTML = '<li>Loading...</li>';

    const data = await chrome.storage.local.get(['visitCounts']);
    const counts = data.visitCounts || {};

    statsList.innerHTML = '';
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) {
        statsList.innerHTML = '<li><span>No metrics yet.</span></li>';
        return;
    }

    sorted.forEach(([site, count]) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${site}</span> <strong>${count}</strong>`;
        statsList.appendChild(li);
    });
}

function showStatus() {
    statusMsg.classList.remove('hidden');
    setTimeout(() => {
        statusMsg.classList.add('hidden');
    }, 2000);
}

// Run
init();
