export interface JikanManga {
  mal_id: number;
  title: string;
  synopsis: string | null;
  images: {
    jpg: {
      image_url: string;
    };
  };
  chapters: number | null;
  status: string;
  genres?: { mal_id: number, type: string, name: string, url: string }[];
}

export interface StoredManga {
  id: number; // Our DB id
  mal_id: number;
  title: string;
  image_url: string;
  total_chapters: number | null;
  status: string; // Reading status from user
  chapters_read: number;
  rating?: number;
  notes?: string;
  tags?: string[];
  genres?: { mal_id: number, type: string, name: string, url: string }[];
  last_updated?: number;
  reading_history?: { date: string; count: number }[];
  target_date?: string; // YYYY-MM-DD
  journal_entries?: { id: string, chapter: number, text: string, date: string }[];
  epitaph?: string;
}