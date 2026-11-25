import React, { useMemo, useRef, useState } from 'react';
import {
  ExternalLink,
  Music2,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { FavoriteTrack, MusicPlatform, TrackTag } from '../types';

const TRACK_TAGS: TrackTag[] = ['Phonk', 'Workout', 'Focus', 'Chill'];

const TAG_TEXT_STYLE: Record<TrackTag, string> = {
  Phonk: 'text-[#fb7185]',
  Workout: 'text-[#f59e0b]',
  Focus: 'text-sky-400',
  Chill: 'text-emerald-400',
};

export function buildMusicSearchUrl(
  query: string,
  platform: MusicPlatform
): string {
  const encoded = encodeURIComponent(query.trim());
  if (platform === 'youtube-music') {
    return `https://music.youtube.com/search?q=${encoded}`;
  }
  return `https://www.youtube.com/results?search_query=${encoded}`;
}

interface FavoriteTracksCardProps {
  tracks: FavoriteTrack[];
  onAddTrack: (query: string, tag: TrackTag) => void;
  onDeleteTrack: (id: string) => void;
}

export const FavoriteTracksCard: React.FC<FavoriteTracksCardProps> = ({
  tracks,
  onAddTrack,
  onDeleteTrack,
}) => {
  const [platform, setPlatform] = useState<MusicPlatform>('youtube-music');
  const [quickQuery, setQuickQuery] = useState('');
  const [saveQuery, setSaveQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<TrackTag>('Phonk');
  const [filterTag, setFilterTag] = useState<'All' | TrackTag>('All');

  const searchAnchorRef = useRef<HTMLAnchorElement | null>(null);

  const cleanedQuickQuery = quickQuery.trim();
  const quickSearchHref = cleanedQuickQuery
    ? buildMusicSearchUrl(cleanedQuickQuery, platform)
    : undefined;

  const filteredTracks = useMemo(() => {
    if (filterTag === 'All') return tracks;
    return tracks.filter((t) => t.tag === filterTag);
  }, [tracks, filterTag]);

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanedQuickQuery) return;
    searchAnchorRef.current?.click();
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = saveQuery.trim();
    if (!cleaned) return;
    onAddTrack(cleaned, selectedTag);
    setSaveQuery('');
  };

  const platformLabel = platform === 'youtube-music' ? 'YouTube Music' : 'YouTube';
  const altPlatform: MusicPlatform =
    platform === 'youtube-music' ? 'youtube' : 'youtube-music';
  const altPlatformShort = altPlatform === 'youtube-music' ? 'YT Music' : 'YouTube';

  return (
    <section className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-6">
      {/* Header + Platform Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#e11d48]/12 border border-[#e11d48]/30 flex items-center justify-center shrink-0">
            <Music2 className="w-5 h-5 text-[#e11d48]" />
          </div>
          <div className="space-y-0.5">
            <h2 className="font-display text-2xl font-bold tracking-tight text-white">
              Favorite Tracks &amp; Phonk Search
            </h2>
            <p className="text-xs text-zinc-400">
              Launch any phonk, funk, workout, or focus track directly in {platformLabel}
            </p>
          </div>
        </div>

        {/* Platform Switcher */}
        <div
          role="group"
          aria-label="Music platform"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#09090b] border border-zinc-800 self-start sm:self-auto shrink-0"
        >
          <button
            type="button"
            onClick={() => setPlatform('youtube-music')}
            aria-pressed={platform === 'youtube-music'}
            className={`min-h-[38px] px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              platform === 'youtube-music'
                ? 'bg-[#e11d48] text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            YouTube Music
          </button>
          <button
            type="button"
            onClick={() => setPlatform('youtube')}
            aria-pressed={platform === 'youtube'}
            className={`min-h-[38px] px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              platform === 'youtube'
                ? 'bg-[#e11d48] text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            YouTube
          </button>
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Quick Search Bar + Save Track Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* Quick Search Bar */}
          <form onSubmit={handleQuickSearchSubmit} className="space-y-2.5">
            <label
              htmlFor="quick-track-search"
              className="block text-xs font-semibold text-zinc-300"
            >
              Quick Track Search
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="quick-track-search"
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="e.g. Brazilian Phonk, Kordhell, Drift Funk..."
                className="w-full min-h-[46px] pl-10 pr-3.5 rounded-xl bg-[#09090b] border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#e11d48]"
              />
            </div>

            <div className="flex items-center gap-2">
              {quickSearchHref ? (
                <a
                  ref={searchAnchorRef}
                  href={quickSearchHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-h-[44px] px-4 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                >
                  <span>Search &amp; Play</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex-1 min-h-[44px] px-4 rounded-xl bg-[#e11d48] opacity-40 text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed whitespace-nowrap"
                >
                  <span>Search &amp; Play</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </button>
              )}

              {cleanedQuickQuery && (
                <button
                  type="button"
                  onClick={() => {
                    onAddTrack(cleanedQuickQuery, selectedTag);
                    setQuickQuery('');
                  }}
                  className="min-h-[44px] px-3.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-200 hover:text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  + Save
                </button>
              )}
            </div>
          </form>

          <div className="border-t border-zinc-800/80 pt-5">
            {/* Save Track Form */}
            <form onSubmit={handleSaveSubmit} className="space-y-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-white">Save Track</h3>
                <p className="text-xs text-zinc-400">
                  Pin your go-to songs, artists, or phonk mixes for 1-tap launch.
                </p>
              </div>

              <input
                type="text"
                value={saveQuery}
                onChange={(e) => setSaveQuery(e.target.value)}
                placeholder="Song, artist, or phonk / funk track name"
                aria-label="Track name to save"
                className="w-full min-h-[46px] px-3.5 rounded-xl bg-[#09090b] border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#f59e0b]"
              />

              <div className="space-y-1.5">
                <span className="block text-xs text-zinc-400">Vibe Tag</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {TRACK_TAGS.map((tag) => {
                    const active = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(tag)}
                        aria-pressed={active}
                        className={`min-h-[40px] px-2 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                          active
                            ? 'bg-zinc-800 border-zinc-600 text-white'
                            : 'bg-[#09090b] border-zinc-800/90 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={!saveQuery.trim()}
                className="w-full min-h-[44px] px-4 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-[#f59e0b]/70 hover:text-white disabled:opacity-40 text-zinc-100 text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4 text-[#f59e0b]" />
                <span>Save Track</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right: Saved Tracks List */}
        <div className="lg:col-span-7 space-y-3 lg:border-l lg:border-zinc-800/80 lg:pl-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold text-white font-mono-tabular">
              Saved Rotation ({filteredTracks.length})
            </div>

            <div className="flex items-center gap-1 overflow-x-auto">
              {(['All', ...TRACK_TAGS] as const).map((tag) => {
                const active = filterTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setFilterTag(tag)}
                    aria-pressed={active}
                    className={`min-h-[34px] px-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredTracks.length === 0 ? (
            <div className="py-10 text-center space-y-2 border-t border-zinc-800/80">
              <div className="text-sm font-medium text-zinc-300">
                {tracks.length === 0
                  ? 'No favorite tracks saved yet'
                  : `No tracks tagged ${filterTag}`}
              </div>
              <p className="text-xs text-zinc-500">
                Add a phonk, workout, focus, or chill track to launch it in one tap.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-800/80 border-t border-zinc-800/80">
              {filteredTracks.map((track) => {
                const primaryHref = buildMusicSearchUrl(track.query, platform);
                const secondaryHref = buildMusicSearchUrl(
                  track.query,
                  altPlatform
                );

                return (
                  <li
                    key={track.id}
                    className="flex items-center justify-between gap-2 py-2.5 group"
                  >
                    <a
                      href={primaryHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-0 min-h-[48px] px-2 -mx-2 rounded-xl hover:bg-zinc-900/80 flex items-center gap-3 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#09090b] border border-zinc-800 group-hover:border-[#e11d48]/50 flex items-center justify-center shrink-0 transition-colors">
                        <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-[#e11d48] transition-colors" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-zinc-100 group-hover:text-white truncate">
                          {track.query}
                        </div>
                        <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                          <span className={`font-medium ${TAG_TEXT_STYLE[track.tag]}`}>
                            {track.tag}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">Open in {platformLabel}</span>
                        </div>
                      </div>
                    </a>

                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={secondaryHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Search on ${altPlatformShort}`}
                        className="min-h-[44px] px-2.5 rounded-lg text-[11px] font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 flex items-center whitespace-nowrap transition-colors"
                      >
                        {altPlatformShort}
                      </a>

                      <button
                        type="button"
                        onClick={() => onDeleteTrack(track.id)}
                        aria-label={`Remove ${track.query}`}
                        className="min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center text-zinc-500 hover:text-[#fb7185] hover:bg-zinc-800/60 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};
