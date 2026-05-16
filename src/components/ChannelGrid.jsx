import { memo, useCallback } from "react";
import ChannelCard from "./ChannelCard.jsx";

function ChannelGrid({
  channels,
  favouritesSet,
  onSelectChannel,
  onToggleFavourite,
  selectedChannelId,
  getItemProps,
  onKeyDown,
}) {
  const handleSelect = useCallback(
    (channel) => () => {
      console.log("Selected channel:", channel);
      onSelectChannel(channel);
    },
    [onSelectChannel],
  );

  const handleToggleFavourite = useCallback(
    (channelId) => () => onToggleFavourite(channelId),
    [onToggleFavourite],
  );

  if (!channels.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-6 text-center text-slate-400 sm:p-8">
        No channels match the current filters.
      </div>
    );
  }

  return (
    <div
      className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 max-h-[60vh] overflow-y-auto pr-2"
      onKeyDown={onKeyDown}
    >
      {channels.map((channel, index) => (
        <ChannelCard
          key={channel.id}
          title={channel.name}
          logo={channel.logo}
          subtitle={`${channel.countryName} · ${channel.categories.join(", ")}`}
          badge={favouritesSet.has(channel.id) ? "Favourite" : undefined}
          onClick={handleSelect(channel)}
          actionLabel={favouritesSet.has(channel.id) ? "Unsave" : "Save"}
          onActionClick={handleToggleFavourite(channel.id)}
          active={selectedChannelId === channel.id}
          focusProps={getItemProps?.(index)}
        />
      ))}
    </div>
  );
}

export default memo(ChannelGrid);
