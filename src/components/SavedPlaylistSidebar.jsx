import { memo, useMemo } from "react";
import { useTVFocus } from "../hooks/useTVFocus.jsx";
import Sidebar from "./ui/Sidebar.jsx";

function SavedPlaylistSidebar({ playlists, activeId, onSelect }) {
  const { getItemProps, handleKeyDown } = useTVFocus({
    itemCount: playlists.length,
    columns: 1,
    orientation: "vertical",
    storageKey: "saved-playlist-sidebar",
    onActivate: (index) => onSelect(playlists[index]),
  });

  const items = useMemo(
    () =>
      playlists.map((playlist, index) => ({
        label: playlist.label,
        active: activeId === playlist.id,
        badge: `${playlist.channelCount} channels`,
        onClick: () => onSelect(playlist),
        focusProps: getItemProps(index),
      })),
    [playlists, activeId, getItemProps, onSelect],
  );

  return (
    <Sidebar
      title="Saved playlists"
      items={items}
      className="max-w-full"
      onKeyDown={handleKeyDown}
    />
  );
}

export default memo(SavedPlaylistSidebar);
