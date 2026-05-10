import { useCallback, useEffect, useMemo, useState } from "react";
import { readJson, writeJson } from "../services/storageService.js";

const STORAGE_KEY = "iptv_favourites";

export function useFavourites() {
  const [favourites, setFavourites] = useState(() => readJson(STORAGE_KEY, []));

  useEffect(() => {
    writeJson(STORAGE_KEY, favourites);
  }, [favourites]);

  const addFavourite = useCallback((channelId) => {
    setFavourites((current) =>
      current.includes(channelId) ? current : [...current, channelId],
    );
  }, []);

  const removeFavourite = useCallback((channelId) => {
    setFavourites((current) =>
      current.filter((id) => id !== channelId),
    );
  }, []);

  const toggleFavourite = useCallback((channelId) => {
    setFavourites((current) =>
      current.includes(channelId)
        ? current.filter((id) => id !== channelId)
        : [...current, channelId],
    );
  }, []);

  const isFavourite = useCallback(
    (channelId) => favourites.includes(channelId),
    [favourites],
  );

  const favouritesSet = useMemo(() => new Set(favourites), [favourites]);

  return {
    favourites,
    favouritesSet,
    addFavourite,
    removeFavourite,
    toggleFavourite,
    isFavourite,
  };
}
