import React, { useState, useEffect } from "react";
import { Team, Match, LeagueSeason, TeamTableAdjustment, TeamStanding } from "../types";
import { calculateStandings } from "../utils/leagueCalculations";
import { TeamBadge } from "./TeamBadge";
import { 
  Table2, 
  X, 
  CheckCircle2, 
  RotateCcw, 
  AlertTriangle, 
  Sliders, 
  Plus, 
  Minus, 
  ShieldAlert, 
  Sparkles,
  Award,
  HelpCircle,
  TrendingUp,
  FileText
} from "lucide-react";

interface EditLeagueTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  matches: Match[];
  activeSeason: LeagueSeason;
  initialSelectedTeamId?: string;
  onSaveAdjustments: (adjustments: Record<string, TeamTableAdjustment>) => Promise<void>;
}

export const EditLeagueTableModal: React.FC<EditLeagueTableModalProps> = ({
  isOpen,
  onClose,
  teams,
  matches,
  activeSeason,
  initialSelectedTeamId,
  onSaveAdjustments,
}) => {
  const safeTeams = teams || [];
  const safeMatches = matches || [];

  // Working state for adjustments keyed by teamId
  const [adjustments, setAdjustments] = useState<Record<string, TeamTableAdjustment>>(() => {
    const existing = { ...(activeSeason.tableAdjustments || {}) };
    safeTeams.forEach((t) => {
      if (!existing[t.id] && t.tableAdjustment) {
        existing[t.id] = { ...t.tableAdjustment };
      }
    });
    return existing;
  });

  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    initialSelectedTeamId || safeTeams[0]?.id || "team_red"
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync state if activeSeason or teams change
  useEffect(() => {
    const existing = { ...(activeSeason.tableAdjustments || {}) };
    safeTeams.forEach((t) => {
      if (!existing[t.id] && t.tableAdjustment) {
        existing[t.id] = { ...t.tableAdjustment };
      }
    });
    setAdjustments(existing);
    if (initialSelectedTeamId) {
      setSelectedTeamId(initialSelectedTeamId);
    } else if (!selectedTeamId && safeTeams.length > 0) {
      setSelectedTeamId(safeTeams[0].id);
    }
  }, [activeSeason, isOpen, initialSelectedTeamId]);

  if (!isOpen) return null;

  const currentTeam = safeTeams.find((t) => t.id === selectedTeamId) || safeTeams[0];
  const currentAdj = adjustments[selectedTeamId] || {
    teamId: selectedTeamId,
    pointsAdjustment: 0,
    overrideEnabled: false,
    notes: "",
  };

  // Base standings without adjustments for baseline reference
  const baseStandings = calculateStandings(safeTeams, safeMatches, activeSeason.id, {});
  const baseTeamStanding = baseStandings.find((s) => s.teamId === selectedTeamId) || {
    played: 0,
    won: 0,
    penaltyWon: 0,
    drawn: 0,
    penaltyLost: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
    goalDifference: 0,
  };

  // Live preview standings with current adjustments state
  const previewStandings = calculateStandings(safeTeams, safeMatches, activeSeason.id, adjustments);

  const updateCurrentTeamAdjustment = (patch: Partial<TeamTableAdjustment>) => {
    setAdjustments((prev) => {
      const existing = prev[selectedTeamId] || {
        teamId: selectedTeamId,
        pointsAdjustment: 0,
        overrideEnabled: false,
        notes: "",
      };
      return {
        ...prev,
        [selectedTeamId]: {
          ...existing,
          ...patch,
          teamId: selectedTeamId,
          updatedAt: Date.now(),
        },
      };
    });
  };

  const handleResetCurrentTeam = () => {
    setAdjustments((prev) => {
      const next = { ...prev };
      delete next[selectedTeamId];
      return next;
    });
  };

  const handleResetAllTeams = () => {
    if (window.confirm("Are you sure you want to reset all league table adjustments for this season back to exact match results?")) {
      setAdjustments({});
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Clean up empty adjustments
      const cleaned: Record<string, TeamTableAdjustment> = {};
      Object.entries(adjustments).forEach(([tId, adj]) => {
        const item = adj as TeamTableAdjustment;
        const hasPointsAdj = typeof item.pointsAdjustment === "number" && item.pointsAdjustment !== 0;
        const hasOverride = Boolean(item.overrideEnabled);
        const hasNotes = Boolean(item.notes && item.notes.trim().length > 0);
        if (hasPointsAdj || hasOverride || hasNotes) {
          cleaned[tId] = {
            ...item,
            teamId: item.teamId || tId,
          };
        }
      });

      await onSaveAdjustments(cleaned);
      setSuccessMessage("League table successfully modified and synchronized!");
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 700);
    } catch (err) {
      console.error("Failed to save table adjustments:", err);
      alert("Failed to save adjustments. Please check connection.");
    } finally {
      setIsSaving(false);
    }
  };

  // Preset points buttons
  const presetButtons = [
    { label: "-3 Pts", sub: "Disciplinary", val: -3, color: "bg-rose-950/60 text-rose-300 border-rose-800/80 hover:bg-rose-900/80" },
    { label: "-2 Pts", sub: "Violation", val: -2, color: "bg-rose-950/40 text-rose-300 border-rose-800/60 hover:bg-rose-900/60" },
    { label: "-1 Pt", sub: "Forfeit", val: -1, color: "bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/60" },
    { label: "0 Pts", sub: "Standard", val: 0, color: "bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800" },
    { label: "+1 Pt", sub: "Fair Play", val: 1, color: "bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/60" },
    { label: "+2 Pts", sub: "Bonus", val: 2, color: "bg-cyan-950/40 text-cyan-300 border-cyan-800/60 hover:bg-cyan-900/60" },
    { label: "+3 Pts", sub: "Awarded Win", val: 3, color: "bg-emerald-950/60 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/80" },
  ];

  const currentPointsAdj = currentAdj.pointsAdjustment || 0;
  const isOverrideOn = Boolean(currentAdj.overrideEnabled);

  // Effective values for manual inputs
  const effPlayed = isOverrideOn && typeof currentAdj.playedOverride === "number" ? currentAdj.playedOverride : baseTeamStanding.played;
  const effWon = isOverrideOn && typeof currentAdj.wonOverride === "number" ? currentAdj.wonOverride : baseTeamStanding.won;
  const effPenaltyWon = isOverrideOn && typeof currentAdj.penaltyWonOverride === "number" ? currentAdj.penaltyWonOverride : (baseTeamStanding.penaltyWon || 0);
  const effDrawn = isOverrideOn && typeof currentAdj.drawnOverride === "number" ? currentAdj.drawnOverride : baseTeamStanding.drawn;
  const effPenaltyLost = isOverrideOn && typeof currentAdj.penaltyLostOverride === "number" ? currentAdj.penaltyLostOverride : (baseTeamStanding.penaltyLost || 0);
  const effLost = isOverrideOn && typeof currentAdj.lostOverride === "number" ? currentAdj.lostOverride : baseTeamStanding.lost;
  const effGf = isOverrideOn && typeof currentAdj.goalsForOverride === "number" ? currentAdj.goalsForOverride : baseTeamStanding.goalsFor;
  const effGa = isOverrideOn && typeof currentAdj.goalsAgainstOverride === "number" ? currentAdj.goalsAgainstOverride : baseTeamStanding.goalsAgainst;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#121215] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-white font-bold shadow-inner">
              <Table2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black font-chakra text-white tracking-wide">
                  MODIFY LEAGUE TABLE & POINTS
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-400">
                  Admin Authority
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans">
                {activeSeason.name} &bull; Set point deductions, fair play bonuses, or full standings overrides
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Team Selector Tabs */}
        <div className="px-6 py-3 border-b border-zinc-800/60 bg-[#15151a] flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-chakra font-bold text-zinc-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Select Team:
            </span>
            {safeTeams.map((team) => {
              const isSelected = team.id === selectedTeamId;
              const hasAdj = Boolean(
                adjustments[team.id] &&
                (adjustments[team.id].pointsAdjustment ||
                  adjustments[team.id].overrideEnabled ||
                  adjustments[team.id].notes)
              );

              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => setSelectedTeamId(team.id)}
                  className={`px-3.5 py-2 rounded-2xl border text-xs font-chakra font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "bg-white text-black border-white shadow-md"
                      : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800"
                  }`}
                >
                  <TeamBadge team={team} size="sm" />
                  <span>{team.name}</span>
                  {hasAdj && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? "bg-amber-600" : "bg-amber-400 animate-pulse"
                      }`}
                      title="Active adjustment"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetAllTeams}
              className="text-xs text-zinc-400 hover:text-rose-400 font-chakra font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900/60 border border-zinc-800 transition-colors"
              title="Reset all teams in this season back to exact match calculations"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden md:inline">Reset All</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 font-sans">
          
          {/* Current Team Overview Header */}
          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <TeamBadge team={currentTeam} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-black font-chakra text-white">
                    {currentTeam?.name}
                  </h4>
                  <span className="text-xs font-mono text-zinc-400">
                    ({currentTeam?.shortName})
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Match-calculated base: <span className="text-white font-mono font-bold">{baseTeamStanding.played} P</span> &bull; <span className="text-emerald-400 font-mono font-bold">{baseTeamStanding.won} W</span> &bull; <span className="text-cyan-400 font-mono font-bold">{baseTeamStanding.penaltyWon || 0} PW</span> &bull; <span className="text-zinc-300 font-mono font-bold">{baseTeamStanding.drawn} D</span> &bull; <span className="text-rose-400 font-mono font-bold">{baseTeamStanding.lost} L</span> &bull; <span className="text-white font-mono font-bold">{baseTeamStanding.points} PTS</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetCurrentTeam}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-chakra font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                Reset Team
              </button>
            </div>
          </div>

          {/* Section 1: Points Adjustment / Deduction Stepper */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-white" />
                <h5 className="text-sm font-black font-chakra text-white uppercase tracking-wider">
                  1. Points Adjustment & Deductions
                </h5>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                Applied directly to total points
              </span>
            </div>

            {/* Stepper + Input */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateCurrentTeamAdjustment({ pointsAdjustment: currentPointsAdj - 1 })}
                  className="w-10 h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center font-bold text-lg active:scale-95 transition-transform"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="text-center min-w-[120px]">
                  <div className={`text-2xl font-black font-chakra ${
                    currentPointsAdj > 0
                      ? "text-emerald-400"
                      : currentPointsAdj < 0
                      ? "text-rose-400"
                      : "text-white"
                  }`}>
                    {currentPointsAdj > 0 ? `+${currentPointsAdj}` : currentPointsAdj} PTS
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    {currentPointsAdj > 0 ? "Bonus Applied" : currentPointsAdj < 0 ? "Points Deduction" : "No Adjustment"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => updateCurrentTeamAdjustment({ pointsAdjustment: currentPointsAdj + 1 })}
                  className="w-10 h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center font-bold text-lg active:scale-95 transition-transform"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 flex-1 justify-center sm:justify-start">
                {presetButtons.map((btn, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => updateCurrentTeamAdjustment({ pointsAdjustment: btn.val })}
                    className={`px-2.5 py-1 rounded-xl border text-[11px] font-chakra font-bold flex flex-col items-center leading-tight transition-colors ${btn.color} ${
                      currentPointsAdj === btn.val ? "ring-2 ring-white font-black" : ""
                    }`}
                  >
                    <span>{btn.label}</span>
                    <span className="text-[9px] opacity-80 font-normal">{btn.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Note / Reason Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-chakra font-bold text-zinc-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                Adjustment Reason / Note (displayed on standings table):
              </label>
              <input
                type="text"
                value={currentAdj.notes || ""}
                onChange={(e) => updateCurrentTeamAdjustment({ notes: e.target.value })}
                placeholder="e.g. -2 points for unregistered player; +1 fair play award"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white font-sans"
              />
            </div>
          </div>

          {/* Section 2: Full Table Row Manual Override (Optional) */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table2 className="w-4 h-4 text-cyan-400" />
                <div>
                  <h5 className="text-sm font-black font-chakra text-white uppercase tracking-wider">
                    2. Full Standings Row Override (Manual Mode)
                  </h5>
                  <p className="text-[11px] text-zinc-400">
                    Directly override individual stats like Played, Wins, Goals For, Goals Against
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOverrideOn}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    if (enabled) {
                      updateCurrentTeamAdjustment({
                        overrideEnabled: true,
                        playedOverride: typeof currentAdj.playedOverride === "number" ? currentAdj.playedOverride : baseTeamStanding.played,
                        wonOverride: typeof currentAdj.wonOverride === "number" ? currentAdj.wonOverride : baseTeamStanding.won,
                        penaltyWonOverride: typeof currentAdj.penaltyWonOverride === "number" ? currentAdj.penaltyWonOverride : (baseTeamStanding.penaltyWon || 0),
                        drawnOverride: typeof currentAdj.drawnOverride === "number" ? currentAdj.drawnOverride : baseTeamStanding.drawn,
                        penaltyLostOverride: typeof currentAdj.penaltyLostOverride === "number" ? currentAdj.penaltyLostOverride : (baseTeamStanding.penaltyLost || 0),
                        lostOverride: typeof currentAdj.lostOverride === "number" ? currentAdj.lostOverride : baseTeamStanding.lost,
                        goalsForOverride: typeof currentAdj.goalsForOverride === "number" ? currentAdj.goalsForOverride : baseTeamStanding.goalsFor,
                        goalsAgainstOverride: typeof currentAdj.goalsAgainstOverride === "number" ? currentAdj.goalsAgainstOverride : baseTeamStanding.goalsAgainst,
                      });
                    } else {
                      updateCurrentTeamAdjustment({ overrideEnabled: false });
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                <span className="ml-2 text-xs font-chakra font-bold text-zinc-300">
                  {isOverrideOn ? "Enabled" : "Disabled"}
                </span>
              </label>
            </div>

            {isOverrideOn && (
              <div className="space-y-4 pt-2 border-t border-zinc-800/80 animate-fade-in">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
                  
                  {/* Matches Played */}
                  <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800 flex flex-col">
                    <span className="text-[10px] font-chakra font-bold text-zinc-400 uppercase">Played (P)</span>
                    <input
                      type="number"
                      min={0}
                      value={effPlayed}
                      onChange={(e) => updateCurrentTeamAdjustment({ playedOverride: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="mt-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-2 py-1 text-center font-mono font-bold text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Regulation Wins */}
                  <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800 flex flex-col">
                    <span className="text-[10px] font-chakra font-bold text-emerald-400 uppercase">Wins (W - 3p)</span>
                    <input
                      type="number"
                      min={0}
                      value={effWon}
                      onChange={(e) => updateCurrentTeamAdjustment({ wonOverride: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="mt-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-2 py-1 text-center font-mono font-bold text-sm text-emerald-400 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  {/* Penalty Wins */}
                  <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800 flex flex-col">
                    <span className="text-[10px] font-chakra font-bold text-cyan-400 uppercase">Pens W (PW - 2p)</span>
                    <input
                      type="number"
                      min={0}
                      value={effPenaltyWon}
                      onChange={(e) => updateCurrentTeamAdjustment({ penaltyWonOverride: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="mt-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-2 py-1 text-center font-mono font-bold text-sm text-cyan-400 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Draws */}
                  <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800 flex flex-col">
                    <span className="text-[10px] font-chakra font-bold text-zinc-300 uppercase">Draws (D - 1p)</span>
                    <input
                      type="number"
                      min={0}
                      value={effDrawn}
                      onChange={(e) => updateCurrentTeamAdjustment({ drawnOverride: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="mt-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-2 py-1 text-center font-mono font-bold text-sm text-zinc-300 focus:outline-none focus:border-white"
                    />
                  </div>

                  {/* Penalty Losses */}
                  <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800 flex flex-col">
                    <span className="text-[10px] font-chakra font-bold text-zinc-400 uppercase">Pens L (PL - 0p)</span>
                    <input
                      type="number"
                      min={0}
                      value={effPenaltyLost}
                      onChange={(e) => updateCurrentTeamAdjustment({ penaltyLostOverride: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="mt-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-2 py-1 text-center font-mono font-bold text-sm text-zinc-400 focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  {/* Losses */}
                  <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800 flex flex-col">
                    <span className="text-[10px] font-chakra font-bold text-rose-400 uppercase">Losses (L - 0p)</span>
                    <input
                      type="number"
                      min={0}
                      value={effLost}
                      onChange={(e) => updateCurrentTeamAdjustment({ lostOverride: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="mt-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-2 py-1 text-center font-mono font-bold text-sm text-rose-400 focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  {/* Goals For */}
                  <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800 flex flex-col">
                    <span className="text-[10px] font-chakra font-bold text-white uppercase">Goals For (GF)</span>
                    <input
                      type="number"
                      min={0}
                      value={effGf}
                      onChange={(e) => updateCurrentTeamAdjustment({ goalsForOverride: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="mt-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-2 py-1 text-center font-mono font-bold text-sm text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  {/* Goals Against */}
                  <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800 flex flex-col">
                    <span className="text-[10px] font-chakra font-bold text-zinc-400 uppercase">Goals Ag (GA)</span>
                    <input
                      type="number"
                      min={0}
                      value={effGa}
                      onChange={(e) => updateCurrentTeamAdjustment({ goalsAgainstOverride: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="mt-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-2 py-1 text-center font-mono font-bold text-sm text-zinc-400 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="font-chakra font-bold">Goal Difference:</span>
                    <span className={`font-mono font-bold ${
                      effGf - effGa > 0 ? "text-emerald-400" : effGf - effGa < 0 ? "text-rose-400" : "text-zinc-400"
                    }`}>
                      {effGf - effGa > 0 ? `+${effGf - effGa}` : effGf - effGa}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 font-chakra font-medium">Points Calculation:</span>
                    <span className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-700 font-mono font-bold text-white">
                      {effWon * 3 + effPenaltyWon * 2 + effDrawn * 1 + currentPointsAdj} PTS (Calculated)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Live Table Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-chakra font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-white" />
                Live League Standings Preview:
              </span>
              <span className="text-[11px] font-mono text-zinc-500">
                Sorted by: PTS &gt; GD &gt; GF &gt; W
              </span>
            </div>

            <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-inner">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-900/60 border-b border-zinc-800 text-[10px] font-chakra font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Team</th>
                    <th className="py-2.5 px-2 text-center w-10">P</th>
                    <th className="py-2.5 px-2 text-center w-10 text-white">W</th>
                    <th className="py-2.5 px-2 text-center w-10 text-cyan-400">PW</th>
                    <th className="py-2.5 px-2 text-center w-10 text-zinc-300">D</th>
                    <th className="py-2.5 px-2 text-center w-10 text-zinc-500">PL</th>
                    <th className="py-2.5 px-2 text-center w-10 text-zinc-400">L</th>
                    <th className="py-2.5 px-2 text-center w-10">GF</th>
                    <th className="py-2.5 px-2 text-center w-10">GA</th>
                    <th className="py-2.5 px-2 text-center w-10">GD</th>
                    <th className="py-2.5 px-3 text-center w-16 font-black text-white bg-zinc-900">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans">
                  {previewStandings.map((row, idx) => {
                    const isSelected = row.teamId === selectedTeamId;
                    const hasAdj = Boolean(
                      adjustments[row.teamId] &&
                      (adjustments[row.teamId].pointsAdjustment ||
                        adjustments[row.teamId].overrideEnabled ||
                        adjustments[row.teamId].notes)
                    );

                    return (
                      <tr
                        key={row.teamId}
                        onClick={() => setSelectedTeamId(row.teamId)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-zinc-800/60 font-bold"
                            : "hover:bg-zinc-900/40"
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center font-mono font-bold">
                          <span
                            className={`w-5 h-5 rounded-md inline-flex items-center justify-center text-[11px] ${
                              idx === 0
                                ? "bg-white text-black font-black"
                                : "text-zinc-400"
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-chakra font-bold text-white text-xs">
                              {row.teamName}
                            </span>
                            {hasAdj && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold">
                                {adjustments[row.teamId]?.pointsAdjustment ? (
                                  `${adjustments[row.teamId].pointsAdjustment! > 0 ? "+" : ""}${adjustments[row.teamId].pointsAdjustment} pts`
                                ) : "Overridden"}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono">{row.played}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-white font-bold">{row.won}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-cyan-400 font-bold">{row.penaltyWon || 0}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-zinc-300">{row.drawn}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-zinc-500">{row.penaltyLost || 0}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-zinc-400">{row.lost}</td>
                        <td className="py-2.5 px-2 text-center font-mono">{row.goalsFor}</td>
                        <td className="py-2.5 px-2 text-center font-mono">{row.goalsAgainst}</td>
                        <td className="py-2.5 px-2 text-center font-mono font-bold">
                          <span className={row.goalDifference > 0 ? "text-emerald-400" : row.goalDifference < 0 ? "text-rose-400" : "text-zinc-500"}>
                            {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center bg-zinc-900 font-mono font-black text-white text-xs">
                          {row.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {successMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-2xl flex items-center gap-2 text-emerald-200 text-xs font-chakra font-bold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-chakra font-bold text-zinc-300 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-chakra font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:shadow-white/10 transition-all disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-black" />
              {isSaving ? "Saving..." : "Save & Apply Table Changes"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
