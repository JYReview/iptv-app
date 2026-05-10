import { memo } from "react";
import FilterPill from "./ui/FilterPill.jsx";
import SearchBar from "./ui/SearchBar.jsx";
import Card from "./ui/Card.jsx";

function FilterPanel({
  searchTerm,
  onSearchChange,
  genres,
  selectedGenres,
  onToggleGenre,
  countries,
  selectedCountry,
  onCountryChange,
  onClearFilters,
}) {
  return (
    <Card className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Filter</p>
        <h2 className="text-xl font-semibold text-white">Find your next stream</h2>
        <p className="text-sm leading-6 text-slate-400">
          Search channels by name, country or genre, then tap a channel to play instantly.
        </p>
      </div>

      <SearchBar value={searchTerm} onChange={onSearchChange} placeholder="Search channels" />

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-slate-400/90">Genres</p>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <FilterPill
                key={genre}
                label={genre}
                active={selectedGenres.includes(genre)}
                onClick={() => onToggleGenre(genre)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-slate-400/90">Country</p>
          <div className="flex flex-wrap gap-2">
            {countries.map((country) => (
              <FilterPill
                key={country.code}
                label={country.label}
                active={selectedCountry === country.code}
                onClick={() => onCountryChange(country.code)}
              />
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClearFilters}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
      >
        Clear filters
      </button>
    </Card>
  );
}

export default memo(FilterPanel);
