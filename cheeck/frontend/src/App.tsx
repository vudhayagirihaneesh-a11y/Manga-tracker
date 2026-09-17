import React, { useState, useEffect } from "react";
import MangaList from "./components/MangaList";
import Search from "./components/Search";
import Dashboard from "./components/Dashboard";
import TierList from "./components/TierList";
import Discover from "./components/Discover";
import Roulette from "./components/Roulette";
import SettingsModal from "./components/SettingsModal";
import { getMangaList } from "./api";
import EditMangaModal from "./components/EditMangaModal";
import { StoredManga } from "./types";
import { BookOpen, Search as SearchIcon, LayoutDashboard, ListFilter, Settings, Compass, Dices, Skull } from "lucide-react";
import Graveyard from "./components/Graveyard";

function App() {
  const [activeTab, setActiveTab] = useState<"library" | "search" | "dashboard" | "tierlist" | "discover" | "roulette" | "graveyard">("library");
  const [mangaList, setMangaList] = useState<StoredManga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingManga, setEditingManga] = useState<StoredManga | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const fetchMangaList = async () => {
    try {
      setLoading(true);
      const response = await getMangaList();
      setMangaList(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching manga list", error);
      setError("Failed to fetch your manga list. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMangaList();
  }, []);

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="glass-card" style={{ margin: '1rem', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '1rem', zIndex: 50 }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0, background: 'linear-gradient(90deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Manga Tracker
        </h1>
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            className={`btn ${activeTab === 'library' ? 'btn-primary' : ''}`}
            style={{ background: activeTab !== 'library' ? 'transparent' : '', color: activeTab !== 'library' ? 'var(--text-muted)' : '' }}
            onClick={() => setActiveTab('library')}
          >
            <BookOpen size={18} /> Library
          </button>
          <button
            className={`btn ${activeTab === 'tierlist' ? 'btn-primary' : ''}`}
            style={{ background: activeTab !== 'tierlist' ? 'transparent' : '', color: activeTab !== 'tierlist' ? 'var(--text-muted)' : '' }}
            onClick={() => setActiveTab('tierlist')}
          >
            <ListFilter size={18} /> Tier List
          </button>
          <button
            className={`btn ${activeTab === 'discover' ? 'btn-primary' : ''}`}
            style={{ background: activeTab !== 'discover' ? 'transparent' : '', color: activeTab !== 'discover' ? 'var(--text-muted)' : '' }}
            onClick={() => setActiveTab('discover')}
          >
            <Compass size={18} /> Discover
          </button>
          <button
            className={`btn ${activeTab === 'roulette' ? 'btn-primary' : ''}`}
            style={{ background: activeTab !== 'roulette' ? 'transparent' : '', color: activeTab !== 'roulette' ? 'var(--text-muted)' : '' }}
            onClick={() => setActiveTab('roulette')}
          >
            <Dices size={18} /> Roulette
          </button>
          <button
            className={`btn ${activeTab === 'search' ? 'btn-primary' : ''}`}
            style={{ background: activeTab !== 'search' ? 'transparent' : '', color: activeTab !== 'search' ? 'var(--text-muted)' : '' }}
            onClick={() => setActiveTab('search')}
          >
            <SearchIcon size={18} /> Search
          </button>
          <button
            className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : ''}`}
            style={{ background: activeTab !== 'dashboard' ? 'transparent' : '', color: activeTab !== 'dashboard' ? 'var(--text-muted)' : '' }}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button
            className={`btn ${activeTab === 'graveyard' ? 'btn-primary' : ''}`}
            style={{ background: activeTab !== 'graveyard' ? 'transparent' : '', color: activeTab !== 'graveyard' ? 'var(--text-muted)' : '' }}
            onClick={() => setActiveTab('graveyard')}
          >
            <Skull size={18} /> Graveyard
          </button>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }}></div>
          <button className="btn-icon" onClick={() => setShowSettings(true)}>
            <Settings size={20} />
          </button>
        </nav>
      </header>

      <main className="container" style={{ flex: 1, padding: '1rem 0' }}>
        {activeTab === 'library' && (
          <MangaList
            mangaList={mangaList}
            loading={loading}
            error={error}
            onEdit={setEditingManga}
            onMangaDeleted={fetchMangaList}
          />
        )}

        {activeTab === 'discover' && (
          <Discover onMangaAdded={() => { fetchMangaList(); setActiveTab('library'); }} mangaList={mangaList} />
        )}

        {activeTab === 'roulette' && (
          <Roulette mangaList={mangaList} />
        )}

        {activeTab === 'search' && (
          <Search onMangaAdded={() => { fetchMangaList(); setActiveTab('library'); }} mangaList={mangaList} />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard mangaList={mangaList} />
        )}

        {activeTab === 'tierlist' && (
          <TierList mangaList={mangaList} />
        )}

        {activeTab === 'graveyard' && (
          <Graveyard mangaList={mangaList} onMangaUpdated={fetchMangaList} />
        )}
      </main>

      {editingManga && (
        <EditMangaModal
          manga={editingManga}
          onClose={() => setEditingManga(null)}
          onMangaUpdated={() => {
            setEditingManga(null);
            fetchMangaList();
          }}
        />
      )}

      {showSettings && (
        <SettingsModal
          mangaList={mangaList}
          onClose={() => setShowSettings(false)}
          onRefresh={fetchMangaList}
        />
      )}
    </div>
  );
}

export default App;
