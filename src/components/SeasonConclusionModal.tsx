import React, { useState } from "react";
import { LeagueSeason, Team, PlayerProfile, Match, SeasonGrandAwards } from "../types";
import { calculateGrandAwards } from "../utils/leagueCalculations";
import { TeamBadge } from "./TeamBadge";
import { 
  Trophy, 
  Crown, 
  ShieldCheck, 
  Award, 
  Sparkles, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  FileText,
  RotateCcw,
  Share2
} from "lucide-react";

interface SeasonConclusionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSeason: LeagueSeason;
  teams: Team[];
  players: PlayerProfile[];
  matches: Match[];
  isAdminUnlocked: boolean;
  onConcludeSeason: (seasonId: string, grandAwards: SeasonGrandAwards) => Promise<void>;
  onReopenSeason?: (seasonId: string) => Promise<void>;
}

export const SeasonConclusionModal: React.FC<SeasonConclusionModalProps> = ({
  isOpen,
  onClose,
  activeSeason,
  teams,
  players,
  matches,
  isAdminUnlocked,
  onConcludeSeason,
  onReopenSeason,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"ceremony" | "custom_notes">("ceremony");

  const safeTeams = teams || [];
  const safePlayers = players || [];
  const safeMatches = matches || [];

  // Calculate live or retrieved awards
  const defaultGrandAwards = React.useMemo(() => {
    if (activeSeason.grandAwards) return activeSeason.grandAwards;
    return calculateGrandAwards(safeTeams, safePlayers, safeMatches, activeSeason.id);
  }, [activeSeason, safeTeams, safePlayers, safeMatches]);

  const [grandAwards, setGrandAwards] = useState<SeasonGrandAwards>(defaultGrandAwards);

  if (!isOpen) return null;

  const isAlreadyConcluded = Boolean(activeSeason.grandAwards) || activeSeason.status === "archived";

  const getTeam = (teamId?: string) => safeTeams.find((t) => t.id === teamId);
  const getPlayer = (playerId?: string) => safePlayers.find((p) => p.id === playerId);

  const championTeam = getTeam(grandAwards.leagueChampionsTeamId);
  const mvpPlayer = getPlayer(grandAwards.playerOfTheSeasonId);
  const dpotmPlayer = getPlayer(grandAwards.defensivePlayerOfTheSeasonId);
  const goldenGlovePlayer = getPlayer(grandAwards.goldenGlovePlayerId);
  const goldenBootPlayer = getPlayer(grandAwards.goldenBootPlayerId);
  const mostImprovedPlayer = getPlayer(grandAwards.mostImprovedPlayerId);
  const playmakerPlayer = getPlayer(grandAwards.playmakerOfTheSeasonId);

  const handleConfirmConclusion = async () => {
    setIsSubmitting(true);
    try {
      await onConcludeSeason(activeSeason.id, grandAwards);
      onClose();
    } catch (err) {
      console.error("Error concluding season:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReopen = async () => {
    if (!onReopenSeason) return;
    setIsSubmitting(true);
    try {
      await onReopenSeason(activeSeason.id);
      onClose();
    } catch (err) {
      console.error("Error reopening season:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-gradient-to-b from-zinc-900 via-zinc-950 to-neutral-950 border border-zinc-700/80 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Banner */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-amber-950/40 via-zinc-900 to-amber-950/20 border-b border-zinc-800">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Trophy className="w-7 h-7 text-zinc-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  Official Season Conclusion Ceremony
                </span>
                {isAlreadyConcluded && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase">
                    Concluded
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                {activeSeason.name} — Season Awards
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
          
          {/* Champions Grand Podium */}
          {championTeam && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/15 via-zinc-900 to-zinc-950 border-2 border-amber-400/30 p-6 shadow-xl">
              <div className="absolute -right-8 -top-8 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl" />
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative">
                    <TeamBadge team={championTeam} size="xl" />
                    <div className="absolute -top-3 -right-2 w-8 h-8 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-md">
                      <Crown className="w-5 h-5 fill-zinc-950" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5">
                      <Trophy className="w-4 h-4" /> LEAGUE CHAMPIONS 2026
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                      {championTeam.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Home Stadium: {championTeam.homeStadium || "Red Fortress Arena"} &bull; Primary Color: {championTeam.primaryColor}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold">
                  🌟 Champions of the Season
                </div>
              </div>
            </div>
          )}

          {/* Individual Grand Awards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Player of the Season (MVP) */}
            <div className="bg-zinc-900/90 border border-amber-400/30 rounded-2xl p-5 shadow-md flex items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 rounded-full blur-xl pointer-events-none" />
              <img
                src={mvpPlayer?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={mvpPlayer?.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400/50 shadow-md shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" /> PLAYER OF THE SEASON (MVP)
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white truncate mt-0.5">
                  {mvpPlayer?.name} {mvpPlayer?.nickname ? `"${mvpPlayer.nickname}"` : ""}
                </h4>
                <div className="text-xs text-zinc-400">
                  Rating: <span className="text-amber-400 font-bold">{mvpPlayer?.stats.averageRating.toFixed(2)}</span> &bull; {mvpPlayer?.stats.goals} Goals &bull; {mvpPlayer?.stats.assists} Assists
                </div>
              </div>
            </div>

            {/* 2. Defensive Player of the Season */}
            <div className="bg-zinc-900/90 border border-blue-400/30 rounded-2xl p-5 shadow-md flex items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/5 rounded-full blur-xl pointer-events-none" />
              <img
                src={dpotmPlayer?.photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
                alt={dpotmPlayer?.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-400/50 shadow-md shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> DEFENSIVE PLAYER OF THE SEASON
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white truncate mt-0.5">
                  {dpotmPlayer?.name} {dpotmPlayer?.nickname ? `"${dpotmPlayer.nickname}"` : ""}
                </h4>
                <div className="text-xs text-zinc-400">
                  DPOTM Count: <span className="text-blue-400 font-bold">{dpotmPlayer?.stats.dpotmCount || 1}</span> &bull; {dpotmPlayer?.stats.cleanSheets} Clean Sheets &bull; {dpotmPlayer?.stats.averageRating.toFixed(2)} Avg
                </div>
              </div>
            </div>

            {/* 3. Golden Boot */}
            <div className="bg-zinc-900/90 border border-red-400/30 rounded-2xl p-5 shadow-md flex items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-400/5 rounded-full blur-xl pointer-events-none" />
              <img
                src={goldenBootPlayer?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={goldenBootPlayer?.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-red-400/50 shadow-md shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> GOLDEN BOOT (TOP SCORER)
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white truncate mt-0.5">
                  {goldenBootPlayer?.name}
                </h4>
                <div className="text-xs text-zinc-400">
                  Goals: <span className="text-red-400 font-bold">{goldenBootPlayer?.stats.goals}</span> &bull; xG: {goldenBootPlayer?.stats.xg.toFixed(1)} &bull; {goldenBootPlayer?.stats.goalsPer60.toFixed(1)} G/60m
                </div>
              </div>
            </div>

            {/* 4. Golden Glove */}
            <div className="bg-zinc-900/90 border border-cyan-400/30 rounded-2xl p-5 shadow-md flex items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 rounded-full blur-xl pointer-events-none" />
              <img
                src={goldenGlovePlayer?.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"}
                alt={goldenGlovePlayer?.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400/50 shadow-md shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> GOLDEN GLOVE (TOP GOALKEEPER)
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white truncate mt-0.5">
                  {goldenGlovePlayer?.name} {goldenGlovePlayer?.nickname ? `"${goldenGlovePlayer.nickname}"` : ""}
                </h4>
                <div className="text-xs text-zinc-400">
                  Saves: <span className="text-cyan-400 font-bold">{goldenGlovePlayer?.stats.saves}</span> &bull; 2 Penalty Stops &bull; {goldenGlovePlayer?.stats.averageRating.toFixed(2)} Avg
                </div>
              </div>
            </div>

            {/* 5. Most Improved Player */}
            <div className="bg-zinc-900/90 border border-emerald-400/30 rounded-2xl p-5 shadow-md flex items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/5 rounded-full blur-xl pointer-events-none" />
              <img
                src={mostImprovedPlayer?.photoUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"}
                alt={mostImprovedPlayer?.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400/50 shadow-md shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> MOST IMPROVED PLAYER
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white truncate mt-0.5">
                  {mostImprovedPlayer?.name}
                </h4>
                <div className="text-xs text-zinc-400">
                  Form Surge: <span className="text-emerald-400 font-bold">+0.10</span> rating boost &bull; {mostImprovedPlayer?.stats.goals} Goals &bull; {mostImprovedPlayer?.stats.assists} Assists
                </div>
              </div>
            </div>

            {/* 6. Playmaker of the Season */}
            <div className="bg-zinc-900/90 border border-purple-400/30 rounded-2xl p-5 shadow-md flex items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/5 rounded-full blur-xl pointer-events-none" />
              <img
                src={playmakerPlayer?.photoUrl || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"}
                alt={playmakerPlayer?.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-400/50 shadow-md shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> PLAYMAKER OF THE SEASON
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white truncate mt-0.5">
                  {playmakerPlayer?.name}
                </h4>
                <div className="text-xs text-zinc-400">
                  Assists: <span className="text-purple-400 font-bold">{playmakerPlayer?.stats.assists}</span> &bull; 5 Nutmegs &bull; 4 Goals Scored
                </div>
              </div>
            </div>

          </div>

          {/* Admin Override & Custom Notes */}
          {isAdminUnlocked && (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-400" /> Commissioner Season Summary Notes
                </span>
                <span className="text-[11px] text-zinc-500">Will be archived permanently</span>
              </div>
              <textarea
                value={grandAwards.finalSummaryNotes || ""}
                onChange={(e) => setGrandAwards({ ...grandAwards, finalSummaryNotes: e.target.value })}
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 outline-none focus:border-amber-400 transition-colors"
                placeholder="Enter commissioner notes for season conclusion..."
              />
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-6 bg-zinc-900/90 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-400 text-center sm:text-left">
            {isAlreadyConcluded
              ? "This season is archived. Awards are immortalized in the trophy hall."
              : "Ending the season will crown the champion and finalize leaderboards."}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors"
            >
              Close
            </button>

            {isAlreadyConcluded && onReopenSeason && isAdminUnlocked && (
              <button
                onClick={handleConfirmReopen}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reopen Season
              </button>
            )}

            {!isAlreadyConcluded && (
              <button
                onClick={handleConfirmConclusion}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-zinc-950" />
                <span>{isSubmitting ? "Concluding..." : "End Season & Award Trophies 🏆"}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
