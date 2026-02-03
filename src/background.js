// background.js - The "Security Guard" of the extension

// 1. configuration
const DEFAULT_BLOCKED = ["instagram.com", "youtube.com", "twitter.com"];
const INTERVENTION_PAGE = "src/intervention/index.html";

// 2. The Check Function
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        checkUrl(tabId, tab.url);
    }
});

async function checkUrl(tabId, url) {
    // 3. Dynamic Blocklist Check
    const storage = await chrome.storage.local.get(['blockedSites', 'unlockExpireTime']);
    const blockedSites = storage.blockedSites || DEFAULT_BLOCKED;

    const isBlocked = blockedSites.some(domain => url.includes(domain));
    if (!isBlocked) return; // Not on the list

    // 4. Check for Hall Pass
    const unlockExpireTime = storage.unlockExpireTime || 0;
    const now = Date.now();

    // 5. The Decision Logic
    if (now < unlockExpireTime) {
        // START OF TEACHING MOMENT:
        // This implies the user has validly unlocked the app.
        // They have a "Pass" valid until 'unlockExpireTime'.
        console.log("Access allowed until: ", new Date(unlockExpireTime));
        return;
    }

    // 6. If no pass, REDIRECT to the police station (Intervention Page)

    // -- USAGE TRACKING LOGIC --
    try {
        const hostname = new URL(url).hostname;
        const storageData = await chrome.storage.local.get(['visitCounts']);
        const visitCounts = storageData.visitCounts || {};
        const currentCount = (visitCounts[hostname] || 0) + 1;
        visitCounts[hostname] = currentCount;

        // Save asynchronously
        chrome.storage.local.set({ visitCounts: visitCounts });
    } catch (e) {
        console.error("Tracking error:", e);
    }

    const interventionUrl = chrome.runtime.getURL(INTERVENTION_PAGE);

    // Prevent infinite update loops: if we are already on the intervention page, stop.
    if (url.includes(INTERVENTION_PAGE)) return;

    // Execute the redirect
    chrome.tabs.update(tabId, { url: interventionUrl + `?target=${encodeURIComponent(url)}` });
}
