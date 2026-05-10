export function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

export function buildSearchIndex(channel) {
  const haystack = [
    channel.name,
    channel.description,
    channel.country,
    channel.countryName,
    ...(channel.categories || []),
    ...(channel.language ? [channel.language] : []),
    ...(channel.alt_names || []),
  ]
    .filter(Boolean)
    .join(" ");

  return normalizeText(haystack);
}

export function searchMatches(channel, searchTerm) {
  const normalizedSearch = normalizeText(searchTerm);
  if (!normalizedSearch) return true;

  const haystack = channel.searchIndex || buildSearchIndex(channel);
  return haystack.includes(normalizedSearch);
}

export function filterByCountry(channel, countryCode) {
  if (!countryCode) return true;
  return channel.country?.toLowerCase() === countryCode.toLowerCase();
}

export function filterByGenres(channel, genres = []) {
  if (!genres?.length) return true;
  if (!Array.isArray(channel.categories)) return false;
  const activeGenres = genres.map(normalizeText);
  return channel.categories.some((category) =>
    activeGenres.includes(normalizeText(category)),
  );
}

export function filterChannels(channels, { searchTerm = "", country = "", genres = [] } = {}) {
  if (!Array.isArray(channels)) return [];

  return channels.filter((channel) =>
    searchMatches(channel, searchTerm) &&
    filterByCountry(channel, country) &&
    filterByGenres(channel, genres),
  );
}

export function collectUniqueGenres(channels) {
  if (!Array.isArray(channels)) return [];
  const genreSet = new Set();

  channels.forEach((channel) => {
    (channel.categories || []).forEach((genre) => {
      if (genre) genreSet.add(normalizeText(genre));
    });
  });

  return Array.from(genreSet).sort();
}

export function collectUniqueCountries(channels) {
  if (!Array.isArray(channels)) return [];
  const countryMap = new Map();

  channels.forEach((channel) => {
    if (channel.country) {
      countryMap.set(channel.country.toUpperCase(), channel.countryName || channel.country.toUpperCase());
    }
  });

  return Array.from(countryMap.entries()).map(([code, label]) => ({ code, label }));
}
