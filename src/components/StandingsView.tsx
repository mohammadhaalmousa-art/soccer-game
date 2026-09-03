import React, { useState } from "react";
import { Team, Match, LeagueSeason } from "../types";
import { calculateStandings } from "../utils/leagueCalculations";
import { Trophy, Table2, Flame, Shield, Edit3, Image as ImageIcon, Sliders, ShieldAlert, CheckCircle2, Lock } from "lucide-react";
import { TeamBadge } from "./TeamBadge";

interface StandingsViewProps {
  teams: Team[];
  matches: Match[];
  activeSeason: LeagueSeason;
  isAdminUnlocked?: boolean;
  onSelectTeam?: (team: Team) => void;
  onOpenChangeTeamLogo?: (team: Team) => void;
  onOpenModifyTable?: (team?: Team) => void;
  onUnlockAdmin?: (pin: string) => Promise<boolean> | boolean;
}

export const StandingsView: React.FC<StandingsViewProps> = ({
  teams,
  matches,
  activeSeason,
  isAdminUnlocked,
  onSelectTeam,
  onOpenChangeTeamLogo,
  onOpenModifyTable,
  onUnlockAdmin,
}) => {
  const standings = calculateStandings(teams, matches, activeSeason);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // Quick stats
  const totalGoals = standings.reduce((acc, curr) => acc + curr.goalsFor, 0);
  const topAttack = [...standings].sort((a, b) => b.goalsFor - a.goalsFor)[0];
  const topDefense = [...standings].sort((a, b) => a.goalsAgainst - b.goalsAgainst)[0];

  // Check if any team has an active adjustment
  const activeAdjustments = standings.filter(
    (s) => s.pointsAdjustment || s.isOverridden || s.adjustmentNotes
  );

  const handleModifyClick = () => {
    if (isAdminUnlocked) {
      if (onOpenModifyTable) onOpenModifyTable();
    } else {
      setShowPinPrompt(true);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUnlockAdmin) return;
    const ok = await onUnlockAdmin(pinInput);
    if (ok) {
      setShowPinPrompt(false);
      setPinInput("");
      setPinError(false);
      if (onOpenModifyTable) onOpenModifyTable();
    } else {
      setPinError(true);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-[#121215] p-5 rounded-3xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
        <div>
          <h2 className="text-lg sm:text-xl font-black font-chakra text-white flex items-center gap-2">
            <Table2 className="w-5 h-5 text-white" />
            LEAGUE TABLE & STANDINGS
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {activeSeason.name} &bull; Official points, goal differences, and form guide
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-3.5 py-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold text-white flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-white" />
            Season {activeSeason.year}
          </span>

          {onOpenModifyTable && (
            <button
              type="button"
              onClick={handleModifyClick}
              className={`px-3.5 py-1.5 rounded-2xl border text-xs font-chakra font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                isAdminUnlocked
                  ? "bg-white hover:bg-zinc-200 text-black border-white"
                  : "bg-zinc-900 hover:bg-zinc-800 text-amber-300 border-amber-500/40 hover:border-amber-400"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Modify Table</span>
              {activeAdjustments.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Admin Unlock PIN Dialog */}
      {showPinPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121215] border border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black font-chakra text-white uppercase tracking-wider">
                  Admin PIN Required
                </h4>
                <p className="text-xs text-zinc-400">
                  Enter password to modify league standings
                </p>
              </div>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-3">
              <input
                type="password"
                autoFocus
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Enter admin password (pass: admin)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white font-mono"
              />

              {pinError && (
                <p className="text-xs text-rose-400 font-mono">
                  Incorrect PIN or password. Access denied.
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinPrompt(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-chakra font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-chakra font-black uppercase tracking-wider shadow-md"
                >
                  Unlock & Modify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Stats Ticker */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#121215] p-4 rounded-3xl border border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center font-bold">
            ⚽
          </div>
          <div>
            <span className="text-[10px] font-chakra font-bold text-zinc-400 uppercase tracking-wider block">
              Total Goals Scored
            </span>
            <span className="text-lg font-chakra font-black text-white">{totalGoals} Goals</span>
          </div>
        </div>

        <div className="bg-[#121215] p-4 rounded-3xl border border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center font-bold">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-chakra font-bold text-zinc-400 uppercase tracking-wider block">
              Top Attack
            </span>
            <span className="text-lg font-chakra font-black text-white">
              {topAttack?.teamName || "N/A"} ({topAttack?.goalsFor || 0} GF)
            </span>
          </div>
        </div>

        <div className="bg-[#121215] p-4 rounded-3xl border border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center font-bold">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-chakra font-bold text-zinc-400 uppercase tracking-wider block">
              Best Defense
            </span>
            <span className="text-lg font-chakra font-black text-white">
              {topDefense?.teamName || "N/A"} ({topDefense?.goalsAgainst || 0} GA)
            </span>
          </div>
        </div>
      </div>

      {/* Points System Legend Banner */}
      <div className="bg-[#121215] p-4 rounded-3xl border border-zinc-800 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs font-chakra">
        <div className="flex items-center gap-2 text-zinc-300 font-bold uppercase tracking-wider text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Official Points System:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <span className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white font-bold flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Win: <span className="text-emerald-400 font-black">3 PTS</span>
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white font-bold flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Win on Pens: <span className="text-cyan-400 font-black">2 PTS</span>
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-300 font-bold flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
            Draw: <span className="text-zinc-200 font-black">1 PT</span>
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-400 font-bold flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Loss (Pens / Reg): <span className="text-rose-400 font-black">0 PTS</span>
          </span>
        </div>
      </div>

      {/* Active Table Adjustments Footnote / Banner */}
      {activeAdjustments.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black font-chakra text-amber-300 uppercase tracking-wider">
                Official League Adjustments Active
              </h4>
              <div className="text-[11px] text-zinc-300 space-y-0.5 mt-0.5">
                {activeAdjustments.map((adj) => (
                  <div key={adj.teamId} className="flex items-center gap-1.5 font-mono">
                    <span className="font-bold text-white">{adj.teamName}:</span>
                    {typeof adj.pointsAdjustment === "number" && adj.pointsAdjustment !== 0 && (
                      <span className={adj.pointsAdjustment > 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                        {adj.pointsAdjustment > 0 ? `+${adj.pointsAdjustment}` : adj.pointsAdjustment} PTS
                      </span>
                    )}
                    {adj.isOverridden && (
                      <span className="text-cyan-300 text-[10px]">(Manual stats override)</span>
                    )}
                    {adj.adjustmentNotes && (
                      <span className="text-zinc-400 italic">({adj.adjustmentNotes})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {onOpenModifyTable && (
            <button
              type="button"
              onClick={handleModifyClick}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-chakra font-bold transition-colors shrink-0"
            >
              Edit Adjustments
            </button>
          )}
        </div>
      )}

      {/* Modern Minimalist Table */}
      <div className="bg-[#121215] rounded-3xl border border-zinc-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-chakra font-bold text-zinc-400 uppercase tracking-wider">
                <th className="py-3.5 px-3 sm:px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-3 sm:px-4">Team</th>
                <th className="py-3.5 px-2 text-center w-10" title="Matches Played">P</th>
                <th className="py-3.5 px-2 text-center w-10 text-white" title="Regulation Wins (3 Pts)">W</th>
                <th className="py-3.5 px-2 text-center w-10 text-cyan-400" title="Penalty Shootout Wins (2 Pts)">PW</th>
                <th className="py-3.5 px-2 text-center w-10" title="Draws (1 Pt)">D</th>
                <th className="py-3.5 px-2 text-center w-10 text-zinc-500 hidden sm:table-cell" title="Penalty Shootout Losses (0 Pts)">PL</th>
                <th className="py-3.5 px-2 text-center w-10" title="Regulation Losses (0 Pts)">L</th>
                <th className="py-3.5 px-2 text-center w-12 hidden sm:table-cell">GF</th>
                <th className="py-3.5 px-2 text-center w-12 hidden sm:table-cell">GA</th>
                <th className="py-3.5 px-2 text-center w-12">GD</th>
                <th className="py-3.5 px-3 text-center w-20 font-black text-white bg-zinc-900/60">PTS</th>
                <th className="py-3.5 px-3 sm:px-4 text-center w-28 hidden md:table-cell">Form</th>
                {isAdminUnlocked && onOpenModifyTable && (
                  <th className="py-3.5 px-2 text-center w-10 text-zinc-400">Edit</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans text-xs">
              {standings.map((row, idx) => {
                const isFirst = idx === 0;
                const origTeam = teams.find((t) => t.id === row.teamId);
                const hasAdj = Boolean(row.pointsAdjustment || row.isOverridden || row.adjustmentNotes);

                return (
                  <tr
                    key={row.teamId}
                    onClick={() => origTeam && onSelectTeam && onSelectTeam(origTeam)}
                    className={`hover:bg-zinc-800/40 transition-colors cursor-pointer ${
                      isFirst ? "bg-zinc-900/40 font-semibold" : ""
                    }`}
                  >
                    {/* Position # */}
                    <td className="py-4 px-3 sm:px-4 text-center font-mono font-black">
                      <span
                        className={`w-6 h-6 rounded-lg inline-flex items-center justify-center text-xs ${
                          idx === 0
                            ? "bg-white text-black font-black"
                            : idx === 1
                            ? "bg-zinc-800 text-zinc-200 border border-zinc-700"
                            : "text-zinc-500"
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>

                    {/* Team Info */}
                    <td className="py-4 px-3 sm:px-4">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="relative group cursor-pointer"
                          onClick={(e) => {
                            if (origTeam && onOpenChangeTeamLogo) {
                              e.stopPropagation();
                              onOpenChangeTeamLogo(origTeam);
                            }
                          }}
                          title="Change team logo / emoji"
                        >
                          <TeamBadge team={origTeam} size="md" />
                          {onOpenChangeTeamLogo && (
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-800 border border-slate-700 text-cyan-300 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity shadow-sm">
                              <ImageIcon className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        <div className="truncate flex-1">
                          <div className="font-chakra font-black text-white text-sm truncate flex items-center gap-1.5">
                            {row.teamName}
                            {isFirst && (
                              <Trophy className="w-3.5 h-3.5 text-white shrink-0" />
                            )}
                            {hasAdj && (
                              <span
                                className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-mono font-bold"
                                title={row.adjustmentNotes || "Admin table adjustment active"}
                              >
                                {row.pointsAdjustment ? `${row.pointsAdjustment > 0 ? "+" : ""}${row.pointsAdjustment}p` : "Adj"}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-2">
                            <span>{row.shortName}</span>
                            {onOpenChangeTeamLogo && origTeam && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenChangeTeamLogo(origTeam);
                                }}
                                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-chakra font-semibold underline cursor-pointer"
                              >
                                Change Logo
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="py-4 px-2 text-center text-zinc-300 font-mono font-semibold">{row.played}</td>
                    <td className="py-4 px-2 text-center text-white font-mono font-bold" title={`${row.won} Regulation Wins (3 pts)`}>{row.won}</td>
                    <td className="py-4 px-2 text-center text-cyan-400 font-mono font-bold" title={`${row.penaltyWon || 0} Shootout Wins (2 pts)`}>{row.penaltyWon || 0}</td>
                    <td className="py-4 px-2 text-center text-zinc-400 font-mono" title={`${row.drawn} Draws (1 pt)`}>{row.drawn}</td>
                    <td className="py-4 px-2 text-center text-zinc-500 font-mono hidden sm:table-cell" title={`${row.penaltyLost || 0} Shootout Losses (0 pts)`}>{row.penaltyLost || 0}</td>
                    <td className="py-4 px-2 text-center text-zinc-400 font-mono" title={`${row.lost} Regulation Losses (0 pts)`}>{row.lost}</td>
                    <td className="py-4 px-2 text-center text-zinc-300 font-mono hidden sm:table-cell">{row.goalsFor}</td>
                    <td className="py-4 px-2 text-center text-zinc-400 font-mono hidden sm:table-cell">{row.goalsAgainst}</td>
                    
                    {/* Goal Difference */}
                    <td className="py-4 px-2 text-center font-mono font-bold">
                      <span
                        className={
                          row.goalDifference > 0
                            ? "text-emerald-400"
                            : row.goalDifference < 0
                            ? "text-rose-400"
                            : "text-zinc-500"
                        }
                      >
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </span>
                    </td>

                    {/* Points */}
                    <td className="py-4 px-3 text-center bg-zinc-900/40">
                      <div className="flex flex-col items-center justify-center">
                        <span className="px-2.5 py-1 rounded-xl bg-zinc-950 border border-zinc-700/80 font-mono font-black text-sm text-white shadow-inner">
                          {row.points}
                        </span>
                        {typeof row.pointsAdjustment === "number" && row.pointsAdjustment !== 0 && (
                          <span
                            className={`text-[9px] font-mono font-bold mt-0.5 ${
                              row.pointsAdjustment > 0 ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            ({row.pointsAdjustment > 0 ? `+${row.pointsAdjustment}` : row.pointsAdjustment})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Form Guide */}
                    <td className="py-4 px-3 sm:px-4 text-center hidden md:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        {row.form.length === 0 ? (
                          <span className="text-zinc-600 text-xs">-</span>
                        ) : (
                          row.form.map((res, fIdx) => (
                            <span
                              key={fIdx}
                              className={`w-5 h-5 rounded-md flex items-center justify-center font-chakra font-black text-[10px] ${
                                res === "W"
                                  ? "bg-white text-black"
                                  : res === "D"
                                  ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                                  : "bg-zinc-950 text-zinc-500 border border-zinc-800"
                              }`}
                            >
                              {res}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    {/* Edit Trigger for Admin */}
                    {isAdminUnlocked && onOpenModifyTable && (
                      <td className="py-4 px-2 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (origTeam) onOpenModifyTable(origTeam);
                          }}
                          className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white inline-flex items-center justify-center transition-colors"
                          title={`Modify table stats for ${row.teamName}`}
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

