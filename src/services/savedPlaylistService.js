import { readJson, writeJson } from "./storageService.js";
import { fetchCheckerSources } from "./channelService.js";

const STORAGE_KEY = "iptv_saved_playlists";

export async function loadSavedPlaylists() {
  const data = readJson(STORAGE_KEY, []);
  const urls = await fetchCheckerSources();

  const initialData = urls.map((item, index) => ({
    id: `source-${index}`,
    label: "Source Playlist",
    url: item.url,
    createdAt: Date.now(),
    channelCount: 0,
    isSystem: true,
  }));

  return [...initialData, ...data];
}

export function savePlaylist(url, label, channels = []) {
  const playlists = readJson(STORAGE_KEY, []);
  const timestamp = Date.now();
  const id = `${timestamp}-${Math.random().toString(36).slice(2, 8)}`;
  const item = {
    id,
    label: label || `Playlist ${playlists.length + 1}`,
    url,
    createdAt: timestamp,
    channelCount: channels.length,
  };

  const updated = [item, ...playlists.filter((playlist) => playlist.url !== url)];
  writeJson(STORAGE_KEY, updated);
  return updated;
}

export function deletePlaylist(id) {
  const playlists = readJson(STORAGE_KEY, []);
  const updated = playlists.filter((item) => item.id !== id);
  writeJson(STORAGE_KEY, updated);
  return updated;
}

export function findPlaylist(id) {
  return readJson(STORAGE_KEY, []).find((item) => item.id === id) || null;
}
