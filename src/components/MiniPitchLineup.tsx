import React, { useState } from "react";
import { Team, PlayerProfile } from "../types";
import { getFormationPreset } from "../utils/leagueCalculations";
import { TeamBadge } from "./TeamBadge";
import { Star, Shield, Zap, Sparkles } from "lucide-react";

interface MiniPitchLineupProps {
  team: Team;
  formation?: string;
  starterIds?: string[];
  allPlayers: PlayerProfile[];
  benchIds?: string[];
  isAway?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  interactive?: boolean;
  onSelectPlayer?: (player: PlayerProfile) => void;
  playerRatings?: Record<string, number>;
  motmPlayerId?: string;
  dpotmPlayerId?: string;
  className?: string;
}

export const MiniPitchLineup: React.FC<MiniPitchLineupProps> = ({
  team,
  formation = "7v7_3-2-1",
  starterIds,
  allPlayers,
  benchIds = [],
  isAway = false,
  size = "md",
  interactive = true,
  onSelectPlayer,
  playerRatings = {},
  motmPlayerId,
  dpotmPlayerId,
  className = "",
}) => {
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);

  const safeAllPlayers = allPlayers || [];
  const effectiveFormation = formation || team?.formation || "7v7_3-2-1";
  const preset = getFormationPreset(effectiveFormation);

  // If explicit starterIds not passed, use team.startingLineup or first N team players
  const teamRoster = safeAllPlayers.filter(
    (p) => p.teamId === team?.id || (p.isTemporaryTransfer && p.temporaryTeamId === team?.id)
  );

  const actualStarterIds = starterIds && starterIds.length > 0
    ? starterIds
    : (team?.startingLineup && team.startingLineup.length > 0
        ? team.startingLineup
        : teamRoster.slice(0, preset.slots.length).map((p) => p.id));

  // Determine size classes
  const sizeConfig = {
    xs: {
      height: "h-56",
      badgeSize: "w-7 h-7",
      textSize: "text-[8px]",
      namePill: "text-[8px] px-1 py-0.2",
      numSize: "text-[7px]",
      showRating: false,
    },
    sm: {
      height: "h-64",
      badgeSize: "w-8 h-8",
      textSize: "text-[9px]",
      namePill: "text-[9px] px-1.5 py-0.2",
      numSize: "text-[8px]",
      showRating: true,
    },
    md: {
      height: "h-80 sm:h-96",
      badgeSize: "w-10 h-10 sm:w-11 sm:h-11",
      textSize: "text-[10px] sm:text-xs",
      namePill: "text-[10px] sm:text-xs px-2 py-0.5",
      numSize: "text-[8px] sm:text-[9px]",
      showRating: true,
    },
    lg: {
      height: "h-96 sm:h-[420px]",
      badgeSize: "w-12 h-12",
      textSize: "text-xs",
      namePill: "text-xs px-2.5 py-0.5",
      numSize: "text-[10px]",
      showRating: true,
    },
  }[size];

  // Bench players
  const benchPlayers = benchIds
    .map((id) => safeAllPlayers.find((p) => p.id === id))
    .filter((p): p is PlayerProfile => !!p);

  return (
    <div className={`flex flex-col rounded-2xl bg-zinc-950/80 border border-zinc-800 p-3 sm:p-4 shadow-xl ${className}`}>
      {/* Team & Tactical Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-zinc-800/80">
        <div className="flex items-center gap-2 min-w-0">
          <TeamBadge team={team} size="sm" />
          <div className="min-w-0">
            <h4 className="font-chakra font-black text-white text-xs sm:text-sm truncate">
              {team?.name || "Team Squad"}
            </h4>
            <span className="text-[10px] font-chakra font-semibold text-zinc-400 block truncate">
              {actualStarterIds.length} Starters &bull; {preset.name.split(" ")[0]}
            </span>
          </div>
        </div>

        <div className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] sm:text-xs font-mono font-bold text-emerald-400 shrink-0">
          {preset.category} ({preset.slots.length}p)
        </div>
      </div>

      {/* Soccer Pitch Canvas */}
      <div className={`relative w-full ${sizeConfig.height} rounded-xl bg-gradient-to-b from-[#151d16] via-[#0d1410] to-[#080d0a] border border-emerald-500/25 overflow-hidden shadow-inner select-none p-2`}>
        {/* Authentic Field Markings */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          {/* Halfway line & center circle */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-300 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-emerald-300" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-300" />

          {/* Goal areas & penalty boxes */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 sm:w-40 h-14 sm:h-16 border-b border-x border-emerald-300/80 rounded-b-sm" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-6 border-b border-x border-emerald-300/80" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 sm:w-40 h-14 sm:h-16 border-t border-x border-emerald-300/80 rounded-t-sm" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-6 border-t border-x border-emerald-300/80" />

          {/* Corner arcs */}
          <div className="absolute top-0 left-0 w-4 h-4 border-b border-r border-emerald-300/60 rounded-br-full" />
          <div className="absolute top-0 right-0 w-4 h-4 border-b border-l border-emerald-300/60 rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-t border-r border-emerald-300/60 rounded-tr-full" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-t border-l border-emerald-300/60 rounded-tl-full" />

          {/* Subtle grass turf strips */}
          <div className="absolute inset-0 flex flex-col justify-between opacity-15">
            <div className="h-1/6 bg-emerald-400/10 w-full" />
            <div className="h-1/6 bg-emerald-400/5 w-full" />
            <div className="h-1/6 bg-emerald-400/10 w-full" />
            <div className="h-1/6 bg-emerald-400/5 w-full" />
            <div className="h-1/6 bg-emerald-400/10 w-full" />
            <div className="h-1/6 bg-emerald-400/5 w-full" />
          </div>
        </div>

        {/* Pitch Slots */}
        {preset.slots.map((slot, index) => {
          const playerId = actualStarterIds[index];
          const player = playerId
            ? safeAllPlayers.find((p) => p.id === playerId)
            : teamRoster[index];

          if (!player && !slot) return null;

          const isCaptain = team?.captainPlayerId === player?.id;
          const isMotm = motmPlayerId === player?.id;
          const isDpotm = dpotmPlayerId === player?.id;
          const rating = player ? playerRatings[player.id] || player.stats?.averageRating : undefined;
          const isHovered = hoveredPlayerId === player?.id;

          // For away team attacking downwards or upwards
          const topPos = isAway ? 100 - slot.top : slot.top;
          const leftPos = isAway ? 100 - slot.left : slot.left;

          return (
            <div
              key={slot.id || index}
              style={{
                top: `${topPos}%`,
                left: `${leftPos}%`,
                transform: "translate(-50%, -50%)",
              }}
              onMouseEnter={() => player && setHoveredPlayerId(player.id)}
              onMouseLeave={() => setHoveredPlayerId(null)}
              onClick={() => {
                if (interactive && player && onSelectPlayer) {
                  onSelectPlayer(player);
                }
              }}
              className={`absolute z-10 flex flex-col items-center group transition-all duration-200 ${
                interactive && player ? "cursor-pointer hover:scale-110" : ""
              }`}
            >
              {/* Player Avatar Circle */}
              <div
                className={`relative ${sizeConfig.badgeSize} rounded-full p-0.5 transition-all shadow-lg ${
                  isMotm
                    ? "ring-2 ring-amber-400 shadow-amber-500/50"
                    : isDpotm
                    ? "ring-2 ring-cyan-400 shadow-cyan-500/50"
                    : isHovered
                    ? "ring-2 ring-white scale-105"
                    : "ring-1 ring-zinc-500 group-hover:ring-white"
                } bg-zinc-900`}
              >
                {player?.photoUrl ? (
                  <img
                    src={player.photoUrl}
                    alt={player.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-white font-chakra font-black text-[9px] sm:text-xs">
                    {player ? player.name.substring(0, 2).toUpperCase() : slot.label}
                  </div>
                )}

                {/* Captain 'C' Badge */}
                {isCaptain && (
                  <span className="absolute -top-1 -left-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white text-black font-chakra font-black text-[8px] sm:text-[9px] flex items-center justify-center shadow-xs">
                    C
                  </span>
                )}

                {/* MOTM / MVP Badge */}
                {isMotm && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-400 text-slate-950 font-chakra font-black text-[8px] flex items-center justify-center shadow-sm">
                    ★
                  </span>
                )}

                {/* Jersey Number Tag */}
                {player && (
                  <span className={`absolute -bottom-1 -right-1 px-1 py-0.2 rounded bg-zinc-950 text-white font-mono font-bold ${sizeConfig.numSize} border border-zinc-700`}>
                    #{player.jerseyNumber}
                  </span>
                )}
              </div>

              {/* Player Name Pill */}
              <div className={`mt-0.5 ${sizeConfig.namePill} rounded-md bg-zinc-950/95 backdrop-blur-xs border ${
                isMotm
                  ? "border-amber-400/80 text-amber-300 font-black"
                  : "border-zinc-800 text-white font-bold"
              } font-chakra shadow-md whitespace-nowrap text-center max-w-[85px] sm:max-w-[110px] truncate`}>
                {player ? player.name : `+ ${slot.label}`}
              </div>

              {/* Rating Tag */}
              {sizeConfig.showRating && rating !== undefined && (
                <span className="text-[8px] sm:text-[9px] font-mono font-bold text-zinc-400">
                  ★ {rating.toFixed(1)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Bench / Substitutes Section */}
      {benchPlayers.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-zinc-800/80">
          <span className="text-[10px] font-chakra font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
            Substitutes ({benchPlayers.length})
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {benchPlayers.map((bp) => (
              <div
                key={bp.id}
                onClick={() => interactive && onSelectPlayer && onSelectPlayer(bp)}
                className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-chakra font-semibold text-zinc-300 flex items-center gap-1.5 hover:border-zinc-700 transition-colors cursor-pointer"
              >
                <span className="font-mono text-zinc-500">#{bp.jerseyNumber}</span>
                <span className="text-white truncate max-w-[80px]">{bp.name}</span>
                <span className="text-[9px] px-1 rounded bg-zinc-950 text-zinc-400 font-mono">
                  {bp.position}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
