import React, { useRef, useState } from "react";
import { X, Download, Upload } from "lucide-react";
import { StoredManga } from "../types";
import { importMangaList } from "../api";

interface SettingsModalProps {
  mangaList: StoredManga[];
  onClose: () => void;
  onRefresh: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ mangaList, onClose, onRefresh }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mangaList, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "manga_tracker_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setImporting(true);
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) {
          alert("Invalid backup file. Must be a JSON array.");
          return;
        }
        await importMangaList(json);
        alert("Import successful!");
        onRefresh();
        onClose();
      } catch (err) {
        console.error(err);
        alert("Failed to parse or import backup file.");
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>Settings & Data</h3>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Export Backup</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Download your entire library to a JSON file.</p>
            </div>
            <button className="btn btn-primary" onClick={handleExport}>
              <Download size={18} /> Export
            </button>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Import Backup</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Restore your library from a JSON file.</p>
            </div>
            <button className="btn" style={{ background: 'var(--surface-light)', color: 'var(--text)' }} onClick={() => fileInputRef.current?.click()} disabled={importing}>
              <Upload size={18} /> {importing ? "Importing..." : "Import"}
            </button>
            <input 
              type="file" 
              accept=".json" 
              style={{ display: 'none' }} 
              ref={fileInputRef} 
              onChange={handleImport} 
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
