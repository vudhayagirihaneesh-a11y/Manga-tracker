import axios from "axios";
import { JikanManga, StoredManga } from "./types";

const API_URL = "/api";

export const searchManga = (query: string) => {
  return axios.get<{ data: JikanManga[] }>(`${API_URL}/search/${query}`);
};

export const addManga = (manga: Omit<StoredManga, "id">) => {
  return axios.post<StoredManga>(`${API_URL}/manga`, manga);
};

export const importMangaList = (mangaList: StoredManga[]) => axios.post(`${API_URL}/manga/import`, mangaList);

export const getMangaList = () => {
  return axios.get<StoredManga[]>(`${API_URL}/manga`);
};

export const updateManga = (id: number, updates: Partial<Omit<StoredManga, "id" | "mal_id">>) => {
  return axios.put<StoredManga>(`${API_URL}/manga/${id}`, updates);
};

export const getStats = () => {
  return axios.get<{ totalManga: number; completedManga: number; totalChaptersRead: number; readingHistory: { date: string; count: number }[] }>(`${API_URL}/stats`);
};

export const deleteManga = (id: number) => {
  return axios.delete(`${API_URL}/manga/${id}`);
};
