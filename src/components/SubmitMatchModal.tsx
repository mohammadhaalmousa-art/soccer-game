import React, { useState, useEffect } from "react";
import { Team, PlayerProfile, CustomStatDefinition, MatchEvent } from "../types";
import { FORMATION_PRESETS } from "../utils/leagueCalculations";
import { 
  X, 
  PlusCircle, 
  Trash2, 
  Trophy, 
  Send, 
  Calendar, 
  MapPin, 
  Sparkles, 
  ShieldCheck,
  Star,
  Users,
  Check,
  Shirt,
  CheckCircle2,
  Sliders
} from "lucide-react";

interface SubmitMatchModalProps {
  teams: Team[];
  players: PlayerProfile[];
  customStats: CustomStatDefinition[];
  onClose: () => void;
  onSubmitMatch: (matchPayload: any) => Promise<void>;
}

export const SubmitMatchModal: React.FC<SubmitMatchModalProps> = ({
  teams,
  players,
  customStats,
  onClose,
  onSubmitMatch,
}) => {
  const [title, setTitle] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [venue, setVenue] = useState<string>("Main Community Pitch");
  const [stadiumPitchType, setStadiumPitchType] = useState<string>("Grass");
  const [submittedBy, setSubmittedBy] = useState<string>("");
  const [homeTeamId, setHomeTeamId] = useState<string>(teams[0]?.id || "team_blue");
  const [awayTeamId, setAwayTeamId] = useState<string>(teams[1]?.id || "team_red");
  const [homeScore, setHomeScore] = useState<number>(3);
  const [awayScore, setAwayScore] = useState<number>(2);

  // Match Format & Player Count Configuration
  const [matchFormat, setMatchFormat] = useState<string>("7v7");
  const [playerCount, setPlayerCount] = useState<number>(7);
  const [homeFormation, setHomeFormation] = useState<string>("7v7_3-2-1");
  const [awayFormation, setAwayFormation] = useState<string>("7v7_2-3-1");
  const [homeStarters, setHomeStarters] = useState<string[]>([]);
  const [awayStarters, setAwayStarters] = useState<string[]>([]);

  const [wentToPenalties, setWentToPenalties] = useState<boolean>(false);
  const [homePenaltyScore, setHomePenaltyScore] = useState<number>(3);
  const [awayPenaltyScore, setAwayPenaltyScore] = useState<number>(4);
  const [penaltyWinnerTeamId, setPenaltyWinnerTeamId] = useState<string>(teams[0]?.id || "team_blue");
  const [motmPlayerId, setMotmPlayerId] = useState<string>("");
  const [dpotmPlayerId, setDpotmPlayerId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [events, setEvents] = useState<MatchEvent[]>([
    {
      id: "evt_1",
      minute: 15,
      type: "GOAL",
      playerId: "",
      assistPlayerId: "",
      teamId: teams[0]?.id || "team_blue",
    },
  ]);

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const safePlayers = players || [];
  const safeTeams = teams || [];
  const safeCustomStats = customStats || [];

  // Relevant players for selected teams
  const homePlayers = safePlayers.filter((p) => p.teamId === homeTeamId);
  const awayPlayers = safePlayers.filter((p) => p.teamId === awayTeamId);
  const matchPlayers = [...homePlayers, ...awayPlayers];

  // Initialize starters when team changes or format changes
  useEffect(() => {
    setHomeStarters(homePlayers.slice(0, playerCount).map((p) => p.id));
  }, [homeTeamId, playerCount]);

  useEffect(() => {
    setAwayStarters(awayPlayers.slice(0, playerCount).map((p) => p.id));
  }, [awayTeamId, playerCount]);

  // Handle format change
  const handleFormatChange = (fmt: string) => {
    setMatchFormat(fmt);
    let count = 7;
    let defHomeForm = "7v7_3-2-1";
    let defAwayForm = "7v7_2-3-1";

    if (fmt === "4v4") {
      count = 4;
      defHomeForm = "4v4_1-2-1";
      defAwayForm = "4v4_1-2-1";
    } else if (fmt === "5v5") {
      count = 5;
      defHomeForm = "5v5_1-2-1";
      defAwayForm = "5v5_2-2";
    } else if (fmt === "6v6") {
      count = 6;
      defHomeForm = "6v6_2-2-1";
      defAwayForm = "6v6_2-1-2";
    } else if (fmt === "7v7") {
      count = 7;
      defHomeForm = "7v7_3-2-1";
      defAwayForm = "7v7_2-3-1";
    } else if (fmt === "8v8") {
      count = 8;
      defHomeForm = "8v8_3-3-1";
      defAwayForm = "8v8_2-4-1";
    } else if (fmt === "9v9") {
      count = 9;
      defHomeForm = "9v9_3-3-2";
      defAwayForm = "9v9_3-2-3";
    } else if (fmt === "11v11") {
      count = 11;
      defHomeForm = "11v11_4-3-3";
      defAwayForm = "11v11_4-2-3-1";
    }
    setPlayerCount(count);
    setHomeFormation(defHomeForm);
    setAwayFormation(defAwayForm);
  };

  const toggleHomeStarter = (pId: string) => {
    if (homeStarters.includes(pId)) {
      setHomeStarters(homeStarters.filter((id) => id !== pId));
    } else {
      if (homeStarters.length >= playerCount) {
        // replace last
        setHomeStarters([...homeStarters.slice(0, playerCount - 1), pId]);
      } else {
        setHomeStarters([...homeStarters, pId]);
      }
    }
  };

  const toggleAwayStarter = (pId: string) => {
    if (awayStarters.includes(pId)) {
      setAwayStarters(awayStarters.filter((id) => id !== pId));
    } else {
      if (awayStarters.length >= playerCount) {
        setAwayStarters([...awayStarters.slice(0, playerCount - 1), pId]);
      } else {
        setAwayStarters([...awayStarters, pId]);
      }
    }
  };

  // Helper to add new match event
  const handleAddEvent = (type: MatchEvent["type"]) => {
    const newEvt: MatchEvent = {
      id: "evt_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5),
      minute: 20,
      type,
      playerId: matchPlayers[0]?.id || "",
      teamId: homeTeamId,
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
          // Auto-sync teamId if player changed
          if (updates.playerId) {
            const p = players.find((pl) => pl.id === updates.playerId);
            if (p) updated.teamId = p.teamId;
          }
          return updated;
        }
        return e;
      })
    );
  };

  const handleSetRating = (playerId: string, val: number) => {
    setRatings({
      ...ratings,
      [playerId]: val,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (homeTeamId === awayTeamId) {
      setErrorMsg("Home team and Away team cannot be the same.");
      return;
    }
    if (!submittedBy.trim()) {
      setErrorMsg("Please enter your name as the submitter.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Clean valid events with assigned players
      const validEvents = events.filter((evt) => evt.playerId);

      const homeTeamObj = teams.find((t) => t.id === homeTeamId);
      const awayTeamObj = teams.find((t) => t.id === awayTeamId);

      const homeSubs = homePlayers.filter((p) => !homeStarters.includes(p.id)).map((p) => p.id);
      const awaySubs = awayPlayers.filter((p) => !awayStarters.includes(p.id)).map((p) => p.id);

      await onSubmitMatch({
        title: title.trim() || `Soccer Match: ${homeTeamObj?.shortName || 'HOM'} vs ${awayTeamObj?.shortName || 'AWY'}`,
        date,
        venue,
        stadiumPitchType,
        submittedBy: submittedBy.trim(),
        homeTeamId,
        awayTeamId,
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        penaltyScore: wentToPenalties
          ? { home: Number(homePenaltyScore), away: Number(awayPenaltyScore) }
          : undefined,
        penaltyWinnerTeamId: wentToPenalties ? penaltyWinnerTeamId : undefined,
        outcomeNote: wentToPenalties
          ? `${teams.find((t) => t.id === penaltyWinnerTeamId)?.name || 'Winner'} won ${homePenaltyScore}-${awayPenaltyScore} on penalties (${homeScore}-${awayScore} FT)`
          : undefined,
        motmPlayerId: motmPlayerId || undefined,
        dpotmPlayerId: dpotmPlayerId || undefined,
        notes,
        events: validEvents,
        playerRatings: ratings,
        matchFormat,
        playerCount,
        lineups: {
          home: {
            formation: homeFormation,
            starters: homeStarters.length > 0 ? homeStarters : homePlayers.slice(0, playerCount).map((p) => p.id),
            subs: homeSubs,
          },
          away: {
            formation: awayFormation,
            starters: awayStarters.length > 0 ? awayStarters : awayPlayers.slice(0, playerCount).map((p) => p.id),
            subs: awaySubs,
          },
        },
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit match.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#090e18] border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-[#090e18]/95 backdrop-blur-md border-b border-slate-800 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-chakra font-black text-white text-base sm:text-lg">
                SUBMIT MATCH RESULT
              </h3>
              <p className="text-xs text-slate-400">
                Submit score, scorers, cards, and custom stats for admin review
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Submitter & Basics */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-3">
            <h4 className="text-xs font-chakra font-black text-emerald-400 uppercase tracking-wider">
              1. Submitter & Match Info
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Name (Submitter) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mohammad, Samuel, Carlos"
                  value={submittedBy}
                  onChange={(e) => setSubmittedBy(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Match Title / Game #
                </label>
                <input
                  type="text"
                  placeholder="e.g. Soccer Game #6"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Stadium / Venue</label>
                <input
                  type="text"
                  placeholder="e.g. The Red Fortress Arena"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pitch Surface Type</label>
                <select
                  value={stadiumPitchType}
                  onChange={(e) => setStadiumPitchType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-emerald-400 outline-none"
                >
                  <option value="Grass">🌱 Natural Grass</option>
                  <option value="Turf">🟢 Synthetic Turf</option>
                  <option value="Hybrid">⚡ Hybrid Grass</option>
                  <option value="Indoor">🏟️ Indoor Hardwood/Carpet</option>
                  <option value="Cage">⚽ Futsal / Cage Court</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Teams & Final Score */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-4">
            <h4 className="text-xs font-chakra font-black text-emerald-400 uppercase tracking-wider">
              2. Teams & Final Score
            </h4>

            <div className="grid grid-cols-5 items-center gap-3">
              {/* Home Team Selector */}
              <div className="col-span-2 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Home Team</label>
                <select
                  value={homeTeamId}
                  onChange={(e) => setHomeTeamId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-emerald-400 outline-none"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.badgeEmoji} {t.name}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Goals:</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={homeScore}
                    onChange={(e) => setHomeScore(Number(e.target.value))}
                    className="w-16 bg-slate-950 border-2 border-emerald-500/50 rounded-xl p-2 text-center text-lg font-chakra font-black text-white focus:border-emerald-400 outline-none"
                  />
                </div>
              </div>

              {/* VS Divider */}
              <div className="col-span-1 text-center font-chakra font-black text-slate-500 text-sm">
                VS
              </div>

              {/* Away Team Selector */}
              <div className="col-span-2 space-y-2 text-right">
                <label className="block text-xs font-semibold text-slate-300">Away Team</label>
                <select
                  value={awayTeamId}
                  onChange={(e) => setAwayTeamId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-emerald-400 outline-none"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.badgeEmoji} {t.name}
                    </option>
                  ))}
                </select>

                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs text-slate-400">Goals:</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={awayScore}
                    onChange={(e) => setAwayScore(Number(e.target.value))}
                    className="w-16 bg-slate-950 border-2 border-emerald-500/50 rounded-xl p-2 text-center text-lg font-chakra font-black text-white focus:border-emerald-400 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Penalty Shootout Section (Optional / For Draws) */}
            <div className="pt-2 border-t border-slate-800/80">
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
                <div className="mt-3 p-3 bg-slate-950/80 rounded-xl border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Home Pens</span>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={homePenaltyScore}
                      onChange={(e) => setHomePenaltyScore(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center font-chakra font-black text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Away Pens</span>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={awayPenaltyScore}
                      onChange={(e) => setAwayPenaltyScore(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center font-chakra font-black text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Shootout Winner</span>
                    <select
                      value={penaltyWinnerTeamId}
                      onChange={(e) => setPenaltyWinnerTeamId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs font-bold text-emerald-400"
                    >
                      <option value={homeTeamId}>
                        {teams.find((t) => t.id === homeTeamId)?.name}
                      </option>
                      <option value={awayTeamId}>
                        {teams.find((t) => t.id === awayTeamId)?.name}
                      </option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Match Format, Player Count & Starting Lineups */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-xs font-chakra font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                3. Match Format & Starting Lineups ({playerCount}v{playerCount})
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                Select match size to adapt tactical pitch & lineups
              </span>
            </div>

            {/* Format Quick Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select Game Size:
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {["4v4", "5v5", "6v6", "7v7", "8v8", "9v9", "11v11"].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => handleFormatChange(fmt)}
                    className={`px-3 py-1.5 rounded-xl font-chakra font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      matchFormat === fmt
                        ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                        : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {fmt} {fmt === "7v7" ? "(Standard)" : fmt === "11v11" ? "(Full)" : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* Formations & Starters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              {/* Home Team Lineup */}
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-chakra font-black text-white flex items-center gap-1.5">
                    <span>{teams.find((t) => t.id === homeTeamId)?.badgeEmoji}</span>
                    <span>{teams.find((t) => t.id === homeTeamId)?.name}</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    {homeStarters.length}/{playerCount} Starters
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                    Tactical Formation
                  </label>
                  <select
                    value={homeFormation}
                    onChange={(e) => setHomeFormation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
                  >
                    {FORMATION_PRESETS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                    Select Starters (Click to toggle):
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {homePlayers.map((p) => {
                      const isStarter = homeStarters.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleHomeStarter(p.id)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-chakra font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isStarter
                              ? "bg-emerald-500/20 border border-emerald-500 text-emerald-300"
                              : "bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          <span>#{p.jerseyNumber}</span>
                          <span>{p.name}</span>
                          {isStarter && <Check className="w-3 h-3 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Away Team Lineup */}
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-chakra font-black text-white flex items-center gap-1.5">
                    <span>{teams.find((t) => t.id === awayTeamId)?.badgeEmoji}</span>
                    <span>{teams.find((t) => t.id === awayTeamId)?.name}</span>
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono font-bold">
                    {awayStarters.length}/{playerCount} Starters
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                    Tactical Formation
                  </label>
                  <select
                    value={awayFormation}
                    onChange={(e) => setAwayFormation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
                  >
                    {FORMATION_PRESETS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                    Select Starters (Click to toggle):
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {awayPlayers.map((p) => {
                      const isStarter = awayStarters.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleAwayStarter(p.id)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-chakra font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isStarter
                              ? "bg-cyan-500/20 border border-cyan-500 text-cyan-300"
                              : "bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          <span>#{p.jerseyNumber}</span>
                          <span>{p.name}</span>
                          {isStarter && <Check className="w-3 h-3 text-cyan-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Goals, Cards & Custom Events */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-xs font-chakra font-black text-emerald-400 uppercase tracking-wider">
                4. Match Events (Goals, Cards, Nutmegs, Saves)
              </h4>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleAddEvent("GOAL")}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold font-chakra transition-colors flex items-center gap-1"
                >
                  <span>⚽ +Goal</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddEvent("CUSTOM_STAT")}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold font-chakra transition-colors flex items-center gap-1"
                >
                  <span>🪄 +Custom Stat</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddEvent("YELLOW_CARD")}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold font-chakra transition-colors flex items-center gap-1"
                >
                  <span>🟨 +Card</span>
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {events.map((evt, idx) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                >
                  {/* Event Type */}
                  <div className="sm:col-span-3">
                    <select
                      value={evt.type}
                      onChange={(e) =>
                        handleUpdateEvent(evt.id, { type: e.target.value as MatchEvent["type"] })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-white outline-none"
                    >
                      <option value="GOAL">⚽ Goal</option>
                      <option value="CUSTOM_STAT">🪄 Custom Stat</option>
                      <option value="YELLOW_CARD">🟨 Yellow Card</option>
                      <option value="RED_CARD">🟥 Red Card</option>
                    </select>
                  </div>

                  {/* Player Selector */}
                  <div className="sm:col-span-4">
                    <select
                      value={evt.playerId}
                      onChange={(e) => handleUpdateEvent(evt.id, { playerId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-semibold text-white outline-none"
                    >
                      <option value="">Select Player...</option>
                      {matchPlayers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (#{p.jerseyNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Assist / Custom Stat Extra */}
                  <div className="sm:col-span-4">
                    {evt.type === "GOAL" ? (
                      <select
                        value={evt.assistPlayerId || ""}
                        onChange={(e) =>
                          handleUpdateEvent(evt.id, { assistPlayerId: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-300 outline-none"
                      >
                        <option value="">No Assist (Solo / Penalty)</option>
                        {matchPlayers.map((p) => (
                          <option key={p.id} value={p.id}>
                            Assist: {p.name}
                          </option>
                        ))}
                      </select>
                    ) : evt.type === "CUSTOM_STAT" ? (
                      <select
                        value={evt.customStatId || customStats[0]?.id}
                        onChange={(e) =>
                          handleUpdateEvent(evt.id, { customStatId: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-semibold text-cyan-300 outline-none"
                      >
                        {customStats.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Note (e.g. Tackle foul)"
                        value={evt.note || ""}
                        onChange={(e) => handleUpdateEvent(evt.id, { note: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none"
                      />
                    )}
                  </div>

                  {/* Delete Event */}
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveEvent(evt.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Man of the Match & Defensive Player of the Match & Player Ratings */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-4">
            <h4 className="text-xs font-chakra font-black text-emerald-400 uppercase tracking-wider">
              4. Match Awards & Decimal Ratings (1.0 – 10.0)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  Man of the Match (MOTM)
                </label>
                <select
                  value={motmPlayerId}
                  onChange={(e) => setMotmPlayerId(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-xs font-bold text-amber-300 focus:border-amber-400 outline-none"
                >
                  <option value="">Select MOTM Player...</option>
                  {matchPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      ⭐ {p.name} ({p.position})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-300 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  Defensive Player of the Match (DPOTM)
                </label>
                <select
                  value={dpotmPlayerId}
                  onChange={(e) => setDpotmPlayerId(e.target.value)}
                  className="w-full bg-slate-950 border border-blue-500/40 rounded-xl px-3 py-2 text-xs font-bold text-blue-300 focus:border-blue-400 outline-none"
                >
                  <option value="">Select DPOTM Player...</option>
                  {matchPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      🛡️ {p.name} ({p.position})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Ratings Grid */}
            <div className="space-y-2">
              <span className="text-xs text-slate-400 block">
                Assign performance ratings to match participants:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {matchPlayers.map((p) => {
                  const currentScore = ratings[p.id] || 8.0;
                  return (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <span className="font-chakra font-bold text-white text-xs block truncate">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-slate-500">#{p.jerseyNumber} • {p.position}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="0.1"
                          value={currentScore}
                          onChange={(e) => handleSetRating(p.id, Number(e.target.value))}
                          className="w-20 sm:w-24 accent-emerald-400"
                        />
                        <span className="w-8 text-center font-chakra font-black text-xs text-emerald-300">
                          {currentScore.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submission Notice & Submit Button */}
          <div className="pt-2">
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                Match result will be submitted to the admin queue. Once approved by an admin, it updates the official table, Golden Boot, and MVP rankings!
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-chakra font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>{isSubmitting ? "SUBMITTING RESULT..." : "SUBMIT MATCH RESULT FOR APPROVAL"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
