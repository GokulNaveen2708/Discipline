// options/main.js

// 1. Defaults
const DEFAULT_BLOCKED = ["instagram.com", "youtube.com", "twitter.com"];
const DEFAULT_MODE = "normal";

// Elements
const siteListEl = document.getElementById('site-list');
const newSiteInput = document.getElementById('new-site');
const btnAdd = document.getElementById('btn-add');
const btnSave = document.getElementById('btn-save');
const statusMsg = document.getElementById('status-msg');

let currentSites = [];
let currentMode = DEFAULT_MODE;

// 2. Initialize
async function init() {
    // Load from storage
    const data = await chrome.storage.local.get(['blockedSites', 'frictionMode']);

    currentSites = data.blockedSites || DEFAULT_BLOCKED;
    currentMode = data.frictionMode || DEFAULT_MODE;

    renderSites();
    setModeRadio(currentMode);

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

        // Save to Chrome Storage
        await chrome.storage.local.set({
            blockedSites: currentSites,
            frictionMode: selectedMode
        });

        // Notify Background Script to update (optional, but good practice)
        // chrome.runtime.sendMessage({ type: 'SETTINGS_UPDATED' });

        showStatus();
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
