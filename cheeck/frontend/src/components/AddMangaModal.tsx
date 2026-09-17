import React, { useState } from "react";
import { addManga } from "../api";
import { JikanManga, StoredManga } from "../types";
import { X } from "lucide-react";
import ImageFallback from "./ImageFallback";

interface AddMangaModalProps {
  manga: JikanManga;
  onClose: () => void;
  onMangaAdded: () => void;
  mangaList: StoredManga[];
}

const AddMangaModal: React.FC<AddMangaModalProps> = ({ manga, onClose, onMangaAdded, mangaList }) => {
  const [status, setStatus] = useState("Reading");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (mangaList.some((item) => item.mal_id === manga.mal_id)) {
        alert(`${manga.title} is already in your list.`);
        onClose();
        return;
      }

      const newManga = {
        mal_id: manga.mal_id,
        title: manga.title,
        image_url: manga.images?.jpg?.image_url || "",
        status: status,
        chapters_read: 0,
        total_chapters: manga.chapters || null,
        rating: 0,
        notes: "",
        tags: [],
        genres: manga.genres || []
      };
      await addManga(newManga);
      onMangaAdded();
      onClose();
    } catch (error) {
      console.error("Error adding manga", error);
      alert("Failed to add manga. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!manga) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Add to Library</h3>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          <ImageFallback 
            src={manga.images?.jpg?.image_url} 
            alt={manga.title} 
            style={{ width: "120px", height: "180px", objectFit: "cover", borderRadius: "var(--radius-md)", boxShadow: 'var(--shadow-md)' }} 
            width="120"
            height="180"
          />
          <div style={{ flex: 1 }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>{manga.title}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status</label>
              <select
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="Plan to Read">Plan to Read</option>
                <option value="Reading">Reading</option>
                <option value="Completed">Completed</option>
                <option value="On-Hold">On-Hold</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>
            {manga.chapters && (
              <p className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>Total Chapters: {manga.chapters}</p>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }} onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Add to Library"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMangaModal;
