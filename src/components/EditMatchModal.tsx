import React, { useState } from "react";
import { Match, Team, PlayerProfile, CustomStatDefinition, MatchEvent, PenaltyShootoutData, PenaltyShot } from "../types";
import { 
  X, 
  Save, 
  PlusCircle, 
  Trash2, 
  Sparkles, 
  Trophy, 
  Star, 
  Users, 
  Calendar, 
  MapPin, 
  AlertCircle,
  CheckCircle2,
  Sliders,
  Flame,
  ShieldCheck,
  ArrowRightLeft,
  Activity,
  BarChart3,
  Shirt,
  UserCheck,
  UserX,
  UserPlus,
  RefreshCw,
  Eye
} from "lucide-react";
import { FORMATION_PRESETS, getFormationPreset } from "../utils/leagueCalculations";
import { MiniPitchLineup } from "./MiniPitchLineup";

interface EditMatchModalProps {
  match: Match;
  teams: Team[];
  players: PlayerProfile[];
  customStats: CustomStatDefinition[];
  onClose: () => void;
  onSaveMatch: (updatedMatch: Match) => Promise<void>;
  onDeleteMatch?: (matchId: string) => Promise<void>;
}

export const EditMatchModal: React.FC<EditMatchModalProps> = ({
  match,
  teams,
  players,
  customStats,
  onClose,
  onSaveMatch,
  onDeleteMatch,
}) => {
  const safeTeams = teams || [];
  const safePlayers = players || [];
  const safeCustomStats = customStats || [];

  const [title, setTitle] = useState<string>(match.title);
  const [date, setDate] = useState<string>(match.date);
  const [venue, setVenue] = useState<string>(match.venue || "Main Community Pitch");
  const [stadiumPitchType, setStadiumPitchType] = useState<string>(match.stadiumPitchType || "Grass");
  const [status, setStatus] = useState<Match["status"]>(match.status);
  const [homeTeamId, setHomeTeamId] = useState<string>(match.homeTeamId);
  const [awayTeamId, setAwayTeamId] = useState<string>(match.awayTeamId);
  const [homeScore, setHomeScore] = useState<number>(match.homeScore);
  const [awayScore, setAwayScore] = useState<number>(match.awayScore);
  const [homeXg, setHomeXg] = useState<number>(match.homeXg ?? Number((match.homeScore * 1.15).toFixed(1)));
  const [awayXg, setAwayXg] = useState<number>(match.awayXg ?? Number((match.awayScore * 1.08).toFixed(1)));
  
  // Penalties
  const [wentToPenalties, setWentToPenalties] = useState<boolean>(!!match.penaltyScore || !!match.penaltyShootout);
  const [homePenaltyScore, setHomePenaltyScore] = useState<number>(
    match.penaltyShootout?.homeScore ?? match.penaltyScore?.home ?? 3
  );
  const [awayPenaltyScore, setAwayPenaltyScore] = useState<number>(
    match.penaltyShootout?.awayScore ?? match.penaltyScore?.away ?? 4
  );
  const [penaltyWinnerTeamId, setPenaltyWinnerTeamId] = useState<string>(
    match.penaltyShootout?.winnerTeamId || match.penaltyWinnerTeamId || match.homeTeamId
  );
  const [penaltyShots, setPenaltyShots] = useState<PenaltyShot[]>(
    match.penaltyShootout?.shots ? match.penaltyShootout.shots.map((s) => ({ ...s })) : []
  );
  const [outcomeNote, setOutcomeNote] = useState<string>(match.outcomeNote || "");

  // MOTM, DPOTM and Notes
  const [motmPlayerId, setMotmPlayerId] = useState<string>(match.motmPlayerId || "");
  const [dpotmPlayerId, setDpotmPlayerId] = useState<string>(match.dpotmPlayerId || "");
  const [notes, setNotes] = useState<string>(match.notes || "");

  // Match Specific Loans (e.g. for historical games)
  const [loanedPlayers, setLoanedPlayers] = useState<{ playerId: string; loanedToTeamId: string; note?: string }[]>(
    match.loanedPlayers ? [...match.loanedPlayers] : []
  );

  // Lineups state
  const homeTeamObj = safeTeams.find((t) => t.id === match.homeTeamId);
  const awayTeamObj = safeTeams.find((t) => t.id === match.awayTeamId);

  const [homeFormation, setHomeFormation] = useState<string>(
    match.lineups?.home.formation || homeTeamObj?.formation || "7v7_2-3-1"
  );
  const [awayFormation, setAwayFormation] = useState<string>(
    match.lineups?.away.formation || awayTeamObj?.formation || "7v7_3-2-1"
  );

  const [homeStarters, setHomeStarters] = useState<string[]>(
    match.lineups?.home.starters || homeTeamObj?.startingLineup || []
  );
  const [homeSubs, setHomeSubs] = useState<string[]>(
    match.lineups?.home.subs || homeTeamObj?.substitutes || []
  );

  const [awayStarters, setAwayStarters] = useState<string[]>(
    match.lineups?.away.starters || awayTeamObj?.startingLineup || []
  );
  const [awaySubs, setAwaySubs] = useState<string[]>(
    match.lineups?.away.subs || awayTeamObj?.substitutes || []
  );

  const [lineupTeamTab, setLineupTeamTab] = useState<"home" | "away">("home");

  // Events (Goals, Cards, Custom Stats)
  const [events, setEvents] = useState<MatchEvent[]>(
    match.events && match.events.length > 0 ? [...match.events] : []
  );

  // Player Ratings map
  const [ratings, setRatings] = useState<Record<string, number>>(
    match.playerRatings ? { ...match.playerRatings } : {}
  );

  // Who Played / Match Appearances Tracker
  const [playedPlayerIds, setPlayedPlayerIds] = useState<string[]>(() => {
    if (Array.isArray(match.playedPlayerIds)) {
      return [...match.playedPlayerIds];
    }
    const starterSubs = [
      ...(match.lineups?.home.starters || homeTeamObj?.startingLineup || []),
      ...(match.lineups?.home.subs || homeTeamObj?.substitutes || []),
      ...(match.lineups?.away.starters || awayTeamObj?.startingLineup || []),
      ...(match.lineups?.away.subs || awayTeamObj?.substitutes || []),
    ];
    const eventParticipants = (match.events || []).flatMap((e) => [e.playerId, e.assistPlayerId]).filter(Boolean) as string[];
    return Array.from(new Set([...starterSubs, ...eventParticipants]));
  });

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"score" | "lineups" | "played" | "loans" | "events" | "ratings" | "penalties" | "info">("score");

  const homeTeam = safeTeams.find((t) => t.id === homeTeamId);
  const awayTeam = safeTeams.find((t) => t.id === awayTeamId);

  // Calculate effective players for this match taking loans into account
  const isPlayerLoanedTo = (pId: string, tId: string) => {
    return loanedPlayers.some((l) => l.playerId === pId && l.loanedToTeamId === tId);
  };
  const isPlayerLoanedAway = (pId: string, originalTId: string) => {
    return loanedPlayers.some((l) => l.playerId === pId && l.loanedToTeamId !== originalTId);
  };

  const effectiveHomePlayers = safePlayers.filter((p) => {
    if (homeStarters.includes(p.id) || homeSubs.includes(p.id)) return true;
    if (isPlayerLoanedTo(p.id, homeTeamId)) return true;
    if (p.teamId === homeTeamId && !isPlayerLoanedAway(p.id, homeTeamId)) return true;
    return false;
  });

  const effectiveAwayPlayers = safePlayers.filter((p) => {
    if (awayStarters.includes(p.id) || awaySubs.includes(p.id)) return true;
    if (isPlayerLoanedTo(p.id, awayTeamId)) return true;
    if (p.teamId === awayTeamId && !isPlayerLoanedAway(p.id, awayTeamId)) return true;
    return false;
  });

  const matchPlayers = [...effectiveHomePlayers, ...effectiveAwayPlayers];

  // Penalty shootout helpers
  const handleAddPenaltyShot = (teamSide: "home" | "away") => {
    const targetTeamId = teamSide === "home" ? homeTeamId : awayTeamId;
    const opponentTeamId = teamSide === "home" ? awayTeamId : homeTeamId;
    const teamPlayerList = teamSide === "home" ? effectiveHomePlayers : effectiveAwayPlayers;
    const opponentPlayerList = teamSide === "home" ? effectiveAwayPlayers : effectiveHomePlayers;
    const oppGk = opponentPlayerList.find((p) => p.position === "GK") || opponentPlayerList[0];

    const currentShotsForTeam = penaltyShots.filter((s) => s.teamId === targetTeamId).length;
    const round = Math.max(currentShotsForTeam + 1, penaltyShots.length > 0 ? Math.max(...penaltyShots.map((s) => s.round || 1)) : 1);

    const shooter = teamPlayerList[currentShotsForTeam % (teamPlayerList.length || 1)];

    const newShot: PenaltyShot = {
      id: "shot_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5),
      round,
      teamId: targetTeamId,
      playerId: shooter?.id,
      playerName: shooter?.name || (teamSide === "home" ? "Home Taker" : "Away Taker"),
      scored: true,
      goalkeeperName: oppGk?.name || "Goalkeeper",
      note: "",
    };

    const updated = [...penaltyShots, newShot];
    setPenaltyShots(updated);
    recomputePenaltyScores(updated);
  };

  const handleRemovePenaltyShot = (shotId: string) => {
    const updated = penaltyShots.filter((s) => s.id !== shotId);
    setPenaltyShots(updated);
    recomputePenaltyScores(updated);
  };

  const handleUpdatePenaltyShot = (shotId: string, updates: Partial<PenaltyShot>) => {
    const updated = penaltyShots.map((s) => (s.id === shotId ? { ...s, ...updates } : s));
    setPenaltyShots(updated);
    recomputePenaltyScores(updated);
  };

  const recomputePenaltyScores = (shots: PenaltyShot[]) => {
    const hScore = shots.filter((s) => (s.teamId === homeTeamId || s.teamId === "team_red" || s.teamId === "home") && s.scored).length;
    const aScore = shots.filter((s) => (s.teamId === awayTeamId || s.teamId === "team_blue" || s.teamId === "away") && s.scored).length;
    setHomePenaltyScore(hScore);
    setAwayPenaltyScore(aScore);
    if (hScore > aScore) {
      setPenaltyWinnerTeamId(homeTeamId);
    } else if (aScore > hScore) {
      setPenaltyWinnerTeamId(awayTeamId);
    }
  };

  // Helper to add new match event
  const handleAddEvent = (type: MatchEvent["type"]) => {
    const newEvt: MatchEvent = {
      id: "evt_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      minute: 25,
      type,
      playerId: matchPlayers[0]?.id || "",
      teamId: homeTeamId,
      customStatId: type === "CUSTOM_STAT" ? customStats[0]?.id : undefined,
    };
    setEvents([...events, newEvt]);
  };

  const handleRemoveEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const handleUpdateEvent = (id: string, updates: Partial<MatchEvent>) => {
    setEvents(
      events.map((e) => {
        if (e.id === id) {
          const updated = { ...e, ...updates };
          if (updates.playerId) {
            const isLoanedHome = isPlayerLoanedTo(updates.playerId, homeTeamId);
            const isLoanedAway = isPlayerLoanedTo(updates.playerId, awayTeamId);
            if (isLoanedHome) {
              updated.teamId = homeTeamId;
            } else if (isLoanedAway) {
              updated.teamId = awayTeamId;
            } else {
              const p = players.find((pl) => pl.id === updates.playerId);
              if (p) updated.teamId = p.teamId;
            }
          }
          return updated;
        }
        return e;
      })
    );
  };

  // Loan management for this specific match
  const handleAddLoan = () => {
    const availablePlayers = safePlayers.filter(
      (p) => !loanedPlayers.some((l) => l.playerId === p.id)
    );
    if (availablePlayers.length === 0) return;
    const p = availablePlayers[0];
    const targetTeam = p.teamId === homeTeamId ? awayTeamId : homeTeamId;
    setLoanedPlayers([
      ...loanedPlayers,
      {
        playerId: p.id,
        loanedToTeamId: targetTeam,
        note: `Loaned for this match fixture`,
      },
    ]);
  };

  const handleRemoveLoan = (pId: string) => {
    setLoanedPlayers(loanedPlayers.filter((l) => l.playerId !== pId));
  };

  const handleUpdateLoan = (pId: string, updates: Partial<{ playerId: string; loanedToTeamId: string; note: string }>) => {
    setLoanedPlayers(
      loanedPlayers.map((l) => {
        if (l.playerId === pId) {
          return { ...l, ...updates };
        }
        return l;
      })
    );
  };

  const handleSetRating = (playerId: string, val: number) => {
    setRatings((prev) => ({
      ...prev,
      [playerId]: Number(val),
    }));
  };

  // Lineup manipulation helpers
  const handleSetPlayerRole = (teamSide: "home" | "away", playerId: string, role: "starter" | "sub" | "none") => {
    if (teamSide === "home") {
      let newStarters = homeStarters.filter((id) => id !== playerId);
      let newSubs = homeSubs.filter((id) => id !== playerId);
      if (role === "starter") {
        newStarters.push(playerId);
      } else if (role === "sub") {
        newSubs.push(playerId);
      }
      setHomeStarters(newStarters);
      setHomeSubs(newSubs);
    } else {
      let newStarters = awayStarters.filter((id) => id !== playerId);
      let newSubs = awaySubs.filter((id) => id !== playerId);
      if (role === "starter") {
        newStarters.push(playerId);
      } else if (role === "sub") {
        newSubs.push(playerId);
      }
      setAwayStarters(newStarters);
      setAwaySubs(newSubs);
    }
  };

  const handleResetTeamLineup = (teamSide: "home" | "away") => {
    if (teamSide === "home") {
      const t = homeTeam;
      if (t) {
        setHomeFormation(t.formation || "7v7_2-3-1");
        setHomeStarters(t.startingLineup || []);
        setHomeSubs(t.substitutes || []);
      }
    } else {
      const t = awayTeam;
      if (t) {
        setAwayFormation(t.formation || "7v7_3-2-1");
        setAwayStarters(t.startingLineup || []);
        setAwaySubs(t.substitutes || []);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSaving(true);

    try {
      const validEvents = events.filter((e) => e.playerId);

      let computedOutcome = outcomeNote.trim();
      if (wentToPenalties && !computedOutcome) {
        const winnerObj = teams.find((t) => t.id === penaltyWinnerTeamId);
        computedOutcome = `${winnerObj?.name || 'Winner'} won ${homePenaltyScore}-${awayPenaltyScore} on penalties (${homeScore}-${awayScore} FT)`;
      } else if (!wentToPenalties && !computedOutcome) {
        if (homeScore > awayScore) {
          computedOutcome = `${homeTeam?.name || 'Home'} won ${homeScore}-${awayScore} in full time`;
        } else if (awayScore > homeScore) {
          computedOutcome = `${awayTeam?.name || 'Away'} won ${awayScore}-${homeScore} in full time`;
        } else {
          computedOutcome = `Match drawn ${homeScore}-${awayScore}`;
        }
      }

      const updatedMatch: Match = {
        ...match,
        title: title.trim() || `Soccer Game: ${homeTeam?.shortName} vs ${awayTeam?.shortName}`,
        date,
        venue,
        stadiumPitchType: stadiumPitchType as any,
        status,
        homeTeamId,
        awayTeamId,
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        homeXg: Number(homeXg) || undefined,
        awayXg: Number(awayXg) || undefined,
        penaltyScore: wentToPenalties
          ? { home: Number(homePenaltyScore), away: Number(awayPenaltyScore) }
          : undefined,
        penaltyWinnerTeamId: wentToPenalties ? penaltyWinnerTeamId : undefined,
        penaltyShootout: wentToPenalties
          ? {
              homeScore: Number(homePenaltyScore),
              awayScore: Number(awayPenaltyScore),
              winnerTeamId: penaltyWinnerTeamId,
              shots: penaltyShots,
            }
          : undefined,
        outcomeNote: computedOutcome,
        motmPlayerId: motmPlayerId || undefined,
        dpotmPlayerId: dpotmPlayerId || undefined,
        notes,
        loanedPlayers: loanedPlayers.length > 0 ? loanedPlayers : undefined,
        playedPlayerIds,
        events: validEvents,
        playerRatings: ratings,
        lineups: {
          home: {
            formation: homeFormation,
            starters: homeStarters,
            subs: homeSubs,
          },
          away: {
            formation: awayFormation,
            starters: awayStarters,
            subs: awaySubs,
          },
        },
      };

      await onSaveMatch(updatedMatch);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save match statistics.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteMatch) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setIsSaving(true);
    try {
      await onDeleteMatch(match.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete match.");
      setIsSaving(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0b101b] border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-chakra font-black text-white flex items-center gap-2">
                MODIFY GAME STATS & LINEUPS
              </h2>
              <p className="text-xs text-slate-400">
                Update scores, tactical lineups, players who played, historical loans, events and ratings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("score")}
            className={`px-4 py-2.5 text-xs font-chakra font-black tracking-wider uppercase border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "score"
                ? "border-emerald-400 text-emerald-400 bg-emerald-500/10 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            ⚽ Score & xG
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("lineups")}
            className={`px-4 py-2.5 text-xs font-chakra font-black tracking-wider uppercase border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "lineups"
                ? "border-emerald-400 text-emerald-400 bg-emerald-500/10 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>Lineups & Squad ({homeStarters.length + homeSubs.length + awayStarters.length + awaySubs.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("played")}
            className={`px-4 py-2.5 text-xs font-chakra font-black tracking-wider uppercase border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "played"
                ? "border-emerald-400 text-emerald-400 bg-emerald-500/10 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Who Played ({playedPlayerIds.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("loans")}
            className={`px-4 py-2.5 text-xs font-chakra font-black tracking-wider uppercase border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "loans"
                ? "border-amber-400 text-amber-400 bg-amber-500/10 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Match Loans ({loanedPlayers.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2.5 text-xs font-chakra font-black tracking-wider uppercase border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "events"
                ? "border-emerald-400 text-emerald-400 bg-emerald-500/10 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            🎯 Events ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ratings")}
            className={`px-4 py-2.5 text-xs font-chakra font-black tracking-wider uppercase border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "ratings"
                ? "border-emerald-400 text-emerald-400 bg-emerald-500/10 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            ★ Player Ratings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("penalties")}
            className={`px-4 py-2.5 text-xs font-chakra font-black tracking-wider uppercase border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "penalties"
                ? "border-amber-400 text-amber-400 bg-amber-500/10 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>🥅 Shootout</span>
            {wentToPenalties && (
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                {penaltyShots.length > 0 ? `${penaltyShots.length} kicks` : "ON"}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`px-4 py-2.5 text-xs font-chakra font-black tracking-wider uppercase border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "info"
                ? "border-emerald-400 text-emerald-400 bg-emerald-500/10 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            📋 Details & Status
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: SCORE & RESULT */}
          {activeTab === "score" && (
            <div className="space-y-5">
              {/* Teams & Scoreboard */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-chakra font-bold text-slate-300 block mb-1">
                      Home Team
                    </label>
                    <select
                      value={homeTeamId}
                      onChange={(e) => setHomeTeamId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                    >
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.badgeEmoji} {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-chakra font-bold text-slate-300 block mb-1">
                      Away Team
                    </label>
                    <select
                      value={awayTeamId}
                      onChange={(e) => setAwayTeamId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                    >
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.badgeEmoji} {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Score Controls */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-3 items-center gap-3">
                  <div className="text-center space-y-2">
                    <span className="text-xs font-chakra font-bold text-rose-400 block truncate">
                      {homeTeam?.name || "Home"}
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={homeScore}
                      onChange={(e) => setHomeScore(Number(e.target.value))}
                      className="w-20 mx-auto text-center bg-slate-900 border border-slate-700 rounded-xl py-2 text-2xl font-chakra font-black text-white"
                    />
                  </div>

                  <div className="text-center font-chakra font-bold text-slate-500 text-sm">
                    VS (FT)
                  </div>

                  <div className="text-center space-y-2">
                    <span className="text-xs font-chakra font-bold text-blue-400 block truncate">
                      {awayTeam?.name || "Away"}
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={awayScore}
                      onChange={(e) => setAwayScore(Number(e.target.value))}
                      className="w-20 mx-auto text-center bg-slate-900 border border-slate-700 rounded-xl py-2 text-2xl font-chakra font-black text-white"
                    />
                  </div>
                </div>

                {/* Expected Goals (xG) inputs */}
                <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-chakra font-black text-slate-300 uppercase tracking-wider">
                      Expected Goals (xG) Values
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-chakra font-bold text-slate-400 block mb-1">
                        {homeTeam?.shortName || "Home"} xG
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="25"
                        value={homeXg}
                        onChange={(e) => setHomeXg(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-chakra font-black text-emerald-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-chakra font-bold text-slate-400 block mb-1">
                        {awayTeam?.shortName || "Away"} xG
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="25"
                        value={awayXg}
                        onChange={(e) => setAwayXg(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-chakra font-black text-blue-400 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Penalties Checkbox & Controls */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                    <input
                      type="checkbox"
                      checked={wentToPenalties}
                      onChange={(e) => setWentToPenalties(e.target.checked)}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <span>Penalty Shootout Decider (e.g. Draw decided on penalties)</span>
                  </label>

                  {wentToPenalties && (
                    <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1">Home Penalties</span>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={homePenaltyScore}
                          onChange={(e) => setHomePenaltyScore(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-center font-chakra font-black text-white text-base"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1">Away Penalties</span>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={awayPenaltyScore}
                          onChange={(e) => setAwayPenaltyScore(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-center font-chakra font-black text-white text-base"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1">Shootout Winner</span>
                        <select
                          value={penaltyWinnerTeamId}
                          onChange={(e) => setPenaltyWinnerTeamId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold text-emerald-400 outline-none"
                        >
                          <option value={homeTeamId}>{homeTeam?.name}</option>
                          <option value={awayTeamId}>{awayTeam?.name}</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3 pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setActiveTab("penalties")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-chakra font-bold transition-colors cursor-pointer"
                        >
                          <span>🥅 Edit Shooters & Shots in Shootout Tab ({penaltyShots.length} kicks logged)</span>
                          <span className="text-amber-400">→</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Outcome summary note */}
                <div>
                  <label className="text-xs font-chakra font-bold text-slate-300 block mb-1">
                    Outcome Summary Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Team Blue Wins on pens (4-3 on penalties, 5-5 FT)"
                    value={outcomeNote}
                    onChange={(e) => setOutcomeNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none"
                  />
                </div>

                {/* Match Awards (MOTM & DPOTM) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-chakra font-bold text-amber-300 block mb-1 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Man of the Match (MOTM)</span>
                    </label>
                    <select
                      value={motmPlayerId}
                      onChange={(e) => setMotmPlayerId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-300 outline-none"
                    >
                      <option value="">-- Select MVP / MOTM --</option>
                      {matchPlayers.map((p) => {
                        const isLoanedH = isPlayerLoanedTo(p.id, homeTeamId);
                        const isLoanedA = isPlayerLoanedTo(p.id, awayTeamId);
                        const displayTeam = isLoanedH ? homeTeam : isLoanedA ? awayTeam : teams.find((tm) => tm.id === p.teamId);
                        return (
                          <option key={p.id} value={p.id}>
                            ⭐ {p.name} ({displayTeam?.shortName} - #{p.jerseyNumber}) {isLoanedH || isLoanedA ? "[LOAN]" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-chakra font-bold text-blue-300 block mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Defensive Player of Match (DPOTM)</span>
                    </label>
                    <select
                      value={dpotmPlayerId}
                      onChange={(e) => setDpotmPlayerId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-blue-300 outline-none"
                    >
                      <option value="">-- Select DPOTM --</option>
                      {matchPlayers.map((p) => {
                        const isLoanedH = isPlayerLoanedTo(p.id, homeTeamId);
                        const isLoanedA = isPlayerLoanedTo(p.id, awayTeamId);
                        const displayTeam = isLoanedH ? homeTeam : isLoanedA ? awayTeam : teams.find((tm) => tm.id === p.teamId);
                        return (
                          <option key={p.id} value={p.id}>
                            🛡️ {p.name} ({displayTeam?.shortName} - #{p.jerseyNumber})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LINEUPS & SQUAD */}
          {activeTab === "lineups" && (
            <div className="space-y-5">
              {/* Header explanation banner */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-chakra font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Shirt className="w-4 h-4 text-emerald-400" />
                    Match Tactical Lineups & Participating Players
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Designate starters on the pitch and bench substitutes for {homeTeam?.name || "Home"} & {awayTeam?.name || "Away"}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleResetTeamLineup("home")}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-chakra font-bold transition-colors cursor-pointer flex items-center gap-1"
                    title="Reset Home Lineup to Default Roster"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset Home</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResetTeamLineup("away")}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-chakra font-bold transition-colors cursor-pointer flex items-center gap-1"
                    title="Reset Away Lineup to Default Roster"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset Away</span>
                  </button>
                </div>
              </div>

              {/* Team Switcher Tabs for Lineup Editor */}
              <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setLineupTeamTab("home")}
                  className={`flex-1 py-2 px-3 rounded-xl font-chakra font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    lineupTeamTab === "home"
                      ? "bg-rose-950/60 text-rose-300 border border-rose-500/40 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span>{homeTeam?.badgeEmoji || "🔴"}</span>
                  <span>{homeTeam?.name || "Home Team"}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px] text-rose-400 border border-rose-500/30">
                    {homeStarters.length} Starters &bull; {homeSubs.length} Subs
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setLineupTeamTab("away")}
                  className={`flex-1 py-2 px-3 rounded-xl font-chakra font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    lineupTeamTab === "away"
                      ? "bg-blue-950/60 text-blue-300 border border-blue-500/40 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span>{awayTeam?.badgeEmoji || "🔵"}</span>
                  <span>{awayTeam?.name || "Away Team"}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px] text-blue-400 border border-blue-500/30">
                    {awayStarters.length} Starters &bull; {awaySubs.length} Subs
                  </span>
                </button>
              </div>

              {/* Selected Team Lineup Configuration */}
              {lineupTeamTab === "home" && (
                <div className="space-y-5">
                  {/* Formation Bar */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-chakra font-bold text-slate-300">
                        Home Pitch Formation:
                      </span>
                      <select
                        value={homeFormation}
                        onChange={(e) => setHomeFormation(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-chakra font-black text-rose-400 outline-none"
                      >
                        {FORMATION_PRESETS.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400">
                      Preset slots: {getFormationPreset(homeFormation).slots.length} starters
                    </div>
                  </div>

                  {/* Pitch Preview & Starters/Subs Manager Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Live Tactical Pitch Preview */}
                    <div className="lg:col-span-6">
                      {homeTeam && (
                        <MiniPitchLineup
                          team={homeTeam}
                          formation={homeFormation}
                          starterIds={homeStarters}
                          benchIds={homeSubs}
                          allPlayers={players}
                          playerRatings={ratings}
                          motmPlayerId={motmPlayerId}
                          dpotmPlayerId={dpotmPlayerId}
                          size="md"
                        />
                      )}
                    </div>

                    {/* Starters & Subs Control Lists */}
                    <div className="lg:col-span-6 space-y-4">
                      {/* Starting Lineup List */}
                      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-chakra font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5" />
                            Starters on Pitch ({homeStarters.length})
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Click to reassign
                          </span>
                        </div>

                        {homeStarters.length === 0 ? (
                          <div className="text-center py-4 text-xs text-slate-500">
                            No starters assigned. Select players below.
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                            {homeStarters.map((pId, idx) => {
                              const p = safePlayers.find((pl) => pl.id === pId);
                              const isLoaned = isPlayerLoanedTo(pId, homeTeamId);
                              return (
                                <div
                                  key={pId}
                                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-5 h-5 rounded-md bg-rose-950/80 text-rose-400 font-chakra font-bold text-[10px] flex items-center justify-center shrink-0">
                                      #{p?.jerseyNumber || idx + 1}
                                    </span>
                                    <span className="font-chakra font-bold text-white truncate">
                                      {p?.name || pId}
                                    </span>
                                    <span className="text-[10px] text-slate-400 shrink-0">
                                      ({p?.position})
                                    </span>
                                    {isLoaned && (
                                      <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold border border-amber-500/30 shrink-0">
                                        LOAN
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleSetPlayerRole("home", pId, "sub")}
                                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-chakra font-bold transition-colors cursor-pointer"
                                      title="Move to bench/subs"
                                    >
                                      ⇄ Bench
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSetPlayerRole("home", pId, "none")}
                                      className="p-1 rounded hover:bg-rose-950/40 text-rose-400 transition-colors cursor-pointer"
                                      title="Remove from squad"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Substitutes / Bench List */}
                      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-chakra font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            Substitutes / Bench ({homeSubs.length})
                          </span>
                        </div>

                        {homeSubs.length === 0 ? (
                          <div className="text-center py-4 text-xs text-slate-500">
                            No substitutes on bench.
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {homeSubs.map((pId) => {
                              const p = safePlayers.find((pl) => pl.id === pId);
                              const isLoaned = isPlayerLoanedTo(pId, homeTeamId);
                              return (
                                <div
                                  key={pId}
                                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-5 h-5 rounded-md bg-amber-950/80 text-amber-400 font-chakra font-bold text-[10px] flex items-center justify-center shrink-0">
                                      #{p?.jerseyNumber || "•"}
                                    </span>
                                    <span className="font-chakra font-bold text-white truncate">
                                      {p?.name || pId}
                                    </span>
                                    <span className="text-[10px] text-slate-400 shrink-0">
                                      ({p?.position})
                                    </span>
                                    {isLoaned && (
                                      <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold border border-amber-500/30 shrink-0">
                                        LOAN
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleSetPlayerRole("home", pId, "starter")}
                                      className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-[10px] font-chakra font-bold transition-colors cursor-pointer"
                                      title="Promote to Starter"
                                    >
                                      ⭐ Starter
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSetPlayerRole("home", pId, "none")}
                                      className="p-1 rounded hover:bg-rose-950/40 text-rose-400 transition-colors cursor-pointer"
                                      title="Remove from squad"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Add Player from League / Roster */}
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
                        <span className="text-[11px] font-chakra font-bold text-slate-400 block mb-2">
                          + Add Available Player to Home Match Squad:
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                          {effectiveHomePlayers
                            .filter((p) => !homeStarters.includes(p.id) && !homeSubs.includes(p.id))
                            .map((p) => (
                              <div
                                key={p.id}
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs"
                              >
                                <span className="text-white font-chakra font-semibold">{p.name}</span>
                                <span className="text-[10px] text-slate-400">({p.position})</span>
                                <button
                                  type="button"
                                  onClick={() => handleSetPlayerRole("home", p.id, "starter")}
                                  className="ml-1 px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-bold cursor-pointer"
                                >
                                  + Starter
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSetPlayerRole("home", p.id, "sub")}
                                  className="px-1.5 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-[9px] font-bold cursor-pointer"
                                >
                                  + Sub
                                </button>
                              </div>
                            ))}
                          {effectiveHomePlayers.filter((p) => !homeStarters.includes(p.id) && !homeSubs.includes(p.id)).length === 0 && (
                            <span className="text-xs text-slate-500 italic">All home squad players assigned.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Away Team Lineup Configuration */}
              {lineupTeamTab === "away" && (
                <div className="space-y-5">
                  {/* Formation Bar */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-chakra font-bold text-slate-300">
                        Away Pitch Formation:
                      </span>
                      <select
                        value={awayFormation}
                        onChange={(e) => setAwayFormation(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-chakra font-black text-blue-400 outline-none"
                      >
                        {FORMATION_PRESETS.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400">
                      Preset slots: {getFormationPreset(awayFormation).slots.length} starters
                    </div>
                  </div>

                  {/* Pitch Preview & Starters/Subs Manager Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Live Tactical Pitch Preview */}
                    <div className="lg:col-span-6">
                      {awayTeam && (
                        <MiniPitchLineup
                          team={awayTeam}
                          formation={awayFormation}
                          starterIds={awayStarters}
                          benchIds={awaySubs}
                          allPlayers={players}
                          playerRatings={ratings}
                          motmPlayerId={motmPlayerId}
                          dpotmPlayerId={dpotmPlayerId}
                          isAway={true}
                          size="md"
                        />
                      )}
                    </div>

                    {/* Starters & Subs Control Lists */}
                    <div className="lg:col-span-6 space-y-4">
                      {/* Starting Lineup List */}
                      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-chakra font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5" />
                            Starters on Pitch ({awayStarters.length})
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Click to reassign
                          </span>
                        </div>

                        {awayStarters.length === 0 ? (
                          <div className="text-center py-4 text-xs text-slate-500">
                            No starters assigned. Select players below.
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                            {awayStarters.map((pId, idx) => {
                              const p = safePlayers.find((pl) => pl.id === pId);
                              const isLoaned = isPlayerLoanedTo(pId, awayTeamId);
                              return (
                                <div
                                  key={pId}
                                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-5 h-5 rounded-md bg-blue-950/80 text-blue-400 font-chakra font-bold text-[10px] flex items-center justify-center shrink-0">
                                      #{p?.jerseyNumber || idx + 1}
                                    </span>
                                    <span className="font-chakra font-bold text-white truncate">
                                      {p?.name || pId}
                                    </span>
                                    <span className="text-[10px] text-slate-400 shrink-0">
                                      ({p?.position})
                                    </span>
                                    {isLoaned && (
                                      <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold border border-amber-500/30 shrink-0">
                                        LOAN
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleSetPlayerRole("away", pId, "sub")}
                                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-chakra font-bold transition-colors cursor-pointer"
                                      title="Move to bench/subs"
                                    >
                                      ⇄ Bench
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSetPlayerRole("away", pId, "none")}
                                      className="p-1 rounded hover:bg-rose-950/40 text-rose-400 transition-colors cursor-pointer"
                                      title="Remove from squad"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Substitutes / Bench List */}
                      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-chakra font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            Substitutes / Bench ({awaySubs.length})
                          </span>
                        </div>

                        {awaySubs.length === 0 ? (
                          <div className="text-center py-4 text-xs text-slate-500">
                            No substitutes on bench.
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {awaySubs.map((pId) => {
                              const p = safePlayers.find((pl) => pl.id === pId);
                              const isLoaned = isPlayerLoanedTo(pId, awayTeamId);
                              return (
                                <div
                                  key={pId}
                                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-5 h-5 rounded-md bg-amber-950/80 text-amber-400 font-chakra font-bold text-[10px] flex items-center justify-center shrink-0">
                                      #{p?.jerseyNumber || "•"}
                                    </span>
                                    <span className="font-chakra font-bold text-white truncate">
                                      {p?.name || pId}
                                    </span>
                                    <span className="text-[10px] text-slate-400 shrink-0">
                                      ({p?.position})
                                    </span>
                                    {isLoaned && (
                                      <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold border border-amber-500/30 shrink-0">
                                        LOAN
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleSetPlayerRole("away", pId, "starter")}
                                      className="px-2 py-1 rounded bg-blue-950/60 hover:bg-blue-900 border border-blue-500/40 text-blue-300 text-[10px] font-chakra font-bold transition-colors cursor-pointer"
                                      title="Promote to Starter"
                                    >
                                      ⭐ Starter
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSetPlayerRole("away", pId, "none")}
                                      className="p-1 rounded hover:bg-rose-950/40 text-rose-400 transition-colors cursor-pointer"
                                      title="Remove from squad"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Add Player from League / Roster */}
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
                        <span className="text-[11px] font-chakra font-bold text-slate-400 block mb-2">
                          + Add Available Player to Away Match Squad:
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                          {effectiveAwayPlayers
                            .filter((p) => !awayStarters.includes(p.id) && !awaySubs.includes(p.id))
                            .map((p) => (
                              <div
                                key={p.id}
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs"
                              >
                                <span className="text-white font-chakra font-semibold">{p.name}</span>
                                <span className="text-[10px] text-slate-400">({p.position})</span>
                                <button
                                  type="button"
                                  onClick={() => handleSetPlayerRole("away", p.id, "starter")}
                                  className="ml-1 px-1.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-bold cursor-pointer"
                                >
                                  + Starter
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSetPlayerRole("away", p.id, "sub")}
                                  className="px-1.5 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-[9px] font-bold cursor-pointer"
                                >
                                  + Sub
                                </button>
                              </div>
                            ))}
                          {effectiveAwayPlayers.filter((p) => !awayStarters.includes(p.id) && !awaySubs.includes(p.id)).length === 0 && (
                            <span className="text-xs text-slate-500 italic">All away squad players assigned.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: WHO PLAYED IN THIS MATCH (APPEARANCE TRACKER) */}
          {activeTab === "played" && (
            <div className="space-y-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-chakra font-black text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    Who Played In This Match (Appearance Tracker)
                  </h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Select exactly who took part in this game. Only checked players will be awarded 1 official match appearance (<strong>Matches Played: 1</strong>). Unchecked players will NOT have their appearance count increased, allowing players to only have 1 game played all season.
                  </p>
                </div>

                {/* Quick Selection Presets */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const startersOnly = Array.from(new Set([...homeStarters, ...awayStarters]));
                      setPlayedPlayerIds(startersOnly);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-chakra font-bold transition-all cursor-pointer"
                  >
                    Starters Only ({homeStarters.length + awayStarters.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const startersAndSubs = Array.from(
                        new Set([...homeStarters, ...homeSubs, ...awayStarters, ...awaySubs])
                      );
                      setPlayedPlayerIds(startersAndSubs);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-chakra font-bold transition-all cursor-pointer"
                  >
                    Starters &amp; Subs ({homeStarters.length + homeSubs.length + awayStarters.length + awaySubs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const allSquad = Array.from(
                        new Set([...effectiveHomePlayers.map((p) => p.id), ...effectiveAwayPlayers.map((p) => p.id)])
                      );
                      setPlayedPlayerIds(allSquad);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-chakra font-bold transition-all cursor-pointer"
                  >
                    All Players
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayedPlayerIds([])}
                    className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-chakra font-bold transition-all cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Home & Away Squad Selection Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Home Team Column */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-sm">
                        {homeTeam?.badgeEmoji || "🛡️"}
                      </div>
                      <div>
                        <h4 className="font-chakra font-bold text-white text-sm">
                          {homeTeam?.name || "Home Team"}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {effectiveHomePlayers.filter((p) => playedPlayerIds.includes(p.id)).length} of {effectiveHomePlayers.length} played
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const homeIds = effectiveHomePlayers.map((p) => p.id);
                          setPlayedPlayerIds((prev) => Array.from(new Set([...prev, ...homeIds])));
                        }}
                        className="text-[10px] text-emerald-400 hover:underline font-bold cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-slate-600">&bull;</span>
                      <button
                        type="button"
                        onClick={() => {
                          const homeIds = effectiveHomePlayers.map((p) => p.id);
                          setPlayedPlayerIds((prev) => prev.filter((id) => !homeIds.includes(id)));
                        }}
                        className="text-[10px] text-slate-400 hover:underline font-bold cursor-pointer"
                      >
                        Deselect
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {effectiveHomePlayers.map((player) => {
                      const isPlayed = playedPlayerIds.includes(player.id);
                      const isStarter = homeStarters.includes(player.id);
                      const isSub = homeSubs.includes(player.id);
                      const isLoaned = isPlayerLoanedTo(player.id, homeTeamId);

                      return (
                        <div
                          key={player.id}
                          onClick={() => {
                            setPlayedPlayerIds((prev) =>
                              prev.includes(player.id)
                                ? prev.filter((id) => id !== player.id)
                                : [...prev, player.id]
                            );
                          }}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isPlayed
                              ? "bg-emerald-950/25 border-emerald-500/50 shadow-sm shadow-emerald-950/50"
                              : "bg-slate-950/40 border-slate-800 hover:border-slate-700 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-white shrink-0">
                              {player.jerseyNumber || "#"}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-chakra font-bold text-sm text-white truncate">
                                  {player.name}
                                </span>
                                {player.nickname && (
                                  <span className="text-[10px] text-slate-400 truncate">
                                    "{player.nickname}"
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <span>{player.positionDisplay || player.position}</span>
                                {isStarter && (
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                    Starter
                                  </span>
                                )}
                                {isSub && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                                    Sub
                                  </span>
                                )}
                                {isLoaned && (
                                  <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
                                    Loaned In
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isPlayed ? (
                              <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-chakra font-black flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>PLAYED</span>
                              </div>
                            ) : (
                              <div className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 text-xs font-chakra font-bold flex items-center gap-1">
                                <X className="w-3.5 h-3.5 text-slate-500" />
                                <span>DID NOT PLAY</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Away Team Column */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-sm">
                        {awayTeam?.badgeEmoji || "⚡"}
                      </div>
                      <div>
                        <h4 className="font-chakra font-bold text-white text-sm">
                          {awayTeam?.name || "Away Team"}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {effectiveAwayPlayers.filter((p) => playedPlayerIds.includes(p.id)).length} of {effectiveAwayPlayers.length} played
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const awayIds = effectiveAwayPlayers.map((p) => p.id);
                          setPlayedPlayerIds((prev) => Array.from(new Set([...prev, ...awayIds])));
                        }}
                        className="text-[10px] text-emerald-400 hover:underline font-bold cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-slate-600">&bull;</span>
                      <button
                        type="button"
                        onClick={() => {
                          const awayIds = effectiveAwayPlayers.map((p) => p.id);
                          setPlayedPlayerIds((prev) => prev.filter((id) => !awayIds.includes(id)));
                        }}
                        className="text-[10px] text-slate-400 hover:underline font-bold cursor-pointer"
                      >
                        Deselect
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {effectiveAwayPlayers.map((player) => {
                      const isPlayed = playedPlayerIds.includes(player.id);
                      const isStarter = awayStarters.includes(player.id);
                      const isSub = awaySubs.includes(player.id);
                      const isLoaned = isPlayerLoanedTo(player.id, awayTeamId);

                      return (
                        <div
                          key={player.id}
                          onClick={() => {
                            setPlayedPlayerIds((prev) =>
                              prev.includes(player.id)
                                ? prev.filter((id) => id !== player.id)
                                : [...prev, player.id]
                            );
                          }}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isPlayed
                              ? "bg-emerald-950/25 border-emerald-500/50 shadow-sm shadow-emerald-950/50"
                              : "bg-slate-950/40 border-slate-800 hover:border-slate-700 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-white shrink-0">
                              {player.jerseyNumber || "#"}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-chakra font-bold text-sm text-white truncate">
                                  {player.name}
                                </span>
                                {player.nickname && (
                                  <span className="text-[10px] text-slate-400 truncate">
                                    "{player.nickname}"
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <span>{player.positionDisplay || player.position}</span>
                                {isStarter && (
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                    Starter
                                  </span>
                                )}
                                {isSub && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                                    Sub
                                  </span>
                                )}
                                {isLoaned && (
                                  <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
                                    Loaned In
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isPlayed ? (
                              <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-chakra font-black flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>PLAYED</span>
                              </div>
                            ) : (
                              <div className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 text-xs font-chakra font-bold flex items-center gap-1">
                                <X className="w-3.5 h-3.5 text-slate-500" />
                                <span>DID NOT PLAY</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer Guidance */}
              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Total Active Participants: <strong className="text-white font-chakra">{playedPlayerIds.length} players</strong> selected for this match.
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  All match statistics and player master modifications are protected and saved.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: LOANS FOR THIS HISTORICAL / PREVIOUS GAME */}
          {activeTab === "loans" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-xs font-chakra font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                    Match-Specific Loan Players
                  </h3>
                  <p className="text-xs text-slate-300">
                    Did a player swap teams or play as a guest loan for this specific previous game? Assign them below so their goals, assists, and ratings reflect the team they played for in this match.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddLoan}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-chakra font-black shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Loan Player</span>
                </button>
              </div>

              {loanedPlayers.length === 0 ? (
                <div className="text-center py-10 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
                  No guest loans recorded for this match fixture. Click <strong>"+ Loan Player"</strong> above if any player filled in for the opposite team.
                </div>
              ) : (
                <div className="space-y-3">
                  {loanedPlayers.map((loan, idx) => {
                    const playerObj = safePlayers.find((p) => p.id === loan.playerId);
                    const originalTeam = safeTeams.find((t) => t.id === playerObj?.teamId);

                    return (
                      <div
                        key={loan.playerId || idx}
                        className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                          <div>
                            <label className="text-[11px] font-chakra font-bold text-slate-400 block mb-1">
                              Player on Loan
                            </label>
                            <select
                              value={loan.playerId}
                              onChange={(e) => handleUpdateLoan(loan.playerId, { playerId: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-chakra font-bold text-white outline-none"
                            >
                              {safePlayers.map((p) => {
                                const t = safeTeams.find((tm) => tm.id === p.teamId);
                                return (
                                  <option key={p.id} value={p.id}>
                                    {p.name} (Permanent: {t?.shortName})
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] font-chakra font-bold text-amber-300 block mb-1">
                              Loaned To (For this match)
                            </label>
                            <select
                              value={loan.loanedToTeamId}
                              onChange={(e) => handleUpdateLoan(loan.playerId, { loanedToTeamId: e.target.value })}
                              className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-2.5 py-1.5 text-xs font-chakra font-bold text-amber-300 outline-none"
                            >
                              <option value={homeTeamId}>
                                {homeTeam?.badgeEmoji} {homeTeam?.name} (Home)
                              </option>
                              <option value={awayTeamId}>
                                {awayTeam?.badgeEmoji} {awayTeam?.name} (Away)
                              </option>
                            </select>
                          </div>

                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <label className="text-[11px] font-chakra font-bold text-slate-400 block mb-1">
                                Loan Note / Context
                              </label>
                              <input
                                type="text"
                                value={loan.note || ""}
                                onChange={(e) => handleUpdateLoan(loan.playerId, { note: e.target.value })}
                                placeholder="e.g. Substituted for missing striker"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveLoan(loan.playerId)}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                              title="Remove loan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="text-[11px] text-amber-400/90 font-chakra flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>
                            {playerObj?.name} (orig. {originalTeam?.name}) will count towards stats and ratings for{" "}
                            <strong>{loan.loanedToTeamId === homeTeamId ? homeTeam?.name : awayTeam?.name}</strong> in this game.
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EVENTS (GOALS, CARDS, CUSTOM STATS) */}
          {activeTab === "events" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-chakra font-black text-slate-300 uppercase tracking-wider">
                  Match Timeline Events
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddEvent("GOAL")}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-chakra font-bold hover:bg-emerald-500/30 transition-colors cursor-pointer"
                  >
                    + Goal ⚽
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddEvent("YELLOW_CARD")}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-chakra font-bold hover:bg-amber-500/30 transition-colors cursor-pointer"
                  >
                    + Card 🟨
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddEvent("CUSTOM_STAT")}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-chakra font-bold hover:bg-cyan-500/30 transition-colors cursor-pointer"
                  >
                    + Custom Stat ✨
                  </button>
                </div>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
                  No individual match events recorded yet. Click above to add goals, cards, or custom stats.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                  {events.map((evt, idx) => (
                    <div
                      key={evt.id || idx}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs"
                    >
                      {/* Minute */}
                      <div className="flex items-center gap-1 w-20">
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={evt.minute}
                          onChange={(e) => handleUpdateEvent(evt.id, { minute: Number(e.target.value) })}
                          className="w-12 bg-slate-950 border border-slate-700 rounded-lg p-1 text-center font-chakra font-bold text-white text-xs"
                        />
                        <span className="text-[10px] text-slate-500">' min</span>
                      </div>

                      {/* Event Type */}
                      <div className="w-28">
                        <select
                          value={evt.type}
                          onChange={(e) => handleUpdateEvent(evt.id, { type: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1 text-xs font-chakra font-bold text-white"
                        >
                          <option value="GOAL">⚽ Goal</option>
                          <option value="YELLOW_CARD">🟨 Yellow</option>
                          <option value="RED_CARD">🟥 Red Card</option>
                          <option value="CUSTOM_STAT">✨ Custom</option>
                        </select>
                      </div>

                      {/* Player */}
                      <div className="flex-1 min-w-[140px]">
                        <select
                          value={evt.playerId}
                          onChange={(e) => handleUpdateEvent(evt.id, { playerId: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1 text-xs font-semibold text-emerald-300"
                        >
                          <option value="">Select Player...</option>
                          {matchPlayers.map((p) => {
                            const isLoanedH = isPlayerLoanedTo(p.id, homeTeamId);
                            const isLoanedA = isPlayerLoanedTo(p.id, awayTeamId);
                            const displayTeam = isLoanedH ? homeTeam : isLoanedA ? awayTeam : teams.find((tm) => tm.id === p.teamId);
                            return (
                              <option key={p.id} value={p.id}>
                                {p.name} ({displayTeam?.shortName} - #{p.jerseyNumber}) {isLoanedH || isLoanedA ? "[LOAN]" : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Assist (if Goal) or Custom Stat Selector */}
                      {evt.type === "GOAL" && (
                        <div className="flex-1 min-w-[140px]">
                          <select
                            value={evt.assistPlayerId || ""}
                            onChange={(e) => handleUpdateEvent(evt.id, { assistPlayerId: e.target.value || undefined })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1 text-xs font-semibold text-cyan-300"
                          >
                            <option value="">No Assist (Solo)</option>
                            {matchPlayers.map((p) => {
                              const isLoanedH = isPlayerLoanedTo(p.id, homeTeamId);
                              const isLoanedA = isPlayerLoanedTo(p.id, awayTeamId);
                              const displayTeam = isLoanedH ? homeTeam : isLoanedA ? awayTeam : teams.find((tm) => tm.id === p.teamId);
                              return (
                                <option key={p.id} value={p.id}>
                                  Assist: {p.name} ({displayTeam?.shortName})
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}

                      {evt.type === "CUSTOM_STAT" && (
                        <div className="flex-1 min-w-[140px]">
                          <select
                            value={evt.customStatId || ""}
                            onChange={(e) => handleUpdateEvent(evt.id, { customStatId: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1 text-xs font-semibold text-amber-300"
                          >
                            <option value="">Select Custom Metric...</option>
                            {customStats.map((cs) => (
                              <option key={cs.id} value={cs.id}>
                                {cs.name} ({cs.shortLabel})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Delete Event Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveEvent(evt.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors ml-auto cursor-pointer"
                        title="Remove event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PLAYER RATINGS */}
          {activeTab === "ratings" && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                <p>
                  Set post-match player performance ratings (scale: <strong>1.0 to 10.0</strong>). These feed into each player's average rating and the League MVP leaderboard.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Home Team Ratings */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <span>{homeTeam?.badgeEmoji || "🔥"}</span>
                    <h4 className="font-chakra font-bold text-white text-xs">
                      {homeTeam?.name} Ratings
                    </h4>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {effectiveHomePlayers.map((p) => {
                      const currentRating = ratings[p.id] ?? 8.0;
                      const isLoan = isPlayerLoanedTo(p.id, homeTeamId);
                      return (
                        <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                          <div className="font-chakra font-bold text-white">
                            {p.name}{" "}
                            <span className="text-[10px] text-slate-500 font-normal">
                              #{p.jerseyNumber} ({p.position})
                            </span>
                            {isLoan && (
                              <span className="ml-1.5 px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-chakra text-[9px]">
                                LOAN
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.1"
                              min="1.0"
                              max="10.0"
                              value={currentRating}
                              onChange={(e) => handleSetRating(p.id, parseFloat(e.target.value))}
                              className="w-16 bg-slate-900 border border-slate-700 rounded-lg p-1 text-center font-chakra font-black text-amber-300 text-xs"
                            />
                            <span className="text-amber-400 text-xs">★</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Away Team Ratings */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <span>{awayTeam?.badgeEmoji || "⚡"}</span>
                    <h4 className="font-chakra font-bold text-white text-xs">
                      {awayTeam?.name} Ratings
                    </h4>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {effectiveAwayPlayers.map((p) => {
                      const currentRating = ratings[p.id] ?? 8.0;
                      const isLoan = isPlayerLoanedTo(p.id, awayTeamId);
                      return (
                        <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                          <div className="font-chakra font-bold text-white">
                            {p.name}{" "}
                            <span className="text-[10px] text-slate-500 font-normal">
                              #{p.jerseyNumber} ({p.position})
                            </span>
                            {isLoan && (
                              <span className="ml-1.5 px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-chakra text-[9px]">
                                LOAN
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.1"
                              min="1.0"
                              max="10.0"
                              value={currentRating}
                              onChange={(e) => handleSetRating(p.id, parseFloat(e.target.value))}
                              className="w-16 bg-slate-900 border border-slate-700 rounded-lg p-1 text-center font-chakra font-black text-amber-300 text-xs"
                            />
                            <span className="text-amber-400 text-xs">★</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: INFO, VENUE & STATUS */}
          {activeTab === "info" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-chakra font-bold text-slate-300 block mb-1">
                    Match Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-chakra font-bold text-slate-300 block mb-1">
                    Match Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-chakra font-bold text-slate-300 block mb-1">
                    Stadium / Venue
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-chakra font-bold text-slate-300 block mb-1">
                    Pitch Surface Type
                  </label>
                  <select
                    value={stadiumPitchType}
                    onChange={(e) => setStadiumPitchType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none"
                  >
                    <option value="Grass">🌱 Natural Grass</option>
                    <option value="Turf">🟩 4G / Artificial Turf</option>
                    <option value="Indoor">🏟️ Indoor Hardcourt</option>
                    <option value="Futsal">⚽ Futsal Pitch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-chakra font-bold text-slate-300 block mb-1">
                  Match Status Verification
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Match["status"])}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                >
                  <option value="APPROVED">✅ OFFICIAL & APPROVED (Counts towards league standings)</option>
                  <option value="PENDING_APPROVAL">⏳ PENDING ADMIN REVIEW</option>
                  <option value="SCHEDULED">📅 UPCOMING FIXTURE</option>
                  <option value="REJECTED">❌ REJECTED RECORD</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-chakra font-bold text-slate-300 block mb-1">
                  Match Notes & Storyline
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional context, weather conditions, injuries, highlight moments..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>

              {onDeleteMatch && (
                <div className="pt-4 border-t border-slate-800/80 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-rose-400 block">Danger Zone</span>
                    <span className="text-[10px] text-slate-500">Remove this entire match record</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {confirmDelete && (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-chakra font-medium transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isSaving}
                      className={`px-3 py-1.5 rounded-xl text-xs font-chakra font-bold transition-all cursor-pointer ${
                        confirmDelete
                          ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
                          : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {confirmDelete ? "⚠️ Confirm Delete Match?" : "Delete Match"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: PENALTY SHOOTOUT */}
          {activeTab === "penalties" && (
            <div className="space-y-5">
              {/* Toggle Switch */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-chakra font-black text-white flex items-center gap-2">
                    <span>🥅</span> Official Penalty Shootout Decider
                  </h3>
                  <p className="text-xs text-slate-400">
                    Enable to record individual penalty kicks, shooters, scores, and goalkeeper stops
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wentToPenalties}
                    onChange={(e) => setWentToPenalties(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {wentToPenalties && (
                <div className="space-y-5">
                  {/* Summary & Scoreboard */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div>
                      <span className="text-[11px] font-chakra font-bold text-rose-400 block mb-1">
                        {homeTeam?.name || "Home"} Penalties
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={homePenaltyScore}
                        onChange={(e) => setHomePenaltyScore(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base font-chakra font-black text-white"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-chakra font-bold text-blue-400 block mb-1">
                        {awayTeam?.name || "Away"} Penalties
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={awayPenaltyScore}
                        onChange={(e) => setAwayPenaltyScore(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base font-chakra font-black text-white"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-chakra font-bold text-amber-400 block mb-1">
                        Shootout Winner
                      </span>
                      <select
                        value={penaltyWinnerTeamId}
                        onChange={(e) => setPenaltyWinnerTeamId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-400 outline-none"
                      >
                        <option value={homeTeamId}>{homeTeam?.name} (Wins on Pens)</option>
                        <option value={awayTeamId}>{awayTeam?.name} (Wins on Pens)</option>
                      </select>
                    </div>
                  </div>

                  {/* Add Shot Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div>
                      <h4 className="text-xs font-chakra font-bold text-slate-300 uppercase tracking-wider">
                        Individual Penalty Shots ({penaltyShots.length})
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Scores auto-update when kicks are added, edited, or removed
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddPenaltyShot("home")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-chakra font-bold hover:bg-rose-500/30 transition-colors cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>+ {homeTeam?.shortName || "Home"} Kick</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddPenaltyShot("away")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-chakra font-bold hover:bg-blue-500/30 transition-colors cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>+ {awayTeam?.shortName || "Away"} Kick</span>
                      </button>
                    </div>
                  </div>

                  {/* Penalty Shots List */}
                  {penaltyShots.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center">
                      <p className="text-xs text-slate-400 font-chakra">
                        No individual kicks logged yet. Click "+ Home Kick" or "+ Away Kick" above to record each shooter.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {penaltyShots.map((shot, sIdx) => {
                        const isHome =
                          shot.teamId === homeTeamId ||
                          shot.teamId === "team_red" ||
                          shot.teamId === "home" ||
                          shot.teamId.toLowerCase().includes("home") ||
                          shot.teamId.toLowerCase().includes("red");

                        const teamObj = isHome ? homeTeam : awayTeam;
                        const squadPlayers = isHome ? effectiveHomePlayers : effectiveAwayPlayers;

                        return (
                          <div
                            key={shot.id || sIdx}
                            className={`p-3 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                              isHome
                                ? "bg-rose-950/20 border-rose-500/30"
                                : "bg-blue-950/20 border-blue-500/30"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 flex-wrap">
                              {/* Round # */}
                              <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[11px] font-chakra font-black text-slate-400 shrink-0">
                                #{shot.round}
                              </div>

                              {/* Team Label */}
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-chakra font-black shrink-0 ${
                                  isHome
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                    : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                }`}
                              >
                                {teamObj?.shortName || (isHome ? "HOM" : "AWY")}
                              </span>

                              {/* Player Dropdown & Custom Name */}
                              <div className="w-44 sm:w-52">
                                <select
                                  value={shot.playerId || "custom"}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "custom") {
                                      handleUpdatePenaltyShot(shot.id, { playerId: undefined });
                                    } else {
                                      const p = squadPlayers.find((sp) => sp.id === val);
                                      handleUpdatePenaltyShot(shot.id, {
                                        playerId: val,
                                        playerName: p ? p.name : shot.playerName,
                                      });
                                    }
                                  }}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-chakra font-bold text-white outline-none"
                                >
                                  {squadPlayers.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name} ({p.position})
                                    </option>
                                  ))}
                                  <option value="custom">✏️ Custom / Other Name</option>
                                </select>
                              </div>

                              {(!shot.playerId || shot.playerId === "custom") && (
                                <input
                                  type="text"
                                  value={shot.playerName}
                                  onChange={(e) =>
                                    handleUpdatePenaltyShot(shot.id, { playerName: e.target.value })
                                  }
                                  placeholder="Shooter Name"
                                  className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-chakra text-white outline-none"
                                />
                              )}
                            </div>

                            {/* Outcome Toggle, Goalkeeper & Notes */}
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Scored vs Missed Toggle */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdatePenaltyShot(shot.id, { scored: !shot.scored })
                                }
                                className={`px-2.5 py-1.5 rounded-xl font-chakra font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                  shot.scored
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                    : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                }`}
                              >
                                <span>{shot.scored ? "⚽ SCORED" : "❌ SAVED / MISSED"}</span>
                              </button>

                              {/* Goalkeeper name */}
                              <input
                                type="text"
                                value={shot.goalkeeperName || ""}
                                onChange={(e) =>
                                  handleUpdatePenaltyShot(shot.id, { goalkeeperName: e.target.value })
                                }
                                placeholder="Goalkeeper (e.g. Eliot)"
                                className="w-28 sm:w-32 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] font-chakra text-slate-300 outline-none"
                              />

                              {/* Note */}
                              <input
                                type="text"
                                value={shot.note || ""}
                                onChange={(e) =>
                                  handleUpdatePenaltyShot(shot.id, { note: e.target.value })
                                }
                                placeholder="Note (e.g. Top right)"
                                className="w-28 sm:w-36 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] font-sans text-slate-400 outline-none"
                              />

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleRemovePenaltyShot(shot.id)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer ml-auto"
                                title="Delete kick"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-chakra font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-chakra font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving Game..." : "Save Match Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
