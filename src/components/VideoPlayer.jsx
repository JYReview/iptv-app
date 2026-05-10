import { memo, useEffect, useMemo, useState } from "react";
import { useHlsPlayer } from "../hooks/useHlsPlayer.jsx";
import { Play, Pause, SkipBack, SkipForward, Maximize } from "lucide-react";

const controlButton =
  "flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20";

function VideoPlayer({ src, isLive, title = "Live stream" }) {
  const {
    videoRef,
    isLoading,
    isPlaying,
    error,
    togglePlay,
    rewind,
    forward,
    enterFullscreen,
  } = useHlsPlayer({ source: src });

  const loadingLabel = useMemo(
    () => (isLoading ? "Loading stream..." : "Ready to play"),
    [isLoading],
  );

  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (!showControls) return undefined;
    const timeout = window.setTimeout(() => setShowControls(false), 4000);
    return () => window.clearTimeout(timeout);
    
  }, [showControls]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-slate-950">
      <div className="relative aspect-video bg-black">
        {/* VIDEO */}
        <video
          ref={videoRef}
          className="h-full w-full bg-black object-contain"
          onClick={() => setShowControls(true)}
          onPlay={() => setShowControls(true)}
          onPause={() => setShowControls(true)}
          playsInline
          preload="metadata"
          controls={false}
        />

        {/* TOP OVERLAY */}
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-3">
          <div className="rounded-lg bg-black/50 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur-md">
            {title}
          </div>

          <div className="rounded-lg bg-black/50 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur-md">
            {loadingLabel}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-center">
              <p className="text-sm font-semibold text-red-400">Stream Error</p>

              <p className="mt-2 text-sm text-slate-300">{error}</p>
            </div>
          </div>
        )}

        {/* CONTROLS */}
        {showControls && !error && (
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center justify-center gap-3">
              {!isLive && (
                <button
                  type="button"
                  onClick={rewind}
                  className={controlButton}
                >
                  <SkipBack size={18} />
                </button>
              )}

              <button
                type="button"
                onClick={togglePlay}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition hover:scale-105"
              >
                {isPlaying ? (
                  <Pause size={18} />
                ) : (
                  <Play size={18} fill="currentColor" />
                )}
              </button>

              {!isLive && (
                <button
                  type="button"
                  onClick={forward}
                  className={controlButton}
                >
                  <SkipForward size={18} />
                </button>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-slate-300">
                {isPlaying ? "LIVE" : "Paused"}
              </div>

              <button
                type="button"
                onClick={enterFullscreen}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <Maximize size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(VideoPlayer);
