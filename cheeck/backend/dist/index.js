import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";
const app = express();
const port = 3001;
// This provides a robust path to db.json, independent of the working directory.
const dbPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../db.json');
app.use(cors());
app.use(bodyParser.json());
// Request Logger Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});
const readDB = () => {
    const defaultDb = { manga: [] };
    if (!fs.existsSync(dbPath)) {
        writeDB(defaultDb);
        return defaultDb;
    }
    try {
        const dbRaw = fs.readFileSync(dbPath, "utf-8");
        // If the file is empty, it's not valid JSON.
        if (dbRaw.trim() === "") {
            writeDB(defaultDb);
            return defaultDb;
        }
        return JSON.parse(dbRaw);
    }
    catch (error) {
        console.error("Error reading or parsing db.json, resetting file:", error);
        writeDB(defaultDb);
        return defaultDb;
    }
};
const writeDB = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};
app.get("/api/manga", (req, res) => {
    const db = readDB();
    // Ensure we always return an array, even if db or db.manga is malformed.
    res.json(db?.manga || []);
});
app.post("/api/manga", (req, res) => {
    const db = readDB();
    const newMangaData = req.body;
    // Ensure db.manga is an array to prevent data loss on malformed db.json
    if (!Array.isArray(db.manga)) {
        db.manga = [];
    }
    // Check if manga with this mal_id already exists
    const existingManga = db.manga.find((m) => m.mal_id === newMangaData.mal_id);
    if (existingManga) {
        return res.status(409).json({ message: "Manga already exists in the list.", manga: existingManga });
    }
    // Normalize total_chapters: 0 or undefined becomes null (unknown)
    if (newMangaData.total_chapters === 0 || newMangaData.total_chapters === undefined) {
        newMangaData.total_chapters = null;
    }
    // Auto-set status to Completed if chapters_read >= total_chapters
    if (newMangaData.total_chapters && newMangaData.total_chapters > 0 &&
        newMangaData.chapters_read >= newMangaData.total_chapters) {
        newMangaData.status = "Completed";
    }
    const newManga = { ...newMangaData, id: Date.now() };
    db.manga.unshift(newManga); // Add to the beginning of the list
    writeDB(db);
    res.status(201).json(newManga);
});
app.put("/api/manga/:id", (req, res) => {
    const db = readDB();
    const mangaId = parseInt(req.params.id, 10);
    const mangaIndex = db.manga.findIndex((m) => m.id === mangaId);
    if (mangaIndex === -1) {
        return res.status(404).json({ message: "Manga not found" });
    }
    const existingManga = db.manga[mangaIndex];
    const chaptersRead = req.body.chapters_read !== undefined ? req.body.chapters_read : existingManga.chapters_read;
    const totalChapters = existingManga.total_chapters;
    // Validate chapters_read doesn't exceed total_chapters (only when total is known)
    if (totalChapters && totalChapters > 0 && chaptersRead > totalChapters) {
        return res.status(400).json({
            message: `Cannot exceed maximum chapter count of ${totalChapters}. You entered ${chaptersRead}.`
        });
    }
    const updatedManga = { ...existingManga, ...req.body };
    // Normalize total_chapters: 0 becomes null (unknown)
    if (updatedManga.total_chapters === 0 || updatedManga.total_chapters === undefined) {
        updatedManga.total_chapters = null;
    }
    // Auto-set status to Completed if chapters_read >= total_chapters
    if (updatedManga.total_chapters && updatedManga.total_chapters > 0 &&
        updatedManga.chapters_read >= updatedManga.total_chapters) {
        updatedManga.status = "Completed";
    }
    db.manga[mangaIndex] = updatedManga;
    writeDB(db);
    res.json(db.manga[mangaIndex]);
});
app.delete("/api/manga/:id", (req, res) => {
    const db = readDB();
    const mangaId = parseInt(req.params.id, 10);
    const initialLength = db.manga.length;
    db.manga = db.manga.filter((m) => m.id !== mangaId);
    if (db.manga.length === initialLength) {
        return res.status(404).json({ message: "Manga not found" });
    }
    writeDB(db);
    res.status(204).send();
});
app.get("/api/search/:query", async (req, res) => {
    try {
        const response = await axios.get(`https://api.jikan.moe/v4/manga?q=${req.params.query}`);
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching from Jikan API" });
    }
});
app.listen(port, () => {
    console.log(`Database path resolved to: ${dbPath}`);
    console.log(`Backend listening at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map