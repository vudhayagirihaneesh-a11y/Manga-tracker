import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, ChevronLeft, ChevronRight, User } from "lucide-react";
import ImageFallback from "./ImageFallback";

interface CharacterFlashcardModalProps {
  mangaMalId: number;
  onClose: () => void;
}

const CharacterFlashcardModal: React.FC<CharacterFlashcardModalProps> = ({ mangaMalId, onClose }) => {
  const [characters, setCharacters] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [aboutCache, setAboutCache] = useState<Record<number, string>>({});
  const [loadingAbout, setLoadingAbout] = useState(false);
  const fetchedIds = React.useRef(new Set<number>());

  useEffect(() => {
    setLoadingList(true);
    axios.get(`https://api.jikan.moe/v4/manga/${mangaMalId}/characters`)
      .then(res => {
        // Filter unique and valid characters
        const uniqueSet = new Set();
        const validCharacters = (res.data.data || []).filter((c: any) => {
          if (c.role !== "Main") return false; // Only show main characters
          
          const url = c.character.images?.jpg?.image_url;
          const isValidImage = url && !url.includes("questionmark") && !url.includes("qm_");
          if (!isValidImage) return false;
          
          if (uniqueSet.has(c.character.mal_id)) return false;
          uniqueSet.add(c.character.mal_id);
          return true;
        });
        setCharacters(validCharacters);
      })
      .catch(err => console.error("Error fetching character list", err))
      .finally(() => setLoadingList(false));
  }, [mangaMalId]);

  useEffect(() => {
    if (characters.length > 0 && currentIndex >= characters.length) {
      setCurrentIndex(Math.max(0, characters.length - 1));
    }
  }, [characters.length, currentIndex]);

  useEffect(() => {
    if (characters.length > 0 && currentIndex < characters.length) {
      const currentCharId = characters[currentIndex].character.mal_id;
      if (!fetchedIds.current.has(currentCharId)) {
        fetchedIds.current.add(currentCharId);
        setLoadingAbout(true);
        axios.get(`https://api.jikan.moe/v4/characters/${currentCharId}`)
          .then(res => {
            setAboutCache(prev => ({
              ...prev,
              [currentCharId]: res.data.data.about || "No description available."
            }));
          })
          .catch(err => {
            console.error("Error fetching character details", err);
            // Remove the character from the list if we fail to load its description
            setCharacters(prev => prev.filter(c => c.character.mal_id !== currentCharId));
          })
          .finally(() => setLoadingAbout(false));
      }
    }
  }, [currentIndex, characters]);

  const handleNext = () => {
    if (currentIndex < characters.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, characters.length, onClose]);

  return (
    <div className="modal-overlay" style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-card" style={{ position: 'relative', width: '90%', maxWidth: '900px', height: '75vh', maxHeight: '650px', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.8)' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={24} /> Characters Flashcards</h3>
          <button className="btn-icon" onClick={onClose}><X size={24} /></button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', minHeight: 0 }}>
          {loadingList ? (
            <div className="text-muted">Loading characters...</div>
          ) : characters.length === 0 ? (
            <div className="text-muted">No characters available for this manga.</div>
          ) : !characters[currentIndex] ? (
            <div className="text-muted">Adjusting deck...</div>
          ) : (
            <div style={{ display: 'flex', width: '100%', height: '100%', gap: '1rem', alignItems: 'stretch', minHeight: 0 }}>
              
              {/* Navigation Left */}
              <button 
                onClick={handlePrev} 
                disabled={currentIndex === 0}
                style={{ background: 'none', border: 'none', color: currentIndex === 0 ? 'rgba(255,255,255,0.2)' : 'white', cursor: currentIndex === 0 ? 'default' : 'pointer', transition: 'color 0.2s', padding: '1rem' }}
              >
                <ChevronLeft size={48} />
              </button>

              {/* Card Area */}
              <div style={{ flex: 1, display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', minHeight: 0 }}>
                
                {/* Left Side: Image */}
                <div style={{ width: '40%', position: 'relative', background: '#0f172a' }}>
                  <ImageFallback 
                    src={characters[currentIndex].character.images.jpg.image_url} 
                    alt={characters[currentIndex].character.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem', background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}>
                    <h2 style={{ margin: 0, fontSize: '2rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{characters[currentIndex].character.name}</h2>
                    <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {characters[currentIndex].role} Role
                    </div>
                  </div>
                </div>

                {/* Right Side: Description */}
                <div style={{ width: '60%', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>About</h4>
                  {loadingAbout ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      Fetching details...
                    </div>
                  ) : (
                    <div style={{ lineHeight: '1.8', fontSize: '1.05rem', whiteSpace: 'pre-wrap', color: 'rgba(255,255,255,0.9)' }}>
                      {aboutCache[characters[currentIndex].character.mal_id]}
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Right */}
              <button 
                onClick={handleNext} 
                disabled={currentIndex >= characters.length - 1}
                style={{ background: 'none', border: 'none', color: currentIndex >= characters.length - 1 ? 'rgba(255,255,255,0.2)' : 'white', cursor: currentIndex >= characters.length - 1 ? 'default' : 'pointer', transition: 'color 0.2s', padding: '1rem' }}
              >
                <ChevronRight size={48} />
              </button>

            </div>
          )}
        </div>

        {/* Footer info */}
        {characters.length > 0 && characters[currentIndex] && (
          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            Card {currentIndex + 1} of {characters.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterFlashcardModal;
