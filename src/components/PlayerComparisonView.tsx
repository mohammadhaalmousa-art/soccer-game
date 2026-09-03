import React, { useState } from "react";
import { PlayerProfile, Team, Match, CustomStatDefinition } from "../types";
import { PlayerTraitPentagonChart } from "./PlayerTraitPentagonChart";
import { TeamBadge } from "./TeamBadge";
import { 
  GitCompare, 
  Trophy, 
  Flame, 
  Sparkles, 
  Shield, 
  Target, 
  Crosshair, 
  Zap, 
  Award,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Percent,
  Activity,
  Star
} from "lucide-react";

interface PlayerComparisonViewProps {
  players: PlayerProfile[];
  teams: Team[];
  matches: Match[];
  customStats: CustomStatDefinition[];
  onOpenMatchDetails?: (match: Match) => void;
}

export const PlayerComparisonView: React.FC<PlayerComparisonViewProps> = ({
  players,
  teams,
  matches,
  customStats,
  onOpenMatchDetails,
}) => {
  const safePlayers = players || [];
  const safeTeams = teams || [];
  const safeMatches = matches || [];
  const safeCustomStats = customStats || [];

  // Default to Samuel (Red) vs Nickolas (Blue) or first two available
  const defaultPlayer1 = safePlayers.find((p) => p.id === "p_samuel") || safePlayers[0];
  const defaultPlayer2 = safePlayers.find((p) => p.id === "p_nickolas") || safePlayers[1] || safePlayers[0];

  const [player1Id, setPlayer1Id] = useState<string>(defaultPlayer1?.id || "");
  const [player2Id, setPlayer2Id] = useState<string>(defaultPlayer2?.id || "");

  const p1 = safePlayers.find((p) => p.id === player1Id) || defaultPlayer1;
  const p2 = safePlayers.find((p) => p.id === player2Id) || defaultPlayer2;

  const t1 = safeTeams.find((t) => t.id === p1?.teamId);
  const t2 = safeTeams.find((t) => t.id === p2?.teamId);

  // Preset quick comparisons
  const presets = [
    { name: "Golden Boot Duel", p1: "p_samuel", p2: "p_nickolas", desc: "Top scorers clash (6 goals each)" },
    { name: "Midfield Maestros", p1: "p_mohammad", p2: "p_maxime", desc: "Assist kings & creative engines" },
    { name: "Rock vs Engine", p1: "p_marios", p2: "p_albert", desc: "Red defensive anchor vs Blue workhorse" },
    { name: "Striker vs Wall", p1: "p_samuel", p2: "p_eliot", desc: "Deadly finisher vs Shootout hero" },
    { name: "Flank Dynamo", p1: "p_alki", p2: "p_alend", desc: "Pace, crossing & transition specialists" },
  ];

  // Head-to-head matches calculation
  const approvedMatches = safeMatches.filter((m) => m.status === "APPROVED");
  const h2hMatches = approvedMatches.filter((m) => {
    if (!p1 || !p2) return false;
    const isP1In = m.homeTeamId === p1.teamId || m.awayTeamId === p1.teamId;
    const isP2In = m.homeTeamId === p2.teamId || m.awayTeamId === p2.teamId;
    return isP1In && isP2In;
  });

  const getMetricLeader = (v1: number, v2: number, inverse = false) => {
    if (v1 === v2) return "TIE";
    if (inverse) {
      return v1 < v2 ? "P1" : "P2";
    }
    return v1 > v2 ? "P1" : "P2";
  };

  const statRows = [
    {
      label: "Match Rating",
      v1: p1?.stats?.averageRating || 0,
      v2: p2?.stats?.averageRating || 0,
      format: (v: number) => `★ ${v.toFixed(1)}`,
      unit: "out of 10",
      max: 10,
    },
    {
      label: "Total Goals",
      v1: p1?.stats?.goals || 0,
      v2: p2?.stats?.goals || 0,
      format: (v: number) => `${v} G`,
      unit: "goals",
      max: Math.max(p1?.stats?.goals || 1, p2?.stats?.goals || 1, 8),
    },
    {
      label: "Goals / 60 Min",
      v1: p1?.stats?.goalsPer60 || (p1?.stats?.goals ? p1.stats.goals / Math.max(p1.stats.matchesPlayed, 1) : 0),
      v2: p2?.stats?.goalsPer60 || (p2?.stats?.goals ? p2.stats.goals / Math.max(p2.stats.matchesPlayed, 1) : 0),
      format: (v: number) => `${v.toFixed(2)}`,
      unit: "per game",
      max: 4.0,
    },
    {
      label: "Expected Goals (xG)",
      v1: p1?.stats?.xg || (p1?.stats?.goals ? p1.stats.goals * 0.85 : 0),
      v2: p2?.stats?.xg || (p2?.stats?.goals ? p2.stats.goals * 0.85 : 0),
      format: (v: number) => `${v.toFixed(1)} xG`,
      unit: "expected",
      max: Math.max(p1?.stats?.xg || 1, p2?.stats?.xg || 1, 8),
    },
    {
      label: "Total Assists",
      v1: p1?.stats?.assists || 0,
      v2: p2?.stats?.assists || 0,
      format: (v: number) => `${v} A`,
      unit: "assists",
      max: Math.max(p1?.stats?.assists || 1, p2?.stats?.assists || 1, 6),
    },
    {
      label: "Goal Contributions (G+A)",
      v1: (p1?.stats?.goals || 0) + (p1?.stats?.assists || 0),
      v2: (p2?.stats?.goals || 0) + (p2?.stats?.assists || 0),
      format: (v: number) => `${v} G+A`,
      unit: "total",
      max: Math.max((p1?.stats?.goals || 0) + (p1?.stats?.assists || 0), (p2?.stats?.goals || 0) + (p2?.stats?.assists || 0), 10),
    },
    {
      label: "Win Rate %",
      v1: p1?.stats?.winRate || 50,
      v2: p2?.stats?.winRate || 50,
      format: (v: number) => `${v}%`,
      unit: "win %",
      max: 100,
    },
    {
      label: "Man of the Match (MOTM)",
      v1: p1?.stats?.motmCount || 0,
      v2: p2?.stats?.motmCount || 0,
      format: (v: number) => `${v} 🏆`,
      unit: "awards",
      max: 3,
    },
    {
      label: "Defensive POTM (DPOTM)",
      v1: p1?.stats?.dpotmCount || 0,
      v2: p2?.stats?.dpotmCount || 0,
      format: (v: number) => `${v} 🛡️`,
      unit: "awards",
      max: 3,
    },
    {
      label: "Matches Played",
      v1: p1?.stats?.matchesPlayed || 0,
      v2: p2?.stats?.matchesPlayed || 0,
      format: (v: number) => `${v} (60m)`,
      unit: "caps",
      max: 5,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#121215] p-5 rounded-3xl border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-chakra font-black">
              <GitCompare className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-black font-chakra text-white tracking-wide">
              PLAYER COMPARISON & TRAIT LAB
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Head-to-head metrics, scoring rates, percentile trait pentagons, and direct fixtures
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full pb-1">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPlayer1Id(preset.p1);
                setPlayer2Id(preset.p2);
              }}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-chakra font-bold text-zinc-300 hover:text-white whitespace-nowrap transition-colors cursor-pointer shrink-0"
              title={preset.desc}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selectors & Fighter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Player 1 Card (Emerald accent) */}
        <div className="bg-[#121215] rounded-3xl border border-emerald-500/30 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="text-[10px] font-chakra font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              PLAYER 1 (EMERALD)
            </span>
            {/* Player 1 Dropdown */}
            <div className="relative">
              <select
                value={player1Id}
                onChange={(e) => setPlayer1Id(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-1.5 text-xs font-chakra font-bold outline-none cursor-pointer"
              >
                {safePlayers.map((p) => {
                  const tm = safeTeams.find((t) => t.id === p.teamId);
                  return (
                    <option key={p.id} value={p.id}>
                      {tm?.name || "Team"} - {p.name} (#{p.jerseyNumber})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Player 1 Hero */}
          {p1 && (
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-950 border-2 border-emerald-500/50 overflow-hidden shrink-0 shadow-lg">
                {p1.photoUrl ? (
                  <img src={p1.photoUrl} alt={p1.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-chakra font-black text-xl">
                    #{p1.jerseyNumber}
                  </div>
                )}
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-emerald-400 font-mono text-[9px] font-bold border border-zinc-800">
                  #{p1.jerseyNumber}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TeamBadge team={t1} size="xs" />
                  <span className="text-xs font-chakra font-bold text-zinc-400">{t1?.name}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-chakra text-white leading-none">
                  {p1.name}
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                    {p1.position}
                  </span>
                  <span>Foot: {p1.preferredFoot || "Right"}</span>
                  <span>&bull;</span>
                  <span className="text-emerald-400 font-bold">★ {p1.stats?.averageRating?.toFixed(1) || "7.5"}</span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{p1.bio}</p>
              </div>
            </div>
          )}
        </div>

        {/* Player 2 Card (Rose accent) */}
        <div className="bg-[#121215] rounded-3xl border border-rose-500/30 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="text-[10px] font-chakra font-black uppercase text-rose-400 tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400 inline-block animate-pulse" />
              PLAYER 2 (ROSE)
            </span>
            {/* Player 2 Dropdown */}
            <div className="relative">
              <select
                value={player2Id}
                onChange={(e) => setPlayer2Id(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-1.5 text-xs font-chakra font-bold outline-none cursor-pointer"
              >
                {safePlayers.map((p) => {
                  const tm = safeTeams.find((t) => t.id === p.teamId);
                  return (
                    <option key={p.id} value={p.id}>
                      {tm?.name || "Team"} - {p.name} (#{p.jerseyNumber})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Player 2 Hero */}
          {p2 && (
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-950 border-2 border-rose-500/50 overflow-hidden shrink-0 shadow-lg">
                {p2.photoUrl ? (
                  <img src={p2.photoUrl} alt={p2.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-chakra font-black text-xl">
                    #{p2.jerseyNumber}
                  </div>
                )}
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-rose-400 font-mono text-[9px] font-bold border border-zinc-800">
                  #{p2.jerseyNumber}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TeamBadge team={t2} size="xs" />
                  <span className="text-xs font-chakra font-bold text-zinc-400">{t2?.name}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-chakra text-white leading-none">
                  {p2.name}
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold">
                    {p2.position}
                  </span>
                  <span>Foot: {p2.preferredFoot || "Right"}</span>
                  <span>&bull;</span>
                  <span className="text-rose-400 font-bold">★ {p2.stats?.averageRating?.toFixed(1) || "7.5"}</span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{p2.bio}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Head-to-Head Comparative Metric Matrix */}
      <div className="bg-[#121215] rounded-3xl border border-zinc-800 p-5 sm:p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-base font-chakra font-black text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              TALE OF THE TAPE & STAT COMPARISON
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Normalised performance rates based on official 60-minute match records
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-chakra font-bold">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <TeamBadge team={t1} size="xs" /> {p1?.name}
            </span>
            <span className="text-zinc-600">vs</span>
            <span className="text-rose-400 flex items-center gap-1.5">
              {p2?.name} <TeamBadge team={t2} size="xs" />
            </span>
          </div>
        </div>

        {/* Stat Bars List */}
        <div className="space-y-4">
          {statRows.map((row, idx) => {
            const leader = getMetricLeader(row.v1, row.v2);
            const p1Pct = Math.min(100, Math.max(10, (row.v1 / row.max) * 100));
            const p2Pct = Math.min(100, Math.max(10, (row.v2 / row.max) * 100));

            return (
              <div key={idx} className="space-y-1.5">
                {/* Metric Label & Numbers */}
                <div className="flex items-center justify-between text-xs font-chakra">
                  {/* P1 Value */}
                  <span className={`font-mono font-black text-sm ${leader === "P1" ? "text-emerald-400" : "text-zinc-500"}`}>
                    {row.format(row.v1)}
                    {leader === "P1" && <span className="ml-1 text-[10px] text-emerald-400">▲</span>}
                  </span>

                  {/* Centered Metric Title */}
                  <span className="font-bold text-zinc-300 text-xs uppercase tracking-wider text-center">
                    {row.label}
                  </span>

                  {/* P2 Value */}
                  <span className={`font-mono font-black text-sm ${leader === "P2" ? "text-rose-400" : "text-zinc-500"}`}>
                    {leader === "P2" && <span className="mr-1 text-[10px] text-rose-400">▲</span>}
                    {row.format(row.v2)}
                  </span>
                </div>

                {/* Comparative Double Bars */}
                <div className="grid grid-cols-2 gap-2 h-2.5">
                  {/* P1 Bar (Aligns right) */}
                  <div className="w-full bg-zinc-900 rounded-l-full overflow-hidden flex justify-end">
                    <div
                      style={{ width: `${p1Pct}%` }}
                      className={`h-full rounded-l-full transition-all duration-500 ${
                        leader === "P1" ? "bg-emerald-400" : "bg-emerald-900/60"
                      }`}
                    />
                  </div>

                  {/* P2 Bar (Aligns left) */}
                  <div className="w-full bg-zinc-900 rounded-r-full overflow-hidden flex justify-start">
                    <div
                      style={{ width: `${p2Pct}%` }}
                      className={`h-full rounded-r-full transition-all duration-500 ${
                        leader === "P2" ? "bg-rose-400" : "bg-rose-900/60"
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Specialty Stats Breakdown */}
        {safeCustomStats.length > 0 && (
          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <h4 className="text-xs font-chakra font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Specialty & Custom Skills
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {safeCustomStats.map((cs) => {
                const c1 = p1?.stats?.customStats?.[cs.id] || 0;
                const c2 = p2?.stats?.customStats?.[cs.id] || 0;
                const csLeader = getMetricLeader(c1, c2);

                return (
                  <div
                    key={cs.id}
                    className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-chakra font-bold text-white text-xs">{cs.name}</div>
                      <div className="text-[10px] text-zinc-500">{cs.shortLabel}</div>
                    </div>

                    <div className="flex items-center gap-2 font-mono font-bold text-xs">
                      <span className={csLeader === "P1" ? "text-emerald-400 font-black" : "text-zinc-500"}>
                        {c1}
                      </span>
                      <span className="text-zinc-600">vs</span>
                      <span className={csLeader === "P2" ? "text-rose-400 font-black" : "text-zinc-500"}>
                        {c2}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* PLAYER TRAIT PENTAGON RADAR CHART (DUAL COMPARISON) */}
      {p1 && (
        <div className="bg-[#121215] rounded-3xl border border-zinc-800 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-chakra font-black text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                PLAYER TRAIT PENTAGON COMPARISON
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                5-dimensional percentile trait radar comparing both athletes against the entire league distribution
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-chakra font-bold">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> {p1.name}
              </span>
              {p2 && (
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" /> {p2.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center pt-2">
            <PlayerTraitPentagonChart
              player={p1}
              comparePlayer={p2}
              allPlayers={safePlayers}
              matches={safeMatches}
              customStats={safeCustomStats}
              size={320}
              showDetails={true}
              className="w-full max-w-lg"
            />
          </div>
        </div>
      )}

      {/* Head-to-Head Match History */}
      {h2hMatches.length > 0 && (
        <div className="bg-[#121215] rounded-3xl border border-zinc-800 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h4 className="text-xs font-chakra font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-white" />
              Direct Clash Fixtures ({h2hMatches.length})
            </h4>
            <span className="text-[11px] text-zinc-500 font-mono">60 Min Match Format</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {h2hMatches.map((m) => {
              const p1Rating = m.playerRatings?.[p1?.id || ""] || "—";
              const p2Rating = m.playerRatings?.[p2?.id || ""] || "—";

              return (
                <div
                  key={m.id}
                  onClick={() => onOpenMatchDetails && onOpenMatchDetails(m)}
                  className="p-3.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 transition-all cursor-pointer flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-chakra font-bold text-white">{m.title}</span>
                    <span className="text-[10px] font-mono text-zinc-400">{m.date}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm font-chakra font-black text-white my-1">
                    <span>{m.homeScore}</span>
                    <span className="text-xs text-zinc-500 font-mono">FT (60')</span>
                    <span>{m.awayScore}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-t border-zinc-800/60 pt-2">
                    <span className="text-emerald-400">{p1?.name}: <strong>★ {p1Rating}</strong></span>
                    <span className="text-rose-400">{p2?.name}: <strong>★ {p2Rating}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
