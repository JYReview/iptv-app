import React, { useEffect, useState, useRef } from "react";
import Hls from "hls.js";

// Player component for modal
function Player({ url }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!url) return;

    const video = videoRef.current;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      return () => hls.destroy();
    }
  }, [url]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      className="w-full h-[480px] bg-black rounded-md"
    />
  );
}

export default function IPTVApp() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStream, setCurrentStream] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [playlistUrl, setPlaylistUrl] = useState(
    "https://iptv-org.github.io/iptv/languages/zho.m3u",
  );
  const pageSize = 20;

  // Parse M3U
  const parseM3U = (text) => {
    const lines = text.split("\n");
    const result = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("#EXTINF")) {
        const name = lines[i].split(",")[1] || "Unknown";
        const url = lines[i + 1];
        if (url && url.startsWith("http")) {
          result.push({ name, url, status: "Not Started" });
        }
      }
    }
    return result;
  };

  // Load playlist
  const loadPlaylist = async () => {
    setLoading(true);
    const res = await fetch(playlistUrl);
    const text = await res.text();
    const parsed = parseM3U(text);
    setChannels(parsed);
    setLoading(false);
  };

  // Check a single stream
  const checkStream = async (channel, index) => {
    updateStatus(index, "Checking...");

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      await fetch(channel.url, {
        method: "GET",
        mode: "no-cors",
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Assume it's available if no error thrown
      updateStatus(index, "Available");
    } catch {
      updateStatus(index, "Not Working");
    }
  };

  // Update status dynamically
  const updateStatus = (index, status) => {
    setChannels((prev) => {
      const newList = [...prev];
      newList[index] = { ...newList[index], status };
      return newList;
    });
  };

  // Check all streams concurrently
  const checkAllStreams = async () => {
    channels.forEach((ch, idx) => {
      checkStream(ch, idx);
    });
  };

  useEffect(() => {
    loadPlaylist();
  }, []);

  // Filtered by search and status
  const filtered = channels.filter(
    (ch) =>
      (ch.name.toLowerCase().includes(search.toLowerCase()) ||
        ch.status.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === "" || ch.status === statusFilter),
  );

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Modern table styling using Tailwind
  return (
    <div className="p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6">IPTV App - Stream Checker</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          placeholder="M3U Playlist URL"
          className="border rounded px-3 py-2 flex-grow"
        />
        <button
          onClick={loadPlaylist}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Load Playlist
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={checkAllStreams}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Check All Streams
        </button>
        <input
          type="text"
          placeholder="Search by name or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 flex-grow"
        />
      </div>

      <div className="flex gap-2 mb-4">
        {["Not Started", "Checking...", "Available", "Not Working"].map(
          (status) => (
            <button
              key={status}
              className={`px-3 py-1 rounded ${statusFilter === status ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
              onClick={() =>
                setStatusFilter(statusFilter === status ? "" : status)
              }
            >
              {status}
            </button>
          ),
        )}
      </div>

      <div className="overflow-auto border rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Channel Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginated.map((ch, idx) => (
              <tr
                key={idx}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setCurrentStream(ch.url);
                  setModalOpen(true);
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                  {ch.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {ch.status === "Checking..." ? (
                    <span className="text-blue-500">{ch.status}</span>
                  ) : ch.status === "Available" ? (
                    <span className="text-green-600">{ch.status}</span>
                  ) : ch.status === "Not Working" ? (
                    <span className="text-red-600">{ch.status}</span>
                  ) : (
                    <span className="text-gray-500">{ch.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex justify-between">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
        >
          Prev
        </button>
        <span className="px-2 py-1">
          Page {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
        >
          Next
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="bg-white p-4 rounded w-11/12 md:w-3/4 max-w-3xl">
          <button
            onClick={() => setModalOpen(false)}
            className="mb-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Close
          </button>
          {currentStream && <Player url={currentStream} />}
        </div>
      )}
    </div>
  );
}
