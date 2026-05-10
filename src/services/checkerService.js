const CHECK_API_ENDPOINT = "/api/check-stream";

function delay(ms = 50) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function checkStreamUrl(url, timeout = 10000) {
  return new Promise((resolve) => {
    const video = document.createElement("video");

    let resolved = false;

    const cleanup = () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    };

    const finish = (result) => {
      if (resolved) return;

      resolved = true;

      clearTimeout(timer);
      cleanup();

      resolve(result);
    };

    const timer = setTimeout(() => {
      finish({
        status: "Not Working",
        error: "Timeout",
      });
    }, timeout);

    video.muted = true;
    video.autoplay = false;
    video.playsInline = true;
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      finish({
        status: "Available",
        error: null,
      });
    };

    video.oncanplay = () => {
      finish({
        status: "Available",
        error: null,
      });
    };

    video.onerror = () => {
      finish({
        status: "Not Working",
        error: "Playback failed",
      });
    };

    video.src = url;
    video.load();
  });
}

export async function checkChannelQueue(channels, options = {}) {
  const { concurrency = 3, onUpdate = () => {} } = options;

  if (!Array.isArray(channels)) return [];

  const results = channels.map((c) => ({
    ...c,
    status: "Not Started",
  }));

  let nextIndex = 0;

  const worker = async () => {
    while (true) {
      const currentIndex = nextIndex++;

      if (currentIndex >= results.length) break;

      const channel = results[currentIndex];

      onUpdate(currentIndex, "Checking...");

      try {
        const response = await checkStreamUrl(channel.url);

        const updatedStatus =
          response.status === "Available"
            ? "Available"
            : "Not Working";

        const updatedChannel = {
          ...channel,
          status: updatedStatus,
          statusCode: response.statusCode,
          error: response.error,
        };

        results[currentIndex] = updatedChannel;

        onUpdate(currentIndex, updatedStatus, response);
      } catch (error) {
        results[currentIndex] = {
          ...channel,
          status: "Not Working",
          error: error.message,
        };

        onUpdate(currentIndex, "Not Working", {
          error: error.message,
        });
      }

      await delay(30);
    }
  };

  await Promise.all(
    Array.from({ length: concurrency }, () => worker())
  );

  return results;
}
