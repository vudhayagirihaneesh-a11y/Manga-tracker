import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { JikanManga, StoredManga } from "../types";
import { Plus, Compass, EyeOff, RefreshCw, Filter, ChevronDown, ChevronUp } from "lucide-react";
import ImageFallback from "./ImageFallback";
import AddMangaModal from "./AddMangaModal";

interface DiscoverProps {
  mangaList: StoredManga[];
  onMangaAdded: () => void;
}

const Discover: React.FC<DiscoverProps> = ({ mangaList, onMangaAdded }) => {
  const [recommendations, setRecommendations] = useState<JikanManga[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedManga, setSelectedManga] = useState<JikanManga | null>(null);
  const [activeMode, setActiveMode] = useState<"recommendations" | "blind_date">("recommendations");
  const [blindDateManga, setBlindDateManga] = useState<JikanManga | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [fetchingBlindDate, setFetchingBlindDate] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const AVAILABLE_GENRES = [
    { id: 1, name: "Action" },
    { id: 2, name: "Adventure" },
    { id: 4, name: "Comedy" },
    { id: 8, name: "Drama" },
    { id: 10, name: "Fantasy" },
    { id: 14, name: "Horror" },
    { id: 7, name: "Mystery" },
    { id: 22, name: "Romance" },
    { id: 24, name: "Sci-Fi" },
    { id: 36, name: "Slice of Life" },
    { id: 30, name: "Sports" },
    { id: 37, name: "Supernatural" },
    { id: 41, name: "Thriller" },
    { id: 40, name: "Psychological" },
    { id: 9, name: "Ecchi" },
    { id: 12, name: "Hentai" },
    { id: 49, name: "Erotica" }
  ];

  const topGenre = useMemo(() => {
    const genreCounts: Record<number, { count: number, name: string }> = {};
    mangaList.forEach(m => {
      if ((m.rating || 0) >= 8 && m.genres) {
        m.genres.forEach(g => {
          if (!genreCounts[g.mal_id]) {
            genreCounts[g.mal_id] = { count: 0, name: g.name };
          }
          genreCounts[g.mal_id].count++;
        });
      }
    });

    let topGenreId: number | null = null;
    let maxCount = 0;
    let topGenreName = "";

    for (const id in genreCounts) {
      if (genreCounts[id].count > maxCount) {
        maxCount = genreCounts[id].count;
        topGenreId = parseInt(id, 10);
        topGenreName = genreCounts[id].name;
      }
    }

    return { id: topGenreId, name: topGenreName };
  }, [mangaList]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = `
          query ($genre: String) {
            Page(page: 1, perPage: 40) {
              media(type: MANGA, sort: SCORE_DESC, genre: $genre) {
                idMal
                title { romaji english }
                description(asHtml: false)
                coverImage { large }
                genres
                averageScore
              }
            }
          }
        `;
        const variables = topGenre.name ? { genre: topGenre.name } : {};
        
        const response = await axios.post("https://graphql.anilist.co", { query, variables });
        const anilistManga = response.data.data.Page.media;
        
        // Map to JikanManga format
        const mappedManga: JikanManga[] = anilistManga
          .filter((m: any) => m.idMal != null)
          .map((m: any) => ({
            mal_id: m.idMal,
            title: m.title.english || m.title.romaji,
            synopsis: m.description?.replace(/<br\s*\/?>/gi, '\n').replace(/<i>/gi, '').replace(/<\/i>/gi, '') || "No synopsis available.",
            images: {
              jpg: {
                image_url: m.coverImage.large
              }
            },
            chapters: null,
            status: "Unknown",
            genres: m.genres.map((g: string) => ({ mal_id: 0, type: "manga", name: g, url: "" }))
          }));
        
        // Filter out manga already in library
        const existingIds = new Set(mangaList.map(m => m.mal_id));
        const filtered = mappedManga.filter(m => !existingIds.has(m.mal_id)).slice(0, 12);
        
        setRecommendations(filtered);
      } catch (err: any) {
        console.error("Error fetching recommendations from AniList", err);
        setError("Failed to load recommendations from the fallback API. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topGenre.id, mangaList]); // Re-run if top genre or library size changes significantly

  const fetchBlindDate = async () => {
    setFetchingBlindDate(true);
    setIsRevealed(false);
    setError(null);
    try {
      // Pick a random page (top ~3000 manga depending on genre)
      const randomPage = Math.floor(Math.random() * 50) + 1;
      
      let genreVar = null;
      if (selectedGenres.length > 0) {
        const randomSelectedId = selectedGenres[Math.floor(Math.random() * selectedGenres.length)];
        const genreObj = AVAILABLE_GENRES.find(g => g.id === randomSelectedId);
        if (genreObj) genreVar = genreObj.name;
      }

      const query = `
        query ($page: Int, $genre: String) {
          Page(page: $page, perPage: 15) {
            media(type: MANGA, sort: SCORE_DESC, genre: $genre) {
              idMal
              title { romaji english }
              description(asHtml: false)
              coverImage { large }
              genres
              averageScore
            }
          }
        }
      `;
      
      const variables = { page: randomPage, ...(genreVar ? { genre: genreVar } : {}) };
      
      const response = await axios.post("https://graphql.anilist.co", { query, variables });
      const anilistManga = response.data.data.Page.media;
      
      if (anilistManga && anilistManga.length > 0) {
         const validManga = anilistManga.filter((m: any) => m.idMal != null);
         if (validManga.length > 0) {
            const randomIndex = Math.floor(Math.random() * validManga.length);
            const m = validManga[randomIndex];
            
            const mapped: JikanManga = {
              mal_id: m.idMal,
              title: m.title.english || m.title.romaji,
              synopsis: m.description?.replace(/<br\s*\/?>/gi, '\n').replace(/<i>/gi, '').replace(/<\/i>/gi, '') || "No synopsis available for this one! It's a true mystery.",
              images: {
                jpg: {
                  image_url: m.coverImage.large
                }
              },
              chapters: null,
              status: "Unknown",
              genres: m.genres.map((g: string) => ({ mal_id: 0, type: "manga", name: g, url: "" }))
            };
            setBlindDateManga(mapped);
         } else {
            setError("Failed to find a valid manga. Please try again.");
         }
      } else {
         setError("No manga found for these filters. Please try again.");
      }
    } catch (err: any) {
      console.error("Error fetching random manga from AniList", err);
      setError("Failed to load a blind date from the fallback API. Please try again later.");
    } finally {
      setFetchingBlindDate(false);
    }
  };

  useEffect(() => {
    if (activeMode === "blind_date" && !blindDateManga && !fetchingBlindDate && !error) {
      fetchBlindDate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode, selectedGenres, error]);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyItems: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Compass size={24} color="var(--primary)" /> Discover
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: 'var(--radius-lg)' }}>
          <button 
            className={`btn ${activeMode === 'recommendations' ? 'btn-primary' : ''}`}
            style={{ padding: '0.5rem 1rem', background: activeMode !== 'recommendations' ? 'transparent' : '' }}
            onClick={() => setActiveMode('recommendations')}
          >
            Smart Matches
          </button>
          <button 
            className={`btn ${activeMode === 'blind_date' ? 'btn-primary' : ''}`}
            style={{ padding: '0.5rem 1rem', background: activeMode !== 'blind_date' ? 'transparent' : '', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => setActiveMode('blind_date')}
          >
            <EyeOff size={16} /> Blind Date
          </button>
        </div>
      </h2>

      {activeMode === 'recommendations' && (
        <>
          <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
            {topGenre.id 
              ? `Because you highly rated ${topGenre.name} manga, we think you'll love these:`
              : `We need more data to personalize! Rate some manga 8/10 or higher. For now, here are the top-rated manga overall:`}
          </p>

          {loading && <div className="text-center mt-4">Analyzing your taste and finding matches...</div>}
          {error && <div className="text-center mt-4 text-danger">{error}</div>}

          <div className="row">
            {recommendations.map((manga) => (
          <div key={manga.mal_id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div className="glass-card manga-card-hover" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
              <ImageFallback 
                src={manga.images?.jpg?.image_url} 
                alt={manga.title}
                style={{ width: "100%", height: "280px", objectFit: "cover", transition: 'transform 0.3s ease' }}
              />
              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h5 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {manga.title}
                </h5>
                <p className="text-muted" style={{ fontSize: '0.8rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1rem' }}>
                  {manga.synopsis || "No synopsis available."}
                </p>
                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setSelectedManga(manga)}>
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      </>
      )}

      {activeMode === 'blind_date' && (
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Don't judge a book by its cover. Here is a completely random manga. You only get to see the premise. Will you read it?
          </p>

          <div style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <button 
              className="btn" 
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'transparent', color: 'var(--text-color)', border: 'none' }}
              onClick={() => setShowFilters(!showFilters)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={18} color="var(--primary)" />
                <span style={{ fontWeight: 'bold' }}>Genre Preferences</span>
                {selectedGenres.length > 0 && (
                  <span className="badge badge-primary" style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>{selectedGenres.length} selected</span>
                )}
              </div>
              {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            
            {showFilters && (
              <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                <button
                  className={`badge ${selectedGenres.length === 0 ? 'badge-primary' : ''}`}
                  style={{ cursor: 'pointer', padding: '0.5rem 1rem', background: selectedGenres.length === 0 ? undefined : 'rgba(255,255,255,0.1)' }}
                  onClick={() => {
                    setSelectedGenres([]);
                    setBlindDateManga(null);
                  }}
                >
                  All Genres (Completely Random)
                </button>
                {AVAILABLE_GENRES.map(genre => (
                  <button
                    key={genre.id}
                    className={`badge ${selectedGenres.includes(genre.id) ? 'badge-primary' : ''}`}
                    style={{ cursor: 'pointer', padding: '0.5rem 1rem', background: selectedGenres.includes(genre.id) ? undefined : 'rgba(255,255,255,0.1)' }}
                    onClick={() => {
                      setSelectedGenres(prev => {
                        const newSelection = prev.includes(genre.id) 
                          ? prev.filter(id => id !== genre.id)
                          : [...prev, genre.id];
                        setBlindDateManga(null); // Force refetch on change
                        return newSelection;
                      });
                    }}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {fetchingBlindDate ? (
            <div style={{ padding: '4rem', color: 'var(--primary)' }}>
              <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
              <p style={{ marginTop: '1rem' }}>Finding a mystery date...</p>
            </div>
          ) : blindDateManga ? (
            <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
              <div style={{ 
                width: '200px', height: '280px', 
                background: isRevealed ? 'transparent' : 'linear-gradient(135deg, #1e293b, #0f172a)',
                borderRadius: '8px', overflow: 'hidden', position: 'relative',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
              }}>
                {isRevealed ? (
                  <ImageFallback src={blindDateManga.images.jpg.image_url} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)' }}>
                    <EyeOff size={64} />
                  </div>
                )}
              </div>

              <div style={{ width: '100%' }}>
                {isRevealed ? (
                  <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{blindDateManga.title}</h3>
                ) : (
                  <h3 style={{ fontSize: '2rem', marginBottom: '1rem', filter: 'blur(8px)', opacity: 0.5 }}>Mystery Manga Title Here</h3>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  {blindDateManga.genres?.map(g => (
                    <span key={g.mal_id} className="badge" style={{ background: 'var(--primary)', color: 'white' }}>{g.name}</span>
                  ))}
                </div>

                <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--text-muted)', textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px' }}>
                  {blindDateManga.synopsis || "No synopsis available for this one! It's a true mystery."}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1rem' }}>
                <button className="btn btn-secondary" onClick={fetchBlindDate} style={{ flex: 1, padding: '1rem' }}>
                  <RefreshCw size={18} style={{ marginRight: '0.5rem' }} /> Skip
                </button>
                {!isRevealed ? (
                  <button className="btn btn-primary" onClick={() => setIsRevealed(true)} style={{ flex: 2, padding: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    Reveal Cover
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={() => setSelectedManga(blindDateManga)} style={{ flex: 2, padding: '1rem', fontWeight: 'bold', fontSize: '1.1rem', background: '#10b981', borderColor: '#10b981' }}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add to Library
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-danger">{error}</div>
          )}
        </div>
      )}

      {selectedManga && (
        <AddMangaModal
          manga={selectedManga}
          onClose={() => setSelectedManga(null)}
          onMangaAdded={() => {
            setSelectedManga(null);
            onMangaAdded();
          }}
          mangaList={mangaList}
        />
      )}
    </div>
  );
};

export default Discover;
