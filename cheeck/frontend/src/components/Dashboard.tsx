import React, { useState, useEffect, useMemo, useRef } from "react";
import { getStats } from "../api";
import { BookOpen, CheckCircle, TrendingUp, Flame, Download } from "lucide-react";
import { StoredManga } from "../types";
import html2canvas from 'html2canvas';

interface DashboardProps {
  mangaList: StoredManga[];
}

const Dashboard: React.FC<DashboardProps> = ({ mangaList }) => {
  const [stats, setStats] = useState<{ 
    totalManga: number; 
    completedManga: number; 
    totalChaptersRead: number;
    readingHistory: { date: string; count: number }[]
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getStats();
        setStats(response.data);
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const rpgAura = useMemo(() => {
    if (!mangaList || mangaList.length === 0) return { class: '', title: 'Novice Reader', color: 'var(--text-muted)' };

    const genreCounts: Record<string, number> = {};
    mangaList.forEach(m => {
      if (m.genres) {
        m.genres.forEach(g => {
          genreCounts[g.name] = (genreCounts[g.name] || 0) + 1;
        });
      }
    });

    let topGenre = "";
    let maxCount = 0;
    for (const name in genreCounts) {
      if (genreCounts[name] > maxCount) {
        maxCount = genreCounts[name];
        topGenre = name;
      }
    }

    if (maxCount === 0) return { class: '', title: 'Wandering Reader', color: 'var(--text-muted)' };

    const lowerGenre = topGenre.toLowerCase();
    if (lowerGenre.includes("action") || lowerGenre.includes("shounen")) {
      return { class: 'aura-fire', title: 'Battle Junkie', color: '#ef4444' };
    }
    if (lowerGenre.includes("romance") || lowerGenre.includes("shoujo")) {
      return { class: 'aura-petal', title: 'Hopeless Romantic', color: '#ec4899' };
    }
    if (lowerGenre.includes("horror") || lowerGenre.includes("thriller") || lowerGenre.includes("mystery")) {
      return { class: 'aura-mist', title: 'Dark Scholar', color: '#8b5cf6' };
    }
    if (lowerGenre.includes("comedy") || lowerGenre.includes("slice of life")) {
      return { class: 'aura-light', title: 'Joyful Soul', color: '#eab308' };
    }
    
    // Default fallback
    return { class: 'aura-mist', title: 'Avid Explorer', color: '#8b5cf6' };
  }, [mangaList]);

  const dashboardRef = useRef<HTMLDivElement>(null);
  const handleDownload = async () => {
    if (dashboardRef.current) {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = 'manga-rpg-stats.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  if (loading) return <div className="text-center mt-4">Loading dashboard...</div>;
  if (!stats) return <div className="text-center mt-4 text-danger">Failed to load statistics.</div>;

  return (
    <div className="position-relative">
      <div className="text-end mb-3">
        <button onClick={handleDownload} className="btn btn-outline-primary" style={{ borderRadius: 'var(--radius-full)' }}>
          <Download size={16} className="me-2" /> Export RPG Card
        </button>
      </div>
      <div ref={dashboardRef} className={rpgAura.class} style={{ animation: 'fadeIn 0.5s ease-out', padding: '2rem 1rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Your Reading Statistics</h2>
        {rpgAura.title !== 'Novice Reader' && (
          <p style={{ marginTop: '0.5rem', color: rpgAura.color, fontWeight: 'bold', fontSize: '1.2rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            <Flame size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}/> 
            Class: {rpgAura.title} (Dominant Genre: {mangaList.length > 0 ? "Analyzed" : "Unknown"})
          </p>
        )}
      </div>
      <div className="row" style={{ gap: '1rem', justifyContent: 'center' }}>
        
        <div className="col-md-4" style={{ padding: '0' }}>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', height: '100%' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '1rem', borderRadius: 'var(--radius-lg)', color: 'var(--primary)' }}>
              <BookOpen size={32} />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalManga}</div>
              <div className="text-muted">Total Manga</div>
            </div>
          </div>
        </div>

        <div className="col-md-4" style={{ padding: '0' }}>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', height: '100%' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: 'var(--radius-lg)', color: 'var(--success)' }}>
              <CheckCircle size={32} />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.completedManga}</div>
              <div className="text-muted">Completed</div>
            </div>
          </div>
        </div>

        <div className="col-md-4" style={{ padding: '0' }}>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', height: '100%' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.2)', padding: '1rem', borderRadius: 'var(--radius-lg)', color: 'var(--accent)' }}>
              <TrendingUp size={32} />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalChaptersRead}</div>
              <div className="text-muted">Chapters Read</div>
            </div>
          </div>
        </div>

      </div>
    </div>
    </div>
  );
};

export default Dashboard;
