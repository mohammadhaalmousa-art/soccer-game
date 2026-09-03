import React, { useState } from "react";
import { PlayerProfile, Match, CustomStatDefinition } from "../types";
import { calculatePlayerTraits, PlayerTraitScores } from "../utils/playerTraitCalculations";
import { Crosshair, Zap, Shield, Star, Activity, Sparkles, Trophy } from "lucide-react";

interface PlayerTraitPentagonChartProps {
  player: PlayerProfile;
  allPlayers: PlayerProfile[];
  comparePlayer?: PlayerProfile | null;
  matches?: Match[];
  customStats?: CustomStatDefinition[];
  size?: number;
  showDetails?: boolean;
  className?: string;
}

export const PlayerTraitPentagonChart: React.FC<PlayerTraitPentagonChartProps> = ({
  player,
  allPlayers,
  comparePlayer,
  matches = [],
  customStats = [],
  size = 280,
  showDetails = true,
  className = "",
}) => {
  const [hoveredAxis, setHoveredAxis] = useState<string | null>(null);

  const traitsP1 = calculatePlayerTraits(player, allPlayers, matches, customStats);
  const traitsP2 = comparePlayer
    ? calculatePlayerTraits(comparePlayer, allPlayers, matches, customStats)
    : null;

  // Pentagon dimensions
  const center = size / 2;
  const radius = size * 0.38;

  // 5 axes configuration (angles rotated so index 0 points straight up: -90 deg)
  const axes = [
    { key: "finishing", label: "Finishing", shortLabel: "FIN", icon: Crosshair, color: "#f43f5e" },
    { key: "playmaking", label: "Playmaking", shortLabel: "PLM", icon: Zap, color: "#38bdf8" },
    { key: "defending", label: "Defending", shortLabel: "DEF", icon: Shield, color: "#34d399" },
    { key: "rating", label: "Form / Rating", shortLabel: "RAT", icon: Star, color: "#fbbf24" },
    { key: "reliability", label: "Workrate", shortLabel: "WRK", icon: Activity, color: "#a855f7" },
  ];

  // Helper to get (x, y) coordinates for angle index and magnitude (0 to 1)
  const getCoordinates = (index: number, magnitude: number, r = radius) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5;
    const x = center + r * magnitude * Math.cos(angle);
    const y = center + r * magnitude * Math.sin(angle);
    return { x, y };
  };

  // Generate SVG polygon points string for a trait object
  const getPolygonPoints = (traits: PlayerTraitScores) => {
    return axes
      .map((axis, i) => {
        const val = traits[axis.key as keyof PlayerTraitScores] as number;
        // val is 0-100, scale between 0.15 and 1.0 for visual clarity
        const normalized = Math.max(0.15, Math.min(1.0, val / 100));
        const { x, y } = getCoordinates(i, normalized);
        return `${x},${y}`;
      })
      .join(" ");
  };

  // Background grid pentagons (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const p1Points = getPolygonPoints(traitsP1);
  const p2Points = traitsP2 ? getPolygonPoints(traitsP2) : null;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Pentagon SVG Canvas */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
        >
          <defs>
            {/* Player 1 Gradient */}
            <linearGradient id="p1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.25" />
            </linearGradient>
            {/* Player 2 Gradient */}
            <linearGradient id="p2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
            </linearGradient>
            {/* Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Concentric Reference Pentagons */}
          {gridLevels.map((lvl, idx) => {
            const points = axes
              .map((_, i) => {
                const { x, y } = getCoordinates(i, lvl);
                return `${x},${y}`;
              })
              .join(" ");

            return (
              <polygon
                key={idx}
                points={points}
                fill={idx === 4 ? "rgba(15, 23, 42, 0.6)" : "none"}
                stroke="rgba(148, 163, 184, 0.15)"
                strokeWidth={idx === 4 ? "1.5" : "1"}
                strokeDasharray={idx < 4 ? "2,3" : undefined}
              />
            );
          })}

          {/* Radial Axis Lines */}
          {axes.map((axis, i) => {
            const outer = getCoordinates(i, 1.0);
            const isHovered = hoveredAxis === axis.key;
            return (
              <line
                key={axis.key}
                x1={center}
                y1={center}
                x2={outer.x}
                y2={outer.y}
                stroke={isHovered ? axis.color : "rgba(148, 163, 184, 0.2)"}
                strokeWidth={isHovered ? "2" : "1"}
              />
            );
          })}

          {/* Player 2 Shape (if comparing) */}
          {p2Points && (
            <>
              <polygon
                points={p2Points}
                fill="url(#p2Grad)"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
              {axes.map((axis, i) => {
                const val = traitsP2![axis.key as keyof PlayerTraitScores] as number;
                const normalized = Math.max(0.15, Math.min(1.0, val / 100));
                const { x, y } = getCoordinates(i, normalized);
                return (
                  <circle
                    key={`p2_dot_${i}`}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#f43f5e"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                );
              })}
            </>
          )}

          {/* Player 1 Shape */}
          <polygon
            points={p1Points}
            fill="url(#p1Grad)"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinejoin="round"
            filter="url(#glow)"
            className="transition-all duration-300"
          />

          {/* Player 1 Vertex Dots */}
          {axes.map((axis, i) => {
            const val = traitsP1[axis.key as keyof PlayerTraitScores] as number;
            const normalized = Math.max(0.15, Math.min(1.0, val / 100));
            const { x, y } = getCoordinates(i, normalized);
            const isHovered = hoveredAxis === axis.key;

            return (
              <g
                key={`p1_dot_${i}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredAxis(axis.key)}
                onMouseLeave={() => setHoveredAxis(null)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? "6" : "4.5"}
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all"
                />
              </g>
            );
          })}

          {/* Outer Axis Labels */}
          {axes.map((axis, i) => {
            const { x, y } = getCoordinates(i, 1.22);
            const p1Val = traitsP1[axis.key as keyof PlayerTraitScores] as number;
            const p2Val = traitsP2 ? (traitsP2[axis.key as keyof PlayerTraitScores] as number) : null;
            const isHovered = hoveredAxis === axis.key;

            return (
              <g
                key={`lbl_${axis.key}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredAxis(axis.key)}
                onMouseLeave={() => setHoveredAxis(null)}
              >
                <text
                  x={x}
                  y={y - 6}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isHovered ? "#ffffff" : "#94a3b8"}
                  fontSize={size < 260 ? "10" : "11"}
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {axis.label}
                </text>
                <text
                  x={x}
                  y={y + 8}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={p2Val ? "#10b981" : axis.color}
                  fontSize={size < 260 ? "10" : "12"}
                  fontWeight="900"
                  fontFamily="monospace"
                >
                  {p1Val}%
                  {p2Val && (
                    <tspan fill="#f43f5e" dx="4">
                      / {p2Val}%
                    </tspan>
                  )}
                </text>
              </g>
            );
          })}

          {/* Center Archetype Badge */}
          <circle cx={center} cy={center} r={size * 0.1} fill="#090e18" stroke="#334155" strokeWidth="1.5" />
          <text
            x={center}
            y={center - 3}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#10b981"
            fontSize="12"
            fontWeight="900"
            fontFamily="monospace"
          >
            {traitsP1.overallOvr}
          </text>
          <text
            x={center}
            y={center + 8}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#64748b"
            fontSize="8"
            fontWeight="bold"
          >
            OVR
          </text>
        </svg>
      </div>

      {/* Trait Archetype & Summary */}
      {showDetails && (
        <div className="w-full mt-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[10px] font-chakra font-bold text-slate-400 uppercase tracking-wider block">
                  Player Archetype
                </span>
                <span className="text-xs font-chakra font-black text-white">
                  {traitsP1.archetype}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-chakra font-bold text-slate-400 uppercase tracking-wider block">
                League Percentile
              </span>
              <span className="text-xs font-mono font-black text-emerald-400">
                Top {Math.max(1, 100 - traitsP1.overallOvr)}%
              </span>
            </div>
          </div>

          {/* Trait breakdown bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {axes.map((axis) => {
              const Icon = axis.icon;
              const val1 = traitsP1[axis.key as keyof PlayerTraitScores] as number;
              const val2 = traitsP2 ? (traitsP2[axis.key as keyof PlayerTraitScores] as number) : null;

              return (
                <div
                  key={axis.key}
                  className={`p-2 rounded-xl bg-slate-950/60 border transition-all ${
                    hoveredAxis === axis.key ? "border-slate-600 bg-slate-900" : "border-slate-800/80"
                  }`}
                  onMouseEnter={() => setHoveredAxis(axis.key)}
                  onMouseLeave={() => setHoveredAxis(null)}
                >
                  <div className="flex items-center justify-between mb-1 text-[11px]">
                    <span className="flex items-center gap-1 font-bold text-slate-300">
                      <Icon className="w-3.5 h-3.5" style={{ color: axis.color }} />
                      {axis.label}
                    </span>
                    <div className="font-mono font-bold">
                      <span className="text-emerald-400">{val1}%</span>
                      {val2 !== null && (
                        <span className="text-slate-500 ml-1">
                          vs <span className="text-rose-400">{val2}%</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${val1}%` }}
                    />
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
