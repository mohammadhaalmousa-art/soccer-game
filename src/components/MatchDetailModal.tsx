import React, { useState } from "react";
import { Match, Team, PlayerProfile, CustomStatDefinition } from "../types";
import { 
  X, 
  Trophy, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Sparkles, 
  Star,
  Users2,
  Clock,
  Shirt,
  ShieldCheck,
  Radio,
  Sliders,
  Eye,
  Activity
} from "lucide-react";
import { FORMATION_PRESETS, getFormationPreset } from "../utils/leagueCalculations";
import { MiniPitchLineup } from "./MiniPitchLineup";
import { PenaltyShootoutView } from "./PenaltyShootoutView";

interface MatchDetailModalProps {
  match: Match | null;
  teams: Team[];
  players: PlayerProfile[];
  customStats: CustomStatDefinition[];
  isAdminUnlocked: boolean;
  onClose: () => void;
  onApproveMatch?: (matchId: string) => void;
  onRejectMatch?: (matchId: string) => void;
  onEditMatch?: (match: Match) => void;
  onOpenRateMatch?: (matchId: string) => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  match,
  teams,
  players,
  customStats,
  isAdminUnlocked,
  onClose,
  onApproveMatch,
  onRejectMatch,
  onEditMatch,
  onOpenRateMatch,
}) => {
  if (!match) return null;

  const [activeSubTab, setActiveSubTab] = useState<"timeline" | "lineups" | "ratings" | "shootout">("timeline");

  const safeTeams = teams || [];
  const safePlayers = players || [];
  const safeCustomStats = customStats || [];

  const home = safeTeams.find((t) => t.id === match.homeTeamId);
  const away = safeTeams.find((t) => t.id === match.awayTeamId);
  const motm = match.motmPlayerId ? safePlayers.find((p) => p.id === match.motmPlayerId) : null;

  const getPlayer = (playerId: string) => safePlayers.find((p) => p.id === playerId);
  const getCustomStat = (statId: string) => safeCustomStats.find((s) => s.id === statId);

  // Group events chronologically
  const sortedEvents = [...(match.events || [])].sort((a, b) => (a.minute || 0) - (b.minute || 0));

  // Extract ratings entries sorted descending
  const ratingsEntries: { player: PlayerProfile | undefined; rating: number; isMotm: boolean }[] = Object.entries(
    match.playerRatings || {}
  )
    .map(([pid, r]) => {
      const p = getPlayer(pid);
      return {
        player: p,
        rating: Number(r),
        isMotm: match.motmPlayerId === pid,
      };
    })
    .filter((entry) => Boolean(entry.player));

  ratingsEntries.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#090e18] border border-slate-700/80 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-[#090e18]/95 backdrop-blur-md border-b border-slate-800 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-chakra font-black text-white text-base sm:text-lg">
              {match.title}
            </span>
            {match.status === "APPROVED" ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                OFFICIAL
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <AlertCircle className="w-3 h-3 text-amber-400" />
                PENDING APPROVAL
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onEditMatch && (
              <button
                type="button"
                onClick={() => {
                  onEditMatch(match);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 text-xs font-chakra font-bold transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Modify Stats</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big FotMob Scoreboard */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-[#111927] to-[#090e18] border-b border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-sans mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {match.date}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {match.venue || "Community Pitch"}
            </span>
          </div>

          <div className="grid grid-cols-5 items-center gap-3">
            {/* Home Team */}
            <div className="col-span-2 flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-3xl sm:text-4xl shadow-md mb-2">
                {home?.badgeEmoji || "🛡️"}
              </div>
              <h3 className="font-chakra font-black text-white text-base sm:text-lg">
                {home?.name || "Home Team"}
              </h3>
              <p className="text-xs text-slate-400 font-semibold">{home?.slogan || ""}</p>
            </div>

            {/* Score */}
            <div className="col-span-1 flex flex-col items-center justify-center">
              <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-2xl sm:text-4xl font-chakra font-black text-white flex items-center gap-2 shadow-xl">
                <span className={match.homeScore > match.awayScore || (match.penaltyWinnerTeamId === match.homeTeamId) ? "text-emerald-400" : ""}>
                  {match.homeScore}
                </span>
                <span className="text-slate-600">:</span>
                <span className={match.awayScore > match.homeScore || (match.penaltyWinnerTeamId === match.awayTeamId) ? "text-emerald-400" : ""}>
                  {match.awayScore}
                </span>
              </div>
              {match.penaltyScore ? (
                <div className="mt-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[11px] font-chakra font-black text-amber-300 whitespace-nowrap">
                  ({match.penaltyScore.home} - {match.penaltyScore.away} Pens)
                </div>
              ) : (
                <span className="text-[10px] font-chakra font-bold text-slate-400 mt-1 uppercase tracking-widest">
                  {match.status === "APPROVED" ? "Full Time" : "Submitted"}
                </span>
              )}
              {match.outcomeNote && (
                <span className="text-[10px] font-chakra font-semibold text-emerald-400 mt-1 text-center">
                  {match.outcomeNote}
                </span>
              )}
            </div>

            {/* Away Team */}
            <div className="col-span-2 flex flex-col items-center sm:items-end text-center sm:text-right">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-3xl sm:text-4xl shadow-md mb-2">
                {away?.badgeEmoji || "⚡"}
              </div>
              <h3 className="font-chakra font-black text-white text-base sm:text-lg">
                {away?.name || "Away Team"}
              </h3>
              <p className="text-xs text-slate-400 font-semibold">{away?.slogan || ""}</p>
            </div>
          </div>

          {/* MOTM Callout */}
          {motm && (
            <div className="mt-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-chakra font-bold text-amber-400 uppercase tracking-wider block">
                    Man of the Match
                  </span>
                  <span className="text-sm font-chakra font-black text-white">
                    {motm.name} <span className="text-slate-400 text-xs font-normal">({motm.position})</span>
                  </span>
                </div>
              </div>
              {match.playerRatings?.[motm.id] && (
                <div className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-chakra font-black text-xs">
                  {match.playerRatings[motm.id]} ★
                </div>
              )}
            </div>
          )}

          {/* Admin Approval Notice / Action Banner */}
          {match.status === "PENDING_APPROVAL" && (
            <div className="mt-4 p-3 rounded-2xl bg-slate-900 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Submitted by <strong>{match.submittedBy}</strong>. Awaiting official verification.</span>
              </div>

              {isAdminUnlocked && onApproveMatch && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => onApproveMatch(match.id)}
                    className="flex-1 sm:flex-initial px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-chakra font-black text-xs transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    Approve Result
                  </button>
                  {onRejectMatch && (
                    <button
                      onClick={() => onRejectMatch(match.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-chakra font-bold text-xs transition-all cursor-pointer"
                    >
                      Reject
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 px-4 sm:px-6 bg-slate-950">
          <button
            onClick={() => setActiveSubTab("timeline")}
            className={`py-3 px-4 text-xs font-chakra font-bold transition-all border-b-2 cursor-pointer ${
              activeSubTab === "timeline"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Events & Timeline ({sortedEvents.length})
          </button>
          <button
            onClick={() => setActiveSubTab("ratings")}
            className={`py-3 px-4 text-xs font-chakra font-bold transition-all border-b-2 cursor-pointer ${
              activeSubTab === "ratings"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Player Ratings ({ratingsEntries.length})
          </button>
          <button
            onClick={() => setActiveSubTab("lineups")}
            className={`py-3 px-4 text-xs font-chakra font-bold transition-all border-b-2 cursor-pointer ${
              activeSubTab === "lineups"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Tactical Lineups
          </button>
          {(match.penaltyScore || match.penaltyShootout) && (
            <button
              onClick={() => setActiveSubTab("shootout")}
              className={`py-3 px-4 text-xs font-chakra font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === "shootout"
                  ? "border-amber-400 text-amber-400 bg-amber-500/10"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>🥅 Shootout</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                {match.penaltyScore ? `${match.penaltyScore.home}-${match.penaltyScore.away}` : "PENS"}
              </span>
            </button>
          )}
        </div>

        {/* Sub-Tab Content */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          {/* TAB 1: TIMELINE */}
          {activeSubTab === "timeline" && (
            <div className="space-y-3">
              {sortedEvents.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No individual match events recorded for this game.
                </div>
              ) : (
                sortedEvents.map((evt) => {
                  const p = getPlayer(evt.playerId);
                  const assistP = evt.assistPlayerId ? getPlayer(evt.assistPlayerId) : null;
                  const cStat = evt.customStatId ? getCustomStat(evt.customStatId) : null;
                  const isHomeEvent = evt.teamId === match.homeTeamId;

                  return (
                    <div
                      key={evt.id}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                        evt.type === "GOAL"
                          ? "bg-emerald-950/20 border-emerald-500/30"
                          : evt.type === "YELLOW_CARD"
                          ? "bg-amber-950/20 border-amber-500/30"
                          : evt.type === "RED_CARD"
                          ? "bg-rose-950/20 border-rose-500/30"
                          : "bg-slate-900 border-slate-800"
                      }`}
                    >
                      {/* Minute badge */}
                      <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-chakra font-black text-xs text-emerald-400 shrink-0">
                        {evt.minute ? `${evt.minute}'` : "•"}
                      </div>

                      {/* Event Icon */}
                      <div className="text-xl shrink-0">
                        {evt.type === "GOAL" && "⚽"}
                        {evt.type === "YELLOW_CARD" && "🟨"}
                        {evt.type === "RED_CARD" && "🟥"}
                        {evt.type === "CUSTOM_STAT" && "🪄"}
                        {evt.type === "OWN_GOAL" && "🤦"}
                      </div>

                      {/* Event Text */}
                      <div className="flex-1">
                        <div className="font-chakra font-bold text-white text-sm">
                          {p?.name || "Player"}{" "}
                          <span className="text-xs text-slate-400 font-normal">
                            ({isHomeEvent ? home?.shortName : away?.shortName})
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-sans">
                          {evt.type === "GOAL" && (
                            <span>
                              Goal {assistP && <>• Assist by <strong className="text-slate-300">{assistP.name}</strong></>}
                            </span>
                          )}
                          {evt.type === "CUSTOM_STAT" && (
                            <span className="text-cyan-300 font-medium">
                              {cStat?.name || "Custom Stat"} {evt.note && `(${evt.note})`}
                            </span>
                          )}
                          {evt.type === "YELLOW_CARD" && <span>Yellow Card</span>}
                          {evt.type === "RED_CARD" && <span className="text-rose-400">Straight Red Card</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Penalty Shootout Section on Timeline */}
              {(match.penaltyScore || match.penaltyShootout) && (
                <div className="mt-5 pt-4 border-t border-slate-800">
                  <div className="text-xs font-chakra font-bold text-amber-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🥅 Official Penalty Shootout Record</span>
                  </div>
                  <PenaltyShootoutView
                    shootout={
                      match.penaltyShootout || {
                        homeScore: match.penaltyScore?.home ?? 0,
                        awayScore: match.penaltyScore?.away ?? 0,
                        winnerTeamId: match.penaltyWinnerTeamId,
                        shots: [],
                      }
                    }
                    homeTeamName={home?.name || "Home Team"}
                    awayTeamName={away?.name || "Away Team"}
                    homeBadgeEmoji={home?.badgeEmoji || "🔴"}
                    awayBadgeEmoji={away?.badgeEmoji || "⚡"}
                    homeTeamId={match.homeTeamId}
                    awayTeamId={match.awayTeamId}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PLAYER RATINGS */}
          {activeSubTab === "ratings" && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>Player performance rated on official 1.0 – 10.0 scale</span>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-chakra font-bold">
                    Match Average: {(ratingsEntries.reduce((acc, curr) => acc + curr.rating, 0) / (ratingsEntries.length || 1)).toFixed(1)}
                  </span>
                  {onOpenRateMatch && (
                    <button
                      onClick={() => {
                        onOpenRateMatch(match.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-chakra font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-emerald-500/20 flex items-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                      <span>Rate This Game</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ratingsEntries.map((item, idx) => {
                  const isHome = item.player?.teamId === match.homeTeamId;
                  const t = isHome ? home : away;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                        item.isMotm
                          ? "bg-amber-500/10 border-amber-500/40 shadow-sm"
                          : "bg-slate-900 border-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-chakra font-bold text-xs text-white">
                          #{item.player?.jerseyNumber || "•"}
                        </div>
                        <div>
                          <div className="font-chakra font-bold text-white text-sm flex items-center gap-1.5">
                            {item.player?.name}
                            {item.isMotm && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black">
                                MVP
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {t?.shortName} • {item.player?.position}
                          </div>
                        </div>
                      </div>

                      {/* Rating Score Pill */}
                      <div
                        className={`px-3 py-1 rounded-xl font-chakra font-black text-sm ${
                          (item.rating || 0) >= 9.0
                            ? "bg-emerald-500 text-slate-950"
                            : (item.rating || 0) >= 8.0
                            ? "bg-cyan-500 text-slate-950"
                            : (item.rating || 0) >= 7.0
                            ? "bg-amber-500 text-slate-950"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {(item.rating || 0).toFixed(1)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: LINEUPS */}
          {activeSubTab === "lineups" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-chakra font-bold text-slate-300">
                    Match Tactical Board & Formations
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Pitch visualizer rendered for {home?.shortName || "HOM"} and {away?.shortName || "AWY"}
                </span>
              </div>

              {/* Side-by-side Mini Pitch Tactical Lineups */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Home Team Mini Pitch */}
                {home && (
                  <MiniPitchLineup
                    team={home}
                    formation={match.lineups?.home.formation || home.formation}
                    starterIds={match.lineups?.home.starters || home.startingLineup}
                    benchIds={match.lineups?.home.subs || home.substitutes || []}
                    allPlayers={players}
                    playerRatings={match.playerRatings}
                    motmPlayerId={match.motmPlayerId}
                    dpotmPlayerId={match.dpotmPlayerId}
                    size="md"
                  />
                )}

                {/* Away Team Mini Pitch */}
                {away && (
                  <MiniPitchLineup
                    team={away}
                    formation={match.lineups?.away.formation || away.formation}
                    starterIds={match.lineups?.away.starters || away.startingLineup}
                    benchIds={match.lineups?.away.subs || away.substitutes || []}
                    allPlayers={players}
                    playerRatings={match.playerRatings}
                    motmPlayerId={match.motmPlayerId}
                    dpotmPlayerId={match.dpotmPlayerId}
                    isAway={true}
                    size="md"
                  />
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SHOOTOUT */}
          {activeSubTab === "shootout" && (
            <div className="space-y-4">
              <PenaltyShootoutView
                shootout={
                  match.penaltyShootout || {
                    homeScore: match.penaltyScore?.home ?? 0,
                    awayScore: match.penaltyScore?.away ?? 0,
                    winnerTeamId: match.penaltyWinnerTeamId,
                    shots: [],
                  }
                }
                homeTeamName={home?.name || "Home Team"}
                awayTeamName={away?.name || "Away Team"}
                homeBadgeEmoji={home?.badgeEmoji || "🔴"}
                awayBadgeEmoji={away?.badgeEmoji || "⚡"}
                homeTeamId={match.homeTeamId}
                awayTeamId={match.awayTeamId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
