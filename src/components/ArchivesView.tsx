import React, { useState } from "react";
import { LeagueSeason, Match, Team, PlayerProfile, HistoricalGameArchive } from "../types";
import { PREVIOUS_GAMES_ARCHIVE } from "../data/leagueSeed";
import { Archive, Trophy, Calendar, CheckCircle2, Star, Sparkles, ChevronRight, Sliders, Plus, ShieldCheck, MapPin } from "lucide-react";
import { PenaltyShootoutView } from "./PenaltyShootoutView";
import { EditArchiveGameModal } from "./EditArchiveGameModal";

interface ArchivesViewProps {
  seasons: LeagueSeason[];
  matches: Match[];
  teams: Team[];
  players: PlayerProfile[];
  historicalGames?: HistoricalGameArchive[];
  isAdminUnlocked?: boolean;
  adminPin?: string;
  onSelectSeason?: (season: LeagueSeason) => void;
  onOpenMatchDetails?: (match: Match) => void;
  onSaveHistoricalGame?: (game: HistoricalGameArchive) => Promise<void>;
  onDeleteHistoricalGame?: (gameId: string) => Promise<void>;
}

export const ArchivesView: React.FC<ArchivesViewProps> = ({
  seasons,
  matches,
  teams,
  players,
  historicalGames = PREVIOUS_GAMES_ARCHIVE,
  isAdminUnlocked = false,
  adminPin = "",
  onSelectSeason,
  onOpenMatchDetails,
  onSaveHistoricalGame,
  onDeleteHistoricalGame,
}) => {
  const [activeTab, setActiveTab] = useState<"historical_games" | "seasons">("historical_games");
  const gamesList = historicalGames && historicalGames.length > 0 ? historicalGames : PREVIOUS_GAMES_ARCHIVE;

  const [selectedHistoricalGameId, setSelectedHistoricalGameId] = useState<string>(
    gamesList[0]?.id || "game-1"
  );

  const [editingGame, setEditingGame] = useState<HistoricalGameArchive | null>(null);

  const activeHistorical = gamesList.find((g) => g.id === selectedHistoricalGameId) || gamesList[0];
  const redOrOpponentTeam = (activeHistorical as any)?.redTeam || (activeHistorical as any)?.orangeTeam;

  const handleCreateNewArchive = () => {
    const newGame: HistoricalGameArchive = {
      id: "game-" + Date.now(),
      title: `Soccer Game #${gamesList.length + 1}`,
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      summary: "Historical league encounter",
      mvp: "TBD",
      scoreDisplay: "0 - 0",
      venue: "Community Pitch",
      redTeam: {
        name: "Red Team",
        score: 0,
        players: [],
      },
      blueTeam: {
        name: "Blue Team",
        score: 0,
        players: [],
      },
    };
    setEditingGame(newGame);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black font-chakra text-white flex items-center gap-2">
              <Archive className="w-5 h-5 text-emerald-400" />
              LEAGUE ARCHIVES & HISTORY
            </h2>
            {isAdminUnlocked && (
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-chakra font-bold">
                ADMIN ACCESS
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Historical game archives, detailed penalty shootout logs, and tournament records
          </p>
        </div>

        {/* Tab Toggle & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === "historical_games" && isAdminUnlocked && (
            <button
              onClick={handleCreateNewArchive}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-chakra font-black text-xs transition-colors cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Archived Game</span>
            </button>
          )}

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-chakra">
            <button
              onClick={() => setActiveTab("historical_games")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === "historical_games"
                  ? "bg-slate-800 text-emerald-400 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Historical Matches ({gamesList.length})
            </button>
            <button
              onClick={() => setActiveTab("seasons")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === "seasons"
                  ? "bg-slate-800 text-emerald-400 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Season Archives
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: HISTORICAL GAMES */}
      {activeTab === "historical_games" && (
        <div className="space-y-6">
          {/* Game Selector Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {gamesList.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedHistoricalGameId(g.id)}
                className={`px-4 py-2.5 rounded-2xl border font-chakra font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  selectedHistoricalGameId === g.id
                    ? "bg-emerald-950/50 text-emerald-300 border-emerald-500/50 shadow-md ring-1 ring-emerald-400/30"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                <span>⚽</span>
                <span>{g.title}</span>
                <span className="text-[10px] text-slate-500">({g.date})</span>
                {g.penaltyShootout && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                    PENS
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Historical Game Details Display */}
          {activeHistorical && (
            <div className="bg-[#0d131f] rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-6">
              {/* Game Header Scoreboard */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-chakra font-black text-white text-lg sm:text-xl">
                      {activeHistorical.title}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-chakra font-bold">
                      ARCHIVED RESULT
                    </span>
                    {activeHistorical.penaltyShootout && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-chakra font-bold">
                        DECIDED ON PENALTIES
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-sans">{activeHistorical.summary}</p>
                  <div className="flex items-center gap-3 text-slate-500 text-xs font-sans mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {activeHistorical.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {activeHistorical.venue || "Community Pitch"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="px-5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-2xl sm:text-3xl font-chakra font-black text-white flex items-center gap-3 shadow-inner">
                      <span className="text-rose-400">{redOrOpponentTeam?.score ?? 0}</span>
                      <span className="text-slate-600">:</span>
                      <span className="text-blue-400">{activeHistorical.blueTeam?.score ?? 0}</span>
                    </div>
                    {(activeHistorical as any).scoreDisplay ? (
                      <span className="text-[11px] font-chakra font-bold text-amber-400 mt-1">
                        {(activeHistorical as any).scoreDisplay}
                      </span>
                    ) : (
                      <span className="text-[10px] font-chakra font-bold text-slate-500 mt-1 uppercase">
                        Full Time
                      </span>
                    )}
                  </div>

                  {/* Admin Modify Button */}
                  <button
                    onClick={() => setEditingGame(activeHistorical)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 text-xs font-chakra font-bold transition-all shadow-md cursor-pointer hover:border-amber-500/50"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Modify Stats</span>
                  </button>
                </div>
              </div>

              {/* MOTM Callout */}
              {activeHistorical.mvp && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
                      🏆
                    </div>
                    <div>
                      <span className="text-[10px] font-chakra font-bold text-amber-400 uppercase tracking-wider block">
                        Historical Man of the Match
                      </span>
                      <span className="text-sm sm:text-base font-chakra font-black text-white">
                        {activeHistorical.mvp}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-chakra font-bold text-amber-300">
                    {activeHistorical.date}
                  </span>
                </div>
              )}

              {/* PENALTY SHOOTOUT BREAKDOWN COMPONENT */}
              {activeHistorical.penaltyShootout && (
                <PenaltyShootoutView
                  shootout={activeHistorical.penaltyShootout}
                  homeTeamName={redOrOpponentTeam?.name || "Red Team"}
                  awayTeamName={activeHistorical.blueTeam?.name || "Blue Team"}
                  homeBadgeEmoji="🔴"
                  awayBadgeEmoji="⚡"
                  homeTeamId="team_red"
                  awayTeamId="team_blue"
                />
              )}

              {/* Both Teams Performance Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Red Team */}
                {redOrOpponentTeam && (
                  <div className="bg-slate-950/80 rounded-2xl border border-rose-500/30 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🔥</span>
                        <h4 className="font-chakra font-bold text-rose-400 text-sm">
                          {redOrOpponentTeam.name}
                        </h4>
                      </div>
                      <span className="font-chakra font-black text-sm text-rose-300">
                        {redOrOpponentTeam.score} Goals
                        {redOrOpponentTeam.penaltyScore !== undefined && (
                          <span className="text-amber-400 text-xs ml-1.5">
                            ({redOrOpponentTeam.penaltyScore} Pens)
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {redOrOpponentTeam.players.map((p: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs"
                        >
                          <div className="font-chakra font-bold text-white">
                            {p.name} <span className="text-[10px] text-slate-400 font-normal">({p.position})</span>
                          </div>
                          <div className="flex items-center gap-2 font-chakra text-[11px] text-slate-300">
                            {p.goals > 0 && <span className="text-emerald-400">⚽ {p.goals}G</span>}
                            {p.assists > 0 && <span className="text-cyan-400">🎯 {p.assists}A</span>}
                            {p.rating && <span className="text-amber-300 font-black">★ {p.rating}</span>}
                            {p.note && <span className="text-amber-400 text-[10px]">({p.note})</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blue Team */}
                <div className="bg-slate-950/80 rounded-2xl border border-blue-500/30 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⚡</span>
                      <h4 className="font-chakra font-bold text-blue-400 text-sm">
                        {activeHistorical.blueTeam?.name || "Blue Team"}
                      </h4>
                    </div>
                    <span className="font-chakra font-black text-sm text-blue-300">
                      {activeHistorical.blueTeam?.score ?? 0} Goals
                      {activeHistorical.blueTeam?.penaltyScore !== undefined && (
                        <span className="text-amber-400 text-xs ml-1.5">
                          ({activeHistorical.blueTeam.penaltyScore} Pens)
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeHistorical.blueTeam?.players?.map((p: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div className="font-chakra font-bold text-white">
                          {p.name} <span className="text-[10px] text-slate-400 font-normal">({p.position})</span>
                        </div>
                        <div className="flex items-center gap-2 font-chakra text-[11px] text-slate-300">
                          {p.goals > 0 && <span className="text-emerald-400">⚽ {p.goals}G</span>}
                          {p.assists > 0 && <span className="text-cyan-400">🎯 {p.assists}A</span>}
                          {p.rating && <span className="text-amber-300 font-black">★ {p.rating}</span>}
                          {p.note && <span className="text-amber-400 text-[10px]">({p.note})</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: SEASONS ARCHIVE */}
      {activeTab === "seasons" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {seasons.map((season) => (
            <div
              key={season.id}
              onClick={() => onSelectSeason && onSelectSeason(season)}
              className="bg-[#0d131f] hover:bg-[#121a2b] transition-all rounded-3xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-chakra font-black text-white text-base sm:text-lg">
                    {season.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-chakra font-bold ${
                      season.status === "active"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {season.status === "active" ? "CURRENT SEASON" : "ARCHIVED"}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4 font-sans">
                  {season.description || `Community soccer championship ${season.year}`}
                </p>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-chakra">
                  <span className="text-slate-400">Season Champion:</span>
                  <span className="font-black text-amber-400 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    {season.championTeamId
                      ? teams.find((t) => t.id === season.championTeamId)?.name || "Champion Declared"
                      : "In Progress"}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-emerald-400 font-chakra font-bold">
                <span>View Season Standings & Records</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Historical Game Modal */}
      {editingGame && (
        <EditArchiveGameModal
          game={editingGame}
          adminPin={adminPin}
          onClose={() => setEditingGame(null)}
          onSave={async (updated) => {
            if (onSaveHistoricalGame) {
              await onSaveHistoricalGame(updated);
            }
          }}
          onDelete={onDeleteHistoricalGame}
        />
      )}
    </div>
  );
};
