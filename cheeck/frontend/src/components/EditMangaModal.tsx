import React, { useState, useEffect } from "react";
import { updateManga } from "../api";
import { StoredManga } from "../types";
import { X, Save } from "lucide-react";
import { getColor } from "colorthief";
import ImageFallback from "./ImageFallback";
import { getValidImageUrl } from "../utils";

interface EditMangaModalProps {
  manga: StoredManga | null;
  onClose: () => void;
  onMangaUpdated: () => void;
}

const EditMangaModal: React.FC<EditMangaModalProps> = ({ manga, onClose, onMangaUpdated }) => {
  const [status, setStatus] = useState("");
  const [chaptersRead, setChaptersRead] = useState(0);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [targetDate, setTargetDate] = useState("");
  const [epitaph, setEpitaph] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ambientColor, setAmbientColor] = useState('rgba(139, 92, 246, 0.4)');

  useEffect(() => {
    if (manga) {
      setStatus(manga.status);
      setChaptersRead(manga.chapters_read);
      setRating(manga.rating || 0);
      setNotes(manga.notes || "");
      setTags(manga.tags || []);
      setTargetDate(manga.target_date || "");
      setEpitaph(manga.epitaph || "");
      setErrorMsg(null);

      // Extract color
      const validImgUrl = getValidImageUrl(manga.image_url);
      if (validImgUrl && !validImgUrl.startsWith("data:")) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = validImgUrl;
        img.onload = async () => {
          try {
            const color: any = await getColor(img);
            if (color && color.length >= 3) {
              setAmbientColor(`rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.5)`);
            }
          } catch (e) {
            console.log("Could not extract color, using default", e);
          }
        };
      }
    }
  }, [manga]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSave = async () => {
    if (saving) return;

    if (manga?.total_chapters && manga.total_chapters > 0 && chaptersRead > manga.total_chapters) {
      setErrorMsg(`Cannot exceed maximum chapter count (${manga.total_chapters}).`);
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      if (!manga) return;
      const updatedManga: Partial<StoredManga> = {
        status,
        chapters_read: chaptersRead,
        rating,
        notes,
        tags,
        target_date: targetDate,
        epitaph: epitaph
      };
      await updateManga(manga.id, updatedManga);
      onMangaUpdated();
    } catch (error) {
      console.error("Error updating manga", error);
      setErrorMsg("Failed to update manga. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!manga) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '800px', boxShadow: `0 0 80px ${ambientColor}` }}>

        {/* Cover Background Header */}
        <div style={{ position: 'relative', height: '150px', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
          {/* Blurred Background Wrapper */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundImage: `url(${getValidImageUrl(manga.image_url)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(20px) brightness(0.4)',
              transform: 'scale(1.1)'
            }}></div>
          </div>
          <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem', zIndex: 10 }}>
            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '1.5rem', display: 'flex', alignItems: 'flex-end', gap: '1.5rem', zIndex: 10 }}>
            <ImageFallback
              src={manga.image_url}
              alt={manga.title}
              style={{ width: "100px", height: "140px", objectFit: "cover", borderRadius: "var(--radius-sm)", boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transform: 'translateY(40px)' }}
              width="100"
              height="140"
            />
            <h3 style={{ margin: 0, fontSize: '1.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{manga.title}</h3>
          </div>
        </div>

        <div className="modal-body" style={{ paddingTop: '60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Status</label>
              <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)} style={{ cursor: 'pointer' }}>
                <option value="Plan to Read">Plan to Read</option>
                <option value="Reading">Reading</option>
                <option value="Completed">Completed</option>
                <option value="On-Hold">On-Hold</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>

            {(status === 'Reading' || status === 'Plan to Read') && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.5rem', display: 'block', fontWeight: 'bold' }}>
                  Target Finish Date (Pace Calculator)
                </label>
                <input
                  className="form-control"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  style={{ borderColor: 'var(--primary)', background: 'rgba(139, 92, 246, 0.05)' }}
                />
              </div>
            )}

            {status === 'Dropped' && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <label style={{ fontSize: '0.9rem', color: '#ef4444', marginBottom: '0.5rem', display: 'block', fontWeight: 'bold' }}>
                  The Graveyard Epitaph
                </label>
                <textarea
                  className="form-control"
                  value={epitaph}
                  onChange={(e) => setEpitaph(e.target.value)}
                  placeholder="Here lies this manga... dropped because..."
                  style={{ minHeight: '80px', borderColor: 'rgba(239, 68, 68, 0.5)', background: 'rgba(239, 68, 68, 0.05)' }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
                Chapters Read {manga.total_chapters ? `(Max: ${manga.total_chapters})` : ''}
              </label>
              <input
                className="form-control"
                type="number"
                value={chaptersRead}
                min="0"
                max={manga.total_chapters || undefined}
                onChange={(e) => {
                  let value = parseInt(e.target.value, 10);
                  if (isNaN(value)) value = 0;
                  setErrorMsg(null);
                  setChaptersRead(value);

                  if (manga.total_chapters && manga.total_chapters > 0) {
                    if (value >= manga.total_chapters) setStatus("Completed");
                    else if (status === "Completed") setStatus("Reading");
                  }
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Rating (0-10)</label>
              <input
                className="form-control"
                type="number"
                value={rating}
                min="0"
                max="10"
                onChange={(e) => {
                  let value = parseInt(e.target.value, 10);
                  if (isNaN(value)) value = 0;
                  if (value > 10) value = 10;
                  if (value < 0) value = 0;
                  setRating(value);
                }}
              />
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Personal Notes</label>
              <textarea
                className="form-control"
                style={{ flex: 1, minHeight: '100px', resize: 'none' }}
                placeholder="Write your thoughts here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>

            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Tags</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {tags.map((tag, idx) => (
                  <span key={idx} className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    {tag}
                    <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveTag(tag)} />
                  </span>
                ))}
              </div>
              <input
                className="form-control"
                type="text"
                placeholder="Type and press Enter to add tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>

          </div>

        </div>

        {errorMsg && (
          <div style={{ padding: '0 1.5rem', marginTop: '-1rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              {errorMsg}
            </div>
          </div>
        )}

        <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ width: '100%' }}>
            {saving ? "Saving..." : <><Save size={18} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMangaModal;
