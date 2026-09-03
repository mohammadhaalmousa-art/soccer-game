import React, { useState } from "react";
import { Match, Team, PlayerProfile } from "../types";
import { Activity, Target, Flame, ChevronRight, Zap } from "lucide-react";
import { TeamBadge } from "./TeamBadge";

interface MatchXgChartProps {
  match: Match;
  homeTeam?: Team;
  awayTeam?: Team;
  players?: PlayerProfile[];
  className?: string;
}

export const MatchXgChart: React.FC<MatchXgChartProps> = ({
  match,
  homeTeam,
  awayTeam,
  players = [],
  className = "",
}) => {
  const [hoveredMinute, setHoveredMinute] = useState<number | null>(null);

  // Compute minute-by-minute xG progression (0 to 60 mins)
  const homeTargetXg = match.homeXg || Math.max(0.4, Number((match.homeScore * 0.85 + 0.3).toFixed(1)));
  const awayTargetXg = match.awayXg || Math.max(0.4, Number((match.awayScore * 0.85 + 0.3).toFixed(1)));

  // Generate discrete xG events from match.events or interpolate along the match timeline
  const goalEvents = (match.events || []).filter((e) => e.type === "GOAL");

  // Step points across 0 to 60 mins
  const timelinePoints: {
    minute: number;
    homeCumulativeXg: number;
    awayCumulativeXg: number;
    homeShot?: { scorerName: string; xg: number; isGoal: boolean };
    awayShot?: { scorerName: string; xg: number; isGoal: boolean };
  }[] = [];

  let currentHomeXg = 0;
  let currentAwayXg = 0;

  // Distribute baseline xG across quarters + goal events
  for (let min = 0; min <= 60; min += 5) {
    const goalsAtMin = goalEvents.filter((g) => {
      const gMin = g.minute || (g.half === 2 ? 45 : 15);
      return Math.abs(gMin - min) <= 2;
    });

    let homeShotInfo = undefined;
    let awayShotInfo = undefined;

    // Add goal xG spikes
    goalsAtMin.forEach((g) => {
      const p = players.find((pl) => pl.id === g.playerId);
      const shotXg = g.xgValue || 0.45;
      if (g.teamId === match.homeTeamId) {
        currentHomeXg += shotXg;
        homeShotInfo = { scorerName: p?.name || "Home Goal", xg: shotXg, isGoal: true };
      } else {
        currentAwayXg += shotXg;
        awayShotInfo = { scorerName: p?.name || "Away Goal", xg: shotXg, isGoal: true };
      }
    });

    // Baseline progressive accumulation
    const baselineStep = min / 60;
    const progressHome = baselineStep * (homeTargetXg * 0.5);
    const progressAway = baselineStep * (awayTargetXg * 0.5);

    timelinePoints.push({
      minute: min,
      homeCumulativeXg: Math.min(homeTargetXg, Number((currentHomeXg + progressHome).toFixed(2))),
      awayCumulativeXg: Math.min(awayTargetXg, Number((currentAwayXg + progressAway).toFixed(2))),
      homeShot: homeShotInfo,
      awayShot: awayShotInfo,
    });
  }

  // Ensure 60' matches target xG
  if (timelinePoints.length > 0) {
    timelinePoints[timelinePoints.length - 1].homeCumulativeXg = homeTargetXg;
    timelinePoints[timelinePoints.length - 1].awayCumulativeXg = awayTargetXg;
  }

  const maxY = Math.max(homeTargetXg, awayTargetXg, 2.5) * 1.15;
  const svgWidth = 540;
  const svgHeight = 180;
  const padX = 40;
  const padY = 25;
  const plotWidth = svgWidth - padX * 2;
  const plotHeight = svgHeight - padY * 2;

  const getX = (minute: number) => padX + (minute / 60) * plotWidth;
  const getY = (val: number) => svgHeight - padY - (val / maxY) * plotHeight;

  // Build SVG path strings (step curve)
  let homePath = `M ${getX(0)} ${getY(0)}`;
  let awayPath = `M ${getX(0)} ${getY(0)}`;

  timelinePoints.forEach((pt, i) => {
    if (i === 0) return;
    const prevPt = timelinePoints[i - 1];
    // Step line
    homePath += ` L ${getX(pt.minute)} ${getY(prevPt.homeCumulativeXg)} L ${getX(pt.minute)} ${getY(pt.homeCumulativeXg)}`;
    awayPath += ` L ${getX(pt.minute)} ${getY(prevPt.awayCumulativeXg)} L ${getX(pt.minute)} ${getY(pt.awayCumulativeXg)}`;
  });

  const homeArea = `${homePath} L ${getX(60)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`;
  const awayArea = `${awayPath} L ${getX(60)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`;

  return (
    <div className={`bg-slate-950/80 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4 ${className}`}>
      {/* Header & Match xG Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <h4 className="text-xs font-chakra font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            Expected Goals (xG) Timeline & Momentum
          </h4>
          <p className="text-[11px] text-slate-400">
            Cumulative match quality & chance creation curve (0' to 60')
          </p>
        </div>

        {/* Dual xG Pill */}
        <div className="flex items-center gap-3 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-chakra font-black text-emerald-400">
            <TeamBadge team={homeTeam} size="xs" />
            <span>{homeTargetXg.toFixed(1)} xG</span>
          </div>
          <span className="text-slate-600 font-bold text-xs">vs</span>
          <div className="flex items-center gap-1.5 text-xs font-chakra font-black text-rose-400">
            <span>{awayTargetXg.toFixed(1)} xG</span>
            <TeamBadge team={awayTeam} size="xs" />
          </div>
        </div>
      </div>

      {/* Interactive Step Area Chart */}
      <div className="w-full overflow-x-auto no-scrollbar">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[220px] select-none"
        >
          <defs>
            <linearGradient id="matchHomeXgGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="matchAwayXgGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          {[0, 15, 30, 45, 60].map((min) => (
            <g key={min}>
              <line
                x1={getX(min)}
                y1={padY}
                x2={getX(min)}
                y2={svgHeight - padY}
                stroke={min === 30 ? "rgba(148, 163, 184, 0.3)" : "rgba(148, 163, 184, 0.1)"}
                strokeDasharray={min === 30 ? undefined : "3,3"}
              />
              <text
                x={getX(min)}
                y={svgHeight - 8}
                textAnchor="middle"
                fill="#64748b"
                fontSize="10"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                {min === 0 ? "KO" : min === 30 ? "HT (30')" : `${min}'`}
              </text>
            </g>
          ))}

          {/* Horizontal Level Guides */}
          {[0.5, 1.0, 1.5, 2.0, 2.5].map((lvl) => {
            if (lvl > maxY) return null;
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
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {lvl.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Area Fills */}
          <path d={homeArea} fill="url(#matchHomeXgGrad)" />
          <path d={awayArea} fill="url(#matchAwayXgGrad)" />

          {/* Step Lines */}
          <path d={homePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
          <path d={awayPath} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />

          {/* Goal Marker Pins */}
          {goalEvents.map((g, idx) => {
            const min = g.minute || (g.half === 2 ? 45 : 15);
            const isHome = g.teamId === match.homeTeamId;
            const pt = timelinePoints.find((p) => Math.abs(p.minute - min) <= 4) || timelinePoints[timelinePoints.length - 1];
            const yPos = getY(isHome ? pt.homeCumulativeXg : pt.awayCumulativeXg);
            const color = isHome ? "#10b981" : "#f43f5e";

            return (
              <g key={g.id || idx}>
                <circle
                  cx={getX(min)}
                  cy={yPos}
                  r="5"
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="cursor-pointer animate-pulse"
                />
                <text
                  x={getX(min)}
                  y={yPos - 8}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="900"
                >
                  ⚽
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* xG Efficiency Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
          <span className="text-[10px] font-chakra font-bold text-slate-400 block uppercase">
            Home Goal Diff vs xG
          </span>
          <span className={`font-mono font-bold ${match.homeScore >= homeTargetXg ? "text-emerald-400" : "text-amber-400"}`}>
            {match.homeScore >= homeTargetXg ? "+" : ""}
            {(match.homeScore - homeTargetXg).toFixed(1)} G vs xG
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
          <span className="text-[10px] font-chakra font-bold text-slate-400 block uppercase">
            Away Goal Diff vs xG
          </span>
          <span className={`font-mono font-bold ${match.awayScore >= awayTargetXg ? "text-rose-400" : "text-amber-400"}`}>
            {match.awayScore >= awayTargetXg ? "+" : ""}
            {(match.awayScore - awayTargetXg).toFixed(1)} G vs xG
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
          <span className="text-[10px] font-chakra font-bold text-slate-400 block uppercase">
            1st Half xG
          </span>
          <span className="font-mono font-bold text-slate-200">
            {(homeTargetXg * 0.48).toFixed(1)} - {(awayTargetXg * 0.48).toFixed(1)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
          <span className="text-[10px] font-chakra font-bold text-slate-400 block uppercase">
            2nd Half xG
          </span>
          <span className="font-mono font-bold text-slate-200">
            {(homeTargetXg * 0.52).toFixed(1)} - {(awayTargetXg * 0.52).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
};
