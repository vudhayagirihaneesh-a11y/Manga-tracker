import React, { useMemo } from "react";
import { StoredManga } from "../types";
import { Star } from "lucide-react";
import ImageFallback from "./ImageFallback";

interface TierListProps {
  mangaList: StoredManga[];
}

const TierList: React.FC<TierListProps> = ({ mangaList }) => {
  
  const tiers = useMemo(() => {
    const list = {
      S: mangaList.filter(m => (m.rating || 0) === 10),
      A: mangaList.filter(m => { const r = m.rating || 0; return r >= 8 && r <= 9; }),
      B: mangaList.filter(m => { const r = m.rating || 0; return r >= 6 && r <= 7; }),
      C: mangaList.filter(m => { const r = m.rating || 0; return r >= 4 && r <= 5; }),
      D: mangaList.filter(m => { const r = m.rating || 0; return r >= 1 && r <= 3; }),
      Unrated: mangaList.filter(m => !m.rating || m.rating === 0)
    };
    return list;
  }, [mangaList]);

  const tierColors: Record<string, string> = {
    S: '#ff7f7f',
    A: '#ffbf7f',
    B: '#ffff7f',
    C: '#7fff7f',
    D: '#7fbfff',
    Unrated: '#475569'
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>My Tier List</h2>
      <p className="text-muted text-center" style={{ marginBottom: '3rem' }}>
        Automatically generated based on your 1-10 library ratings.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#0f172a', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        {(Object.keys(tiers) as Array<keyof typeof tiers>).map((tierKey) => {
          const items = tiers[tierKey];
          return (
            <div key={tierKey} style={{ display: 'flex', minHeight: '120px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              
              {/* Tier Label */}
              <div style={{ 
                width: '100px', 
                background: tierColors[tierKey], 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#000',
                fontSize: tierKey === 'Unrated' ? '1rem' : '2.5rem',
                fontWeight: '900',
                borderRight: '1px solid rgba(0,0,0,0.5)',
                textShadow: '0 1px 2px rgba(255,255,255,0.3)'
              }}>
                {tierKey}
              </div>

              {/* Tier Items */}
              <div style={{ flex: 1, padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {items.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.2)' }}>
                    Empty
                  </div>
                ) : (
                  items.map(manga => (
                    <div key={manga.id} style={{ position: 'relative', width: '80px', height: '115px' }}>
                      <ImageFallback 
                        src={manga.image_url} 
                        alt={manga.title} 
                        title={manga.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s', cursor: 'pointer' }} 
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        width="80"
                        height="115"
                      />
                      {manga.rating ? (
                         <div style={{ position: 'absolute', bottom: '-0.5rem', left: '50%', transform: 'translateX(-50%)', background: '#000', border: '1px solid #333', fontSize: '0.6rem', padding: '0.1rem 0.3rem', borderRadius: 'var(--radius-full)', zIndex: 5, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
                           <Star size={8} fill="#fbbf24" /> {manga.rating}
                         </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
};

export default TierList;
