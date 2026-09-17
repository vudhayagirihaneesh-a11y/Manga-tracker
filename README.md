<div align="center">
  <h1>📚 Manga Tracker Infinity</h1>
  <p><b>Your personal, lightweight manga reading companion.</b></p>

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://php.net/)
  [![Jikan API](https://img.shields.io/badge/Jikan_API-2E51A2?style=for-the-badge&logo=myanimelist&logoColor=white)](https://jikan.moe/)
</div>

---

## 🌟 What is Manga Tracker?

Manga Tracker is a fast, beautifully designed web application that helps you keep track of all the manga you're reading. Built with a React frontend and a hyper-lightweight PHP/JSON backend, it can be deployed anywhere—even on free shared hosting like InfinityFree!

## ✨ Key Features

- 🔍 **Search & Add**: Seamlessly search for manga titles using the **Jikan API** (Unofficial MyAnimeList API) and add them to your collection instantly.
- 📈 **Reading History**: Tracks the exact number of chapters you read day-by-day and builds a historical heatmap of your reading habits!
- 📂 **JSON Database**: No complex SQL databases required. Everything is stored in a simple, portable `db.json` file.
- 📊 **Smart Statistics**: Automatically calculates your total manga, completed series, and total chapters read.
- 🔁 **Import / Export**: Easily import your existing manga lists and synchronize your reading data.

## 🏗️ Project Structure

The repository contains multiple components of the project architecture:

- 📁 **`mnga_infinity/`**: The production-ready build. Contains the compiled React frontend (`static/`) and the incredibly efficient `api.php` backend that acts as a router and database manager for `db.json`. 
- 📁 **`cheeck/frontend/`**: The raw React source code for the user interface.
- 📁 **`cheeck/backend/`**: An alternative Express.js backend built with Node.js and TypeScript.

## 🚀 Quick Setup (PHP Version)

The `mnga_infinity` folder is designed to be dropped directly into any PHP web server.

1. Upload the contents of the `mnga_infinity/` directory to your web root (e.g., `htdocs` or `public_html`).
2. Ensure that PHP has write permissions to create and modify the `db.json` file.
3. Visit `index.html` in your browser. 
4. Start tracking your manga!

## 💻 Development (React + Node)

If you want to modify the source code:
1. Navigate to `cheeck/frontend` to run the React development server:
   ```bash
   cd cheeck/frontend
   npm install
   npm start
   ```
2. For the Node backend, navigate to `cheeck/backend`:
   ```bash
   cd cheeck/backend
   npm install
   npm start
   ```

---
<div align="center">
  <i>Read more. Track better.</i>
</div>
