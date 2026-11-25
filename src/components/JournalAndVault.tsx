import React, { useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Download,
  FileJson,
  Trash2,
  Upload,
  AlertCircle,
} from 'lucide-react';
import { AppState, JournalEntry, TrackTag } from '../types';
import { getLocalDateKey, validateBackupPayload } from '../utils/storage';
import { FavoriteTracksCard } from './FavoriteTracksCard';

interface JournalAndVaultProps {
  state: AppState;
  onAddJournalEntry: (winToday: string, leakTomorrow: string) => void;
  onDeleteJournalEntry: (id: string) => void;
  onAddFavoriteTrack: (query: string, tag: TrackTag) => void;
  onDeleteFavoriteTrack: (id: string) => void;
  onExportBackup: () => void;
  onImportBackup: (restored: AppState) => void;
}

export const JournalAndVault: React.FC<JournalAndVaultProps> = ({
  state,
  onAddJournalEntry,
  onDeleteJournalEntry,
  onAddFavoriteTrack,
  onDeleteFavoriteTrack,
  onExportBackup,
  onImportBackup,
}) => {
  const [winToday, setWinToday] = useState('');
  const [leakTomorrow, setLeakTomorrow] = useState('');
  const [importFeedback, setImportFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedWin = winToday.trim();
    const cleanedLeak = leakTomorrow.trim();
    if (!cleanedWin || !cleanedLeak) return;

    onAddJournalEntry(cleanedWin, cleanedLeak);
    setWinToday('');
    setLeakTomorrow('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const result = validateBackupPayload(text);
      if (result.valid && result.data) {
        onImportBackup(result.data);
        setImportFeedback({
          type: 'success',
          message: `Backup restored cleanly — Day ${result.data.currentDay} of 66, ${result.data.totalXP.toLocaleString()} XP, ${result.data.journalEntries.length} journal logs.`,
        });
      } else {
        setImportFeedback({
          type: 'error',
          message: result.error ?? 'Invalid JSON backup file.',
        });
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      setImportFeedback({
        type: 'error',
        message: 'Could not read the selected file.',
      });
    };
    reader.readAsText(file);
  };

  const todayKey = getLocalDateKey();
  const hasLoggedToday = state.journalEntries.some((e) => e.date === todayKey);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="text-xs text-zinc-400 font-mono-tabular">
          Day {state.currentDay} · {state.journalEntries.length}{' '}
          {state.journalEntries.length === 1 ? 'Reflection' : 'Reflections'} Saved
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Night Accountability &amp; Backup Vault
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Night Accountability Form + JSON Backup Vault */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleSaveReflection}
            className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Evening Debrief
                </h2>
                <p className="text-xs text-zinc-400">
                  Close the day honestly before lights out ({state.profile.sleepTime})
                </p>
              </div>
              {hasLoggedToday && (
                <span className="text-xs font-medium text-emerald-400 whitespace-nowrap">
                  Logged Today
                </span>
              )}
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-emerald-400">
                1 Win Today
              </span>
              <textarea
                required
                rows={3}
                value={winToday}
                onChange={(e) => setWinToday(e.target.value)}
                placeholder="What promise did you keep even when resistance hit?"
                className="w-full p-3.5 rounded-xl bg-[#09090b] border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[#f59e0b]">
                1 Leak to Fix Tomorrow
              </span>
              <textarea
                required
                rows={3}
                value={leakTomorrow}
                onChange={(e) => setLeakTomorrow(e.target.value)}
                placeholder="Where did attention, energy, or discipline leak—and what exact fix closes it tomorrow?"
                className="w-full p-3.5 rounded-xl bg-[#09090b] border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#f59e0b] resize-none leading-relaxed"
              />
            </label>

            <button
              type="submit"
              disabled={!winToday.trim() || !leakTomorrow.trim()}
              className="w-full min-h-[48px] px-5 rounded-xl bg-[#e11d48] hover:bg-[#be123c] disabled:opacity-40 text-white font-semibold text-sm transition-colors"
            >
              Save Night Reflection
            </button>
          </form>

          {/* JSON Backup Vault */}
          <section className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/12 border border-[#f59e0b]/30 flex items-center justify-center shrink-0">
                <FileJson className="w-5 h-5 text-[#f59e0b]" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-white">
                  JSON Backup Vault
                </h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  All progress lives locally in your browser. Export a snapshot anytime or restore across devices.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onExportBackup}
                className="min-h-[46px] px-4 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <Download className="w-4 h-4 text-[#f59e0b]" />
                <span>Export Backup</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[46px] px-4 rounded-xl bg-[#09090b] border border-zinc-800 hover:border-zinc-600 text-zinc-200 hover:text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <Upload className="w-4 h-4 text-zinc-400" />
                <span>Import Backup</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {importFeedback && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  importFeedback.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-[#e11d48]/10 border-[#e11d48]/30 text-[#fb7185]'
                }`}
              >
                {importFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{importFeedback.message}</span>
              </div>
            )}
          </section>
        </div>

        {/* Right: Chronological Journal Timeline */}
        <section className="lg:col-span-7 bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Accountability Log
            </h2>
            <span className="text-xs text-zinc-500">Newest first</span>
          </div>

          {state.journalEntries.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto">
                <BookOpen className="w-5 h-5 text-zinc-500" />
              </div>
              <div className="text-sm font-medium text-zinc-300">
                No evening reflections logged yet
              </div>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Record tonight&apos;s win and tomorrow&apos;s fix to tighten your discipline loop every 24 hours.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/80">
              {state.journalEntries.map((entry: JournalEntry) => (
                <article key={entry.id} className="py-4 first:pt-1 last:pb-1 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-zinc-400 font-mono-tabular">
                      <span className="text-white font-semibold">
                        Day {entry.dayNumber}
                      </span>{' '}
                      <span aria-hidden="true">·</span> {entry.date}
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteJournalEntry(entry.id)}
                      aria-label="Delete reflection"
                      className="min-h-[36px] min-w-[36px] rounded-lg flex items-center justify-center text-zinc-500 hover:text-[#fb7185] hover:bg-zinc-800/60 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-[#09090b] border border-zinc-800/80 space-y-1">
                      <div className="text-[11px] font-semibold text-emerald-400">
                        1 Win Today
                      </div>
                      <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                        {entry.winToday}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#09090b] border border-zinc-800/80 space-y-1">
                      <div className="text-[11px] font-semibold text-[#f59e0b]">
                        1 Leak to Fix Tomorrow
                      </div>
                      <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                        {entry.leakTomorrow}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Favorite Tracks & Phonk Search */}
      <FavoriteTracksCard
        tracks={state.favoriteTracks ?? []}
        onAddTrack={onAddFavoriteTrack}
        onDeleteTrack={onDeleteFavoriteTrack}
      />
    </div>
  );
};
