import React, { useState } from "react";
import { PlayerProfile, Team, Match, CustomStatDefinition } from "../types";
import { 
  UserCheck, 
  Search, 
  Upload, 
  Trophy, 
  Sparkles, 
  Star, 
  Shirt, 
  X, 
  PlusCircle,
  Camera,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Activity,
  ArrowRightLeft,
  Edit3,
  RotateCcw,
  UserPlus,
  BarChart3,
  Sliders,
  Crosshair,
  Zap,
  Shield,
  Music,
  Heart,
  Award,
  Hash,
  Plus,
  Minus,
  Trash2,
  ExternalLink
} from "lucide-react";
import { PlayerTraitPentagonChart } from "./PlayerTraitPentagonChart";
import { TeamBadge } from "./TeamBadge";

interface PlayersViewProps {
  players: PlayerProfile[];
  teams: Team[];
  matches?: Match[];
  customStats: CustomStatDefinition[];
  isAdminUnlocked: boolean;
  onSavePlayer: (player: PlayerProfile) => Promise<void>;
  onSaveCustomStat?: (stat: CustomStatDefinition) => Promise<void>;
  onOpenPlayerProfile?: (player: PlayerProfile) => void;
}

export const PlayersView: React.FC<PlayersViewProps> = ({
  players,
  teams,
  matches = [],
  customStats,
  isAdminUnlocked,
  onSavePlayer,
  onSaveCustomStat,
  onOpenPlayerProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [positionFilter, setPositionFilter] = useState<string>("ALL");
  const [teamFilter, setTeamFilter] = useState<string>("ALL");
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null);
  const [modalTab, setModalTab] = useState<"traits" | "identity" | "stats">("traits");
  const [comparePlayerId, setComparePlayerId] = useState<string>("");

  // Edit State inside modal - Identity & Squad
  const [editingName, setEditingName] = useState<string>("");
  const [editingNickname, setEditingNickname] = useState<string>("");
  const [editingTeamId, setEditingTeamId] = useState<string>("team_blue");
  const [isTemporaryTransfer, setIsTemporaryTransfer] = useState<boolean>(false);
  const [temporaryTeamId, setTemporaryTeamId] = useState<string>("team_red");
  const [temporaryNote, setTemporaryNote] = useState<string>("");
  const [editingPhotoUrl, setEditingPhotoUrl] = useState<string>("");
  const [editingBio, setEditingBio] = useState<string>("");
  const [editingPosition, setEditingPosition] = useState<PlayerProfile["position"]>("MID");
  const [editingPositionDisplay, setEditingPositionDisplay] = useState<string>("");
  const [editingJersey, setEditingJersey] = useState<number>(10);
  const [editingFoot, setEditingFoot] = useState<PlayerProfile["preferredFoot"]>("Right");
  const [editingArchetype, setEditingArchetype] = useState<string>("");
  const [editingCelebration, setEditingCelebration] = useState<string>("");
  const [editingProClub, setEditingProClub] = useState<string>("");
  const [editingProPlayer, setEditingProPlayer] = useState<string>("");
  const [editingBootModel, setEditingBootModel] = useState<string>("");
  const [editingPersonalQuote, setEditingPersonalQuote] = useState<string>("");

  // Walkout Song
  const [editingWalkoutTitle, setEditingWalkoutTitle] = useState<string>("");
  const [editingWalkoutArtist, setEditingWalkoutArtist] = useState<string>("");
  const [editingWalkoutSpotify, setEditingWalkoutSpotify] = useState<string>("");

  // Performance Stats
  const [statMatchesPlayed, setStatMatchesPlayed] = useState<number>(0);
  const [statGoals, setStatGoals] = useState<number>(0);
  const [statAssists, setStatAssists] = useState<number>(0);
  const [statXg, setStatXg] = useState<number>(0);
  const [statCleanSheets, setStatCleanSheets] = useState<number>(0);
  const [statSaves, setStatSaves] = useState<number>(0);
  const [statYellowCards, setStatYellowCards] = useState<number>(0);
  const [statRedCards, setStatRedCards] = useState<number>(0);
  const [statMotmCount, setStatMotmCount] = useState<number>(0);
  const [statDpotmCount, setStatDpotmCount] = useState<number>(0);
  const [statAverageRating, setStatAverageRating] = useState<number>(7.5);
  const [statWinRate, setStatWinRate] = useState<number>(50);

  // Custom Community Stats (Record<string, number>)
  const [customStatsMap, setCustomStatsMap] = useState<Record<string, number>>({});
  const [isAddingNewStatField, setIsAddingNewStatField] = useState<boolean>(false);
  const [newStatFieldName, setNewStatFieldName] = useState<string>("");
  const [newStatFieldCategory, setNewStatFieldCategory] = useState<CustomStatDefinition["category"]>("fun");
  const [newStatFieldIcon, setNewStatFieldIcon] = useState<string>("✨");

  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Create new player modal
  const [isAddingNewPlayer, setIsAddingNewPlayer] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const [newTeamId, setNewTeamId] = useState<string>(teams[0]?.id || "team_blue");
  const [newPosition, setNewPosition] = useState<PlayerProfile["position"]>("MID");
  const [newJersey, setNewJersey] = useState<number>(10);

  const safePlayers = players || [];
  const safeTeams = teams || [];

  const getTeam = (teamId: string) => safeTeams.find((t) => t.id === teamId);

  // Filtered Players
  const filteredPlayers = safePlayers.filter((p) => {
    const matchesSearch = 
      (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nickname || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.positionDisplay || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = positionFilter === "ALL" || p.position === positionFilter;
    const effectiveTeamId = p.isTemporaryTransfer && p.temporaryTeamId ? p.temporaryTeamId : p.teamId;
    const matchesTeam = teamFilter === "ALL" || effectiveTeamId === teamFilter || p.teamId === teamFilter;
    return matchesSearch && matchesPosition && matchesTeam;
  });

  const handleOpenDetail = (p: PlayerProfile) => {
    setSelectedPlayer(p);
    setModalTab("traits");
    setComparePlayerId("");

    // Load Identity
    setEditingName(p.name || "");
    setEditingNickname(p.nickname || "");
    setEditingTeamId(p.teamId || "team_blue");
    setIsTemporaryTransfer(!!p.isTemporaryTransfer);
    setTemporaryTeamId(p.temporaryTeamId || (p.teamId === "team_blue" ? "team_red" : "team_blue"));
    setTemporaryNote(p.temporaryTransferNote || "");
    setEditingPhotoUrl(p.photoUrl || "");
    setEditingBio(p.bio || "");
    setEditingPosition(p.position || "MID");
    setEditingPositionDisplay(p.positionDisplay || p.position || "MID");
    setEditingJersey(p.jerseyNumber || 10);
    setEditingFoot(p.preferredFoot || "Right");
    setEditingArchetype(p.playstyleArchetype || "");
    setEditingCelebration(p.signatureCelebration || "");
    setEditingProClub(p.favoriteProClub || "");
    setEditingProPlayer(p.favoriteProPlayer || "");
    setEditingBootModel(p.bootModel || "");
    setEditingPersonalQuote(p.personalQuote || "");

    // Walkout Song
    setEditingWalkoutTitle(p.walkoutSong?.title || "");
    setEditingWalkoutArtist(p.walkoutSong?.artist || "");
    setEditingWalkoutSpotify(p.walkoutSong?.spotifyUrl || "");

    // Stats
    const stats = p.stats || ({} as any);
    setStatMatchesPlayed(stats.matchesPlayed ?? 0);
    setStatGoals(stats.goals ?? 0);
    setStatAssists(stats.assists ?? 0);
    setStatXg(stats.xg ?? 0);
    setStatCleanSheets(stats.cleanSheets ?? 0);
    setStatSaves(stats.saves ?? 0);
    setStatYellowCards(stats.yellowCards ?? 0);
    setStatRedCards(stats.redCards ?? 0);
    setStatMotmCount(stats.motmCount ?? 0);
    setStatDpotmCount(stats.dpotmCount ?? 0);
    setStatAverageRating(stats.averageRating ?? 7.5);
    setStatWinRate(stats.winRate ?? 50);

    // Custom Stats Map
    setCustomStatsMap({ ...(stats.customStats || {}) });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Image file size must be less than 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setEditingPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomStatChange = (statId: string, val: number) => {
    setCustomStatsMap((prev) => ({
      ...prev,
      [statId]: Math.max(0, val),
    }));
  };

  const handleAddNewCustomStatToPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatFieldName.trim()) return;

    const statId = newStatFieldName.trim().toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now().toString().slice(-4);
    const newStatDef: CustomStatDefinition = {
      id: statId,
      name: newStatFieldName.trim(),
      category: newStatFieldCategory,
      iconName: newStatFieldIcon,
      icon: newStatFieldIcon,
      awardTitle: `${newStatFieldName.trim()} Master 🏆`,
    };

    if (onSaveCustomStat) {
      await onSaveCustomStat(newStatDef);
    }

    setCustomStatsMap((prev) => ({
      ...prev,
      [statId]: 1,
    }));

    setNewStatFieldName("");
    setIsAddingNewStatField(false);
  };

  const handleSaveProfile = async () => {
    if (!selectedPlayer) return;
    if (!editingName.trim()) return;
    setIsSaving(true);
    try {
      const updated: PlayerProfile = {
        ...selectedPlayer,
        name: editingName.trim(),
        nickname: editingNickname.trim() || undefined,
        teamId: editingTeamId,
        isTemporaryTransfer: isTemporaryTransfer,
        temporaryTeamId: isTemporaryTransfer ? temporaryTeamId : undefined,
        temporaryTransferNote: isTemporaryTransfer ? temporaryNote.trim() : undefined,
        photoUrl: editingPhotoUrl,
        bio: editingBio,
        position: editingPosition,
        positionDisplay: editingPositionDisplay.trim() || editingPosition,
        jerseyNumber: Number(editingJersey) || selectedPlayer.jerseyNumber,
        preferredFoot: editingFoot,
        playstyleArchetype: editingArchetype.trim() || undefined,
        signatureCelebration: editingCelebration.trim() || undefined,
        favoriteProClub: editingProClub.trim() || undefined,
        favoriteProPlayer: editingProPlayer.trim() || undefined,
        bootModel: editingBootModel.trim() || undefined,
        personalQuote: editingPersonalQuote.trim() || undefined,
        walkoutSong: editingWalkoutTitle.trim() ? {
          title: editingWalkoutTitle.trim(),
          artist: editingWalkoutArtist.trim(),
          spotifyUrl: editingWalkoutSpotify.trim() || undefined,
        } : undefined,
        stats: {
          ...selectedPlayer.stats,
          matchesPlayed: Number(statMatchesPlayed) || 0,
          goals: Number(statGoals) || 0,
          assists: Number(statAssists) || 0,
          xg: Number(statXg) || 0,
          cleanSheets: Number(statCleanSheets) || 0,
          saves: Number(statSaves) || 0,
          yellowCards: Number(statYellowCards) || 0,
          redCards: Number(statRedCards) || 0,
          motmCount: Number(statMotmCount) || 0,
          dpotmCount: Number(statDpotmCount) || 0,
          averageRating: Number(Number(statAverageRating).toFixed(1)) || 7.5,
          winRate: Number(statWinRate) || 0,
          customStats: customStatsMap,
        },
      };

      await onSavePlayer(updated);
      setSelectedPlayer(updated);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickRevertLoan = async (e: React.MouseEvent, p: PlayerProfile) => {
    e.stopPropagation();
    const updated: PlayerProfile = {
      ...p,
      isTemporaryTransfer: false,
      temporaryTeamId: undefined,
      temporaryTransferNote: undefined,
    };
    await onSavePlayer(updated);
    if (selectedPlayer?.id === p.id) {
      setSelectedPlayer(updated);
      setIsTemporaryTransfer(false);
    }
  };

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsSaving(true);
    try {
      const newP: PlayerProfile = {
        id: "p_" + Date.now(),
        name: newName.trim(),
        teamId: newTeamId,
        jerseyNumber: Number(newJersey) || 10,
        position: newPosition,
        positionDisplay: newPosition,
        stats: {
          matchesPlayed: 0,
          goals: 0,
          assists: 0,
          xg: 0,
          xgPer60: 0,
          goalsPer60: 0,
          assistsPer60: 0,
          cleanSheets: 0,
          saves: 0,
          yellowCards: 0,
          redCards: 0,
          motmCount: 0,
          dpotmCount: 0,
          averageRating: 7.5,
          ratingCount: 0,
          winRate: 0,
          customStats: {},
        },
      };
      await onSavePlayer(newP);
      setNewName("");
      setIsAddingNewPlayer(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#121215] p-4 sm:p-5 rounded-3xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black font-chakra text-white">
              COMMUNITY PLAYER ROSTER
            </h2>
            <p className="text-xs text-zinc-400">
              Complete player cards, customizable stats, custom community metrics, radar traits & squad assignments
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddingNewPlayer(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-chakra font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
        >
          <PlusCircle className="w-4 h-4 text-black stroke-[3]" />
          <span>Add New Player</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search player name, nickname, or position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121215] border border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Position Filter */}
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="bg-[#121215] border border-zinc-800 text-white rounded-2xl px-3 py-2.5 text-xs font-chakra font-bold outline-none cursor-pointer flex-1 sm:flex-initial shadow-sm"
          >
            <option value="ALL">All Positions</option>
            <option value="GK">Goalkeepers (GK)</option>
            <option value="DEF">Defenders (DEF)</option>
            <option value="MID">Midfielders (MID)</option>
            <option value="FWD">Forwards (FWD)</option>
          </select>

          {/* Team Filter */}
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="bg-[#121215] border border-zinc-800 text-white rounded-2xl px-3 py-2.5 text-xs font-chakra font-bold outline-none cursor-pointer flex-1 sm:flex-initial shadow-sm"
          >
            <option value="ALL">All Squads</option>
            {safeTeams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPlayers.map((p) => {
          const effectiveTeamId = p.isTemporaryTransfer && p.temporaryTeamId ? p.temporaryTeamId : p.teamId;
          const currentEffectiveTeam = getTeam(effectiveTeamId);
          const permanentTeam = getTeam(p.teamId);
          const totalCustomStats = Object.values(p.stats?.customStats || {}).reduce((a: number, b: any) => a + Number(b || 0), 0);

          return (
            <div
              key={p.id}
              onClick={() => handleOpenDetail(p)}
              className="bg-[#121215] hover:bg-[#18181c] border border-zinc-800 hover:border-zinc-600 rounded-3xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-lg"
            >
              <div>
                {/* Top Row: Photo/Number & Team/Loan Pill */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="relative w-14 h-14 rounded-2xl bg-zinc-900 border-2 border-zinc-800 overflow-hidden flex items-center justify-center font-chakra font-black text-lg text-white shrink-0 group-hover:scale-105 transition-transform shadow-md">
                    {p.photoUrl ? (
                      <img
                        src={p.photoUrl}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>#{p.jerseyNumber}</span>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-chakra font-bold text-white shadow-xs">
                      <TeamBadge team={currentEffectiveTeam} size="xs" />
                      <span className="truncate max-w-[100px]">{currentEffectiveTeam?.name}</span>
                    </div>

                    {p.isTemporaryTransfer && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-chakra font-bold uppercase">
                        <ArrowRightLeft className="w-2.5 h-2.5 text-amber-400" />
                        Loan from {permanentTeam?.name || "Squad"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Player Name, Nickname & Position */}
                <div>
                  <h3 className="font-chakra font-black text-white text-base truncate flex items-center gap-1.5">
                    {p.name}
                    {p.nickname && (
                      <span className="text-xs font-normal text-zinc-400">"{p.nickname}"</span>
                    )}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 font-sans mt-0.5">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 font-chakra font-bold text-[10px] border border-zinc-800">
                      {p.positionDisplay || p.position}
                    </span>
                    <span>#{p.jerseyNumber}</span>
                    <span>&bull;</span>
                    <span>{p.preferredFoot || "Right"} Foot</span>
                  </div>
                </div>

                {/* Key Stats Bar */}
                <div className="grid grid-cols-4 gap-1.5 bg-zinc-950/80 rounded-2xl p-2.5 border border-zinc-800/80 my-3 text-center">
                  <div>
                    <span className="text-[9px] font-chakra text-zinc-400 block uppercase">GP</span>
                    <span className="font-chakra font-black text-xs text-white">
                      {p.stats?.matchesPlayed || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-chakra text-zinc-400 block uppercase">Goals</span>
                    <span className="font-chakra font-black text-xs text-white">
                      {p.stats?.goals || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-chakra text-zinc-400 block uppercase">Assists</span>
                    <span className="font-chakra font-black text-xs text-white">
                      {p.stats?.assists || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-chakra text-zinc-400 block uppercase">Rating</span>
                    <span className="font-chakra font-black text-xs text-white">
                      {p.stats?.averageRating?.toFixed(1) || "7.5"}
                    </span>
                  </div>
                </div>

                {/* Custom Stats & Traits Pill */}
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-chakra pt-1 border-t border-zinc-800/60">
                  <span className="flex items-center gap-1 text-zinc-300">
                    <Sparkles className="w-3 h-3 text-white" />
                    <span>{totalCustomStats} Custom Stats</span>
                  </span>
                  <span className="text-zinc-500 font-bold group-hover:text-white transition-colors">
                    Edit & Radar &rarr;
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE NEW PLAYER MODAL */}
      {isAddingNewPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121215] border border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-white" />
                <h3 className="font-chakra font-black text-white text-base">Enroll New Player</h3>
              </div>
              <button
                onClick={() => setIsAddingNewPlayer(false)}
                className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlayer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Player Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Squad / Team</label>
                  <select
                    value={newTeamId}
                    onChange={(e) => setNewTeamId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none cursor-pointer"
                  >
                    {safeTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Primary Position</label>
                  <select
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none cursor-pointer"
                  >
                    <option value="GK">GK</option>
                    <option value="DEF">DEF</option>
                    <option value="MID">MID</option>
                    <option value="FWD">FWD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Jersey Number (#)</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={newJersey}
                  onChange={(e) => setNewJersey(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 rounded-2xl bg-white hover:bg-zinc-200 text-black font-chakra font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                {isSaving ? "Enrolling..." : "Enroll Player to Squad"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE PLAYER PROFILE, MODIFIABLE STATS & CUSTOM COMMUNITY STATS MODAL */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#121215] border border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[94vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
            {/* Modal Top Banner */}
            <div className="sticky top-0 z-20 bg-[#121215]/95 backdrop-blur-md border-b border-zinc-800 p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center font-bold overflow-hidden">
                  {editingPhotoUrl ? (
                    <img
                      src={editingPhotoUrl}
                      alt={editingName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-chakra font-black text-sm">#{editingJersey}</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-chakra font-bold text-zinc-400 uppercase tracking-widest block">
                    Player Profile & Data Customizer
                  </span>
                  <h3 className="font-chakra font-black text-white text-base sm:text-lg flex items-center gap-2">
                    {editingName}
                    {editingNickname && (
                      <span className="text-xs text-zinc-400 font-sans">({editingNickname})</span>
                    )}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedPlayer(null);
                  setComparePlayerId("");
                }}
                className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="flex border-b border-zinc-800 bg-zinc-950/60 px-4 pt-2 gap-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setModalTab("traits")}
                className={`px-4 py-2.5 text-xs font-chakra font-black tracking-wider uppercase border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  modalTab === "traits"
                    ? "border-white text-white bg-white/10 rounded-t-xl"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-white" />
                <span>Radar & Tactical Traits</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("identity")}
                className={`px-4 py-2.5 text-xs font-chakra font-black tracking-wider uppercase border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  modalTab === "identity"
                    ? "border-white text-white bg-white/10 rounded-t-xl"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-white" />
                <span>Identity, Photo & Bio</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("stats")}
                className={`px-4 py-2.5 text-xs font-chakra font-black tracking-wider uppercase border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  modalTab === "stats"
                    ? "border-white text-white bg-white/10 rounded-t-xl"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>Official & Community Stats</span>
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* TAB 1: TRAIT RADAR & SUMMARY */}
              {modalTab === "traits" && (
                <div className="space-y-5">
                  <div className="bg-zinc-950/80 rounded-3xl border border-zinc-800 p-4 sm:p-5 flex flex-col items-center justify-center">
                    <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-zinc-800">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-white" />
                        <h4 className="font-chakra font-black text-white text-xs sm:text-sm uppercase tracking-wider">
                          League Relative Skill Pentagon
                        </h4>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Percentile rank vs all league players
                      </span>
                    </div>

                    {/* Compare against another player selector */}
                    <div className="w-full flex items-center justify-between gap-2 mb-4 p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                      <span className="text-[11px] font-chakra font-bold text-zinc-400">
                        Compare with Teammate / Rival:
                      </span>
                      <select
                        value={comparePlayerId}
                        onChange={(e) => setComparePlayerId(e.target.value)}
                        className="bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1 text-xs font-bold text-white outline-none cursor-pointer"
                      >
                        <option value="">-- Solo View --</option>
                        {safePlayers
                          .filter((p) => p.id !== selectedPlayer.id)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.position} &bull; #{p.jerseyNumber})
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Radar Chart */}
                    <PlayerTraitPentagonChart
                      player={selectedPlayer}
                      allPlayers={safePlayers}
                      comparePlayer={
                        comparePlayerId
                          ? safePlayers.find((p) => p.id === comparePlayerId) || null
                          : null
                      }
                      matches={matches}
                      customStats={customStats}
                      size={290}
                      showDetails={true}
                      className="w-full"
                    />
                  </div>

                  {/* Quick Profile Summary Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Walkout Song */}
                    {selectedPlayer.walkoutSong && (
                      <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Music className="w-4 h-4 text-white" />
                          <div>
                            <span className="text-[10px] font-chakra font-bold text-zinc-400 uppercase block">Walkout Anthem</span>
                            <span className="text-xs font-chakra font-black text-white">
                              {selectedPlayer.walkoutSong.title} &bull; {selectedPlayer.walkoutSong.artist}
                            </span>
                          </div>
                        </div>
                        {selectedPlayer.walkoutSong.spotifyUrl && (
                          <a
                            href={selectedPlayer.walkoutSong.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Celebration */}
                    {selectedPlayer.signatureCelebration && (
                      <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-2.5">
                        <Heart className="w-4 h-4 text-rose-400" />
                        <div>
                          <span className="text-[10px] font-chakra font-bold text-zinc-400 uppercase block">Signature Celebration</span>
                          <span className="text-xs font-chakra font-black text-white">
                            {selectedPlayer.signatureCelebration}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: IDENTITY, SQUAD, PHOTO & BIO */}
              {modalTab === "identity" && (
                <div className="space-y-5">
                  {/* Photo Upload & Preview Card */}
                  <div className="bg-zinc-950/80 rounded-3xl border border-zinc-800 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-24 h-24 rounded-2xl bg-zinc-900 border-2 border-zinc-700 overflow-hidden flex items-center justify-center font-chakra font-black text-2xl text-white shrink-0 shadow-lg">
                      {editingPhotoUrl ? (
                        <img
                          src={editingPhotoUrl}
                          alt={editingName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>#{editingJersey}</span>
                      )}
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-2 w-full">
                      <span className="text-xs font-chakra font-bold text-white block uppercase tracking-wider">
                        Player Photo or Custom Avatar
                      </span>
                      <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold cursor-pointer border border-zinc-700">
                          <Camera className="w-3.5 h-3.5 text-white" />
                          <span>Upload Image File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        {editingPhotoUrl && (
                          <button
                            type="button"
                            onClick={() => setEditingPhotoUrl("")}
                            className="text-xs text-rose-400 hover:underline font-semibold cursor-pointer"
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Or paste direct image URL (https://...)"
                        value={editingPhotoUrl}
                        onChange={(e) => setEditingPhotoUrl(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-300 outline-none"
                      />
                    </div>
                  </div>

                  {/* Name & Basic Info */}
                  <div className="bg-zinc-950/80 rounded-3xl border border-zinc-800 p-4 sm:p-5 space-y-4">
                    <h4 className="text-xs font-chakra font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-white" />
                      Core Identity & Positions
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">Nickname</label>
                        <input
                          type="text"
                          placeholder="e.g. The Maestro, El Capitán"
                          value={editingNickname}
                          onChange={(e) => setEditingNickname(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">Primary Position</label>
                        <select
                          value={editingPosition}
                          onChange={(e) => setEditingPosition(e.target.value as any)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none cursor-pointer"
                        >
                          <option value="GK">Goalkeeper (GK)</option>
                          <option value="DEF">Defender (DEF)</option>
                          <option value="MID">Midfielder (MID)</option>
                          <option value="FWD">Forward (FWD)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">Position Display Label</label>
                        <input
                          type="text"
                          placeholder="e.g. FWD / MID, GK / DEF"
                          value={editingPositionDisplay}
                          onChange={(e) => setEditingPositionDisplay(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">Jersey Number</label>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={editingJersey}
                          onChange={(e) => setEditingJersey(Number(e.target.value))}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">Preferred Foot</label>
                        <select
                          value={editingFoot}
                          onChange={(e) => setEditingFoot(e.target.value as any)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none cursor-pointer"
                        >
                          <option value="Right">Right</option>
                          <option value="Left">Left</option>
                          <option value="Both">Both Feet</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">Playstyle Archetype</label>
                        <input
                          type="text"
                          placeholder="e.g. Poacher, Sweeper Keeper, Box-to-Box"
                          value={editingArchetype}
                          onChange={(e) => setEditingArchetype(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Bio / Tactical Strengths</label>
                      <textarea
                        rows={2}
                        value={editingBio}
                        onChange={(e) => setEditingBio(e.target.value)}
                        placeholder="Player background, playstyle, strengths..."
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Squad Assignment & Temporary Loans */}
                  <div className="bg-zinc-950/80 rounded-3xl border border-zinc-800 p-4 sm:p-5 space-y-4">
                    <h4 className="text-xs font-chakra font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Shirt className="w-3.5 h-3.5 text-white" />
                      Squad Assignment & Temporary Transfer (Loans)
                    </h4>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Permanent Squad</label>
                      <select
                        value={editingTeamId}
                        onChange={(e) => setEditingTeamId(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none cursor-pointer"
                      >
                        {safeTeams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-2 border-t border-zinc-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                          <div>
                            <span className="text-xs font-chakra font-bold text-amber-400 block">
                              Temporary Matchday Loan
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              Temporarily transfer player to the opposing squad for upcoming games
                            </span>
                          </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isTemporaryTransfer}
                            onChange={(e) => setIsTemporaryTransfer(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>

                      {isTemporaryTransfer && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-zinc-900 rounded-2xl border border-amber-500/30">
                          <div>
                            <label className="block text-xs font-semibold text-amber-300 mb-1">
                              Loaned to Squad:
                            </label>
                            <select
                              value={temporaryTeamId}
                              onChange={(e) => setTemporaryTeamId(e.target.value)}
                              className="w-full bg-zinc-950 border border-amber-500/50 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none cursor-pointer"
                            >
                              {safeTeams
                                .filter((t) => t.id !== editingTeamId)
                                .map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.name} (Temporary Loan)
                                  </option>
                                ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-zinc-300 mb-1">
                              Loan Note / Reason
                            </label>
                            <input
                              type="text"
                              value={temporaryNote}
                              onChange={(e) => setTemporaryNote(e.target.value)}
                              placeholder="e.g. Covering for missing player"
                              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Personal Flair: Walkout Song & Celebrations */}
                  <div className="bg-zinc-950/80 rounded-3xl border border-zinc-800 p-4 sm:p-5 space-y-3">
                    <h4 className="text-xs font-chakra font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-white" />
                      Walkout Music & Flair
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">Song Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Eye of the Tiger"
                          value={editingWalkoutTitle}
                          onChange={(e) => setEditingWalkoutTitle(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">Artist</label>
                        <input
                          type="text"
                          placeholder="e.g. Survivor"
                          value={editingWalkoutArtist}
                          onChange={(e) => setEditingWalkoutArtist(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">Spotify URL</label>
                        <input
                          type="text"
                          placeholder="https://open.spotify.com/..."
                          value={editingWalkoutSpotify}
                          onChange={(e) => setEditingWalkoutSpotify(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">Signature Celebration</label>
                        <input
                          type="text"
                          placeholder="e.g. Cold Palmer, Siuuu"
                          value={editingCelebration}
                          onChange={(e) => setEditingCelebration(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">Favorite Pro Club</label>
                        <input
                          type="text"
                          placeholder="e.g. Arsenal, Real Madrid"
                          value={editingProClub}
                          onChange={(e) => setEditingProClub(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">Boot Model</label>
                        <input
                          type="text"
                          placeholder="e.g. Nike Mercurial Vapor 16"
                          value={editingBootModel}
                          onChange={(e) => setEditingBootModel(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: OFFICIAL & CUSTOM COMMUNITY STATS MODIFIER */}
              {modalTab === "stats" && (
                <div className="space-y-6">
                  {/* Official League Performance Stats */}
                  <div className="bg-zinc-950/80 rounded-3xl border border-zinc-800 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-white" />
                        <h4 className="font-chakra font-black text-white text-xs sm:text-sm uppercase tracking-wider">
                          Official League Stats Modifier
                        </h4>
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        Directly adjust official tallies & ratings
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Matches Played */}
                      <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
                        <label className="block text-[10px] font-chakra font-bold text-zinc-400 uppercase mb-1">
                          Games Played
                        </label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setStatMatchesPlayed(Math.max(0, statMatchesPlayed - 1))}
                            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={statMatchesPlayed}
                            onChange={(e) => setStatMatchesPlayed(Math.max(0, Number(e.target.value)))}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-1 text-center font-chakra font-black text-sm text-white outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setStatMatchesPlayed(statMatchesPlayed + 1)}
                            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Goals */}
                      <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
                        <label className="block text-[10px] font-chakra font-bold text-zinc-400 uppercase mb-1">
                          Goals Scored
                        </label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setStatGoals(Math.max(0, statGoals - 1))}
                            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={statGoals}
                            onChange={(e) => setStatGoals(Math.max(0, Number(e.target.value)))}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-1 text-center font-chakra font-black text-sm text-white outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setStatGoals(statGoals + 1)}
                            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Assists */}
                      <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
                        <label className="block text-[10px] font-chakra font-bold text-zinc-400 uppercase mb-1">
                          Assists
                        </label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setStatAssists(Math.max(0, statAssists - 1))}
                            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={statAssists}
                            onChange={(e) => setStatAssists(Math.max(0, Number(e.target.value)))}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-1 text-center font-chakra font-black text-sm text-white outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setStatAssists(statAssists + 1)}
                            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* xG */}
                      <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
                        <label className="block text-[10px] font-chakra font-bold text-zinc-400 uppercase mb-1">
                          Expected Goals (xG)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={statXg}
                          onChange={(e) => setStatXg(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-1 px-2 text-center font-chakra font-black text-sm text-white outline-none"
                        />
                      </div>

                      {/* Clean Sheets */}
                      <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
                        <label className="block text-[10px] font-chakra font-bold text-zinc-400 uppercase mb-1">
                          Clean Sheets
                        </label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setStatCleanSheets(Math.max(0, statCleanSheets - 1))}
                            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={statCleanSheets}
                            onChange={(e) => setStatCleanSheets(Math.max(0, Number(e.target.value)))}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-1 text-center font-chakra font-black text-sm text-white outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setStatCleanSheets(statCleanSheets + 1)}
                            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Saves */}
                      <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
                        <label className="block text-[10px] font-chakra font-bold text-zinc-400 uppercase mb-1">
                          Saves Made
                        </label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setStatSaves(Math.max(0, statSaves - 1))}
                            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={statSaves}
                            onChange={(e) => setStatSaves(Math.max(0, Number(e.target.value)))}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-1 text-center font-chakra font-black text-sm text-white outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setStatSaves(statSaves + 1)}
                            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* MOTM */}
                      <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
                        <label className="block text-[10px] font-chakra font-bold text-zinc-400 uppercase mb-1">
                          MOTM Awards
                        </label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setStatMotmCount(Math.max(0, statMotmCount - 1))}
                            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={statMotmCount}
                            onChange={(e) => setStatMotmCount(Math.max(0, Number(e.target.value)))}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-1 text-center font-chakra font-black text-sm text-white outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setStatMotmCount(statMotmCount + 1)}
                            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Average Rating */}
                      <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
                        <label className="block text-[10px] font-chakra font-bold text-zinc-400 uppercase mb-1">
                          Average Rating (1-10)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="10"
                          value={statAverageRating}
                          onChange={(e) => setStatAverageRating(Number(e.target.value))}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-1 px-2 text-center font-chakra font-black text-sm text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Custom Community Stats Modifier */}
                  <div className="bg-zinc-950/80 rounded-3xl border border-zinc-800 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-white" />
                        <div>
                          <h4 className="font-chakra font-black text-white text-xs sm:text-sm uppercase tracking-wider">
                            Custom Community Stats Modifier
                          </h4>
                          <span className="text-[10px] text-zinc-400">
                            Adjust custom metric counts (Nutmegs, Crucial Blocks, Gaffes, etc.) for this player
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAddingNewStatField(!isAddingNewStatField)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-chakra font-bold border border-zinc-700 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>+ Add Stat Field</span>
                      </button>
                    </div>

                    {/* Quick Add Custom Stat Type form */}
                    {isAddingNewStatField && (
                      <form onSubmit={handleAddNewCustomStatToPlayer} className="p-3 bg-zinc-900 rounded-2xl border border-zinc-700 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <input
                            type="text"
                            placeholder="Stat Name (e.g. Rabona Crosses)"
                            value={newStatFieldName}
                            onChange={(e) => setNewStatFieldName(e.target.value)}
                            required
                            className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                          />
                          <select
                            value={newStatFieldCategory}
                            onChange={(e) => setNewStatFieldCategory(e.target.value as any)}
                            className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                          >
                            <option value="attacking">Attacking</option>
                            <option value="defending">Defending</option>
                            <option value="playmaking">Playmaking</option>
                            <option value="fun">Fun / Highlights</option>
                            <option value="goalkeeping">Goalkeeping</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Emoji Icon (e.g. 🪄)"
                            value={newStatFieldIcon}
                            onChange={(e) => setNewStatFieldIcon(e.target.value)}
                            className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                          />
                          <button
                            type="submit"
                            className="py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-chakra font-black text-xs cursor-pointer"
                          >
                            Create & Add
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Custom Stats Grid for this Player */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {customStats.map((stat) => {
                        const count = customStatsMap[stat.id] || 0;
                        return (
                          <div
                            key={stat.id}
                            className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-2"
                          >
                            <div className="truncate flex-1">
                              <div className="font-chakra font-bold text-white text-xs truncate flex items-center gap-1.5">
                                {stat.iconUrl ? (
                                  <img src={stat.iconUrl} alt={stat.name} className="w-4 h-4 object-contain rounded" />
                                ) : (
                                  <span>{stat.iconName || stat.icon || "✨"}</span>
                                )}
                                <span className="truncate">{stat.name}</span>
                              </div>
                              <span className="text-[9px] text-zinc-400 font-mono block uppercase">
                                {stat.category}
                              </span>
                            </div>

                            {/* Counter Controls */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleCustomStatChange(stat.id, count - 1)}
                                className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center font-bold"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={count}
                                onChange={(e) => handleCustomStatChange(stat.id, Number(e.target.value))}
                                className="w-12 bg-zinc-950 border border-zinc-700 rounded-lg py-0.5 text-center font-chakra font-black text-xs text-white outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleCustomStatChange(stat.id, count + 1)}
                                className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center font-bold"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Universal Save Button */}
              <div className="sticky bottom-0 z-20 bg-[#121215]/95 backdrop-blur-md pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full py-3.5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-chakra font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>{isSaving ? "Saving All Player Data..." : "Save All Player Data & Custom Stats"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
