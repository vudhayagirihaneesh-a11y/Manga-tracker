import React from "react";
import { StoredManga } from "../types";
import { Skull, Ghost, RotateCcw } from "lucide-react";
import ImageFallback from "./ImageFallback";
import { updateManga } from "../api";

interface GraveyardProps {
  mangaList: StoredManga[];
  onMangaUpdated: () => void;
}

const Graveyard: React.FC<GraveyardProps> = ({ mangaList, onMangaUpdated }) => {
  const droppedManga = mangaList.filter(m => m.status === "Dropped");

  const handleRevive = async (manga: StoredManga) => {
    try {
      await updateManga(manga.id, { status: "Plan to Read" });
      onMangaUpdated();
    } catch (e) {
      console.error("Failed to revive manga", e);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '2rem' }}>
        <Skull size={48} color="#ef4444" style={{ marginBottom: '1rem', filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))' }} />
        <h2 style={{ fontSize: '2.5rem', fontWeight: 300, color: '#fca5a5', margin: 0, textTransform: 'uppercase', letterSpacing: '4px' }}>
          The Graveyard
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
          Here lie the series that couldn't keep your attention. May they rest in peace.
        </p>
      </div>

      {droppedManga.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '1rem', border: '1px dashed rgba(239, 68, 68, 0.2)' }}>
          <Ghost size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ margin: '0 0 0.5rem 0' }}>The graveyard is empty... for now.</h3>
          <p style={{ margin: 0 }}>You haven't dropped any manga yet.</p>
        </div>
      ) : (
        <div className="row" style={{ rowGap: '2rem' }}>
          {droppedManga.map(manga => (
            <div key={manga.id} className="col-lg-4 col-md-6 mb-4">
              <div 
                className="glass-card" 
                style={{ 
                  padding: '1.5rem', 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
                  borderTop: '4px solid #ef4444',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <ImageFallback 
                    src={manga.image_url} 
                    alt={manga.title} 
                    style={{ width: '80px', height: '112px', objectFit: 'cover', borderRadius: '4px', filter: 'grayscale(0.8) contrast(1.2)' }} 
                  />
                  <div>
                    <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0', color: '#f8fafc', lineHeight: 1.2 }}>{manga.title}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Dropped at Chapter {manga.chapters_read}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  background: 'rgba(0,0,0,0.3)', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  flex: 1, 
                  position: 'relative',
                  borderLeft: '2px solid rgba(239, 68, 68, 0.3)'
                }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#fca5a5', letterSpacing: '1px', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Epitaph
                  </div>
                  <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                    "{manga.epitaph || "No final words were spoken..."}"
                  </p>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn" 
                    style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.3)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={() => handleRevive(manga)}
                  >
                    <RotateCcw size={14} /> Revive
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Graveyard;
