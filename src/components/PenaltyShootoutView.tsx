import React from "react";
import { PenaltyShootoutData, PenaltyShot } from "../types";
import { Check, X, ShieldAlert, Sparkles, Trophy } from "lucide-react";

interface PenaltyShootoutViewProps {
  shootout: PenaltyShootoutData | undefined;
  homeTeamName?: string;
  awayTeamName?: string;
  homeBadgeEmoji?: string;
  awayBadgeEmoji?: string;
  homeTeamId?: string;
  awayTeamId?: string;
}

export const PenaltyShootoutView: React.FC<PenaltyShootoutViewProps> = ({
  shootout,
  homeTeamName = "Red Team",
  awayTeamName = "Blue Team",
  homeBadgeEmoji = "🔴",
  awayBadgeEmoji = "⚡",
  homeTeamId = "team_red",
  awayTeamId = "team_blue",
}) => {
  if (!shootout || !shootout.shots || shootout.shots.length === 0) {
    if (shootout && (shootout.homeScore !== undefined || shootout.awayScore !== undefined)) {
      return (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-center">
          <span className="text-xs font-chakra font-bold text-amber-400">
            Penalty Shootout Score: {homeTeamName} {shootout.homeScore} - {shootout.awayScore} {awayTeamName}
          </span>
        </div>
      );
    }
    return null;
  }

  // Determine rounds from shots
  const maxRound = Math.max(...shootout.shots.map((s) => s.round || 1), 5);
  const rounds = Array.from({ length: maxRound }, (_, i) => i + 1);

  // Group shots by round and team
  const shotsByRound: Record<number, { home?: PenaltyShot; away?: PenaltyShot }> = {};
  rounds.forEach((r) => {
    shotsByRound[r] = {};
  });

  shootout.shots.forEach((shot) => {
    const r = shot.round || 1;
    if (!shotsByRound[r]) shotsByRound[r] = {};
    const isHome =
      shot.teamId === homeTeamId ||
      shot.teamId === "team_red" ||
      shot.teamId === "home" ||
      shot.teamId.toLowerCase().includes("red") ||
      shot.teamId.toLowerCase().includes("home");
    if (isHome) {
      shotsByRound[r].home = shot;
    } else {
      shotsByRound[r].away = shot;
    }
  });

  const winnerName =
    shootout.winnerTeamId === homeTeamId || shootout.homeScore > shootout.awayScore
      ? homeTeamName
      : shootout.winnerTeamId === awayTeamId || shootout.awayScore > shootout.homeScore
      ? awayTeamName
      : undefined;

  return (
    <div className="rounded-2xl bg-[#0b101b] border border-amber-500/30 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/15 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base">
            🥅
          </div>
          <div>
            <div className="text-xs sm:text-sm font-chakra font-black text-white flex items-center gap-1.5">
              <span>PENALTY SHOOTOUT BREAKDOWN</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                OFFICIAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Detailed record of every shooter, kick result, and goalkeeper stop
            </p>
          </div>
        </div>

        {/* Shootout Score Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950 border border-amber-500/40 font-chakra">
          <span className="text-xs font-bold text-slate-300">{homeTeamName}</span>
          <span className="text-base font-black text-amber-400">{shootout.homeScore}</span>
          <span className="text-slate-600 font-bold">:</span>
          <span className="text-base font-black text-amber-400">{shootout.awayScore}</span>
          <span className="text-xs font-bold text-slate-300">{awayTeamName}</span>
        </div>
      </div>

      {winnerName && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-center gap-2 text-xs font-chakra font-bold text-amber-300">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {winnerName} won {shootout.homeScore > shootout.awayScore ? `${shootout.homeScore}-${shootout.awayScore}` : `${shootout.awayScore}-${shootout.homeScore}`} on penalties
          </span>
        </div>
      )}

      {/* Shootout Shots Table */}
      <div className="p-3 sm:p-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-chakra text-[11px] uppercase tracking-wider">
              <th className="py-2 px-3 text-left w-12">Rnd</th>
              <th className="py-2 px-3 text-left">
                <div className="flex items-center gap-1.5">
                  <span>{homeBadgeEmoji}</span>
                  <span className="font-bold text-rose-400">{homeTeamName}</span>
                </div>
              </th>
              <th className="py-2 px-3 text-left">
                <div className="flex items-center gap-1.5">
                  <span>{awayBadgeEmoji}</span>
                  <span className="font-bold text-blue-400">{awayTeamName}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {rounds.map((roundNum) => {
              const pair = shotsByRound[roundNum];
              if (!pair?.home && !pair?.away) return null;

              return (
                <tr key={roundNum} className="hover:bg-slate-900/50 transition-colors">
                  {/* Round Badge */}
                  <td className="py-3 px-3 font-chakra font-black text-slate-500 text-xs">
                    #{roundNum}
                  </td>

                  {/* Home Team Shot */}
                  <td className="py-3 px-3">
                    {pair?.home ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              pair.home.scored
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                            }`}
                          >
                            {pair.home.scored ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          </span>
                          <div>
                            <span className="font-chakra font-bold text-white text-xs block">
                              {pair.home.playerName || "Taker"}
                            </span>
                            {pair.home.note && (
                              <span className="text-[10px] text-slate-400 font-sans block">
                                {pair.home.note}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                          {pair.home.scored ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-chakra font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              ⚽ SCORED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-chakra font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              ❌ {pair.home.goalkeeperName ? `SAVED BY ${pair.home.goalkeeperName.toUpperCase()}` : "MISSED"}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-600 italic">No kick taken</span>
                    )}
                  </td>

                  {/* Away Team Shot */}
                  <td className="py-3 px-3">
                    {pair?.away ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              pair.away.scored
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                            }`}
                          >
                            {pair.away.scored ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          </span>
                          <div>
                            <span className="font-chakra font-bold text-white text-xs block">
                              {pair.away.playerName || "Taker"}
                            </span>
                            {pair.away.note && (
                              <span className="text-[10px] text-slate-400 font-sans block">
                                {pair.away.note}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                          {pair.away.scored ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-chakra font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              ⚽ SCORED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-chakra font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              ❌ {pair.away.goalkeeperName ? `SAVED BY ${pair.away.goalkeeperName.toUpperCase()}` : "MISSED"}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-600 italic">No kick taken</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
