import React, { useState } from "react";
import { HistoricalGameArchive, HistoricalPlayerStat, PenaltyShootoutData, PenaltyShot } from "../types";
import {
  X,
  Save,
  Plus,
  Trash2,
  Trophy,
  Sliders,
  Check,
  Calendar,
  MapPin,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowUpDown
} from "lucide-react";

interface EditArchiveGameModalProps {
  game: HistoricalGameArchive;
  adminPin: string;
  onClose: () => void;
  onSave: (updatedGame: HistoricalGameArchive) => Promise<void>;
  onDelete?: (gameId: string) => Promise<void>;
}

export const EditArchiveGameModal: React.FC<EditArchiveGameModalProps> = ({
  game,
  adminPin,
  onClose,
  onSave,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "red_players" | "blue_players" | "penalties">("overview");

  // Overview states
  const [title, setTitle] = useState(game.title || "");
  const [date, setDate] = useState(game.date || "");
  const [venue, setVenue] = useState(game.venue || "Main Community Pitch");
  const [summary, setSummary] = useState(game.summary || "");
  const [mvp, setMvp] = useState(game.mvp || "");
  const [scoreDisplay, setScoreDisplay] = useState(game.scoreDisplay || "");
  const [winnerName, setWinnerName] = useState(game.winnerName || "");

  // Team states
  const [redTeamName, setRedTeamName] = useState(game.redTeam?.name || "Red Team");
  const [redScore, setRedScore] = useState<number>(game.redTeam?.score ?? 0);
  const [redPenaltyScore, setRedPenaltyScore] = useState<number>(game.redTeam?.penaltyScore ?? 0);
  const [redPlayers, setRedPlayers] = useState<HistoricalPlayerStat[]>(
    game.redTeam?.players?.map((p) => ({ ...p })) || []
  );

  const [blueTeamName, setBlueTeamName] = useState(game.blueTeam?.name || "Blue Team");
  const [blueScore, setBlueScore] = useState<number>(game.blueTeam?.score ?? 0);
  const [bluePenaltyScore, setBluePenaltyScore] = useState<number>(game.blueTeam?.penaltyScore ?? 0);
  const [bluePlayers, setBluePlayers] = useState<HistoricalPlayerStat[]>(
    game.blueTeam?.players?.map((p) => ({ ...p })) || []
  );

  // Penalty Shootout states
  const [hasPenaltyShootout, setHasPenaltyShootout] = useState<boolean>(
    Boolean(game.penaltyShootout && game.penaltyShootout.shots && game.penaltyShootout.shots.length > 0) ||
      Boolean(game.redTeam?.penaltyScore || game.blueTeam?.penaltyScore)
  );

  const [penaltyShots, setPenaltyShots] = useState<PenaltyShot[]>(
    game.penaltyShootout?.shots ? game.penaltyShootout.shots.map((s) => ({ ...s })) : []
  );

  const [penaltyWinnerTeamId, setPenaltyWinnerTeamId] = useState<string>(
    game.penaltyShootout?.winnerTeamId || (bluePenaltyScore > redPenaltyScore ? "team_blue" : "team_red")
  );

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Add player to team
  const handleAddPlayer = (team: "red" | "blue") => {
    const newPlayer: HistoricalPlayerStat = {
      name: "",
      position: "MID",
      goals: 0,
      assists: 0,
      rating: 8.5,
      note: "",
    };
    if (team === "red") {
      setRedPlayers([...redPlayers, newPlayer]);
    } else {
      setBluePlayers([...bluePlayers, newPlayer]);
    }
  };

  const handleRemovePlayer = (team: "red" | "blue", index: number) => {
    if (team === "red") {
      setRedPlayers(redPlayers.filter((_, i) => i !== index));
    } else {
      setBluePlayers(bluePlayers.filter((_, i) => i !== index));
    }
  };

  const handleUpdatePlayer = (
    team: "red" | "blue",
    index: number,
    field: keyof HistoricalPlayerStat,
    val: any
  ) => {
    if (team === "red") {
      const copy = [...redPlayers];
      copy[index] = { ...copy[index], [field]: val };
      setRedPlayers(copy);
    } else {
      const copy = [...bluePlayers];
      copy[index] = { ...copy[index], [field]: val };
      setBluePlayers(copy);
    }
  };

  // Add penalty shot
  const handleAddPenaltyShot = (team: "red" | "blue") => {
    const round =
      penaltyShots.length > 0
        ? Math.max(...penaltyShots.map((s) => s.round || 1)) + (team === "red" ? 1 : 0)
        : 1;

    const newShot: PenaltyShot = {
      id: "shot_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5),
      round,
      teamId: team === "red" ? "team_red" : "team_blue",
      playerName: team === "red" ? redPlayers[0]?.name || "Red Taker" : bluePlayers[0]?.name || "Blue Taker",
      scored: true,
      goalkeeperName: team === "red" ? bluePlayers.find((p) => p.position === "GK")?.name || "Eliot" : redPlayers.find((p) => p.position === "GK")?.name || "Mohammed",
      note: "",
    };

    const updated = [...penaltyShots, newShot];
    setPenaltyShots(updated);
    recomputePenalties(updated);
  };

  const handleRemovePenaltyShot = (shotId: string) => {
    const updated = penaltyShots.filter((s) => s.id !== shotId);
    setPenaltyShots(updated);
    recomputePenalties(updated);
  };

  const handleUpdatePenaltyShot = (shotId: string, updates: Partial<PenaltyShot>) => {
    const updated = penaltyShots.map((s) => (s.id === shotId ? { ...s, ...updates } : s));
    setPenaltyShots(updated);
    recomputePenalties(updated);
  };

  // Recompute scores from shots
  const recomputePenalties = (shots: PenaltyShot[]) => {
    const rScore = shots.filter(
      (s) => (s.teamId === "team_red" || s.teamId.toLowerCase().includes("red")) && s.scored
    ).length;
    const bScore = shots.filter(
      (s) => (s.teamId === "team_blue" || s.teamId.toLowerCase().includes("blue")) && s.scored
    ).length;

    setRedPenaltyScore(rScore);
    setBluePenaltyScore(bScore);
    if (rScore > bScore) {
      setPenaltyWinnerTeamId("team_red");
    } else if (bScore > rScore) {
      setPenaltyWinnerTeamId("team_blue");
    }
  };

  // Save handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSaving(true);

    try {
      let shootoutData: PenaltyShootoutData | undefined = undefined;
      if (hasPenaltyShootout) {
        shootoutData = {
          homeScore: Number(redPenaltyScore),
          awayScore: Number(bluePenaltyScore),
          winnerTeamId: penaltyWinnerTeamId,
          shots: penaltyShots,
        };
      }

      // Auto-compute score display if empty
      const computedScoreDisplay = hasPenaltyShootout
        ? `${redScore} - ${blueScore} (${redPenaltyScore}-${bluePenaltyScore} Pens)`
        : `${redScore} - ${blueScore}`;

      const computedWinner = hasPenaltyShootout
        ? penaltyWinnerTeamId === "team_red"
          ? `${redTeamName} (Wins on Pens)`
          : `${blueTeamName} (Wins on Pens)`
        : redScore > blueScore
        ? redTeamName
        : blueScore > redScore
        ? blueTeamName
        : "Draw";

      const updatedGame: HistoricalGameArchive = {
        ...game,
        title: title.trim() || game.title,
        date: date.trim() || game.date,
        venue: venue.trim() || game.venue,
        summary: summary.trim() || `${redTeamName}: ${redScore} - ${blueTeamName}: ${blueScore}`,
        mvp: mvp.trim() || game.mvp,
        scoreDisplay: scoreDisplay.trim() || computedScoreDisplay,
        winnerName: winnerName.trim() || computedWinner,
        redTeam: {
          name: redTeamName.trim() || "Red Team",
          score: Number(redScore),
          penaltyScore: hasPenaltyShootout ? Number(redPenaltyScore) : undefined,
          players: redPlayers.filter((p) => p.name.trim().length > 0),
        },
        blueTeam: {
          name: blueTeamName.trim() || "Blue Team",
          score: Number(blueScore),
          penaltyScore: hasPenaltyShootout ? Number(bluePenaltyScore) : undefined,
          players: bluePlayers.filter((p) => p.name.trim().length > 0),
        },
        penaltyShootout: shootoutData,
        updatedAt: Date.now(),
        updatedBy: "Admin",
      };

      await onSave(updatedGame);
      setSuccessMsg("Archive game statistics permanently saved!");
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save historical archive statistics.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0b101b] border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-chakra font-black text-white">
                  MODIFY ARCHIVE STATS & HISTORICAL RECORDS
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-chakra font-bold">
                  PERMANENT SAVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Update game scores, individual player stats, and granular penalty shootouts
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
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 text-xs font-chakra font-black tracking-wider uppercase border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "overview"
                ? "border-amber-400 text-amber-400 bg-amber-500/10 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            ⚽ Match Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("red_players")}
            className={`px-4 py-2.5 text-xs font-chakra font-black tracking-wider uppercase border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "red_players"
                ? "border-rose-400 text-rose-400 bg-rose-500/10 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            🔴 Red Team Stats ({redPlayers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("blue_players")}
            className={`px-4 py-2.5 text-xs font-chakra font-black tracking-wider uppercase border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "blue_players"
                ? "border-blue-400 text-blue-400 bg-blue-500/10 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            ⚡ Blue Team Stats ({bluePlayers.length})
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
            <span>🥅 Penalty Shootout</span>
            {hasPenaltyShootout && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                {penaltyShots.length}
              </span>
            )}
          </button>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-chakra font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Game Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-chakra focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Soccer Game #2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-chakra font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Match Date
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-chakra focus:outline-none focus:border-amber-500"
                    placeholder="e.g. August 22, 2026"
                    required
                  />
                </div>
              </div>

              {/* Scores Grid */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <span className="text-xs font-chakra font-bold text-amber-400 uppercase tracking-wider block">
                  Match Scoreline (Full Time)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                  <div>
                    <label className="block text-[11px] font-chakra text-rose-400 font-bold mb-1">
                      Red Team Name
                    </label>
                    <input
                      type="text"
                      value={redTeamName}
                      onChange={(e) => setRedTeamName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-chakra"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-chakra text-rose-400 font-bold mb-1">
                      Red FT Score
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={redScore}
                      onChange={(e) => setRedScore(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm font-chakra font-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-chakra text-blue-400 font-bold mb-1">
                      Blue FT Score
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={blueScore}
                      onChange={(e) => setBlueScore(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm font-chakra font-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-chakra text-blue-400 font-bold mb-1">
                      Blue Team Name
                    </label>
                    <input
                      type="text"
                      value={blueTeamName}
                      onChange={(e) => setBlueTeamName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-chakra"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-chakra font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Match MVP / Man of the Match
                  </label>
                  <input
                    type="text"
                    value={mvp}
                    onChange={(e) => setMvp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-chakra focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Nicholas"
                  />
                </div>

                <div>
                  <label className="block text-xs font-chakra font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-chakra focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Cyan Park Stadium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-chakra font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Game Summary & Narrative
                </label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-sans focus:outline-none focus:border-amber-500"
                  placeholder="Summary of how the match unfolded..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-chakra font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Winner Banner
                  </label>
                  <input
                    type="text"
                    value={winnerName}
                    onChange={(e) => setWinnerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-chakra"
                    placeholder="e.g. Blue Team (Wins on Pens)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-chakra font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Custom Score Display
                  </label>
                  <input
                    type="text"
                    value={scoreDisplay}
                    onChange={(e) => setScoreDisplay(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-chakra"
                    placeholder="e.g. 5 - 5 (3-4 Pens)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RED TEAM PLAYERS */}
          {activeTab === "red_players" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-chakra font-black text-rose-400 flex items-center gap-2">
                    <span>🔥</span> {redTeamName} Player Records
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Modify goals, assists, ratings, and notes for each player in this archived match
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddPlayer("red")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-chakra font-bold hover:bg-rose-500/30 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Player</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {redPlayers.map((player, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-950/80 border border-rose-500/20 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                  >
                    {/* Name & Position */}
                    <div className="sm:col-span-4 flex items-center gap-2">
                      <input
                        type="text"
                        value={player.name}
                        onChange={(e) => handleUpdatePlayer("red", idx, "name", e.target.value)}
                        placeholder="Player Name"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-chakra font-bold text-xs"
                      />
                      <select
                        value={player.position || "MID"}
                        onChange={(e) => handleUpdatePlayer("red", idx, "position", e.target.value)}
                        className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-chakra text-[11px]"
                      >
                        <option value="GK">GK</option>
                        <option value="DEF">DEF</option>
                        <option value="MID">MID</option>
                        <option value="FWD">FWD</option>
                      </select>
                    </div>

                    {/* Goals */}
                    <div className="sm:col-span-2 flex items-center gap-1">
                      <span className="text-[11px] text-slate-400 font-chakra">Goals:</span>
                      <input
                        type="number"
                        min={0}
                        value={player.goals}
                        onChange={(e) =>
                          handleUpdatePlayer("red", idx, "goals", Math.max(0, parseInt(e.target.value) || 0))
                        }
                        className="w-14 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-chakra font-black text-xs text-center"
                      />
                    </div>

                    {/* Assists */}
                    <div className="sm:col-span-2 flex items-center gap-1">
                      <span className="text-[11px] text-slate-400 font-chakra">Assists:</span>
                      <input
                        type="number"
                        min={0}
                        value={player.assists}
                        onChange={(e) =>
                          handleUpdatePlayer("red", idx, "assists", Math.max(0, parseInt(e.target.value) || 0))
                        }
                        className="w-14 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 font-chakra font-black text-xs text-center"
                      />
                    </div>

                    {/* Rating */}
                    <div className="sm:col-span-2 flex items-center gap-1">
                      <span className="text-[11px] text-slate-400 font-chakra">Rating:</span>
                      <input
                        type="number"
                        step={0.1}
                        min={1}
                        max={10}
                        value={player.rating ?? 8.5}
                        onChange={(e) =>
                          handleUpdatePlayer("red", idx, "rating", parseFloat(e.target.value) || 8.0)
                        }
                        className="w-16 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 font-chakra font-black text-xs text-center"
                      />
                    </div>

                    {/* Delete */}
                    <div className="sm:col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemovePlayer("red", idx)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove player"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: BLUE TEAM PLAYERS */}
          {activeTab === "blue_players" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-chakra font-black text-blue-400 flex items-center gap-2">
                    <span>⚡</span> {blueTeamName} Player Records
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Modify goals, assists, ratings, and notes for each player in this archived match
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddPlayer("blue")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-chakra font-bold hover:bg-blue-500/30 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Player</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {bluePlayers.map((player, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-950/80 border border-blue-500/20 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                  >
                    {/* Name & Position */}
                    <div className="sm:col-span-4 flex items-center gap-2">
                      <input
                        type="text"
                        value={player.name}
                        onChange={(e) => handleUpdatePlayer("blue", idx, "name", e.target.value)}
                        placeholder="Player Name"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-chakra font-bold text-xs"
                      />
                      <select
                        value={player.position || "MID"}
                        onChange={(e) => handleUpdatePlayer("blue", idx, "position", e.target.value)}
                        className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-chakra text-[11px]"
                      >
                        <option value="GK">GK</option>
                        <option value="DEF">DEF</option>
                        <option value="MID">MID</option>
                        <option value="FWD">FWD</option>
                      </select>
                    </div>

                    {/* Goals */}
                    <div className="sm:col-span-2 flex items-center gap-1">
                      <span className="text-[11px] text-slate-400 font-chakra">Goals:</span>
                      <input
                        type="number"
                        min={0}
                        value={player.goals}
                        onChange={(e) =>
                          handleUpdatePlayer("blue", idx, "goals", Math.max(0, parseInt(e.target.value) || 0))
                        }
                        className="w-14 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-chakra font-black text-xs text-center"
                      />
                    </div>

                    {/* Assists */}
                    <div className="sm:col-span-2 flex items-center gap-1">
                      <span className="text-[11px] text-slate-400 font-chakra">Assists:</span>
                      <input
                        type="number"
                        min={0}
                        value={player.assists}
                        onChange={(e) =>
                          handleUpdatePlayer("blue", idx, "assists", Math.max(0, parseInt(e.target.value) || 0))
                        }
                        className="w-14 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 font-chakra font-black text-xs text-center"
                      />
                    </div>

                    {/* Rating */}
                    <div className="sm:col-span-2 flex items-center gap-1">
                      <span className="text-[11px] text-slate-400 font-chakra">Rating:</span>
                      <input
                        type="number"
                        step={0.1}
                        min={1}
                        max={10}
                        value={player.rating ?? 8.5}
                        onChange={(e) =>
                          handleUpdatePlayer("blue", idx, "rating", parseFloat(e.target.value) || 8.0)
                        }
                        className="w-16 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 font-chakra font-black text-xs text-center"
                      />
                    </div>

                    {/* Delete */}
                    <div className="sm:col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemovePlayer("blue", idx)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove player"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PENALTY SHOOTOUT */}
          {activeTab === "penalties" && (
            <div className="space-y-5">
              {/* Toggle */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-chakra font-black text-white flex items-center gap-2">
                    <span>🥅</span> Game Concluded on Penalty Shootout
                  </h4>
                  <p className="text-xs text-slate-400">
                    Enable to record individual penalty kicks, shooters, scores, and goalkeeper saves
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPenaltyShootout}
                    onChange={(e) => setHasPenaltyShootout(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {hasPenaltyShootout && (
                <div className="space-y-5">
                  {/* Shootout Score Summary & Winner */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="block text-[11px] font-chakra text-rose-400 font-bold mb-1">
                        {redTeamName} Penalties
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={redPenaltyScore}
                        onChange={(e) => setRedPenaltyScore(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-chakra font-black text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-chakra text-blue-400 font-bold mb-1">
                        {blueTeamName} Penalties
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={bluePenaltyScore}
                        onChange={(e) => setBluePenaltyScore(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-chakra font-black text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-chakra text-amber-400 font-bold mb-1">
                        Shootout Winner
                      </label>
                      <select
                        value={penaltyWinnerTeamId}
                        onChange={(e) => setPenaltyWinnerTeamId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-chakra font-bold text-xs"
                      >
                        <option value="team_blue">{blueTeamName} (Wins on Pens)</option>
                        <option value="team_red">{redTeamName} (Wins on Pens)</option>
                      </select>
                    </div>
                  </div>

                  {/* Add Shot Controls */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <span className="text-xs font-chakra font-bold text-slate-300 uppercase tracking-wider">
                      Individual Penalty Shots ({penaltyShots.length})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddPenaltyShot("red")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-chakra font-bold hover:bg-rose-500/30 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ {redTeamName} Shot</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddPenaltyShot("blue")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-chakra font-bold hover:bg-blue-500/30 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ {blueTeamName} Shot</span>
                      </button>
                    </div>
                  </div>

                  {/* Penalty Shots List */}
                  {penaltyShots.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center">
                      <p className="text-xs text-slate-400 font-chakra">
                        No individual penalty shots added yet. Click "+ Red Shot" or "+ Blue Shot" above to log each kick.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {penaltyShots.map((shot, sIdx) => {
                        const isRed =
                          shot.teamId === "team_red" ||
                          shot.teamId.toLowerCase().includes("red");

                        return (
                          <div
                            key={shot.id || sIdx}
                            className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isRed
                                ? "bg-rose-950/20 border-rose-500/30"
                                : "bg-blue-950/20 border-blue-500/30"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {/* Round Badge */}
                              <div className="flex flex-col items-center justify-center w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-chakra font-black text-slate-400">
                                #{shot.round}
                              </div>

                              {/* Team Tag */}
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-chakra font-black ${
                                  isRed
                                    ? "bg-rose-500/20 text-rose-300"
                                    : "bg-blue-500/20 text-blue-300"
                                }`}
                              >
                                {isRed ? "RED" : "BLUE"}
                              </span>

                              {/* Taker Name */}
                              <div className="w-40 sm:w-48">
                                <input
                                  type="text"
                                  value={shot.playerName}
                                  onChange={(e) =>
                                    handleUpdatePenaltyShot(shot.id, { playerName: e.target.value })
                                  }
                                  placeholder="Shooter Name"
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-chakra font-bold text-xs"
                                />
                              </div>
                            </div>

                            {/* Middle: Outcome Toggle & Goalkeeper */}
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Scored vs Saved Toggle */}
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
                                {shot.scored ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>⚽ SCORED</span>
                                  </>
                                ) : (
                                  <>
                                    <X className="w-3.5 h-3.5 text-rose-400" />
                                    <span>❌ SAVED / MISSED</span>
                                  </>
                                )}
                              </button>

                              {/* Goalkeeper */}
                              <input
                                type="text"
                                value={shot.goalkeeperName || ""}
                                onChange={(e) =>
                                  handleUpdatePenaltyShot(shot.id, { goalkeeperName: e.target.value })
                                }
                                placeholder="Goalkeeper (e.g. Eliot)"
                                className="w-32 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-chakra text-[11px]"
                              />

                              {/* Note */}
                              <input
                                type="text"
                                value={shot.note || ""}
                                onChange={(e) =>
                                  handleUpdatePenaltyShot(shot.id, { note: e.target.value })
                                }
                                placeholder="Note (e.g. Bottom corner)"
                                className="w-36 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 font-sans text-[11px]"
                              />

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleRemovePenaltyShot(shot.id)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer ml-auto"
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

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-chakra font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-chakra font-black text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving Archive Data..." : "Save Archive Stats Permanently"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
