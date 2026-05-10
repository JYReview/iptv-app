import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export function useHlsPlayer({ source }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const nativeListenersRef = useRef({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);

  const initializePlayer = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !source) return;

    setError(null);
    setIsLoading(true);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      const handleCanPlay = () => setIsLoading(false);
      const handleError = () => {
        setError("Playback error");
        setIsLoading(false);
      };

      nativeListenersRef.current = { handleCanPlay, handleError };
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("error", handleError);
      video.src = source;
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        autoStartLoad: true,
        manifestLoadingTimeOut: 10000,
        fragLoadingTimeOut: 20000,
      });

      hlsRef.current = hls;
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(source);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError(
            data.type === Hls.ErrorTypes.NETWORK_ERROR
              ? "Stream network failure"
              : "Playback error",
          );
          hls.destroy();
          hlsRef.current = null;
        }
      });
    } else {
      setError("HLS playback is not supported in this browser.");
      setIsLoading(false);
    }
  }, [source]);

  const cleanup = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const video = videoRef.current;
    if (video && nativeListenersRef.current.handleCanPlay) {
      video.removeEventListener(
        "canplay",
        nativeListenersRef.current.handleCanPlay,
      );
      video.removeEventListener(
        "error",
        nativeListenersRef.current.handleError,
      );
      nativeListenersRef.current = {};
    }

    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    initializePlayer();
    return cleanup;
  }, [initializePlayer, cleanup]);

  const play = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      await video.play();
      setIsPlaying(true);
    } catch (err) {
      setError("Playback could not start.");
    }
  }, []);

  const pause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      play();
    } else {
      pause();
    }
  }, [play, pause]);

  const seek = useCallback((seconds) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(
      0,
      Math.min(video.duration || 0, video.currentTime + seconds),
    );
  }, []);

  const rewind = useCallback(() => seek(-10), [seek]);
  const forward = useCallback(() => seek(10), [seek]);

  const enterFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const doc = document;

    // If already in fullscreen → exit
    if (doc.fullscreenElement) {
      const exit =
        doc.exitFullscreen ||
        doc.webkitExitFullscreen ||
        doc.mozCancelFullScreen ||
        doc.msExitFullscreen;

      if (exit) exit.call(doc);
      return;
    }

    // Otherwise → enter fullscreen
    const element = video.parentElement || video;

    const request =
      element.requestFullscreen ||
      element.webkitRequestFullscreen ||
      element.mozRequestFullScreen ||
      element.msRequestFullscreen;

    if (request) request.call(element);
  }, []);

  return {
    videoRef,
    isLoading,
    isPlaying,
    error,
    play,
    pause,
    togglePlay,
    rewind,
    forward,
    enterFullscreen,
  };
}
