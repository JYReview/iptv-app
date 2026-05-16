import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import FilterPill from "./ui/FilterPill.jsx";
import SearchBar from "./ui/SearchBar.jsx";
import StatusBadge from "./ui/StatusBadge.jsx";
import SavedPlaylistSidebar from "./SavedPlaylistSidebar.jsx";
import VideoPlayer from "./VideoPlayer.jsx";
import { parseM3UPlaylist } from "../utils/m3uParser.js";
import { checkChannelQueue } from "../services/checkerService.js";
import {
  deletePlaylist,
  loadSavedPlaylists,
  savePlaylist,
} from "../services/savedPlaylistService.js";
import { buildSearchIndex } from "../utils/filterUtils.js";
import { useTVFocus } from "../hooks/useTVFocus.jsx";

const STATUS_OPTIONS = [
  "Not Started",
  "Checking...",
  "Available",
  "Not Working",
];

function getPlaylistName(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return "Playlist";
  }
}

export default function IPTVChecker() {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [channels, setChannels] = useState([]);
  const [savedPlaylists, setSavedPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState(null);

  const statusUpdateQueue = useRef([]);
  const statusFlushTimer = useRef(null);

  useEffect(() => {
    const initialize = async () => {
      setSavedPlaylists(await loadSavedPlaylists());
    };
    initialize();

    return () => {
      if (statusFlushTimer.current) {
        window.clearTimeout(statusFlushTimer.current);
      }
    };
  }, []);

  const scheduleStatusUpdate = useCallback((index, status) => {
    statusUpdateQueue.current.push({ id: index, status });

    if (statusFlushTimer.current) return;

    statusFlushTimer.current = window.setTimeout(() => {
      const updates = [...statusUpdateQueue.current];

      statusUpdateQueue.current = [];
      statusFlushTimer.current = null;

      setChannels((previousChannels) => {
        const updatesMap = new Map(
          updates.map(({ id, status }) => [id, status]),
        );

        return previousChannels.map((channel) => {
          if (!updatesMap.has(channel.id)) return channel;

          return {
            ...channel,
            status: updatesMap.get(channel.id),
          };
        });
      });
    }, 100);
  }, []);

  const loadPlaylist = useCallback(
    async (url = playlistUrl) => {
      if (!url) return;
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url);
        const rawText = await response.text();
        const parsed = parseM3UPlaylist(rawText).map((entry) => ({
          ...entry,
          searchIndex: buildSearchIndex(entry),
          status: "Not Started",
        }));
        setChannels(parsed);
        setSelectedChannel(null);
        setSearch("");
        setStatusFilter("");
        setError(
          parsed.length === 0
            ? "Playlist did not contain valid channels."
            : null,
        );
        setPlaylistUrl(url);
      } catch (err) {
        setChannels([]);
        setSelectedChannel(null);
        setError("Unable to load playlist. Check the URL and try again.");
      } finally {
        setLoading(false);
      }
    },
    [playlistUrl],
  );

  const handleSavePlaylist = useCallback(() => {
    if (!playlistUrl || !channels.length) return;
    const updated = savePlaylist(
      playlistUrl,
      getPlaylistName(playlistUrl),
      channels,
    );
    setSavedPlaylists(updated);
  }, [channels, playlistUrl]);

  const handleSelectPlaylist = useCallback(
    (playlist) => {
      setSelectedPlaylistId(playlist.id);
      setPlaylistUrl(playlist.url);
      loadPlaylist(playlist.url);
    },
    [loadPlaylist],
  );

  const handleDeletePlaylist = useCallback(() => {
    if (!selectedPlaylistId) return;
    const updated = deletePlaylist(selectedPlaylistId);
    setSavedPlaylists(updated);
    setSelectedPlaylistId("");
  }, [selectedPlaylistId]);

  const deferredSearch = useDeferredValue(search);

  const filteredChannels = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();
    
    return channels.filter((channel) => {
      const matchesKeyword =
        normalizedSearch === ""
          ? true
          : channel.name?.toLowerCase().includes(normalizedSearch) ||
            channel.group?.toLowerCase().includes(normalizedSearch);

      const matchesStatus = !statusFilter || channel.status === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [channels, deferredSearch, statusFilter]);

  const { getItemProps: getRowProps, handleKeyDown: handleTableKeyDown } =
    useTVFocus({
      itemCount: filteredChannels.length,
      columns: 1,
      orientation: "vertical",
      storageKey: "checker-channel-table",
      onActivate: (index) => setSelectedChannel(filteredChannels[index]),
      onBack: () => window.history.back(),
    });

  const checkAllStreams = useCallback(async () => {
    if (!filteredChannels.length) return;
    setChecking(true);
    setError(null);

    await checkChannelQueue(filteredChannels, {
      concurrency: 3,
      onUpdate: scheduleStatusUpdate,
    });

    setChecking(false);
  }, [filteredChannels, scheduleStatusUpdate]);

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
      <aside className="space-y-6">
        <SavedPlaylistSidebar
          playlists={savedPlaylists}
          activeId={selectedPlaylistId}
          onSelect={handleSelectPlaylist}
        />
        <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-black/20">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">
            Playlist details
          </p>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p>
              Saved playlists remain in local storage and can be loaded from the
              sidebar.
            </p>
            <p className="flex flex-wrap gap-3">
              <span className="rounded-full bg-white/5 px-3 py-1">
                {channels.length} channels
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1">
                {selectedPlaylistId ? "Saved source" : "Live session"}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleDeletePlaylist}
            disabled={!selectedPlaylistId}
            className="mt-5 w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remove selected playlist
          </button>
        </div>
      </aside>

      <section className="space-y-6">
        <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
          <div className="grid gap-4 md:grid-cols-[1.5fr_0.9fr]">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">
                Playlist checker
              </p>
              <h1 className="text-2xl font-semibold text-white">
                Load an M3U playlist
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-400">
                Paste a playlist URL, parse channel metadata, and validate each
                stream without freezing the browser.
              </p>
              <button
                type="button"
                disabled={!channels.length || checking}
                onClick={checkAllStreams}
                className="mt-5 w-full rounded-full bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checking ? "Checking streams..." : "Validate all streams"}
              </button>
            </div>
            <div className="grid gap-3 rounded-[28px] border border-white/10 bg-slate-900/90 p-4">
              <input
                type="url"
                placeholder="https://example.com/playlist.m3u"
                value={playlistUrl}
                onChange={(event) => setPlaylistUrl(event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-black/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => loadPlaylist()}
                className="rounded-full bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Load playlist
              </button>
              <button
                type="button"
                onClick={handleSavePlaylist}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                Save playlist
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-1">
          <div className="space-y-5 rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">
                  Filters
                </p>
                <h2 className="text-lg font-semibold text-white">
                  Find channels quickly
                </h2>
              </div>
              {/* <p className="text-sm text-slate-400">
                Keyword search and status filters keep results sharp.
              </p> */}
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <FilterPill
                    key={status}
                    label={status}
                    active={statusFilter === status}
                    onClick={() =>
                      setStatusFilter(statusFilter === status ? "" : status)
                    }
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search channel name, group, or url"
              />
            </div>
          </div>

          {/* <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">
              Validation
            </p>
            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <p>
                Check all streams with an async queue so the interface remains
                responsive.
              </p>
              <p>Statuses update live as each channel is validated.</p>
            </div>
            <button
              type="button"
              disabled={!channels.length || checking}
              onClick={checkAllStreams}
              className="mt-5 w-full rounded-full bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {checking ? "Checking streams..." : "Validate all streams"}
            </button>
          </div> */}
        </div>

        <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">
                Now playing
              </p>
              <h2 className="text-lg font-semibold text-white">
                Tap a channel to preview
              </h2>
            </div>
            {selectedChannel ? (
              <div className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-300">
                {selectedChannel.name}
              </div>
            ) : null}
          </div>
          {selectedChannel ? (
            <div className="mt-5">
              <VideoPlayer
                src={selectedChannel.url}
                title={selectedChannel.name}
              />
            </div>
          ) : (
            <div className="mt-5 rounded-[28px] border border-dashed border-white/10 bg-slate-900/80 p-8 text-center text-slate-400">
              Select a channel from the table below to start playback in the
              embedded player.
            </div>
          )}
        </div>

        <div
          className="rounded-[32px] border border-white/10 bg-slate-950/80 shadow-xl shadow-black/20 scrollable max-h-[400px] overflow-y-auto"
          onKeyDown={handleTableKeyDown}
        >
          <table className="min-w-full border-separate border-spacing-0 text-left">
            <thead className="bg-slate-900/90 text-slate-300">
              <tr>
                <th className="px-4 py-4 text-xs uppercase tracking-[0.35em]">
                  Channel
                </th>
                <th className="px-4 py-4 text-xs uppercase tracking-[0.35em]">
                  Group
                </th>
                <th className="px-4 py-4 text-xs uppercase tracking-[0.35em]">
                  Status
                </th>
                <th className="px-4 py-4 text-xs uppercase tracking-[0.35em]">
                  Logo
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    Loading playlist...
                  </td>
                </tr>
              ) : filteredChannels.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    No channels match your current filters.
                  </td>
                </tr>
              ) : (
                filteredChannels.map((channel, index) => {
                  const rowProps = getRowProps?.(index) ?? {};
                  return (
                    <tr
                      key={channel.id}
                      className="border-t border-white/5 transition hover:bg-slate-900/80 focus-visible:ring-4 focus-visible:ring-cyan-400/55"
                      onClick={() => setSelectedChannel(channel)}
                      {...rowProps}
                    >
                      <td className="px-4 py-4">
                        <span className="text-left text-sm font-semibold text-white transition hover:text-cyan-300">
                          {channel.name}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-400">
                        {channel.group}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={channel.status} />
                      </td>
                      <td className="px-4 py-4">
                        {channel.logo ? (
                          <img
                            src={channel.logo}
                            alt={`${channel.name} logo`}
                            className="h-10 w-16 rounded-xl object-contain"
                          />
                        ) : (
                          <span className="inline-flex h-10 w-16 items-center justify-center rounded-xl bg-white/5 text-[11px] text-slate-500">
                            No logo
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
