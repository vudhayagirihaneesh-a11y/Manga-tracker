import React, { useState, useEffect } from "react";
import { searchManga } from "../api";
import AddMangaModal from "./AddMangaModal";
import { JikanManga, StoredManga } from "../types";
import { Search as SearchIcon, Plus } from "lucide-react";
import ImageFallback from "./ImageFallback";

interface SearchProps {
  onMangaAdded: () => void;
  mangaList: StoredManga[];
}

const Search: React.FC<SearchProps> = ({ onMangaAdded, mangaList }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JikanManga[]>([]);
  const [selectedManga, setSelectedManga] = useState<JikanManga | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim() === "") {
        setResults([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await searchManga(query);
        setResults(response.data.data);
      } catch (error) {
        console.error("Error searching for manga", error);
        setError("Failed to search for manga. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto 3rem auto', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Discover New Manga</h2>
        <div className="input-group" style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search for a manga title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '1.5rem', borderRadius: 'var(--radius-full)' }}
          />
          <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            {loading ? <div className="spinner-border spinner-border-sm text-primary" role="status"></div> : <SearchIcon size={18} color="var(--text-muted)" />}
          </div>
        </div>
      </div>

      {error && <div className="text-center mt-4 text-danger">{error}</div>}
      {results.length === 0 && !loading && query && <div className="text-center mt-4 text-muted">No results found for "{query}". Try a different title.</div>}

      <div className="row" style={{ marginTop: '2rem' }}>
        {results.map((manga) => (
          <div key={manga.mal_id} className="col-lg-6 mb-4">
            <div className="glass-card" style={{ display: 'flex', gap: '1.5rem', height: '100%', alignItems: 'flex-start' }}>
              <ImageFallback 
                src={manga.images?.jpg?.image_url} 
                alt={manga.title} 
                style={{ width: "120px", height: "180px", objectFit: "cover", borderRadius: "var(--radius-md)", flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}
                width="120"
                height="180"
              />
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
                <h5 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {manga.title}
                </h5>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-primary">Pub: {manga.status}</span>
                  {manga.chapters && <span className="badge badge-warning">{manga.chapters} Chaps</span>}
                </div>
                <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {manga.synopsis || "No synopsis available."}
                </p>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-success" onClick={() => setSelectedManga(manga)}>
                    <Plus size={16} /> Add to Library
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedManga && (
        <AddMangaModal
          manga={selectedManga}
          onClose={() => setSelectedManga(null)}
          onMangaAdded={onMangaAdded}
          mangaList={mangaList}
        />
      )}
    </div>
  );
};

export default Search;
