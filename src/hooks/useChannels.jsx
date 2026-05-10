import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { fetchChannels } from "../services/channelService.js";
import {
  buildSearchIndex,
  collectUniqueCountries,
  collectUniqueGenres,
  filterChannels,
} from "../utils/filterUtils.js";

export function useChannels() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);

  const loadChannels = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchChannels();
      setChannels(Array.isArray(data) ? data : []);
    } catch (err) {
      setChannels([]);
      setError(err?.message || "Unable to load channels");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const indexedChannels = useMemo(
    () => channels.map((channel) => ({
      ...channel,
      searchIndex: buildSearchIndex(channel),
    })),
    [channels],
  );

  const filteredChannels = useMemo(
    () =>
      filterChannels(indexedChannels, {
        searchTerm: deferredSearchTerm,
        country: selectedCountry,
        genres: selectedGenres,
      }),
    [indexedChannels, deferredSearchTerm, selectedCountry, selectedGenres],
  );

  const availableGenres = useMemo(() => collectUniqueGenres(indexedChannels), [indexedChannels]);
  const availableCountries = useMemo(
    () => collectUniqueCountries(channels),
    [channels],
  );

  const updateSearch = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const setCountry = useCallback((countryCode) => {
    setSelectedCountry((currentCountry) =>
      currentCountry === countryCode ? "" : countryCode,
    );
  }, []);

  const toggleGenre = useCallback((genre) => {
    setSelectedGenres((currentGenres) =>
      currentGenres.includes(genre)
        ? currentGenres.filter((item) => item !== genre)
        : [...currentGenres, genre],
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCountry("");
    setSelectedGenres([]);
  }, []);

  return {
    channels,
    filteredChannels,
    loading,
    error,
    searchTerm,
    selectedCountry,
    selectedGenres,
    availableGenres,
    availableCountries,
    loadChannels,
    updateSearch,
    setCountry,
    toggleGenre,
    clearFilters,
  };
}
