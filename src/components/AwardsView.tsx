import React, { useState, useEffect } from "react";
import { PlayerProfile, Team, CustomStatDefinition, LeagueSeason, AwardConfig } from "../types";
import { 
  Trophy, 
  Award, 
  Crown, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Medal,
  Star,
  Zap,
  Target,
  SlidersHorizontal,
  Plus,
  Trash2,
  Check,
  X,
  RotateCcw,
  Edit3
} from "lucide-react";
import { TeamBadge } from "./TeamBadge";

interface AwardsViewProps {
  players: PlayerProfile[];
  teams: Team[];
  customStats: CustomStatDefinition[];
  activeSeason: LeagueSeason;
  isAdminUnlocked?: boolean;
  onOpenSeasonConclusion?: () => void;
}

const DEFAULT_AWARD_CONFIGS: AwardConfig[] = [
  {
    id: "golden_boot",
    title: "GOLDEN BOOT",
    subtitle: "Top Goalscorer",
    statKey: "goals",
    statType: "standard",
    icon: "⚽ 👟",
    badgeEmoji: "🏆",
    calculationMode: "highest",
    enabled: true,
    colorScheme: "amber",
  },
  {
    id: "mvp",
    title: "PLAYER OF THE SEASON (MVP)",
    subtitle: "Highest Match Rating Average & MOTMs",
    statKey: "averageRating",
    statType: "standard",
    icon: "🏆 🌟",
    badgeEmoji: "👑",
    calculationMode: "highest",
    enabled: true,
    colorScheme: "amber",
  },
  {
    id: "dpotm_season",
    title: "DEFENSIVE PLAYER OF THE SEASON",
    subtitle: "Defensive Player of the Match & Clean Sheets",
    statKey: "dpotmCount",
    statType: "standard",
    icon: "🛡️ ⚡",
    badgeEmoji: "🛡️",
    calculationMode: "highest",
    enabled: true,
    colorScheme: "blue",
  },
  {
    id: "golden_glove",
    title: "GOLDEN GLOVE",
    subtitle: "Top Goalkeeper (Saves & Clean Sheets)",
    statKey: "cleanSheets",
    statType: "standard",
    icon: "🧤 🛡️",
    badgeEmoji: "🧤",
    calculationMode: "highest",
    enabled: true,
    colorScheme: "cyan",
  },
  {
    id: "most_improved",
    title: "MOST IMPROVED PLAYER",
    subtitle: "Highest Rating Surge & Form Growth",
    statKey: "averageRating",
    statType: "standard",
    icon: "📈 🚀",
    badgeEmoji: "🔥",
    calculationMode: "highest",
    enabled: true,
    colorScheme: "emerald",
  },
  {
    id: "playmaker",
    title: "PLAYMAKER MAESTRO",
    subtitle: "Most Assists & Key Passes",
    statKey: "assists",
    statType: "standard",
    icon: "🎯 🪄",
    badgeEmoji: "🎩",
    calculationMode: "highest",
    enabled: true,
    colorScheme: "purple",
  },
  {
    id: "nutmeg_king",
    title: "PANNA / NUTMEG KING",
    subtitle: "Most Nutmegs on Opponents",
    statKey: "nutmegs",
    statType: "custom",
    icon: "🪄 ✨",
    badgeEmoji: "🪄",
    calculationMode: "highest",
    enabled: true,
    colorScheme: "purple",
  },
];

