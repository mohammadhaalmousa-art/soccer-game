import React from "react";
import { Team, Match } from "../types";
import { Activity, TrendingUp, Target, ShieldCheck, Flame } from "lucide-react";

interface TeamXgChartProps {
  team: Team;
  matches: Match[];
  className?: string;
}

export const TeamXgChart: React.FC<TeamXgChartProps> = ({
  team,
  matches,
  className = "",
}) => {
  const teamMatches = (matches || [])
    .filter((m) => m.status === "APPROVED" && (m.homeTeamId === team.id || m.awayTeamId === team.id))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (teamMatches.length === 0) {
    return (
      <div className={`p-5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-slate-500 text-xs ${className}`}>
        No completed match xG data recorded for {team.name} yet.
      </div>
    );
  }

  // Calculate per match stats
  let cumulativeXgCreated = 0;
  let cumulativeXgConceded = 0;
  let totalGoalsScored = 0;
  let totalGoalsConceded = 0;

  const matchData = teamMatches.map((m, idx) => {
    const isHome = m.homeTeamId === team.id;
    const goalsFor = isHome ? m.homeScore : m.awayScore;
    const goalsAgainst = isHome ? m.awayScore : m.homeScore;
    const xgFor = isHome ? (m.homeXg || goalsFor * 0.85 + 0.3) : (m.awayXg || goalsFor * 0.85 + 0.3);
    const xgAgainst = isHome ? (m.awayXg || goalsAgainst * 0.85 + 0.3) : (m.homeXg || goalsAgainst * 0.85 + 0.3);

    cumulativeXgCreated += xgFor;
    cumulativeXgConceded += xgAgainst;
    totalGoalsScored += goalsFor;
    totalGoalsConceded += goalsAgainst;

    return {
      matchId: m.id,
      matchIndex: idx + 1,
      title: `MD ${idx + 1}`,
      date: m.date,
      goalsFor,
      goalsAgainst,
      xgFor: Number(xgFor.toFixed(1)),
      xgAgainst: Number(xgAgainst.toFixed(1)),
      cumXgFor: Number(cumulativeXgCreated.toFixed(1)),
      cumXgAgainst: Number(cumulativeXgConceded.toFixed(1)),
      diff: Number((xgFor - xgAgainst).toFixed(1)),
    };
  });

  const avgXgFor = (cumulativeXgCreated / teamMatches.length).toFixed(1);
  const avgXgAgainst = (cumulativeXgConceded / teamMatches.length).toFixed(1);
  const xgDiff = (cumulativeXgCreated - cumulativeXgConceded).toFixed(1);
  const overperformance = (totalGoalsScored - cumulativeXgCreated).toFixed(1);

  // SVG chart dimensions
  const svgWidth = 520;
  const svgHeight = 160;
  const padX = 40;
  const padY = 20;
  const plotWidth = svgWidth - padX * 2;
  const plotHeight = svgHeight - padY * 2;

  const maxXg = Math.max(...matchData.map((d) => Math.max(d.xgFor, d.xgAgainst, 3.0))) * 1.2;

  const getX = (idx: number) => {
    if (matchData.length <= 1) return svgWidth / 2;
    return padX + (idx / (matchData.length - 1)) * plotWidth;
  };
  const getY = (val: number) => svgHeight - padY - (val / maxXg) * plotHeight;

  return (
    <div className={`bg-slate-950/80 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h4 className="text-xs font-chakra font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-400" />
            Squad xG Performance & Trend (Expected Goals)
          </h4>
          <p className="text-[11px] text-slate-400">
            Chance creation vs defensive solidity per matchday
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-chakra font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            Total xG: <strong className="text-emerald-400">{cumulativeXgCreated.toFixed(1)}</strong>
          </span>
          <span className="text-[10px] font-chakra font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            xG Conceded: <strong className="text-rose-400">{cumulativeXgConceded.toFixed(1)}</strong>
          </span>
        </div>
      </div>

      {/* SVG Multi-match bar and trend visualizer */}
      <div className="w-full overflow-x-auto no-scrollbar">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[190px] select-none"
        >
          {/* Level lines */}
          {[1.0, 2.0, 3.0].map((lvl) => {
            if (lvl > maxXg) return null;
            return (
              <g key={lvl}>
                <line
                  x1={padX}
                  y1={getY(lvl)}
                  x2={svgWidth - padX}
                  y2={getY(lvl)}
                  stroke="rgba(148, 163, 184, 0.08)"
                />
                <text
                  x={padX - 8}
                  y={getY(lvl) + 3}
                  textAnchor="end"
                  fill="#475569"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {lvl.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Render match bars and connector lines */}
          {matchData.map((d, i) => {
            const x = getX(i);
            const barWidth = 14;

            return (
              <g key={d.matchId}>
                {/* Match Guide Line */}
                <line
                  x1={x}
                  y1={padY}
                  x2={x}
                  y2={svgHeight - padY}
                  stroke="rgba(148, 163, 184, 0.1)"
                  strokeDasharray="2,2"
                />

                {/* xG For Bar */}
                <rect
                  x={x - barWidth - 1}
                  y={getY(d.xgFor)}
                  width={barWidth}
                  height={svgHeight - padY - getY(d.xgFor)}
                  fill="#10b981"
                  rx="3"
                  opacity="0.85"
                />

                {/* xG Against Bar */}
                <rect
                  x={x + 1}
                  y={getY(d.xgAgainst)}
                  width={barWidth}
                  height={svgHeight - padY - getY(d.xgAgainst)}
                  fill="#f43f5e"
                  rx="3"
                  opacity="0.75"
                />

                {/* Matchday Label */}
                <text
                  x={x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                  fontWeight="bold"
                >
                  {d.title}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend & Key Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
          <span className="text-[10px] font-chakra font-bold text-slate-400 block uppercase">
            Avg xG For / Match
          </span>
          <span className="font-mono font-black text-emerald-400 text-sm">
            {avgXgFor} xG
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
          <span className="text-[10px] font-chakra font-bold text-slate-400 block uppercase">
            Avg xG Against / Match
          </span>
          <span className="font-mono font-black text-rose-400 text-sm">
            {avgXgAgainst} xG
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
          <span className="text-[10px] font-chakra font-bold text-slate-400 block uppercase">
            xG Differential
          </span>
          <span className={`font-mono font-black text-sm ${Number(xgDiff) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {Number(xgDiff) >= 0 ? "+" : ""}{xgDiff}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
          <span className="text-[10px] font-chakra font-bold text-slate-400 block uppercase">
            Finishing Efficiency
          </span>
          <span className={`font-mono font-black text-sm ${Number(overperformance) >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
            {Number(overperformance) >= 0 ? "+" : ""}{overperformance} G vs xG
          </span>
        </div>
      </div>
    </div>
  );
};
