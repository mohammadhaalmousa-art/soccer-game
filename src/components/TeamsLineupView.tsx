import React, { useState } from "react";
import { Team, PlayerProfile, Match } from "../types";
import { FORMATION_PRESETS, getFormationPreset } from "../utils/leagueCalculations";
import { TeamBadge } from "./TeamBadge";
import { CustomizeTeamModal } from "./CustomizeTeamModal";
import { TeamXgChart } from "./TeamXgChart";
import { 
  Users2, 
  Plus, 
  Crown,
  Palette,
  Upload,
  Settings,
  Sparkles,
  MapPin,
  Activity,
  Target
} from "lucide-react";

interface TeamsLineupViewProps {
  teams: Team[];
  players: PlayerProfile[];
  matches?: Match[];
  isAdminUnlocked: boolean;
  onSaveTeam: (updatedTeam: Team) => Promise<void>;
  onOpenCreateTeam: () => void;
  onOpenPlayerProfile: (player: PlayerProfile) => void;
}

export const TeamsLineupView: React.FC<TeamsLineupViewProps> = ({
  teams,
  players,
  matches = [],
  isAdminUnlocked,
  onSaveTeam,
  onOpenCreateTeam,
  onOpenPlayerProfile,
}) => {
  const safeTeams = teams || [];
  const safePlayers = players || [];
  const safeMatches = matches || [];

  const [selectedTeamId, setSelectedTeamId] = useState<string>(safeTeams[0]?.id || "team_blue");
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  const currentTeam = safeTeams.find((t) => t.id === selectedTeamId) || safeTeams[0];
  const teamPlayers = safePlayers.filter((p) => p.teamId === currentTeam?.id);

  const formationPreset = getFormationPreset(currentTeam?.formation || "7v7_3-2-1");

  // Handle assigning a player to starting lineup
  const handleAssignPlayerToSlot = async (slotIndex: number, playerId: string) => {
    if (!currentTeam) return;
    const newStarters = [...(currentTeam.startingLineup || [])];
    newStarters[slotIndex] = playerId;

    const updated: Team = {
      ...currentTeam,
      startingLineup: newStarters,
    };
    await onSaveTeam(updated);
    setActiveSlotId(null);
  };

  // Handle changing tactical formation
  const handleChangeFormation = async (formationId: string) => {
    if (!currentTeam) return;
    const updated: Team = {
      ...currentTeam,
      formation: formationId,
    };
    await onSaveTeam(updated);
  };

  // Handle setting captain
  const handleSetCaptain = async (playerId: string) => {
    if (!currentTeam) return;
    const updated: Team = {
      ...currentTeam,
      captainPlayerId: playerId,
    };
    await onSaveTeam(updated);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner & Squad Switcher */}
      <div className="bg-[#121215] p-5 rounded-3xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-lg sm:text-xl font-black font-chakra text-white flex items-center gap-2">
            <Users2 className="w-5 h-5 text-white" />
            TEAMS & TACTICAL LINEUPS
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Team customization, custom logo upload, pitch visualizer, formations & xG stats
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {currentTeam && (
            <button
              onClick={() => setIsCustomizeOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-chakra font-black text-xs uppercase tracking-wider transition-colors cursor-pointer border border-zinc-700 shadow-sm"
            >
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              <span>Customize Team & Logo</span>
            </button>
          )}

          {isAdminUnlocked && (
            <button
              onClick={onOpenCreateTeam}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-zinc-200 text-black font-chakra font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-black stroke-[3]" />
              <span>New Squad</span>
            </button>
          )}
        </div>
      </div>

      {/* Squad Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {safeTeams.map((t) => {
          const isSelected = t.id === currentTeam?.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setSelectedTeamId(t.id);
                setActiveSlotId(null);
              }}
              className={`px-4 py-2.5 rounded-2xl border font-chakra font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer touch-manipulation shrink-0 ${
                isSelected
                  ? "bg-white text-black border-white shadow-md"
                  : "bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-white"
              }`}
            >
              <TeamBadge team={t} size="sm" />
              <span>{t.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isSelected ? "bg-zinc-200 text-black font-bold" : "bg-zinc-950 text-zinc-400"}`}>
                {safePlayers.filter((p) => p.teamId === t.id).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Team Details & Pitch Layout */}
      {currentTeam && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: Tactical Pitch Visualizer (7 cols) */}
            <div className="lg:col-span-7 bg-[#121215] rounded-3xl border border-zinc-800 p-5 shadow-xl flex flex-col">
              {/* Pitch Header & Formation Control */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <TeamBadge team={currentTeam} size="lg" showGlow />
                  <div>
                    <span className="text-[10px] font-chakra font-black text-zinc-400 uppercase tracking-wider block">
                      Tactical Pitch Visualizer
                    </span>
                    <h3 className="text-base sm:text-lg font-chakra font-black text-white">
                      {currentTeam.name}
                    </h3>
                  </div>
                </div>

                {/* Formation Dropdown */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-zinc-400 font-chakra">System:</span>
                  <select
                    value={currentTeam.formation || FORMATION_PRESETS[0].id}
                    onChange={(e) => handleChangeFormation(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-1.5 text-xs font-chakra font-bold outline-none cursor-pointer"
                  >
                    {FORMATION_PRESETS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Soccer Pitch Canvas */}
              <div className="relative w-full aspect-[4/5] sm:aspect-[4/4.5] bg-gradient-to-b from-[#18181b] via-[#121215] to-[#09090b] rounded-2xl border-2 border-zinc-700 overflow-hidden shadow-2xl p-4 flex flex-col justify-between select-none">
                {/* Pitch Grass Markings */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                  {/* Center Circle */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-white" />
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white -translate-y-1/2" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white" />
                  {/* Penalty Boxes */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-20 border-b-2 border-x-2 border-white" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-20 border-t-2 border-x-2 border-white" />
                  {/* Goal Areas */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-8 border-b-2 border-x-2 border-white" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-8 border-t-2 border-x-2 border-white" />
                </div>

                {/* Positioned Pitch Slots based on Formation Preset */}
                {formationPreset.slots.map((slot, index) => {
                  const assignedPlayerId = currentTeam.startingLineup?.[index];
                  const player = assignedPlayerId
                    ? safePlayers.find((p) => p.id === assignedPlayerId)
                    : teamPlayers[index];

                  const isCaptain = currentTeam.captainPlayerId === player?.id;
                  const isSlotActive = activeSlotId === slot.id;

                  return (
                    <div
                      key={slot.id}
                      style={{
                        top: `${slot.top}%`,
                        left: `${slot.left}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      onClick={() => setActiveSlotId(isSlotActive ? null : slot.id)}
                      className="absolute z-10 flex flex-col items-center cursor-pointer group"
                    >
                      {/* Player Badge on Pitch */}
                      <div
                        className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full p-0.5 transition-transform group-hover:scale-110 shadow-lg ${
                          isSlotActive
                            ? "ring-4 ring-white scale-110"
                            : "ring-2 ring-zinc-500 hover:ring-white"
                        } bg-zinc-900`}
                      >
                        {player?.photoUrl ? (
                          <img
                            src={player.photoUrl}
                            alt={player.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-white font-chakra font-black text-xs sm:text-sm">
                            {player ? player.name.substring(0, 2).toUpperCase() : slot.label}
                          </div>
                        )}

                        {/* Captain (C) Armband Badge */}
                        {isCaptain && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-black font-chakra font-black text-[9px] flex items-center justify-center shadow-xs">
                            C
                          </span>
                        )}

                        {/* Jersey Number Badge */}
                        {player && (
                          <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded bg-zinc-950 text-white font-mono font-bold text-[8px] border border-zinc-700">
                            #{player.jerseyNumber}
                          </span>
                        )}
                      </div>

                      {/* Name Pill under player */}
                      <div className="mt-1 px-2 py-0.5 rounded-md bg-zinc-950/90 backdrop-blur-xs border border-zinc-800 text-white font-chakra font-bold text-[10px] sm:text-xs shadow-md whitespace-nowrap text-center">
                        {player ? player.name : `+ ${slot.label}`}
                      </div>

                      {/* Rating Pill */}
                      {player && (
                        <span className="text-[9px] font-mono font-bold text-zinc-400">
                          ★ {player.stats?.averageRating?.toFixed(1) || "7.5"}
                        </span>
                      )}

                      {/* Quick Player Switcher Popover when clicked */}
                      {isSlotActive && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 w-48 bg-zinc-950 border border-zinc-700 rounded-2xl p-2 shadow-2xl space-y-1"
                        >
                          <div className="text-[10px] font-chakra font-bold text-white px-2 py-1 border-b border-zinc-800 flex items-center justify-between">
                            <span>Assign {slot.label}</span>
                            <button
                              onClick={() => setActiveSlotId(null)}
                              className="text-zinc-400 hover:text-white"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="max-h-40 overflow-y-auto space-y-0.5">
                            {teamPlayers.map((tp) => (
                              <button
                                key={tp.id}
                                onClick={() => handleAssignPlayerToSlot(index, tp.id)}
                                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-chakra font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                  tp.id === player?.id
                                    ? "bg-white text-black"
                                    : "text-zinc-300 hover:bg-zinc-800"
                                }`}
                              >
                                <span>#{tp.jerseyNumber} {tp.name}</span>
                                <span className="text-[10px] font-mono opacity-80">{tp.position}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Squad Overview & Roster (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Club Identity Banner */}
              <div className="bg-[#121215] rounded-3xl border border-zinc-800 p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TeamBadge team={currentTeam} size="xl" showGlow />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-chakra font-black text-white">
                          {currentTeam.name}
                        </h3>
                        <span className="text-xs font-mono font-black text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                          {currentTeam.shortName}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-semibold mt-0.5">
                        {currentTeam.slogan || "Community Squad"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsCustomizeOpen(true)}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-colors cursor-pointer"
                    title="Customize Team & Upload Logo"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                {/* Ground & Stadium */}
                <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Home Ground: <strong className="text-white">{currentTeam.homeStadium || "Community Pitch"}</strong></span>
                </div>

                {/* Captain Banner */}
                {(() => {
                  const captain = teamPlayers.find((p) => p.id === currentTeam.captainPlayerId);
                  return (
                    <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-white text-black shrink-0">
                          <Crown className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-chakra font-black text-zinc-400 uppercase tracking-wider block">
                            Official Team Captain
                          </span>
                          <div className="font-chakra font-black text-white text-xs sm:text-sm flex items-center gap-1.5">
                            <span>{captain ? `${captain.name} (#${captain.jerseyNumber})` : "None Designated"}</span>
                            {captain && <span className="text-zinc-500 font-mono text-[11px]">&bull; {captain.position}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <select
                          value={currentTeam.captainPlayerId || ""}
                          onChange={(e) => handleSetCaptain(e.target.value)}
                          className="bg-zinc-950 border border-zinc-700 text-white rounded-xl px-2.5 py-1.5 text-xs font-chakra font-bold cursor-pointer"
                        >
                          <option value="">Select Captain...</option>
                          {teamPlayers.map((p) => (
                            <option key={p.id} value={p.id}>
                              #{p.jerseyNumber} {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })()}

                {/* Roster Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-chakra font-black text-white uppercase tracking-wider">
                    Squad Roster ({teamPlayers.length})
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">Captain / Rating</span>
                </div>

                {/* Players List */}
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {teamPlayers.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 text-xs">
                      No players assigned to this squad yet.
                    </div>
                  ) : (
                    teamPlayers.map((player) => {
                      const isCaptain = currentTeam.captainPlayerId === player.id;

                      return (
                        <div
                          key={player.id}
                          onClick={() => onOpenPlayerProfile(player)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isCaptain 
                              ? "bg-zinc-900/90 border-white/40 shadow-sm" 
                              : "bg-zinc-900/60 hover:bg-zinc-800/80 border-zinc-800"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center font-chakra font-black text-xs text-white shrink-0">
                              {player.photoUrl ? (
                                <img
                                  src={player.photoUrl}
                                  alt={player.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>#{player.jerseyNumber}</span>
                              )}
                            </div>

                            <div>
                              <div className="font-chakra font-bold text-white text-sm flex items-center gap-1.5">
                                <span>{player.name}</span>
                                {isCaptain && (
                                  <span className="px-1.5 py-0.2 rounded bg-white text-black font-chakra font-black text-[9px] flex items-center gap-0.5">
                                    <Crown className="w-2.5 h-2.5" /> (C)
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-zinc-400 font-mono">
                                #{player.jerseyNumber} &bull; {player.position} &bull; {player.stats?.goals || 0} G &bull; {player.stats?.assists || 0} A
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              title={isCaptain ? "Current Team Captain" : "Click to identify as Captain"}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetCaptain(player.id);
                              }}
                              className={`px-2 py-1 rounded-xl border text-[10px] font-chakra font-black flex items-center gap-1 transition-all cursor-pointer ${
                                isCaptain
                                  ? "bg-white text-black border-white shadow-sm"
                                  : "bg-zinc-950 text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-600"
                              }`}
                            >
                              <Crown className="w-3 h-3" />
                              <span>{isCaptain ? "Captain" : "Set (C)"}</span>
                            </button>

                            <div className="px-2 py-1 rounded-xl bg-zinc-950 border border-zinc-800 font-mono font-black text-xs text-white">
                              ★ {player.stats?.averageRating?.toFixed(1) || "7.5"}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SQUAD xG PERFORMANCE & CHANCE CREATION CHART */}
          <TeamXgChart team={currentTeam} matches={safeMatches} />
        </div>
      )}

      {/* CUSTOMIZE TEAM MODAL */}
      {isCustomizeOpen && currentTeam && (
        <CustomizeTeamModal
          team={currentTeam}
          allPlayers={safePlayers}
          onSave={onSaveTeam}
          onClose={() => setIsCustomizeOpen(false)}
        />
      )}
    </div>
  );
};
