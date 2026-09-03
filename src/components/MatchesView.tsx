import React, { useState } from "react";
import { Match, Team, PlayerProfile, CustomStatDefinition } from "../types";
import { 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Trophy, 
  Plus,
  Sparkles,
  Activity,
  Zap,
  TrendingUp,
  Percent,
  Flame,
  ChevronDown,
  Clock
} from "lucide-react";
import { TeamBadge } from "./TeamBadge";

interface MatchesViewProps {
  matches: Match[];
  teams: Team[];
  players: PlayerProfile[];
  customStats: CustomStatDefinition[];
  onOpenSubmitMatch: () => void;
  onOpenMatchDetails: (match: Match) => void;
  onEditMatch?: (match: Match) => void;
}

export const MatchesView: React.FC<MatchesViewProps> = ({
  matches,
  teams,
  players,
  customStats,
  onOpenSubmitMatch,
  onOpenMatchDetails,
  onEditMatch,
}) => {
  const [filterStatus, setFilterStatus] = useState<"ALL" | "APPROVED" | "PENDING_APPROVAL">("ALL");
  const [showPredictor, setShowPredictor] = useState<boolean>(true);
  const [predTeam1, setPredTeam1] = useState<string>(teams[0]?.id || "team_red");
  const [predTeam2, setPredTeam2] = useState<string>(teams[1]?.id || "team_blue");

  const safeMatches = matches || [];
  const safePlayers = players || [];
  const safeTeams = teams || [];

  const getTeam = (teamId: string) => safeTeams.find((t) => t.id === teamId);
  const getPlayer = (playerId: string) => safePlayers.find((p) => p.id === playerId);

  // Active visible matches (exclude rejected matches and Game 3)
  const visibleMatches = safeMatches.filter(
    (m) => m.status !== "REJECTED" && m.id !== "match_1788393953358_fouv" && m.title !== "Game 3"
  );

  const filteredMatches = visibleMatches.filter((m) => {
    if (filterStatus === "ALL") return true;
    return m.status === filterStatus;
  });

  const pendingCount = visibleMatches.filter((m) => m.status === "PENDING_APPROVAL").length;

  // Win Predictor Calculation Engine based on 60-min match results, xG, and player rating averages
  const computePrediction = () => {
    const t1 = getTeam(predTeam1) || safeTeams[0];
    const t2 = getTeam(predTeam2) || safeTeams[1] || safeTeams[0];

    const approvedMatches = safeMatches.filter((m) => m.status === "APPROVED");
    const h2h = approvedMatches.filter(
      (m) => (m.homeTeamId === t1?.id && m.awayTeamId === t2?.id) || (m.homeTeamId === t2?.id && m.awayTeamId === t1?.id)
    );

    let t1Wins = 0;
    let t2Wins = 0;
    let draws = 0;
    let t1Goals = 0;
    let t2Goals = 0;

    h2h.forEach((m) => {
      const isT1Home = m.homeTeamId === t1?.id;
      const g1 = isT1Home ? m.homeScore : m.awayScore;
      const g2 = isT1Home ? m.awayScore : m.homeScore;
      t1Goals += g1;
      t2Goals += g2;

      if (g1 > g2 || m.penaltyWinnerTeamId === t1?.id) t1Wins++;
      else if (g2 > g1 || m.penaltyWinnerTeamId === t2?.id) t2Wins++;
      else draws++;
    });

    const p1List = safePlayers.filter((p) => p.teamId === t1?.id);
    const p2List = safePlayers.filter((p) => p.teamId === t2?.id);

    const p1AvgRating = p1List.length
      ? p1List.reduce((acc, p) => acc + p.stats.averageRating, 0) / p1List.length
      : 7.0;
    const p2AvgRating = p2List.length
      ? p2List.reduce((acc, p) => acc + p.stats.averageRating, 0) / p2List.length
      : 7.0;

    // Weight factors
    const ratingDiff = (p1AvgRating - p2AvgRating) * 15; // each 0.1 rating diff = 1.5%
    const h2hDiff = h2h.length > 0 ? ((t1Wins - t2Wins) / h2h.length) * 20 : 0;
    
    let prob1 = 48 + ratingDiff + h2hDiff;
    prob1 = Math.max(15, Math.min(85, Math.round(prob1)));
    const probDraw = 12;
    const prob2 = 100 - prob1 - probDraw;

    // Expected 60-min Goals & xG
    const expGoals1 = (6.0 + (prob1 - 50) * 0.08).toFixed(1);
    const expGoals2 = (6.0 + (prob2 - 50) * 0.08).toFixed(1);
    const expXg1 = (5.8 + (prob1 - 50) * 0.07).toFixed(1);
    const expXg2 = (5.8 + (prob2 - 50) * 0.07).toFixed(1);

    return {
      t1,
      t2,
      h2hCount: h2h.length,
      t1Wins,
      t2Wins,
      draws,
      prob1,
      probDraw,
      prob2,
      expGoals1,
      expGoals2,
      expXg1,
      expXg2,
      p1AvgRating: p1AvgRating.toFixed(1),
      p2AvgRating: p2AvgRating.toFixed(1),
    };
  };

  const pred = computePrediction();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#121215] p-5 rounded-3xl border border-zinc-800 shadow-xl">
        <div>
          <h2 className="text-lg sm:text-xl font-black font-chakra text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-white" />
            FIXTURES & MATCH RESULTS
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Official 60-min league match records, timelines, goalscorers, xG & win predictor
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center bg-zinc-900 p-1 rounded-2xl border border-zinc-800 text-xs font-chakra">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterStatus === "ALL"
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              All ({visibleMatches.length})
            </button>
            <button
              onClick={() => setFilterStatus("APPROVED")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterStatus === "APPROVED"
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Official
            </button>
            <button
              onClick={() => setFilterStatus("PENDING_APPROVAL")}
              className={`relative px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterStatus === "PENDING_APPROVAL"
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>Pending</span>
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-white ring-2 ring-black animate-ping" />
              )}
            </button>
          </div>

          <button
            onClick={() => setShowPredictor(!showPredictor)}
            className={`px-3.5 py-2 rounded-2xl border font-chakra font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              showPredictor
                ? "bg-zinc-800 text-white border-zinc-600"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-white" />
            <span>Win Predictor</span>
          </button>

          <button
            onClick={onOpenSubmitMatch}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-zinc-200 text-black font-chakra font-black text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-black stroke-[3]" />
            <span>Submit Result</span>
          </button>
        </div>
      </div>

      {/* Interactive Match Win Predictor Banner */}
      {showPredictor && (
        <div className="bg-[#121215] rounded-3xl border border-zinc-800 p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-white text-black">
                <TrendingUp className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-chakra font-black text-white text-sm sm:text-base">
                  60-MINUTE MATCH WIN PREDICTOR
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Forecast win probability, xG and scoreline based on squad ratings and historical match records
                </p>
              </div>
            </div>

            {/* Team Selectors */}
            <div className="flex items-center gap-2 text-xs font-chakra font-bold">
              <select
                value={predTeam1}
                onChange={(e) => setPredTeam1(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.badgeEmoji} {t.name}
                  </option>
                ))}
              </select>
              <span className="text-zinc-500">VS</span>
              <select
                value={predTeam2}
                onChange={(e) => setPredTeam2(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.badgeEmoji} {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Probability Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-chakra font-black">
              <div className="flex items-center gap-1.5 text-white">
                <TeamBadge team={pred.t1} size="xs" />
                <span>{pred.t1.name} Win</span>
                <span className="font-mono text-sm">({pred.prob1}%)</span>
              </div>
              <div className="text-zinc-500 font-mono text-[11px]">
                Draw ({pred.probDraw}%)
              </div>
              <div className="flex items-center gap-1.5 text-white">
                <span className="font-mono text-sm">({pred.prob2}%)</span>
                <span>{pred.t2.name} Win</span>
                <TeamBadge team={pred.t2} size="xs" />
              </div>
            </div>

            {/* Visual Probability Distribution Bar */}
            <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden flex gap-0.5 border border-zinc-800">
              <div
                style={{ width: `${pred.prob1}%` }}
                className="h-full bg-white transition-all duration-500"
                title={`${pred.t1.name}: ${pred.prob1}%`}
              />
              <div
                style={{ width: `${pred.probDraw}%` }}
                className="h-full bg-zinc-700 transition-all duration-500"
                title={`Draw: ${pred.probDraw}%`}
              />
              <div
                style={{ width: `${pred.prob2}%` }}
                className="h-full bg-zinc-400 transition-all duration-500"
                title={`${pred.t2.name}: ${pred.prob2}%`}
              />
            </div>
          </div>

          {/* Projected Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center text-xs font-chakra">
            <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase">Projected Score</div>
              <div className="text-base font-black text-white font-mono mt-0.5">
                {pred.expGoals1} - {pred.expGoals2}
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase">Expected Goals (xG)</div>
              <div className="text-base font-black text-white font-mono mt-0.5">
                {pred.expXg1} - {pred.expXg2}
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase">Squad Avg Rating</div>
              <div className="text-base font-black text-white font-mono mt-0.5">
                ★ {pred.p1AvgRating} vs ★ {pred.p2AvgRating}
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase">H2H Record (60m)</div>
              <div className="text-base font-black text-white font-mono mt-0.5">
                {pred.t1Wins}W - {pred.draws}D - {pred.t2Wins}W
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMatches.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-[#121215] rounded-3xl border border-zinc-800">
            <Calendar className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-400">No matches found in this category.</p>
          </div>
        ) : (
          filteredMatches.map((match) => {
            const home = getTeam(match.homeTeamId);
            const away = getTeam(match.awayTeamId);
            const motmPlayer = match.motmPlayerId ? getPlayer(match.motmPlayerId) : null;

            const matchEvents = match.events || [];

            // Extract goal scorers
            const homeGoals = matchEvents.filter(
              (e) => e.type === "GOAL" && e.teamId === match.homeTeamId
            );
            const awayGoals = matchEvents.filter(
              (e) => e.type === "GOAL" && e.teamId === match.awayTeamId
            );

            // Extract custom stats count
            const customStatsCount = matchEvents.filter((e) => e.type === "CUSTOM_STAT").length;

            return (
              <div
                key={match.id}
                onClick={() => onOpenMatchDetails(match)}
                className="group relative bg-[#121215] hover:bg-[#18181b] transition-all rounded-3xl border border-zinc-800 hover:border-zinc-600 p-5 cursor-pointer shadow-lg flex flex-col justify-between"
              >
                {/* Card Top: Match Header */}
                <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-3 mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-chakra font-black text-white text-sm">
                      {match.title}
                    </span>
                    {match.status === "APPROVED" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-chakra font-bold uppercase bg-white text-black">
                        <CheckCircle2 className="w-3 h-3 text-black" />
                        FT
                      </span>
                    ) : match.status === "SCHEDULED" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-chakra font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
                        <Clock className="w-3 h-3 text-blue-400" />
                        Upcoming
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-chakra font-bold uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
                        <AlertCircle className="w-3 h-3 text-zinc-400" />
                        Pending Approval
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-zinc-400 text-[11px] font-mono">
                    <Calendar className="w-3 h-3 text-zinc-500" />
                    <span>
                      {(() => {
                        const d = match.date || (match as any).matchDate || "";
                        if (!d) return "Date TBD";
                        return d.includes("T") ? d.split("T")[0] : d;
                      })()}
                    </span>
                  </div>
                </div>

                {/* Scoreboard Row */}
                <div className="grid grid-cols-5 items-center gap-2 my-2">
                  {/* Home Team */}
                  <div className="col-span-2 flex items-center gap-2.5">
                    <TeamBadge team={home} size="lg" />
                    <div className="truncate">
                      <div className="font-chakra font-black text-white text-sm sm:text-base truncate">
                        {home?.name || "Red Team"}
                      </div>
                      <div className="text-[10px] font-mono font-semibold text-zinc-400">
                        {home?.shortName || "RED"}
                      </div>
                    </div>
                  </div>

                  {/* Score Pill */}
                  <div className="col-span-1 flex flex-col items-center justify-center">
                    {match.status === "SCHEDULED" ? (
                      <div className="px-3 py-1 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-chakra font-black tracking-wider text-blue-300 flex items-center gap-1 shadow-inner">
                        VS
                      </div>
                    ) : (
                      <div className="px-3.5 py-1.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-base sm:text-xl font-chakra font-black tracking-wider text-white flex items-center gap-1.5 shadow-inner">
                        <span className={match.homeScore > match.awayScore || (match.penaltyWinnerTeamId === match.homeTeamId) ? "text-white font-black" : "text-zinc-400"}>
                          {match.homeScore}
                        </span>
                        <span className="text-zinc-600">-</span>
                        <span className={match.awayScore > match.homeScore || (match.penaltyWinnerTeamId === match.awayTeamId) ? "text-white font-black" : "text-zinc-400"}>
                          {match.awayScore}
                        </span>
                      </div>
                    )}

                    {/* xG pill */}
                    {match.homeXg !== undefined && match.awayXg !== undefined && (
                      <div className="text-[10px] font-mono font-bold text-zinc-400 mt-1 flex items-center gap-1">
                        <span>xG</span>
                        <span className="text-zinc-300">{match.homeXg.toFixed(1)}</span>
                        <span>-</span>
                        <span className="text-zinc-300">{match.awayXg.toFixed(1)}</span>
                      </div>
                    )}

                    {match.penaltyScore && (
                      <span className="text-[10px] font-mono font-bold text-zinc-300 mt-0.5 whitespace-nowrap">
                        ({match.penaltyScore.home}-{match.penaltyScore.away} Pens)
                      </span>
                    )}
                    {match.outcomeNote && !match.penaltyScore && (
                      <span className="text-[9px] font-chakra font-semibold text-zinc-400 mt-0.5 text-center truncate max-w-full">
                        {match.outcomeNote}
                      </span>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="col-span-2 flex items-center justify-end gap-2.5 text-right">
                    <div className="truncate">
                      <div className="font-chakra font-black text-white text-sm sm:text-base truncate">
                        {away?.name || "Blue Team"}
                      </div>
                      <div className="text-[10px] font-mono font-semibold text-zinc-400">
                        {away?.shortName || "BLU"}
                      </div>
                    </div>
                    <TeamBadge team={away} size="lg" />
                  </div>
                </div>

                {/* Goal Scorers Snippet */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 mt-3 pt-2.5 border-t border-zinc-800/80 font-sans">
                  {/* Home Scorers */}
                  <div className="space-y-0.5 truncate">
                    {homeGoals.slice(0, 2).map((g, idx) => {
                      const p = getPlayer(g.playerId);
                      return (
                        <div key={idx} className="flex items-center gap-1 truncate text-zinc-300">
                          <span>⚽</span>
                          <span className="font-semibold">{p?.name || "Goal"}</span>
                          {g.minute && <span className="text-zinc-500 font-mono">({g.minute}')</span>}
                        </div>
                      );
                    })}
                    {homeGoals.length > 2 && (
                      <span className="text-[10px] text-zinc-500 font-mono">+{homeGoals.length - 2} more</span>
                    )}
                  </div>

                  {/* Away Scorers */}
                  <div className="space-y-0.5 truncate text-right">
                    {awayGoals.slice(0, 2).map((g, idx) => {
                      const p = getPlayer(g.playerId);
                      return (
                        <div key={idx} className="flex items-center justify-end gap-1 truncate text-zinc-300">
                          {g.minute && <span className="text-zinc-500 font-mono">({g.minute}')</span>}
                          <span className="font-semibold">{p?.name || "Goal"}</span>
                          <span>⚽</span>
                        </div>
                      );
                    })}
                    {awayGoals.length > 2 && (
                      <span className="text-[10px] text-zinc-500 font-mono">+{awayGoals.length - 2} more</span>
                    )}
                  </div>
                </div>

                {/* Bottom Footer Info */}
                <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 text-[11px] text-zinc-400 border-t border-zinc-800/60">
                  <div className="flex items-center gap-2 flex-wrap">
                    {motmPlayer && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-900 text-zinc-200 border border-zinc-700 font-chakra font-bold text-[10px]">
                        <Trophy className="w-3 h-3 text-white" />
                        MOTM: {motmPlayer.name}
                      </span>
                    )}
                    {customStatsCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-zinc-400 text-[10px] font-chakra">
                        <Sparkles className="w-3 h-3 text-zinc-400" />
                        {customStatsCount} custom stats
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {onEditMatch && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditMatch(match);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-chakra font-bold text-[11px] border border-zinc-800 transition-colors cursor-pointer"
                        title="Modify game statistics, scores, events, ratings"
                      >
                        Modify Stats
                      </button>
                    )}
                    <div className="flex items-center gap-1 text-zinc-300 font-chakra font-bold text-xs group-hover:text-white group-hover:translate-x-0.5 transition-all">
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

