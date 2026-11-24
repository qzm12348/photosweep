# PhotoSweep — Bulk Delete & Clean Google Photos (Edge & Chrome)

A lightweight, **100% local Manifest V3 browser extension** in plain Vanilla JS + CSS to safely bulk select and clean Google Photos, large videos, and screenshots — **zero Google OAuth, zero backend, zero uploads**.

> ### 🎁 Free Lifetime Pro for the First 199 Users!
> Email **9090qzm@gmail.com** (subject: `PhotoSweep Pro`) with your Google Photos email to claim a **free Lifetime Pro activation code** (no strings attached).
> If you find PhotoSweep helpful, a ⭐ Star on GitHub or an honest review on the Edge Store helps a ton — or open an Issue with any bugs / feature requests!

---

## Install on Microsoft Edge (1-Click)

- **Microsoft Edge Add-ons Store**: [Install PhotoSweep on Edge](https://microsoftedge.microsoft.com/addons/detail/photosweep-%E2%80%94-google-photo/ddmgkgjpaelgifebnbojjlfighnmljgi)
- **Official Homepage & Privacy Policy**: [https://qzm12348.github.io/photosweep/](https://qzm12348.github.io/photosweep/)

---

## Install on Google Chrome / Brave / Arc (10 Seconds, Free)

PhotoSweep is 100% compatible with **Chrome, Brave, Arc, Vivaldi, Opera**, and any Chromium-based browser:

1. **Download the latest release ZIP**:
   👉 Click [`photosweep-v1.0.2-store-package.zip`](https://github.com/qzm12348/photosweep/raw/main/photosweep-v1.0.2-store-package.zip) and **unzip** it into a folder on your computer.
2. **Open Chrome Extensions**:
   Go to `chrome://extensions` in your address bar and toggle **Developer mode** ON (top-right corner).
3. **Load Unpacked**:
   Click **Load unpacked** (top-left) and select the unzipped folder.
4. **Open Google Photos**:
   Visit [photos.google.com](https://photos.google.com) — the draggable PhotoSweep control panel appears automatically in the bottom-right corner!

---

## Key Features

- **Safe Dry-Run Preview by Default**: Starts in *Select Only* mode so you can visually inspect highlighted items before anything is deleted.
- **Trash Only (30-Day Recovery)**: Moves items to Google Photos Trash — never permanently wipes them directly.
- **Delete by Year & Older + Instant Jump**: Keep recent memories untouched (e.g., *2024 & Older*), or jump straight to any year/keyword.
- **15GB Storage Quick Filters**: One-click shortcuts to All Photos, Videos, Screenshots, Recently Added, Storage Quota Manager, and Trash.
- **Anti-Freeze Batch Processing**: Configurable batch size (`25 / 50 / 100`) and click pacing (`100ms–500ms`) with virtual scroll handling and automatic pause if the Trash confirmation dialog doesn't appear.
- **11+ Languages Supported**: Works across English, Chinese, Spanish, French, German, Japanese, Korean, Portuguese, Russian, Italian, and more with 3-layer Trash detection fallback.
- **Skip Starred / Favorited Photos**: Protects your starred memories automatically by default.

---

## Privacy & Security (Verify It Yourself!)

Because PhotoSweep is open source, you can inspect `manifest.json` and `content.js` directly:
- **Permissions**: Only `storage`, `activeTab`, and `https://photos.google.com/*`.
- **Zero OAuth / Zero Network Uploads**: No photos, videos, credentials, or metadata ever leave your browser.
- **Offline ECDSA P-256 License Verification**: Pro keys are verified 100% locally via the browser's built-in `crypto.subtle.verify()` using the embedded public key.

> **Important Safety Reminder**: If mobile backup & sync is turned on in your phone's Google Photos app, deleting cloud photos may also delete synced local copies on your device. Turn off mobile backup first if you only want to free up cloud storage.

---

## Free vs Pro

- **Free Tier**: Process up to **500 items per day** (resets daily at midnight), with all filters, Dry-Run preview, Year cutoff, and Skip Starred unlocked.
- **Pro Lifetime ($4.99 One-Time — Free for First 199 Users)**: Unlocks unlimited daily bulk cleaning. Email `9090qzm@gmail.com` to grab a free launch code!
