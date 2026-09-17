import React, { useState, useMemo } from "react";
import { StoredManga } from "../types";
import { deleteManga } from "../api";
import { Edit2, Trash2, Star, Search as SearchIcon, Users } from "lucide-react";
import ImageFallback from "./ImageFallback";
import CharacterFlashcardModal from "./CharacterFlashcardModal";

interface MangaListProps {
  mangaList: StoredManga[];
  loading: boolean;
  error: string | null;
  onEdit: (manga: StoredManga) => void;
  onMangaDeleted: () => void;
}

const MangaList: React.FC<MangaListProps> = ({ mangaList, loading, error, onEdit, onMangaDeleted }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date_added" | "recent" | "rating" | "alphabetical">("date_added");
  const [activeFlashcardMangaId, setActiveFlashcardMangaId] = useState<number | null>(null);

  const filteredAndSortedManga = useMemo(() => {
    let result = mangaList;
    
    if (searchQuery) {
      result = result.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    result = [...result].sort((a, b) => {
      if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      } else if (sortBy === "alphabetical") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "recent") {
        return (b.last_updated || b.id) - (a.last_updated || a.id);
      } else {
        return b.id - a.id; // date_added (id is timestamp of creation)
      }
    });

    return result;
  }, [mangaList, searchQuery, sortBy]);

  const handleDelete = async (manga: StoredManga) => {
    if (window.confirm(`Are you sure you want to delete ${manga.title}?`)) {
      try {
        await deleteManga(manga.id);
        onMangaDeleted();
      } catch (error) {
        console.error("Error deleting manga", error);
        alert("Failed to delete manga. Please try again.");
      }
    }
  };

  if (loading) return <div className="text-center mt-4">Loading your magnificent library...</div>;
  if (error) return <div className="text-center mt-4 text-danger">{error}</div>;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <SearchIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search your library..." 
            style={{ paddingLeft: '2.5rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="form-control" 
          style={{ width: 'auto', cursor: 'pointer' }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
        >
          <option value="date_added">Date Added</option>
          <option value="recent">Recently Updated</option>
          <option value="rating">Highest Rated</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>

      {filteredAndSortedManga.length === 0 ? (
        <div className="text-center mt-4 text-muted">
          {searchQuery ? "No manga found matching your search." : "Your library is empty. Go to the Search tab to add some manga!"}
        </div>
      ) : (
        <div className="row">
          {filteredAndSortedManga.map((manga) => {
          const progressPercent = manga.total_chapters && manga.total_chapters > 0 
            ? Math.min(100, Math.round((manga.chapters_read / manga.total_chapters) * 100)) 
            : 0;

          const isCompleted = manga.status === "Completed" || (manga.total_chapters && manga.chapters_read >= manga.total_chapters);

          return (
            <div key={manga.id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
              <div 
                className="parallax-card-container manga-card-hover"
                onMouseEnter={(e) => {
                  const card = e.currentTarget;
                  const innerCard = card.querySelector('.parallax-card') as HTMLElement;
                  if (innerCard) {
                    innerCard.style.transition = 'none';
                  }
                }}
                onMouseMove={(e) => {
                  const card = e.currentTarget;
                  const rect = card.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;
                  const rotateX = ((y - centerY) / centerY) * -10;
                  const rotateY = ((x - centerX) / centerX) * 10;
                  const innerCard = card.querySelector('.parallax-card') as HTMLElement;
                  if (innerCard) {
                    innerCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                  }
                  const glare = card.querySelector('.glare') as HTMLElement;
                  if (glare) {
                     const percentX = (x / rect.width) * 100;
                     const percentY = (y / rect.height) * 100;
                     glare.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(255,255,255,0.3) 0%, transparent 50%)`;
                  }
                }}
                onMouseLeave={(e) => {
                  const card = e.currentTarget;
                  const innerCard = card.querySelector('.parallax-card') as HTMLElement;
                  if (innerCard) {
                    innerCard.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
                    innerCard.style.transform = `rotateX(0deg) rotateY(0deg)`;
                  }
                  const glare = card.querySelector('.glare') as HTMLElement;
                  if (glare) glare.style.background = `none`;
                }}
                style={{ height: '100%' }}
              >
                <div className="parallax-card glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                  <div className="glare"></div>
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <ImageFallback 
                      src={manga.image_url} 
                      alt={manga.title}
                      style={{ width: "100%", height: "280px", objectFit: "cover", transition: 'transform 0.3s ease' }}
                    />
                  
                  {/* Hover Overlay */}
                  <div className="quick-binge-overlay manga-card-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', zIndex: 10 }}>
                    {!isCompleted && (
                      <button 
                        className="btn btn-primary" 
                        style={{ borderRadius: 'var(--radius-full)', padding: '0.75rem 1.5rem', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.5)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const btn = e.currentTarget;
                          btn.classList.add('pop-animation');
                          setTimeout(() => btn.classList.remove('pop-animation'), 300);
                          
                          // Quick increment logic
                          import('../api').then(({ updateManga }) => {
                            updateManga(manga.id, { chapters_read: manga.chapters_read + 1 })
                              .then(() => onMangaDeleted()); // onMangaDeleted just triggers fetchMangaList in App.tsx
                          });
                        }}
                      >
                        +1 Chapter
                      </button>
                    )}
                  </div>

                  {manga.rating ? (
                    <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 'bold', color: '#fbbf24' }}>
                      <Star size={12} fill="#fbbf24" /> {manga.rating}/10
                    </div>
                  ) : null}
                  <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem' }}>
                    <span 
                      className={`badge ${isCompleted ? 'badge-success' : 'badge-primary'}`}
                      style={{ 
                        background: !isCompleted ? 'rgba(0,0,0,0.6)' : undefined, 
                        backdropFilter: !isCompleted ? 'blur(4px)' : undefined,
                        border: !isCompleted ? '1px solid rgba(255,255,255,0.1)' : undefined
                      }}
                    >
                      {isCompleted ? 'Completed' : manga.status}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h5 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {manga.title}
                  </h5>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span>{manga.chapters_read} {manga.total_chapters ? `/ ${manga.total_chapters}` : ''} Chaps</span>
                      {manga.total_chapters && manga.total_chapters > 0 && <span>{progressPercent}%</span>}
                    </div>
                    {manga.total_chapters && manga.total_chapters > 0 ? (
                      <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                    ) : (
                      <div style={{ height: '6px', marginTop: '0.5rem' }}></div>
                    )}
                  </div>

                  {manga.tags && manga.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {manga.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{tag}</span>
                      ))}
                      {manga.tags.length > 3 && <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', fontSize: '0.65rem' }}>+{manga.tags.length - 3}</span>}
                    </div>
                  )}

                  {manga.target_date && manga.total_chapters && !isCompleted && (() => {
                    const targetTime = new Date(manga.target_date).getTime();
                    const now = new Date().getTime();
                    const daysLeft = Math.ceil((targetTime - now) / (1000 * 60 * 60 * 24));
                    const chaptersRemaining = manga.total_chapters - manga.chapters_read;
                    
                    if (daysLeft > 0 && chaptersRemaining > 0) {
                      const pace = Math.ceil(chaptersRemaining / daysLeft);
                      return (
                        <div style={{ marginBottom: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderLeft: '3px solid var(--primary)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <strong style={{ color: 'var(--primary)' }}>Pace Goal:</strong> Read {pace} chap/day to finish by {new Date(manga.target_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      );
                    } else if (daysLeft <= 0) {
                      return (
                        <div style={{ marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #ef4444', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <strong style={{ color: '#ef4444' }}>Goal Missed:</strong> Target date has passed!
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ flex: 1, padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} 
                      onClick={() => onEdit(manga)}
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                    {manga.mal_id && (
                      <button 
                        className="btn" 
                        style={{ padding: '0.5rem 1rem', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                        onClick={() => setActiveFlashcardMangaId(manga.mal_id!)}
                        title="View Characters"
                      >
                        <Users size={18} />
                      </button>
                    )}
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                      onClick={() => handleDelete(manga)} 
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
      {/* Render the Flashcard Modal if a manga is selected */}
      {activeFlashcardMangaId && (
        <CharacterFlashcardModal 
          mangaMalId={activeFlashcardMangaId} 
          onClose={() => setActiveFlashcardMangaId(null)} 
        />
      )}
    </div>
  );
};

export default MangaList;
