import { useState } from "react";
import SectionTitle from "../components/ui/SectionTitle.jsx";
import FilterPanel from "../components/FilterPanel.jsx";
import ChannelGrid from "../components/ChannelGrid.jsx";
import NowPlayingPanel from "../components/NowPlayingPanel.jsx";
import LoadingSkeleton from "../components/ui/LoadingSkeleton.jsx";
import Card from "../components/ui/Card.jsx";
import { useChannels } from "../hooks/useChannels.jsx";
import { useFavourites } from "../hooks/useFavourites.jsx";
import { useTVFocus } from "../hooks/useTVFocus.jsx";

export default function Home() {
  const {
    filteredChannels,
    loading,
    error,
    searchTerm,
    selectedCountry,
    selectedGenres,
    availableGenres,
    availableCountries,
    updateSearch,
    setCountry,
    toggleGenre,
    clearFilters,
  } = useChannels();

  const { favouritesSet, toggleFavourite } = useFavourites();
  const [activeChannel, setActiveChannel] = useState(null);

  const {
    getItemProps: getChannelItemProps,
    handleKeyDown: handleChannelGridKeyDown,
  } = useTVFocus({
    itemCount: filteredChannels.length,
    columns: 3,
    orientation: "grid",
    storageKey: "home-channel-grid",
    onActivate: (index) => setActiveChannel(filteredChannels[index]),
  });

  return (
    <div className="grid gap-8 lg:grid-cols-3 xl:grid-cols-4">
      <div className="space-y-6 lg:col-span-2 xl:col-span-3">
        {/* <SectionTitle
          subtitle="Browse channels"
          title="Your smart IPTV dashboard"
          description="Search, filter, and save favourites. Tap a channel to launch the player and enjoy a premium streaming experience built for TV screens."
        /> */}

        <FilterPanel
          searchTerm={searchTerm}
          onSearchChange={updateSearch}
          genres={availableGenres}
          selectedGenres={selectedGenres}
          onToggleGenre={toggleGenre}
          countries={availableCountries}
          selectedCountry={selectedCountry}
          onCountryChange={setCountry}
          onClearFilters={clearFilters}
        />

        <Card>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Channel library</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {loading ? "Loading channels" : `${filteredChannels.length} channels available`}
              </p>
            </div>
            <p className="text-sm text-slate-400">
              Use search and filters to refine your list.
            </p>
          </div>

          {loading ? (
            <LoadingSkeleton rows={4} />
          ) : error ? (
            <Card className="border-red-500/10 bg-red-500/5">
              <p className="font-semibold text-red-300">Unable to load channels</p>
              <p className="mt-2 text-sm text-slate-300">{error}</p>
            </Card>
          ) : (
            <ChannelGrid
              channels={filteredChannels}
              favouritesSet={favouritesSet}
              onSelectChannel={setActiveChannel}
              onToggleFavourite={toggleFavourite}
              selectedChannelId={activeChannel?.id}
              getItemProps={getChannelItemProps}
              onKeyDown={handleChannelGridKeyDown}
            />
          )}
        </Card>
      </div>

      <div className="lg:col-span-1">
        <NowPlayingPanel
          channel={activeChannel}
          isFavourite={activeChannel ? favouritesSet.has(activeChannel.id) : false}
          onToggleFavourite={toggleFavourite}
        />
      </div>
    </div>
  );
}
