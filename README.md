<div align="center">

# 📚 Manga Tracker Infinity

<img src="mnga_infinity/logo512.png" alt="Manga Tracker Logo" width="150" />

<br/>

**The ultimate, blazing-fast, personal manga reading companion.**  
*Track your chapters, visualize your reading habits, and never lose your place again.*

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://php.net/)
[![Jikan API](https://img.shields.io/badge/Jikan_API-2E51A2?style=for-the-badge&logo=myanimelist&logoColor=white)](https://jikan.moe/)

</div>

---

## 📖 Table of Contents

- [About The Project](#-about-the-project)
- [Stellar Features](#-stellar-features)
- [System Architecture](#-system-architecture)
- [Data & Endpoints](#-data--endpoints)
- [Installation & Deployment](#-installation--deployment)
  - [Production (PHP / InfinityFree)](#production-php--infinityfree)
  - [Development (React + Node.js)](#development-react--nodejs)
- [How It Works](#-how-it-works)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🌟 About The Project

**Manga Tracker Infinity** is an exquisitely designed, highly portable web application tailored for avid manga readers. Are you tired of forgetting which chapter you were on? Do you want to see exactly how many chapters you've devoured over the past month? 

This project solves all of that by providing a **self-hosted, private, and incredibly fast** tracking dashboard. It seamlessly integrates with the **Jikan API** (an unofficial MyAnimeList API) to fetch high-quality metadata, covers, and synopses instantly. Best of all, it relies on a flat `db.json` file for storage, meaning you can host it anywhere—from a robust VPS down to a completely free shared hosting tier like InfinityFree!

---

## ✨ Stellar Features

| Feature | Description |
| :--- | :--- |
| 🔍 **Live Search** | Instantly query the Jikan API. Add manga to your reading list with a single click without manually typing titles. |
| 📈 **Heatmap Analytics** | Keep your streaks alive! The app visually tracks the chapters you read daily, displaying your activity much like a GitHub contribution graph. |
| 🗃️ **Zero-Config Database** | Say goodbye to complex MySQL or PostgreSQL setups. Everything is saved safely in a portable `db.json` file. |
| 📊 **Smart Dashboards** | Get real-time calculations on your Total Manga, Completed Series, and Lifetime Chapters Read. |
| 🔁 **Data Portability** | Easily export your reading list to a JSON file, or import an existing list to pick up right where you left off. |
| ⚡ **Lightning Fast** | Built as a Single Page Application (SPA) using React, ensuring buttery smooth transitions and instant loading times. |

---

## 🏗️ System Architecture

This repository is uniquely structured to provide both a **modern development environment** and a **highly compatible production build**.

### 1. `mnga_infinity/` (Production Build)
This is the holy grail for easy deployment. It contains the **compiled React frontend** (inside `static/`) and a custom, hyper-lightweight **PHP Backend** (`api.php`). This PHP script acts as an API gateway, handling CORS, interacting with the Jikan API, and reading/writing to `db.json`. 

### 2. `cheeck/frontend/` (Frontend Source)
The raw, uncompiled React source code. Built with modern React patterns, hooks, and TypeScript, this is where the UI magic happens. It connects to the backend APIs to render the gorgeous tracker interface.

### 3. `cheeck/backend/` (Development Backend)
An alternative backend built using **Express.js, Node.js, and TypeScript**. This is perfect for local development or for users who prefer hosting on environments like Heroku, Render, or their own VPS.

---

## 📡 Data & Endpoints

The PHP API (`api.php`) handles the following RESTful routes:

- `GET /api/search/{query}` - Proxies requests to Jikan API to find manga.
- `GET /api/stats` - Calculates reading history, completed manga, and total chapters.
- `GET /api/manga` - Retrieves your entire tracking list.
- `POST /api/manga` - Adds a new manga to your tracker.
- `PUT /api/manga/{id}` - Updates chapter progress, rating, or status.
- `DELETE /api/manga/{id}` - Removes a manga from your collection.
- `POST /api/manga/import` - Bulk imports an array of manga objects.

---

## 🚀 Installation & Deployment

### Production (PHP / InfinityFree)
*The easiest way to get online in under 5 minutes.*

1. **Copy the files**: Take the entire contents of the `mnga_infinity/` directory.
2. **Upload to Host**: Upload them directly into the `htdocs`, `public_html`, or `www` directory of your web host.
3. **Set Permissions**: Ensure that your web server has write permissions (`chmod 777` or `chmod 666`) for the `db.json` file so your progress can be saved.
4. **Enjoy**: Navigate to your domain URL. You're live!

### Development (React + Node.js)
*For developers wanting to modify the code.*

**Starting the Backend:**
```bash
cd cheeck/backend
npm install
npm run start
```
*(Runs the Express server with nodemon for hot-reloading).*

**Starting the Frontend:**
```bash
cd cheeck/frontend
npm install
npm start
```
*(Runs the React development server. It will automatically proxy requests to your local backend).*

---

## 🧠 How It Works

When you add a manga, the frontend pings the `api.php` file, which formats the data and pushes it to `db.json`. Every time you update your "Chapters Read", the backend compares the new number with the old number, calculates the difference, and logs that difference into your `reading_history` array with today's date. This allows the frontend to render your daily reading activity graph!

---

## 🗺️ Roadmap

- [x] Initial React SPA Release
- [x] Portable JSON Database implementation
- [x] Jikan API Integration
- [ ] **Next:** Dark/Light Mode Toggle
- [ ] **Next:** Advanced Tagging and Filtering
- [ ] **Next:** User Authentication (Multi-user support)

---

<div align="center">
  <b>Built with ❤️ for the manga community.</b>
  <br/>
  <i>Track every chapter, conquer every series.</i>
</div>
