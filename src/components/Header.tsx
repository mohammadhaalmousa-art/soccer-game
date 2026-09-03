import React from "react";
import { Vote, Trophy, Database, ShieldCheck, Sparkles, RefreshCw } from "lucide-react";
import { SoccerGameLogo } from "./SoccerGameLogo";

interface HeaderProps {
  currentView: "vote" | "ratings" | "manage";
  onSelectView: (view: "vote" | "ratings" | "manage") => void;
  totalSubmissions: number;
  isSyncing?: boolean;
  onManualSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  totalSubmissions,
  isSyncing = false,
  onManualSync,
}) => {
  return (
    <header className="w-full bg-stone-950/95 border-b border-cyan-900/40 backdrop-blur-lg sticky top-0 z-40" id="main-header">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
        {/* Brand Logo & Mobile Quick Status */}
        <div className="w-full sm:w-auto flex items-center justify-between gap-3">
          <button
            type="button"
            className="flex items-center gap-2.5 cursor-pointer bg-transparent border-0 p-0 text-left focus:outline-none"
            onClick={() => onSelectView("vote")}
            aria-label="Go to vote"
          >
            <SoccerGameLogo size="sm" />
            <div className="border-l border-cyan-900/50 pl-2.5">
              <span className="text-[11px] sm:text-xs font-chakra font-bold text-cyan-400 block tracking-wider uppercase leading-tight">
                Player Ratings
              </span>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-cyan-200/70">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="truncate">Synced</span>
              </div>
            </div>
          </button>

          {/* Quick sync button on mobile (header right) */}
          <button
            onClick={onManualSync}
            title="Click to force sync data"
            className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-[11px] font-chakra font-medium text-cyan-300 active:bg-cyan-900/60 transition-colors touch-manipulation min-h-[36px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : `${totalSubmissions} Votes`}</span>
          </button>
        </div>

        {/* Action Controls & Navigation */}
        <div className="w-full sm:w-auto flex items-center justify-center sm:justify-end gap-2 sm:gap-3">
          {/* Permanent Sync Status Pill (Desktop/Tablet) */}
          <div
            onClick={onManualSync}
            title="Data is permanently mirrored between cloud server and browser cache. Click to force sync."
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] font-chakra font-medium text-cyan-300 hover:border-cyan-400 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3 h-3 text-cyan-400 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : `${totalSubmissions} Ballots Saved`}</span>
          </div>

          {/* Navigation Pill Buttons with Touch Targets >= 44px */}
          <nav className="w-full sm:w-auto grid grid-cols-3 sm:flex items-center gap-1 bg-stone-900/90 p-1 rounded-2xl border border-stone-800" aria-label="Main Navigation">
            <button
              onClick={() => onSelectView("vote")}
              id="nav-btn-vote"
              className={`inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer touch-manipulation min-h-[44px] ${
                currentView === "vote"
                  ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-stone-950 font-black shadow-md shadow-cyan-500/20"
                  : "text-stone-300 hover:text-white active:bg-stone-800"
              }`}
            >
              <Vote className="w-4 h-4 shrink-0" />
              <span className="truncate">Vote</span>
            </button>

            <button
              onClick={() => onSelectView("ratings")}
              id="nav-btn-ratings"
              className={`inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer touch-manipulation min-h-[44px] ${
                currentView === "ratings"
                  ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-stone-950 font-black shadow-md shadow-cyan-500/20"
                  : "text-stone-300 hover:text-white active:bg-stone-800"
              }`}
            >
              <Trophy className="w-4 h-4 shrink-0" />
              <span className="truncate">Standings</span>
            </button>

            <button
              onClick={() => onSelectView("manage")}
              id="nav-btn-manage"
              className={`inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer touch-manipulation min-h-[44px] ${
                currentView === "manage"
                  ? "bg-stone-800 text-cyan-300 border border-cyan-500/40 shadow-xs"
                  : "text-stone-400 hover:text-stone-200 active:bg-stone-800/60"
              }`}
            >
              <Database className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="hidden sm:inline">Manage</span>
              <span className="sm:hidden">Admin</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

