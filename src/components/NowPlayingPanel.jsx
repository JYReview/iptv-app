import { memo } from "react";
import SectionTitle from "./ui/SectionTitle.jsx";
import VideoPlayer from "./VideoPlayer.jsx";
import Card from "./ui/Card.jsx";

function NowPlayingPanel({ channel, isFavourite, onToggleFavourite }) {
  return (
    <section className="space-y-6">
      <Card>
        <SectionTitle
          subtitle="Currently playing"
          title={channel ? channel.name : "Select a channel to start streaming"}
          description={
            channel
              ? `${channel.countryName} · ${channel.categories.join(", ")}`
              : "Pick a stream from the list to launch the built-in player and keep favourites handy."
          }
        />
      </Card>

      {channel ? (
        <div className="space-y-4">
          <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm text-slate-400">Now playing</p>
              <p className="text-base font-semibold text-white">{channel.name}</p>
            </div>
            <button
              type="button"
              onClick={() => onToggleFavourite(channel.id)}
              className="w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-cyan-500/15 sm:w-auto"
            >
              {isFavourite ? "Remove favourite" : "Save favourite"}
            </button>
          </Card>
          <VideoPlayer src={channel.url} isLive={channel.isLive} title={channel.name} />
        </div>
      ) : (
        <Card className="grid min-h-80 place-items-center border-dashed">
          <p className="text-sm leading-6 text-slate-400">
            The player will appear here once you tap a channel card. Browse channels on the left, then start watching immediately.
          </p>
        </Card>
      )}
    </section>
  );
}

export default memo(NowPlayingPanel);
