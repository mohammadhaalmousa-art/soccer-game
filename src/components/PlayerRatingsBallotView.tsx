import React, { useState, useEffect } from "react";
import { PlayerProfile, Team, Match } from "../types";
import { 
  Star, 
  Sparkles, 
  Trophy, 
  Check, 
  Send, 
  Users, 
  ShieldCheck, 
  Crown, 
  Award, 
  Calendar, 
  ChevronRight, 
  Search, 
  UserCheck,
  RotateCcw,
  Sliders,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { TeamBadge } from "./TeamBadge";

interface PlayerRatingsBallotViewProps {
  players: PlayerProfile[];
  teams: Team[];
  matches: Match[];
  onSaveRatingSubmission: (
    submittedRatings: Record<string, number>,
    voterName: string,
    matchId?: string,
    voterPlayerId?: string,
    motmPlayerId?: string
  ) => Promise<void>;
  preselectedMatchId?: string;
  onOpenMatchDetails?: (match: Match) => void;
}

export const PlayerRatingsBallotView: React.FC<PlayerRatingsBallotViewProps> = ({
  players,
  teams,
  matches,
  onSaveRatingSubmission,
  preselectedMatchId,
  onOpenMatchDetails,
}) => {
  const safePlayers = players || [];
  const safeTeams = teams || [];
  const safeMatches = matches || [];

  const [activeViewMode, setActiveViewMode] = useState<"leaderboard" | "rate_match">(
    preselectedMatchId ? "rate_match" : "leaderboard"
  );

  // Selected Match to rate
  const [selectedMatchId, setSelectedMatchId] = useState<string>(() => {
    if (preselectedMatchId) return preselectedMatchId;
    return safeMatches[0]?.id || "";
  });

  // Selected Self (Voter)
  const [selectedVoterPlayerId, setSelectedVoterPlayerId] = useState<string>("");
  const [voterCustomName, setVoterCustomName] = useState<string>("");

  // Filter for Leaderboard
  const [leaderboardTeamFilter, setLeaderboardTeamFilter] = useState<string>("ALL");
  const [leaderboardPosFilter, setLeaderboardPosFilter] = useState<string>("ALL");
  const [leaderboardSearch, setLeaderboardSearch] = useState<string>("");

  // Ratings map: playerId -> rating 1..10
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [selectedMotmId, setSelectedMotmId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const getTeam = (teamId: string) => teams.find((t) => t.id === teamId);
  const currentMatch = matches.find((m) => m.id === selectedMatchId) || matches[0];

  // Initialize default ratings when selected match changes
  useEffect(() => {
    if (!currentMatch) return;
    const initial: Record<string, number> = {};
    players.forEach((p) => {
      const existingMatchRating = currentMatch.playerRatings?.[p.id];
      initial[p.id] = existingMatchRating !== undefined ? existingMatchRating : 8.0;
    });
    setRatings(initial);
  }, [selectedMatchId, currentMatch, players]);

  // If voter changes, ensure self-rating is excluded
  const handleVoterSelect = (playerId: string) => {
    setSelectedVoterPlayerId(playerId);
    const p = players.find((pl) => pl.id === playerId);
    if (p) setVoterCustomName(p.name);
  };

  const handleRatingChange = (playerId: string, score: number) => {
    setRatings((prev) => ({
      ...prev,
      [playerId]: score,
    }));
  };

  const handleSubmitBallot = async (e: React.FormEvent) => {
    e.preventDefault();

    const voterName = voterCustomName.trim() || (selectedVoterPlayerId ? players.find((p) => p.id === selectedVoterPlayerId)?.name : "");
    if (!voterName) {
      alert("Please select yourself from the player list or enter your name.");
      return;
    }

    // Filter out self-rating from submitted ballot
    const cleanRatings: Record<string, number> = {};
    Object.entries(ratings).forEach(([pid, r]) => {
      if (pid !== selectedVoterPlayerId) {
        cleanRatings[pid] = Number(r);
      }
    });

    if (Object.keys(cleanRatings).length === 0) {
      alert("Please rate at least one teammate or opponent.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveRatingSubmission(
        cleanRatings,
        voterName,
        selectedMatchId || currentMatch?.id,
        selectedVoterPlayerId || undefined,
        selectedMotmId || undefined
      );

      setSuccessMessage(`Match ratings recorded for ${currentMatch?.title || "Game"}! Leaderboard updated.`);
      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        setActiveViewMode("leaderboard");
      }, 2500);
    } catch (err: any) {
      alert(err.message || "Failed to submit match ratings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to get effective rating for match rating leaderboard:
  // If a player played one game, use that singular rating directly (never do math with 0)
  const getPlayerEffectiveRating = (p: PlayerProfile): number => {
    const mp = p.stats?.matchesPlayed || 0;
    const rc = p.stats?.ratingCount || 0;
    if (mp === 0 && rc === 0) return 0;
    if (mp === 1 || rc === 1) {
      if (p.ratingHistory && p.ratingHistory.length === 1 && typeof p.ratingHistory[0].rating === "number" && p.ratingHistory[0].rating > 0) {
        return p.ratingHistory[0].rating;
      }
      return p.stats?.averageRating || 0;
    }
    return p.stats?.averageRating || 0;
  };

  // Compute Leaderboard Rankings of Match Averages
  const rankedPlayers = [...safePlayers]
    .filter((p) => {
      const matchesSearch = (p.name || "").toLowerCase().includes(leaderboardSearch.toLowerCase());
      const matchesTeam = leaderboardTeamFilter === "ALL" || p.teamId === leaderboardTeamFilter;
      const matchesPos = leaderboardPosFilter === "ALL" || p.position === leaderboardPosFilter;
      return matchesSearch && matchesTeam && matchesPos;
    })
    .sort((a, b) => {
      const gamesA = a.stats?.matchesPlayed || 0;
      const gamesB = b.stats?.matchesPlayed || 0;
      const hasPlayedA = gamesA > 0 || (a.stats?.ratingCount || 0) > 0;
      const hasPlayedB = gamesB > 0 || (b.stats?.ratingCount || 0) > 0;
      if (hasPlayedA !== hasPlayedB) return hasPlayedA ? -1 : 1;

      const avgA = getPlayerEffectiveRating(a);
      const avgB = getPlayerEffectiveRating(b);
      if (avgB !== avgA) return avgB - avgA;
      return (b.stats?.motmCount || 0) - (a.stats?.motmCount || 0);
    });

  const getRatingColor = (score: number) => {
    if (score >= 9.0) return "bg-emerald-500 text-slate-950 shadow-emerald-500/20";
    if (score >= 8.0) return "bg-cyan-500 text-slate-950 shadow-cyan-500/20";
    if (score >= 7.0) return "bg-amber-500 text-slate-950 shadow-amber-500/20";
    if (score >= 6.0) return "bg-orange-500 text-slate-950";
    return "bg-rose-500 text-white";
  };

  const getRatingDescription = (score: number) => {
    if (score >= 9.5) return "World Class 🌟";
    if (score >= 9.0) return "Outstanding 🔥";
    if (score >= 8.0) return "Great Game ⚡";
    if (score >= 7.0) return "Solid & Reliable 👍";
    if (score >= 6.0) return "Decent / Average ⚽";
    if (score >= 5.0) return "Tough Day 🌧️";
    return "Struggled ⚠️";
  };

  const top1 = rankedPlayers[0];
  const top2 = rankedPlayers[1];
  const top3 = rankedPlayers[2];

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black font-chakra text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            MATCH RATINGS & LEADERBOARD
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Per-game 1–10 peer ratings, cumulative match averages, and MVP rankings
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-stretch sm:self-auto">
          <button
            onClick={() => setActiveViewMode("leaderboard")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-chakra font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeViewMode === "leaderboard"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Leaderboard of Match Averages</span>
          </button>

          <button
            onClick={() => setActiveViewMode("rate_match")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-chakra font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeViewMode === "rate_match"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Rate a Game (1-10)</span>
          </button>
        </div>
      </div>

      {submittedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-chakra font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{successMessage || "Ratings ballot recorded successfully!"}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: LEADERBOARD OF MATCH AVERAGES */}
      {/* ========================================================================= */}
      {activeViewMode === "leaderboard" && (
        <div className="space-y-6">
          {/* Top 3 Podium of Match Rating Champions */}
          {top1 && (
            <div className="bg-[#0d131f] rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <h3 className="font-chakra font-black text-white text-base">
                    MATCH RATING AVERAGES &bull; TOP PERFORMERS
                  </h3>
                </div>
                <button
                  onClick={() => setActiveViewMode("rate_match")}
                  className="inline-flex items-center gap-1 text-xs font-chakra font-bold text-emerald-400 hover:underline cursor-pointer"
                >
                  <span>Submit Ratings for a Match</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Podium */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mx-auto pt-2">
                {/* 2nd Place */}
                {top2 && (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 border-2 border-slate-400 overflow-hidden flex items-center justify-center font-chakra font-black text-sm text-white shadow-md mb-2">
                      {top2.photoUrl ? (
                        <img src={top2.photoUrl} alt={top2.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>#{top2.jerseyNumber}</span>
                      )}
                    </div>
                    <span className="font-chakra font-bold text-white text-xs sm:text-sm truncate max-w-full">
                      {top2.name}
                    </span>
                    <span className="text-[10px] text-slate-400">{getTeam(top2.teamId)?.name}</span>
                    <div className="w-full mt-3 h-24 bg-gradient-to-t from-slate-800 to-slate-700/80 rounded-t-2xl flex flex-col items-center justify-center border-t-2 border-slate-400 shadow-md">
                      <span className="font-chakra font-black text-lg sm:text-xl text-slate-200">2nd</span>
                      <span className="text-xs font-chakra font-black text-cyan-300">
                        {getPlayerEffectiveRating(top2) > 0 ? getPlayerEffectiveRating(top2).toFixed(1) : "—"}★
                      </span>
                    </div>
                  </div>
                )}

                {/* 1st Place (Gold Champion) */}
                {top1 && (
                  <div className="flex flex-col items-center text-center -mt-4">
                    <div className="relative">
                      <Crown className="w-6 h-6 text-amber-400 absolute -top-4 left-1/2 -translate-x-1/2 animate-bounce" />
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-800 border-4 border-amber-400 overflow-hidden flex items-center justify-center font-chakra font-black text-base sm:text-lg text-white shadow-xl shadow-amber-500/20 mb-2">
                        {top1.photoUrl ? (
                          <img src={top1.photoUrl} alt={top1.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>#{top1.jerseyNumber}</span>
                        )}
                      </div>
                    </div>
                    <span className="font-chakra font-black text-amber-300 text-sm sm:text-base truncate max-w-full">
                      {top1.name}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{getTeam(top1.teamId)?.name}</span>
                    <div className="w-full mt-3 h-32 bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-2xl flex flex-col items-center justify-center border-t-4 border-amber-300 shadow-xl shadow-amber-500/20">
                      <span className="font-chakra font-black text-2xl sm:text-3xl text-slate-950">1st</span>
                      <span className="text-sm font-chakra font-black text-slate-950">
                        {getPlayerEffectiveRating(top1) > 0 ? getPlayerEffectiveRating(top1).toFixed(1) : "—"}★ {top1.stats.matchesPlayed === 1 ? "Singular Rating" : "Average"}
                      </span>
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {top3 && (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 border-2 border-amber-700 overflow-hidden flex items-center justify-center font-chakra font-black text-sm text-white shadow-md mb-2">
                      {top3.photoUrl ? (
                        <img src={top3.photoUrl} alt={top3.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>#{top3.jerseyNumber}</span>
                      )}
                    </div>
                    <span className="font-chakra font-bold text-white text-xs sm:text-sm truncate max-w-full">
                      {top3.name}
                    </span>
                    <span className="text-[10px] text-slate-400">{getTeam(top3.teamId)?.name}</span>
                    <div className="w-full mt-3 h-18 bg-gradient-to-t from-amber-900/80 to-amber-800/80 rounded-t-2xl flex flex-col items-center justify-center border-t-2 border-amber-700 shadow-md">
                      <span className="font-chakra font-black text-lg sm:text-xl text-amber-200">3rd</span>
                      <span className="text-xs font-chakra font-black text-amber-300">
                        {getPlayerEffectiveRating(top3) > 0 ? getPlayerEffectiveRating(top3).toFixed(1) : "—"}★
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0d131f] p-3.5 rounded-2xl border border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search player in ratings leaderboard..."
                value={leaderboardSearch}
                onChange={(e) => setLeaderboardSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:border-amber-400 outline-none"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-chakra">
              {["ALL", "GK", "DEF", "MID", "FWD"].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setLeaderboardPosFilter(pos)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    leaderboardPosFilter === pos
                      ? "bg-slate-800 text-amber-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>

            <select
              value={leaderboardTeamFilter}
              onChange={(e) => setLeaderboardTeamFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 text-xs font-chakra font-bold text-white rounded-xl px-3 py-2 outline-none cursor-pointer"
            >
              <option value="ALL">All Squads</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.badgeEmoji} {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Complete Ranked Leaderboard Table */}
          <div className="bg-[#0d131f] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs font-chakra font-bold text-slate-400 uppercase tracking-wider">
              <span>Player & Squad</span>
              <div className="flex items-center gap-6">
                <span className="hidden sm:inline">Games Rated</span>
                <span className="hidden sm:inline">MOTMs</span>
                <span>Match Avg (1-10)</span>
              </div>
            </div>

            <div className="divide-y divide-slate-800/60">
              {rankedPlayers.map((player, idx) => {
                const team = getTeam(player.teamId);
                const isSingle = (player.stats?.matchesPlayed || 0) === 1 || (player.stats?.ratingCount || 0) === 1;
                const avg = getPlayerEffectiveRating(player);

                return (
                  <div
                    key={player.id}
                    className="p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span
                        className={`w-7 h-7 rounded-xl font-chakra font-black text-xs flex items-center justify-center shrink-0 ${
                          idx === 0
                            ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                            : idx === 1
                            ? "bg-slate-300 text-slate-950 shadow-md"
                            : idx === 2
                            ? "bg-amber-800 text-amber-100 shadow-md"
                            : "bg-slate-900 text-slate-400 border border-slate-800"
                        }`}
                      >
                        {idx + 1}
                      </span>

                      {/* Photo */}
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-chakra font-black text-xs text-white shrink-0">
                        {player.photoUrl ? (
                          <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>#{player.jerseyNumber}</span>
                        )}
                      </div>

                      <div className="truncate">
                        <div className="font-chakra font-black text-white text-sm sm:text-base truncate flex items-center gap-1.5">
                          <span>{player.name}</span>
                          {player.isTemporaryTransfer && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                              Loan
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 font-chakra flex items-center gap-1.5">
                          <TeamBadge team={team} size="xs" />
                          <span>{team?.name} &bull; {player.position} &bull; #{player.jerseyNumber}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                      <span className="hidden sm:inline font-chakra font-bold text-xs text-slate-400">
                        {player.stats?.matchesPlayed || 0} {player.stats?.matchesPlayed === 1 ? "Game (Singular)" : "Games"}
                      </span>

                      <span className="hidden sm:inline font-chakra font-bold text-xs text-amber-400">
                        {player.stats.motmCount || 0} MOTM
                      </span>

                      <div className="flex flex-col items-end">
                        <div
                          className={`px-3 py-1 rounded-xl font-chakra font-black text-sm sm:text-base shadow-sm ${getRatingColor(
                            avg
                          )}`}
                        >
                          {avg > 0 ? avg.toFixed(1) : "—"}
                        </div>
                        <span className="text-[9px] text-slate-400 font-sans mt-0.5 hidden sm:inline">
                          {isSingle && avg > 0 ? "Singular Rating" : getRatingDescription(avg)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: RATE A GAME (SELECT YOURSELF & RATE OTHERS 1-10) */}
      {/* ========================================================================= */}
      {activeViewMode === "rate_match" && (
        <form onSubmit={handleSubmitBallot} className="space-y-6">
          {/* STEP 1: MATCH & SELF SELECTION */}
          <div className="bg-[#0d131f] rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="font-chakra font-black text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>STEP 1: SELECT MATCH & SELECT YOURSELF</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Match Selector */}
              <div>
                <label className="block text-xs font-chakra font-bold text-slate-300 mb-1.5">
                  Which Game Are You Rating? *
                </label>
                <select
                  value={selectedMatchId}
                  onChange={(e) => setSelectedMatchId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-chakra font-bold text-white outline-none focus:border-emerald-400 cursor-pointer"
                >
                  {matches.map((m) => {
                    const home = getTeam(m.homeTeamId);
                    const away = getTeam(m.awayTeamId);
                    return (
                      <option key={m.id} value={m.id}>
                        {m.title} &bull; {home?.shortName} {m.homeScore}-{m.awayScore} {away?.shortName} ({m.date})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Self Selector */}
              <div>
                <label className="block text-xs font-chakra font-bold text-emerald-400 mb-1.5 flex items-center gap-1">
                  <UserCheck className="w-4 h-4" />
                  <span>Who Are You? (Select Yourself) *</span>
                </label>
                <select
                  value={selectedVoterPlayerId}
                  onChange={(e) => handleVoterSelect(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-emerald-500/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-chakra font-bold text-emerald-300 outline-none focus:border-emerald-400 cursor-pointer shadow-inner"
                >
                  <option value="">-- Tap to Select Your Player Profile --</option>
                  {players.map((p) => {
                    const t = getTeam(p.teamId);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} (#{p.jerseyNumber} - {t?.name})
                      </option>
                    );
                  })}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  🔒 You will rate everyone else 1–10. Self-ratings are automatically locked.
                </p>
              </div>
            </div>

            {/* Custom Name fallback if not in list */}
            {!selectedVoterPlayerId && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-3">
                <span className="text-xs text-slate-400 whitespace-nowrap">Or type your name:</span>
                <input
                  type="text"
                  placeholder="Enter your name/nickname..."
                  value={voterCustomName}
                  onChange={(e) => setVoterCustomName(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-400"
                />
              </div>
            )}
          </div>

          {/* STEP 2: RATE PLAYERS 1-10 */}
          <div className="bg-[#0d131f] rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-chakra font-black text-white text-base flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span>STEP 2: RATE ALL PLAYERS (1.0 &ndash; 10.0 SCALE)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Tap quick 1–10 score buttons or adjust slider for each player in this game
                </p>
              </div>

              {selectedVoterPlayerId && (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-chakra font-bold">
                  Voting as: {players.find((p) => p.id === selectedVoterPlayerId)?.name}
                </div>
              )}
            </div>

            {/* Player Rating Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {players.map((player) => {
                const isSelf = player.id === selectedVoterPlayerId;
                const team = getTeam(player.teamId);
                const currentScore = ratings[player.id] !== undefined ? ratings[player.id] : 8.0;

                return (
                  <div
                    key={player.id}
                    className={`rounded-2xl border p-4 transition-all ${
                      isSelf
                        ? "bg-slate-950/60 border-slate-800 opacity-60"
                        : "bg-[#090e18] border-slate-800 hover:border-slate-700 shadow-md"
                    }`}
                  >
                    {/* Player Info Row */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-chakra font-black text-sm text-white shrink-0">
                          {player.photoUrl ? (
                            <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>#{player.jerseyNumber}</span>
                          )}
                        </div>

                        <div className="truncate">
                          <div className="font-chakra font-black text-white text-base truncate flex items-center gap-2">
                            <span>{player.name}</span>
                            {isSelf && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 text-[10px] font-chakra font-black uppercase">
                                YOU (Self)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-chakra flex items-center gap-1.5">
                            <TeamBadge team={team} size="xs" />
                            <span>{team?.name} &bull; {player.position}</span>
                          </div>
                        </div>
                      </div>

                      {/* Current Rating Score Pill */}
                      {!isSelf ? (
                        <div className="text-right">
                          <div
                            className={`px-3 py-1 rounded-xl font-chakra font-black text-base shadow-sm ${getRatingColor(
                              currentScore
                            )}`}
                          >
                            {currentScore.toFixed(1)}
                          </div>
                          <span className="text-[9px] text-slate-400 font-sans block mt-0.5">
                            {getRatingDescription(currentScore)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-chakra italic">Locked</span>
                      )}
                    </div>

                    {/* Quick Rating Controls (if not self) */}
                    {!isSelf && (
                      <div className="space-y-3 pt-2 border-t border-slate-800/80">
                        {/* Quick 1 - 10 Clickable Number Buttons */}
                        <div>
                          <span className="text-[10px] font-chakra font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            Quick Pick Rating:
                          </span>
                          <div className="grid grid-cols-10 gap-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                              const isSelected = Math.round(currentScore) === num;
                              return (
                                <button
                                  type="button"
                                  key={num}
                                  onClick={() => handleRatingChange(player.id, num)}
                                  className={`py-1.5 rounded-lg font-chakra font-black text-xs transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-emerald-400 text-slate-950 ring-2 ring-emerald-300 scale-105"
                                      : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
                                  }`}
                                >
                                  {num}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Slider for fine adjustment */}
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-chakra font-bold text-slate-500">1.0</span>
                          <input
                            type="range"
                            min="1.0"
                            max="10.0"
                            step="0.5"
                            value={currentScore}
                            onChange={(e) => handleRatingChange(player.id, parseFloat(e.target.value))}
                            className="flex-1 accent-emerald-400 h-2 bg-slate-900 rounded-lg cursor-pointer"
                          />
                          <span className="text-[10px] font-chakra font-bold text-slate-500">10.0</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="bg-[#0d131f] rounded-3xl border border-slate-800 p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-chakra font-black text-white text-sm">
                Ready to Record Match Ratings?
              </h4>
              <p className="text-xs text-slate-400">
                Your ratings will be averaged into the official player averages and standings immediately.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-chakra font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>{isSubmitting ? "Submitting Ratings..." : "Submit Match Ratings"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