export const AwardsView: React.FC<AwardsViewProps> = ({
  players,
  teams,
  customStats,
  activeSeason,
  isAdminUnlocked = false,
  onOpenSeasonConclusion,
}) => {
  // Load custom award configs from localStorage or use defaults
  const [awardConfigs, setAwardConfigs] = useState<AwardConfig[]>(() => {
    try {
      const saved = localStorage.getItem("soccer_game_award_configs");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_AWARD_CONFIGS;
  });

  const [selectedAwardId, setSelectedAwardId] = useState<string>("golden_boot");
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [editingAward, setEditingAward] = useState<AwardConfig | null>(null);

  // Save configs to localStorage
  const handleSaveConfigs = (newConfigs: AwardConfig[]) => {
    setAwardConfigs(newConfigs);
    try {
      localStorage.setItem("soccer_game_award_configs", JSON.stringify(newConfigs));
    } catch {}
  };

  const safeTeams = teams || [];
  const safePlayers = players || [];
  const safeCustomStats = customStats || [];

  const getTeam = (teamId: string) => safeTeams.find((t) => t.id === teamId);

  // Available stats dictionary for picking
  const availableStatOptions = [
    { key: "goals", label: "Goals Scored", type: "standard", unit: "Goals" },
    { key: "assists", label: "Assists Made", type: "standard", unit: "Assists" },
    { key: "averageRating", label: "Average Match Rating (1-10)", type: "standard", unit: "Rating" },
    { key: "motmCount", label: "Man of the Match (MOTM) Awards", type: "standard", unit: "MOTMs" },
    { key: "dpotmCount", label: "Defensive Player of the Match (DPOTM)", type: "standard", unit: "DPOTMs" },
    { key: "cleanSheets", label: "Clean Sheets Kept", type: "standard", unit: "Clean Sheets" },
    { key: "saves", label: "Goalkeeper Saves", type: "standard", unit: "Saves" },
    { key: "matchesPlayed", label: "Matches / Games Played", type: "standard", unit: "Games" },
    { key: "yellowCards", label: "Yellow Cards", type: "standard", unit: "Cards" },
    { key: "redCards", label: "Red Cards", type: "standard", unit: "Cards" },
    ...safeCustomStats.map((cs) => ({
      key: cs.id,
      label: `Custom: ${cs.name}`,
      type: "custom",
      unit: cs.shortLabel || cs.name,
    })),
  ];

  // Helper to compute player ranking for a given award config
  const getRankedPlayersForAward = (config: AwardConfig) => {
    // Helper to get effective rating for player awards:
    // If a player played one game, use that singular rating directly (never do math with 0)
    const getPlayerAwardRating = (p: PlayerProfile): number => {
      const mp = p.stats?.matchesPlayed || 0;
      const rc = p.stats?.ratingCount || 0;
      if (mp === 0 && rc === 0) return 0; // Unplayed players are ineligible for rating awards

      if (mp === 1 || rc === 1) {
        if (p.ratingHistory && p.ratingHistory.length === 1 && typeof p.ratingHistory[0].rating === "number" && p.ratingHistory[0].rating > 0) {
          return p.ratingHistory[0].rating;
        }
        return p.stats?.averageRating || 0;
      }
      return p.stats?.averageRating || 0;
    };

    return [...players].sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (config.statKey === "goals") {
        valA = a.stats.goals;
        valB = b.stats.goals;
      } else if (config.statKey === "assists") {
        valA = a.stats.assists;
        valB = b.stats.assists;
      } else if (config.statKey === "averageRating") {
        const ratingA = getPlayerAwardRating(a);
        const ratingB = getPlayerAwardRating(b);
        valA = ratingA > 0 ? ratingA + (a.stats.motmCount || 0) * 0.2 : 0;
        valB = ratingB > 0 ? ratingB + (b.stats.motmCount || 0) * 0.2 : 0;
      } else if (config.statKey === "motmCount") {
        valA = a.stats.motmCount;
        valB = b.stats.motmCount;
      } else if (config.statKey === "dpotmCount") {
        valA = (a.stats.dpotmCount || 0) * 3 + a.stats.cleanSheets;
        valB = (b.stats.dpotmCount || 0) * 3 + b.stats.cleanSheets;
      } else if (config.statKey === "cleanSheets") {
        valA = a.stats.cleanSheets * 3 + a.stats.saves;
        valB = b.stats.cleanSheets * 3 + b.stats.saves;
      } else if (config.statKey === "saves") {
        valA = a.stats.saves;
        valB = b.stats.saves;
      } else if (config.statKey === "matchesPlayed") {
        valA = a.stats.matchesPlayed;
        valB = b.stats.matchesPlayed;
      } else if (config.statKey === "yellowCards") {
        valA = a.stats.yellowCards;
        valB = b.stats.yellowCards;
      } else if (config.statKey === "redCards") {
        valA = a.stats.redCards;
        valB = b.stats.redCards;
      } else {
        // Custom stat lookup
        valA = a.stats.customStats?.[config.statKey] || 0;
        valB = b.stats.customStats?.[config.statKey] || 0;
      }

      return valB - valA;
    });
  };

  const activeConfig = awardConfigs.find((c) => c.id === selectedAwardId) || awardConfigs[0] || DEFAULT_AWARD_CONFIGS[0];
  const rankedPlayers = getRankedPlayersForAward(activeConfig);

  const formatStatValue = (p: PlayerProfile, config: AwardConfig) => {
    if (config.statKey === "goals") return `${p.stats.goals} Goals`;
    if (config.statKey === "assists") return `${p.stats.assists} Assists`;
    if (config.statKey === "averageRating") {
      const mp = p.stats?.matchesPlayed || 0;
      const rc = p.stats?.ratingCount || 0;
      if (mp === 0 && rc === 0) return "No ratings yet (0 GP)";

      const isSingleGame = mp === 1 || rc === 1;
      const rating = isSingleGame && p.ratingHistory && p.ratingHistory.length === 1 && p.ratingHistory[0].rating > 0
        ? p.ratingHistory[0].rating
        : (p.stats?.averageRating || 0);

      const label = isSingleGame ? "Singular Rating" : "Avg";
      return `${rating.toFixed(1)}★ ${label} (${p.stats.motmCount || 0} MOTM)`;
    }
    if (config.statKey === "motmCount") return `${p.stats.motmCount} MOTM Awards`;
    if (config.statKey === "dpotmCount") return `${p.stats.dpotmCount || 0} DPOTM Awards (${p.stats.cleanSheets} Clean Sheets)`;
    if (config.statKey === "cleanSheets") return `${p.stats.cleanSheets} Clean Sheets (${p.stats.saves} Saves)`;
    if (config.statKey === "saves") return `${p.stats.saves} Saves`;
    if (config.statKey === "matchesPlayed") return `${p.stats.matchesPlayed} Matches`;
    if (config.statKey === "yellowCards") return `${p.stats.yellowCards} Yellows`;
    if (config.statKey === "redCards") return `${p.stats.redCards} Reds`;
    const count = p.stats.customStats?.[config.statKey] || 0;
    const statDef = customStats.find((cs) => cs.id === config.statKey);
    return `${count} ${statDef?.name || config.title}`;
  };

  const handleUpdateAward = (updated: AwardConfig) => {
    const newConfigs = awardConfigs.map((c) => (c.id === updated.id ? updated : c));
    handleSaveConfigs(newConfigs);
    setEditingAward(null);
  };

  const handleAddNewAward = () => {
    const newAward: AwardConfig = {
      id: "award_" + Date.now(),
      title: "CUSTOM TROPHY",
      subtitle: "Custom League Metric",
      statKey: customStats[0]?.id || "goals",
      statType: customStats[0] ? "custom" : "standard",
      icon: "🏆 ⭐",
      badgeEmoji: "🏆",
      calculationMode: "highest",
      enabled: true,
      colorScheme: "cyan",
    };
    const newConfigs = [...awardConfigs, newAward];
    handleSaveConfigs(newConfigs);
    setSelectedAwardId(newAward.id);
    setEditingAward(newAward);
  };

  const handleDeleteAward = (id: string) => {
    const newConfigs = awardConfigs.filter((c) => c.id !== id);
    handleSaveConfigs(newConfigs);
    if (selectedAwardId === id && newConfigs.length > 0) {
      setSelectedAwardId(newConfigs[0].id);
    }
  };

  const handleResetToDefaults = () => {
    handleSaveConfigs(DEFAULT_AWARD_CONFIGS);
    setSelectedAwardId(DEFAULT_AWARD_CONFIGS[0].id);
    setIsConfigModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black font-chakra text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            LEAGUE AWARDS & HONORS
          </h2>
          <p className="text-xs text-slate-400">
            {activeSeason.name} &bull; Individual trophies, custom stat awards, and podium race
          </p>
        </div>

        {/* Actions (Pick Stats & End Season Ceremony) */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenSeasonConclusion && (
            <button
              onClick={onOpenSeasonConclusion}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-chakra font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Trophy className="w-4 h-4 fill-zinc-950 text-zinc-950" />
              <span>{activeSeason?.status === "archived" ? "View Ceremony 🏆" : "End Season & Award Trophies 🏆"}</span>
            </button>
          )}

          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-chakra font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-zinc-300" />
            <span>Pick Stats</span>
          </button>
        </div>
      </div>

      {/* Main Award Category Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {awardConfigs
          .filter((c) => c.enabled)
          .map((config) => {
            const isSelected = selectedAwardId === config.id;
            const topPlayer = getRankedPlayersForAward(config)[0];

            let colorClasses = "border-slate-800 bg-[#0d131f] hover:border-slate-700";
            if (isSelected) {
              if (config.colorScheme === "emerald") {
                colorClasses = "bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-400/30";
              } else if (config.colorScheme === "cyan") {
                colorClasses = "bg-cyan-500/15 border-cyan-500/60 ring-1 ring-cyan-400/30";
              } else if (config.colorScheme === "purple") {
                colorClasses = "bg-purple-500/15 border-purple-500/60 ring-1 ring-purple-400/30";
              } else if (config.colorScheme === "rose") {
                colorClasses = "bg-rose-500/15 border-rose-500/60 ring-1 ring-rose-400/30";
              } else {
                colorClasses = "bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-400/30";
              }
            }

            return (
              <button
                key={config.id}
                onClick={() => setSelectedAwardId(config.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${colorClasses}`}
              >
                <div>
                  <div className="text-2xl mb-1.5">{config.icon || "🏆"}</div>
                  <h3 className="font-chakra font-black text-white text-sm truncate">
                    {config.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5 line-clamp-1">
                    {config.subtitle || `Metric: ${config.statKey}`}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-chakra font-bold text-amber-400 block truncate">
                    Leader: {topPlayer?.name || "None"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-chakra">
                    {topPlayer ? formatStatValue(topPlayer, config) : "0"}
                  </span>
                </div>
              </button>
            );
          })}
      </div>

      {/* Active Award Podium & Standings Table */}
      {activeConfig && (
        <div className="space-y-6">
          {/* Top 3 Visual Podium */}
          {rankedPlayers[0] && (
            <div className="bg-[#0d131f] rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
                <h3 className="font-chakra font-black text-white text-base sm:text-lg uppercase tracking-wider flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span>{activeConfig.title} &bull; TROPHY STANDINGS</span>
                </h3>
                <button
                  onClick={() => {
                    setEditingAward(activeConfig);
                    setIsConfigModalOpen(true);
                  }}
                  className="text-xs font-chakra font-bold text-slate-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Customize Stat</span>
                </button>
              </div>

              {/* 3-Tier Podium Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mx-auto pt-4">
                {/* 2nd Place (Silver) */}
                {rankedPlayers[1] && (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 border-2 border-slate-400 overflow-hidden flex items-center justify-center font-chakra font-black text-sm text-white shadow-md mb-2">
                      {rankedPlayers[1].photoUrl ? (
                        <img src={rankedPlayers[1].photoUrl} alt={rankedPlayers[1].name} className="w-full h-full object-cover" />
                      ) : (
                        <span>#{rankedPlayers[1].jerseyNumber}</span>
                      )}
                    </div>
                    <span className="font-chakra font-bold text-white text-xs sm:text-sm truncate max-w-full">
                      {rankedPlayers[1].name}
                    </span>
                    <span className="text-[10px] text-slate-400">{getTeam(rankedPlayers[1].teamId)?.name}</span>
                    <div className="w-full mt-3 h-24 bg-gradient-to-t from-slate-800 to-slate-700/80 rounded-t-2xl flex flex-col items-center justify-center border-t-2 border-slate-400 shadow-md">
                      <span className="font-chakra font-black text-lg sm:text-xl text-slate-200">2nd</span>
                      <span className="text-[10px] font-chakra font-bold text-slate-300 px-1 truncate">
                        {formatStatValue(rankedPlayers[1], activeConfig)}
                      </span>
                    </div>
                  </div>
                )}

                {/* 1st Place (Gold Champion) */}
                {rankedPlayers[0] && (
                  <div className="flex flex-col items-center text-center -mt-6">
                    <div className="relative">
                      <Crown className="w-6 h-6 text-amber-400 absolute -top-4 left-1/2 -translate-x-1/2 animate-bounce" />
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-800 border-4 border-amber-400 overflow-hidden flex items-center justify-center font-chakra font-black text-base sm:text-lg text-white shadow-xl shadow-amber-500/20 mb-2">
                        {rankedPlayers[0].photoUrl ? (
                          <img src={rankedPlayers[0].photoUrl} alt={rankedPlayers[0].name} className="w-full h-full object-cover" />
                        ) : (
                          <span>#{rankedPlayers[0].jerseyNumber}</span>
                        )}
                      </div>
                    </div>
                    <span className="font-chakra font-black text-amber-300 text-sm sm:text-base truncate max-w-full">
                      {rankedPlayers[0].name}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{getTeam(rankedPlayers[0].teamId)?.name}</span>
                    <div className="w-full mt-3 h-32 bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-2xl flex flex-col items-center justify-center border-t-4 border-amber-300 shadow-xl shadow-amber-500/20">
                      <span className="font-chakra font-black text-2xl sm:text-3xl text-slate-950">1st</span>
                      <span className="text-xs font-chakra font-black text-slate-950 px-1 truncate">
                        {formatStatValue(rankedPlayers[0], activeConfig)}
                      </span>
                    </div>
                  </div>
                )}

                {/* 3rd Place (Bronze) */}
                {rankedPlayers[2] && (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 border-2 border-amber-700 overflow-hidden flex items-center justify-center font-chakra font-black text-sm text-white shadow-md mb-2">
                      {rankedPlayers[2].photoUrl ? (
                        <img src={rankedPlayers[2].photoUrl} alt={rankedPlayers[2].name} className="w-full h-full object-cover" />
                      ) : (
                        <span>#{rankedPlayers[2].jerseyNumber}</span>
                      )}
                    </div>
                    <span className="font-chakra font-bold text-white text-xs sm:text-sm truncate max-w-full">
                      {rankedPlayers[2].name}
                    </span>
                    <span className="text-[10px] text-slate-400">{getTeam(rankedPlayers[2].teamId)?.name}</span>
                    <div className="w-full mt-3 h-18 bg-gradient-to-t from-amber-900/80 to-amber-800/80 rounded-t-2xl flex flex-col items-center justify-center border-t-2 border-amber-700 shadow-md">
                      <span className="font-chakra font-black text-lg sm:text-xl text-amber-200">3rd</span>
                      <span className="text-[10px] font-chakra font-bold text-amber-300 px-1 truncate">
                        {formatStatValue(rankedPlayers[2], activeConfig)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="bg-[#0d131f] rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
            <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 text-xs font-chakra font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Complete Rankings: {activeConfig.title}</span>
              <span className="text-[11px] text-emerald-400 font-sans">
                Stat Metric: {availableStatOptions.find((o) => o.key === activeConfig.statKey)?.label || activeConfig.statKey}
              </span>
            </div>
            <div className="divide-y divide-slate-800/60">
              {rankedPlayers.map((p, idx) => {
                const team = getTeam(p.teamId);
                return (
                  <div
                    key={p.id}
                    className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-lg font-chakra font-black text-xs flex items-center justify-center ${
                          idx === 0
                            ? "bg-amber-400 text-slate-950"
                            : idx === 1
                            ? "bg-slate-400 text-slate-950"
                            : idx === 2
                            ? "bg-amber-800 text-amber-200"
                            : "text-slate-500 bg-slate-900 border border-slate-800"
                        }`}
                      >
                        {idx + 1}
                      </span>

                      <div>
                        <div className="font-chakra font-bold text-white text-sm">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans flex items-center gap-1.5">
                          <TeamBadge team={team} size="xs" />
                          <span>{team?.name} &bull; {p.position}</span>
                        </div>
                      </div>
                    </div>

                    <div className="font-chakra font-black text-sm text-emerald-400">
                      {formatStatValue(p, activeConfig)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CHANGE AWARD STATS CONFIGURATION MODAL */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#090e18] border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-6 space-y-5 my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-chakra font-black text-white text-base sm:text-lg flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-amber-400" />
                  CUSTOMIZE AWARD STATS & METRICS
                </h3>
                <p className="text-xs text-slate-400">
                  Pick which stats compute each award, rename trophies, or add new custom honors
                </p>
              </div>
              <button
                onClick={() => {
                  setIsConfigModalOpen(false);
                  setEditingAward(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* If editing a specific award */}
            {editingAward ? (
              <div className="bg-slate-900/90 rounded-2xl border border-slate-700 p-4 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-chakra font-black text-amber-400 uppercase tracking-wider">
                    Editing Award: {editingAward.title}
                  </h4>
                  <button
                    onClick={() => setEditingAward(null)}
                    className="text-xs text-slate-400 hover:text-white font-semibold"
                  >
                    Back to List
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-chakra font-bold text-slate-300 mb-1">
                    Award Title
                  </label>
                  <input
                    type="text"
                    value={editingAward.title}
                    onChange={(e) => setEditingAward({ ...editingAward, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-chakra font-bold text-slate-300 mb-1">
                    Subtitle / Description
                  </label>
                  <input
                    type="text"
                    value={editingAward.subtitle || ""}
                    onChange={(e) => setEditingAward({ ...editingAward, subtitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                {/* Stat Metric Picker */}
                <div>
                  <label className="block text-xs font-chakra font-bold text-amber-300 mb-1">
                    Select Stat Metric (Which stat calculates this award?) *
                  </label>
                  <select
                    value={editingAward.statKey}
                    onChange={(e) => {
                      const selected = availableStatOptions.find((o) => o.key === e.target.value);
                      setEditingAward({
                        ...editingAward,
                        statKey: e.target.value,
                        statType: (selected?.type as any) || "standard",
                      });
                    }}
                    className="w-full bg-slate-950 border border-amber-500/60 rounded-xl px-3 py-2.5 text-xs font-bold text-white outline-none cursor-pointer focus:ring-1 focus:ring-amber-400"
                  >
                    <optgroup label="Standard Match Statistics">
                      <option value="goals">⚽ Goals Scored</option>
                      <option value="assists">🎯 Assists Made</option>
                      <option value="averageRating">⭐ Average Match Rating (1-10)</option>
                      <option value="motmCount">🏆 Man of the Match (MOTM) Awards</option>
                      <option value="cleanSheets">🧤 Clean Sheets</option>
                      <option value="saves">🛡️ Goalkeeper Saves</option>
                      <option value="matchesPlayed">📅 Matches Played</option>
                      <option value="yellowCards">🟨 Yellow Cards</option>
                      <option value="redCards">🟥 Red Cards</option>
                    </optgroup>
                    {customStats.length > 0 && (
                      <optgroup label="Custom Community Stats">
                        {customStats.map((cs) => (
                          <option key={cs.id} value={cs.id}>
                            ✨ {cs.name} ({cs.awardTitle || cs.name})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-chakra font-bold text-slate-300 mb-1">
                      Emoji Icons
                    </label>
                    <input
                      type="text"
                      value={editingAward.icon}
                      onChange={(e) => setEditingAward({ ...editingAward, icon: e.target.value })}
                      placeholder="e.g. ⚽ 👟, 🏆 🌟, 🪄 ✨"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-chakra font-bold text-slate-300 mb-1">
                      Color Theme
                    </label>
                    <select
                      value={editingAward.colorScheme || "amber"}
                      onChange={(e) => setEditingAward({ ...editingAward, colorScheme: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="amber">Gold / Amber</option>
                      <option value="emerald">Emerald Green</option>
                      <option value="cyan">Electric Cyan</option>
                      <option value="purple">Purple Royalty</option>
                      <option value="rose">Fire Rose</option>
                      <option value="blue">Deep Blue</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => handleUpdateAward(editingAward)}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-chakra font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  Save Award Metric
                </button>
              </div>
            ) : (
              /* Award List with Stat Keys and Edit / Toggle controls */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-chakra font-bold text-slate-400">
                    CONFIGURED AWARDS ({awardConfigs.length})
                  </span>
                  <button
                    onClick={handleAddNewAward}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-chakra font-bold text-xs cursor-pointer border border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Trophy</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {awardConfigs.map((config) => {
                    const currentStatObj = availableStatOptions.find((o) => o.key === config.statKey);

                    return (
                      <div
                        key={config.id}
                        className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span className="text-xl shrink-0">{config.icon || "🏆"}</span>
                          <div className="truncate">
                            <h4 className="font-chakra font-black text-white text-xs sm:text-sm truncate">
                              {config.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span className="text-amber-400 font-semibold">
                                Stat: {currentStatObj?.label || config.statKey}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setEditingAward(config)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-chakra font-bold border border-slate-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-amber-400" />
                            <span>Pick Stat</span>
                          </button>

                          <button
                            onClick={() => handleDeleteAward(config.id)}
                            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer"
                            title="Delete Award"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={handleResetToDefaults}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-300 font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Standard Defaults</span>
                  </button>

                  <button
                    onClick={() => setIsConfigModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-chakra font-black text-xs uppercase cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
