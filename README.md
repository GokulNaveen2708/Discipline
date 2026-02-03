# Discipline - Conscious Friction Extension

**Discipline** is a Chrome Extension designed to stop mindless scrolling by introducing "Conscious Friction". Instead of simply blocking sites, it forces you to pause, reflect, and make an intentional choice before entering high-dopamine environments like Instagram or YouTube.

## 🌟 Features

### 1. The Conscious Pause
When you attempt to visit a blocked site, you are redirected to a calming intervention page. To proceed, you must type a randomized intention phrase (e.g., *"I am choosing to spend my time wisely"*). This engages your prefrontal cortex and breaks the "zombie scrolling" loop.

### 2. Depletion Mode (Boredom Protocol)
For moments when you have zero self-control, enable **Depletion Mode** in settings.
- **The Cost:** You must wait 30 seconds on a blank screen before you can even attempt to unlock the site.
- **Strictness:** If you switch tabs while waiting, the timer resets. You must endure the boredom.

### 3. Dynamic Configuration
- **Add/Remove Sites**: Customize your blocklist (Reddit, Twitter, etc.) on the fly via the Options page.
- **Persistence**: Usage stats and settings are saved locally to your browser.

---

## 🚀 Installation Guide

Since this is a custom extension, you need to load it into Chrome manually (for now).

1.  **Clone/Download** this repository to your local machine.
2.  Open Google Chrome and navigate to `chrome://extensions`.
3.  **Enable Developer Mode** (Toggle switch in the top right corner).
4.  Click **Load Unpacked**.
5.  Select the **`Discipline`** folder (the root of this project).
6.  The extension is now installed! 🛡️

---

## ⚙️ Configuration

1.  Click the **Discipline icon** in your Chrome toolbar (pin it for easy access).
2.  Select **Options** (or right-click -> Options).
3.  **General Tab**:
    - Add new URLs to block.
    - Toggle between "Conscious Pause" (Standard) and "Depletion Mode" (Hardcore).
4.  Click **Save Changes**.

## 🛠️ Tech Stack

- **Manifest V3**: The latest Chrome Extension standard.
- **Vanilla JavaScript**: Lightweight, no heavy frameworks.
- **Glassmorphism CSS**: Modern, calming UI design.
- **Local Storage**: Privacy-first, no data leaves your browser.

## 📂 Project Structure

```bash
/src
  /background.js       # The "Security Guard" service worker
  /intervention        # The Blocking UI (HTML/CSS/JS)
  /options             # The Settings Dashboard
  /icons               # Extension icons
manifest.json          # Configuration blueprint
```

## 📜 License

 Feel free to fork and modify for your own productivity needs.
