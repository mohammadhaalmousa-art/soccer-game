import React, { useState } from "react";
import { Match, Team, PlayerProfile, CustomStatDefinition, LeagueSeason, LeagueBranding, TeamTableAdjustment, NewsArticle } from "../types";
import { calculateStandings } from "../utils/leagueCalculations";
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  Trash2, 
  Lock, 
  Unlock, 
  Sparkles, 
  Download, 
  Users2, 
  UserPlus,
  RefreshCw,
  Trophy,
  AlertCircle,
  Image as ImageIcon,
  Camera,
  Edit3,
  Sliders,
  Palette,
  Search,
  Minus,
  Plus,
  ArrowRightLeft,
  X,
  Music,
  Shield,
  ShieldCheck,
  Layers,
  Table2,
  RotateCcw,
  FileText,
  Eye,
  EyeOff,
  Key,
  Calendar,
  Award,
  Play,
  Save,
  Newspaper
} from "lucide-react";
import { TeamBadge } from "./TeamBadge";

interface AdminHubViewProps {
  isAdminUnlocked: boolean;
  adminPin: string;
  onUnlockAdmin: (pin: string) => boolean | Promise<boolean>;
  onLockAdmin: () => void;
  onChangeAdminPin?: (newPin: string) => Promise<void> | void;
  matches: Match[];
  teams: Team[];
  players: PlayerProfile[];
  customStats: CustomStatDefinition[];
  activeSeason?: LeagueSeason;
  leagueBranding?: LeagueBranding;
  onSaveLeagueBranding?: (branding: LeagueBranding) => Promise<void>;
  onOpenSeasonConclusion?: () => void;
  onOpenModifyTable?: (team?: Team) => void;
  onSaveTableAdjustments?: (adjustments: Record<string, TeamTableAdjustment>) => Promise<void>;
  onApproveMatch: (matchId: string) => Promise<void>;
  onRejectMatch: (matchId: string) => Promise<void>;
  onSaveCustomStat: (stat: CustomStatDefinition) => Promise<void>;
  onDeleteCustomStat: (statId: string) => Promise<void>;
  onSaveTeam: (team: Team) => Promise<void>;
  onSavePlayer: (player: PlayerProfile) => Promise<void>;
  onDeletePlayer?: (playerId: string) => Promise<void>;
  onOpenMatchDetails: (match: Match) => void;
  onEditMatch?: (match: Match) => void;
  onSaveMatch?: (match: Match) => Promise<void>;
  onDeleteMatch?: (matchId: string) => Promise<void>;
  onOpenSubmitMatch?: () => void;
  onOpenCreateTeam?: () => void;
  onRecalculateAllStats?: () => void;
  news?: NewsArticle[];
  onSaveArticle?: (article: NewsArticle) => Promise<void>;
  onDeleteArticle?: (articleId: string) => Promise<void>;
  onSaveAllAdminData?: () => Promise<boolean>;
}

export const AdminHubView: React.FC<AdminHubViewProps> = ({
  isAdminUnlocked,
  adminPin,
  onUnlockAdmin,
  onLockAdmin,
  onChangeAdminPin,
  matches,
  teams,
  players,
  customStats,
  activeSeason,
  leagueBranding,
  onSaveLeagueBranding,
  onOpenSeasonConclusion,
  onOpenModifyTable,
  onSaveTableAdjustments,
  onApproveMatch,
  onRejectMatch,
  onSaveCustomStat,
  onDeleteCustomStat,
  onSaveTeam,
  onSavePlayer,
  onDeletePlayer,
  onOpenMatchDetails,
  onEditMatch,
  onSaveMatch,
  onDeleteMatch,
  onOpenSubmitMatch,
  onOpenCreateTeam,
  onRecalculateAllStats,
  news = [],
  onSaveArticle,
  onDeleteArticle,
  onSaveAllAdminData,
}) => {
  const [adminTab, setAdminTab] = useState<"overview" | "standings" | "branding" | "teams" | "custom_stats" | "players" | "news" | "security">("overview");
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Master Save All Data state
  const [isSavingAllData, setIsSavingAllData] = useState<boolean>(false);
  const [saveAllSuccess, setSaveAllSuccess] = useState<boolean>(false);
  const [saveAllNotice, setSaveAllNotice] = useState<string | null>(null);

  // News management inside Admin Hub
  const [newsSearch, setNewsSearch] = useState<string>("");
  const [editingAdminArticle, setEditingAdminArticle] = useState<Partial<NewsArticle> | null>(null);
  const [adminArticleTags, setAdminArticleTags] = useState<string>("");
  const [isSavingAdminArticle, setIsSavingAdminArticle] = useState<boolean>(false);

  // Top header actions state
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [recalculateSuccess, setRecalculateSuccess] = useState<boolean>(false);

  // Match management state
  const [matchesFilter, setMatchesFilter] = useState<"all" | "approved" | "pending" | "scheduled">("all");

  // Security tab state
  const [showCurrentPin, setShowCurrentPin] = useState<boolean>(false);
  const [newPinInput, setNewPinInput] = useState<string>("");
  const [confirmPinInput, setConfirmPinInput] = useState<string>("");
  const [pinChangeMessage, setPinChangeMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSavingPin, setIsSavingPin] = useState<boolean>(false);

  // Player Creator state
  const [isCreatingNewPlayer, setIsCreatingNewPlayer] = useState<boolean>(false);

  // League Branding State
  const [leagueName, setLeagueName] = useState<string>(leagueBranding?.leagueName || "COMMUNITY LEAGUE");
  const [seasonTag, setSeasonTag] = useState<string>(leagueBranding?.seasonTag || "SEASON 2026");
  const [leagueLogoUrl, setLeagueLogoUrl] = useState<string>(leagueBranding?.logoUrl || "");
  const [leagueEmoji, setLeagueEmoji] = useState<string>(leagueBranding?.leagueEmoji || "🏆");
  const [isSavingBranding, setIsSavingBranding] = useState<boolean>(false);

  // Custom Stat State
  const [editingStatDef, setEditingStatDef] = useState<CustomStatDefinition | null>(null);
  const [newStatName, setNewStatName] = useState<string>("");
  const [newStatCategory, setNewStatCategory] = useState<CustomStatDefinition["category"]>("attacking");
  const [newStatIcon, setNewStatIcon] = useState<string>("🪄");
  const [newStatIconUrl, setNewStatIconUrl] = useState<string>("");
  const [newStatAwardTitle, setNewStatAwardTitle] = useState<string>("");
  const [isAddingStat, setIsAddingStat] = useState<boolean>(false);

  // Team Edit State
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamNameInput, setTeamNameInput] = useState<string>("");
  const [teamShortNameInput, setTeamShortNameInput] = useState<string>("");
  const [teamEmojiInput, setTeamEmojiInput] = useState<string>("");
  const [teamLogoUrlInput, setTeamLogoUrlInput] = useState<string>("");
  const [teamColorInput, setTeamColorInput] = useState<string>("#3b82f6");

  // Player Master Edit State
  const [playerSearch, setPlayerSearch] = useState<string>("");
  const [editingPlayer, setEditingPlayer] = useState<PlayerProfile | null>(null);
  const [editPlayerName, setEditPlayerName] = useState<string>("");
  const [editPlayerNickname, setEditPlayerNickname] = useState<string>("");
  const [editPlayerPosition, setEditPlayerPosition] = useState<PlayerProfile["position"]>("MID");
  const [editPlayerPositionDisplay, setEditPlayerPositionDisplay] = useState<string>("");
  const [editPlayerJersey, setEditPlayerJersey] = useState<number>(10);
  const [editPlayerTeamId, setEditPlayerTeamId] = useState<string>("");
  const [editPlayerFoot, setEditPlayerFoot] = useState<PlayerProfile["preferredFoot"]>("Right");
  const [editPlayerPhotoUrl, setEditPlayerPhotoUrl] = useState<string>("");
  const [editPlayerBio, setEditPlayerBio] = useState<string>("");
  const [editPlayerArchetype, setEditPlayerArchetype] = useState<string>("");
  const [editPlayerCelebration, setEditPlayerCelebration] = useState<string>("");
  const [editPlayerProClub, setEditPlayerProClub] = useState<string>("");
  const [editPlayerProPlayer, setEditPlayerProPlayer] = useState<string>("");
  const [editPlayerBootModel, setEditPlayerBootModel] = useState<string>("");
  const [editPlayerSongTitle, setEditPlayerSongTitle] = useState<string>("");
  const [editPlayerSongArtist, setEditPlayerSongArtist] = useState<string>("");
  const [editPlayerSongSpotify, setEditPlayerSongSpotify] = useState<string>("");
  const [editPlayerIsLoan, setEditPlayerIsLoan] = useState<boolean>(false);
  const [editPlayerLoanTeamId, setEditPlayerLoanTeamId] = useState<string>("");
  const [editPlayerLoanNote, setEditPlayerLoanNote] = useState<string>("");

  // Modifiable Official Stats
  const [pStatMatches, setPStatMatches] = useState<number>(0);
  const [pStatGoals, setPStatGoals] = useState<number>(0);
  const [pStatAssists, setPStatAssists] = useState<number>(0);
  const [pStatXg, setPStatXg] = useState<number>(0);
  const [pStatCleanSheets, setPStatCleanSheets] = useState<number>(0);
  const [pStatSaves, setPStatSaves] = useState<number>(0);
  const [pStatYellows, setPStatYellows] = useState<number>(0);
  const [pStatReds, setPStatReds] = useState<number>(0);
  const [pStatMotm, setPStatMotm] = useState<number>(0);
  const [pStatRating, setPStatRating] = useState<number>(7.5);

  // Modifiable Custom Stats for Player
  const [playerCustomStatsRecord, setPlayerCustomStatsRecord] = useState<Record<string, number>>({});
  const [playerMatchAppearances, setPlayerMatchAppearances] = useState<Record<string, boolean>>({});
  const [isManualOverrideActive, setIsManualOverrideActive] = useState<boolean>(true);
  const [isSavingPlayer, setIsSavingPlayer] = useState<boolean>(false);

  const safeMatches = matches || [];
  const safeTeams = teams || [];
  const safePlayers = players || [];
  const safeCustomStats = customStats || [];

  // Filter pending matches
  const pendingMatches = safeMatches.filter((m) => m.status === "PENDING_APPROVAL");

  const getTeam = (teamId: string) => safeTeams.find((t) => t.id === teamId);

  const handlePinSubmit = async (e?: React.FormEvent, directPin?: string) => {
    if (e) e.preventDefault();
    setPinError(null);
    const targetPin = directPin !== undefined ? directPin : pinInput;
    try {
      const success = await onUnlockAdmin(targetPin);
      if (!success) {
        setPinError("Incorrect Admin Password. Try 'gamesoccer4321' or 'admin'.");
      } else {
        setPinInput("");
        setPinError(null);
      }
    } catch {
      setPinError("Error validating password. Please try again.");
    }
  };

  const handleQuickUnlockDefault = async () => {
    setPinInput("gamesoccer4321");
    setPinError(null);
    await handlePinSubmit(undefined, "gamesoccer4321");
  };

  const handleTriggerRecalculate = () => {
    if (!onRecalculateAllStats) return;
    setIsRecalculating(true);
    setRecalculateSuccess(false);
    try {
      onRecalculateAllStats();
      setRecalculateSuccess(true);
      setTimeout(() => setRecalculateSuccess(false), 3000);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeMessage(null);
    if (!newPinInput.trim()) {
      setPinChangeMessage({ type: "error", text: "New password cannot be blank." });
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinChangeMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    setIsSavingPin(true);
    try {
      if (onChangeAdminPin) {
        await onChangeAdminPin(newPinInput.trim());
        setPinChangeMessage({ type: "success", text: "Commissioner password successfully updated!" });
        setNewPinInput("");
        setConfirmPinInput("");
      }
    } catch {
      setPinChangeMessage({ type: "error", text: "Failed to update password." });
    } finally {
      setIsSavingPin(false);
    }
  };

  const handleDeleteMatchClick = async (matchId: string, matchTitle: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${matchTitle}"? Official standings and player stats will adjust accordingly.`)) {
      if (onDeleteMatch) {
        await onDeleteMatch(matchId);
      }
    }
  };

  const handleDeletePlayerClick = async (playerId: string, playerName: string) => {
    if (window.confirm(`Are you sure you want to permanently remove player "${playerName}" from the league registry? This action cannot be undone.`)) {
      if (onDeletePlayer) {
        await onDeletePlayer(playerId);
        if (editingPlayer?.id === playerId) {
          setEditingPlayer(null);
        }
      }
    }
  };

  const handleOpenCreatePlayerModal = () => {
    setIsCreatingNewPlayer(true);
    const newId = "p_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
    const blankPlayer: PlayerProfile = {
      id: newId,
      name: "",
      teamId: safeTeams[0]?.id || "team_blue",
      jerseyNumber: 10,
      position: "MID",
      positionDisplay: "MID",
      preferredFoot: "Right",
      photoUrl: "",
      bio: "",
      stats: {
        matchesPlayed: 0,
        goals: 0,
        assists: 0,
        xg: 0,
        xgPer60: 0,
        goalsPer60: 0,
        assistsPer60: 0,
        yellowCards: 0,
        redCards: 0,
        cleanSheets: 0,
        saves: 0,
        motmCount: 0,
        dpotmCount: 0,
        averageRating: 7.5,
        ratingCount: 0,
        winRate: 0,
        customStats: {},
      },
      manualStatsOverride: true,
    };
    handleOpenPlayerMasterEdit(blankPlayer);
  };

  const handleSaveLeagueBrandingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBranding(true);
    try {
      const updated: LeagueBranding = {
        leagueName: leagueName.trim() || "COMMUNITY LEAGUE",
        seasonTag: seasonTag.trim() || "SEASON 2026",
        logoUrl: leagueLogoUrl.trim() || undefined,
        leagueEmoji: leagueEmoji.trim() || "🏆",
      };
      if (onSaveLeagueBranding) {
        await onSaveLeagueBranding(updated);
      }
      localStorage.setItem("soccer_custom_league_branding", JSON.stringify(updated));
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleLeagueLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setLeagueLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTeamLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setTeamLogoUrlInput(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStatIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setNewStatIconUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlayerPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setEditPlayerPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenEditTeam = (t: Team) => {
    setEditingTeam(t);
    setTeamNameInput(t.name);
    setTeamShortNameInput(t.shortName);
    setTeamEmojiInput(t.badgeEmoji);
    setTeamLogoUrlInput(t.logoUrl || "");
    setTeamColorInput(t.primaryColor || "#3b82f6");
  };

  const handleSaveTeamModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    const updated: Team = {
      ...editingTeam,
      name: teamNameInput.trim() || editingTeam.name,
      shortName: teamShortNameInput.trim() || editingTeam.shortName,
      badgeEmoji: teamEmojiInput.trim() || editingTeam.badgeEmoji,
      logoUrl: teamLogoUrlInput.trim() || undefined,
      primaryColor: teamColorInput,
    };
    await onSaveTeam(updated);
    setEditingTeam(null);
  };

  const handleCreateOrUpdateCustomStat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatName.trim()) return;

    const id = editingStatDef ? editingStatDef.id : newStatName.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now().toString().slice(-4);
    const stat: CustomStatDefinition = {
      id,
      name: newStatName.trim(),
      category: newStatCategory,
      iconName: newStatIcon,
      icon: newStatIcon,
      iconUrl: newStatIconUrl.trim() || undefined,
      awardTitle: newStatAwardTitle.trim() || `${newStatName.trim()} Master 🏆`,
    };

    await onSaveCustomStat(stat);
    setNewStatName("");
    setNewStatAwardTitle("");
    setNewStatIconUrl("");
    setEditingStatDef(null);
    setIsAddingStat(false);
  };

  const handleOpenEditStatDef = (stat: CustomStatDefinition) => {
    setEditingStatDef(stat);
    setNewStatName(stat.name);
    setNewStatCategory(stat.category);
    setNewStatIcon(stat.iconName || stat.icon || "🪄");
    setNewStatIconUrl(stat.iconUrl || "");
    setNewStatAwardTitle(stat.awardTitle || "");
    setIsAddingStat(true);
  };

  const handleOpenPlayerMasterEdit = (p: PlayerProfile) => {
    setEditingPlayer(p);
    setEditPlayerName(p.name || "");
    setEditPlayerNickname(p.nickname || "");
    setEditPlayerPosition(p.position || "MID");
    setEditPlayerPositionDisplay(p.positionDisplay || p.position || "MID");
    setEditPlayerJersey(p.jerseyNumber || 10);
    setEditPlayerTeamId(p.teamId || teams[0]?.id || "team_blue");
    setEditPlayerFoot(p.preferredFoot || "Right");
    setEditPlayerPhotoUrl(p.photoUrl || "");
    setEditPlayerBio(p.bio || "");
    setEditPlayerArchetype(p.playstyleArchetype || "");
    setEditPlayerCelebration(p.signatureCelebration || "");
    setEditPlayerProClub(p.favoriteProClub || "");
    setEditPlayerProPlayer(p.favoriteProPlayer || "");
    setEditPlayerBootModel(p.bootModel || "");
    setEditPlayerSongTitle(p.walkoutSong?.title || "");
    setEditPlayerSongArtist(p.walkoutSong?.artist || "");
    setEditPlayerSongSpotify(p.walkoutSong?.spotifyUrl || "");
    setEditPlayerIsLoan(!!p.isTemporaryTransfer);
    setEditPlayerLoanTeamId(p.temporaryTeamId || (p.teamId === "team_blue" ? "team_red" : "team_blue"));
    setEditPlayerLoanNote(p.temporaryTransferNote || "");

    const st = p.stats || ({} as any);
    setPStatMatches(st.matchesPlayed ?? 0);
    setPStatGoals(st.goals ?? 0);
    setPStatAssists(st.assists ?? 0);
    setPStatXg(st.xg ?? 0);
    setPStatCleanSheets(st.cleanSheets ?? 0);
    setPStatSaves(st.saves ?? 0);
    setPStatYellows(st.yellowCards ?? 0);
    setPStatReds(st.redCards ?? 0);
    setPStatMotm(st.motmCount ?? 0);
    setPStatRating(st.averageRating ?? 7.5);
    setPlayerCustomStatsRecord({ ...(st.customStats || {}) });

    setIsManualOverrideActive(p.manualStatsOverride !== false);

    // Initialize which games this player played
    const appearances: Record<string, boolean> = {};
    safeMatches.filter((m) => m.status === "APPROVED").forEach((m) => {
      if (Array.isArray(m.playedPlayerIds)) {
        appearances[m.id] = m.playedPlayerIds.includes(p.id);
      } else {
        const isStarter =
          m.lineups?.home?.starters?.includes(p.id) ||
          m.lineups?.away?.starters?.includes(p.id);
        const isSub =
          m.lineups?.home?.subs?.includes(p.id) ||
          m.lineups?.away?.subs?.includes(p.id);
        const hasEvents = (m.events || []).some(
          (e: any) => e.playerId === p.id || e.assistPlayerId === p.id
        );
        appearances[m.id] = Boolean(isStarter || isSub || hasEvents);
      }
    });
    setPlayerMatchAppearances(appearances);
  };

  const handleTogglePlayerMatchAppearance = async (matchId: string) => {
    const current = !!playerMatchAppearances[matchId];
    const next = !current;
    const nextRecord = { ...playerMatchAppearances, [matchId]: next };
    setPlayerMatchAppearances(nextRecord);

    const count = Object.values(nextRecord).filter(Boolean).length;
    setPStatMatches(count);

    if (onSaveMatch && editingPlayer) {
      const targetMatch = safeMatches.find((m) => m.id === matchId);
      if (targetMatch) {
        let currentPlayed = Array.isArray(targetMatch.playedPlayerIds)
          ? [...targetMatch.playedPlayerIds]
          : [
              ...(targetMatch.lineups?.home?.starters || []),
              ...(targetMatch.lineups?.home?.subs || []),
              ...(targetMatch.lineups?.away?.starters || []),
              ...(targetMatch.lineups?.away?.subs || []),
            ];
        if (next) {
          if (!currentPlayed.includes(editingPlayer.id)) currentPlayed.push(editingPlayer.id);
        } else {
          currentPlayed = currentPlayed.filter((id) => id !== editingPlayer.id);
        }
        await onSaveMatch({
          ...targetMatch,
          playedPlayerIds: currentPlayed,
        });
      }
    }
  };

  const handleSavePlayerMaster = async () => {
    if (!editingPlayer) return;
    setIsSavingPlayer(true);
    try {
      const updated: PlayerProfile = {
        ...editingPlayer,
        name: editPlayerName.trim() || editingPlayer.name,
        nickname: editPlayerNickname.trim() || undefined,
        position: editPlayerPosition,
        positionDisplay: editPlayerPositionDisplay.trim() || editPlayerPosition,
        jerseyNumber: Number(editPlayerJersey) || editingPlayer.jerseyNumber,
        teamId: editPlayerTeamId,
        preferredFoot: editPlayerFoot,
        photoUrl: editPlayerPhotoUrl,
        bio: editPlayerBio,
        playstyleArchetype: editPlayerArchetype.trim() || undefined,
        signatureCelebration: editPlayerCelebration.trim() || undefined,
        favoriteProClub: editPlayerProClub.trim() || undefined,
        favoriteProPlayer: editPlayerProPlayer.trim() || undefined,
        bootModel: editPlayerBootModel.trim() || undefined,
        isTemporaryTransfer: editPlayerIsLoan,
        temporaryTeamId: editPlayerIsLoan ? editPlayerLoanTeamId : undefined,
        temporaryTransferNote: editPlayerIsLoan ? editPlayerLoanNote.trim() : undefined,
        walkoutSong: editPlayerSongTitle.trim() ? {
          title: editPlayerSongTitle.trim(),
          artist: editPlayerSongArtist.trim(),
          spotifyUrl: editPlayerSongSpotify.trim() || undefined,
        } : undefined,
        manualStatsOverride: isManualOverrideActive,
        stats: {
          ...editingPlayer.stats,
          matchesPlayed: Number(pStatMatches) || 0,
          goals: Number(pStatGoals) || 0,
          assists: Number(pStatAssists) || 0,
          xg: Number(pStatXg) || 0,
          cleanSheets: Number(pStatCleanSheets) || 0,
          saves: Number(pStatSaves) || 0,
          yellowCards: Number(pStatYellows) || 0,
          redCards: Number(pStatReds) || 0,
          motmCount: Number(pStatMotm) || 0,
          averageRating: Number(Number(pStatRating).toFixed(1)) || 7.5,
          customStats: playerCustomStatsRecord,
          isManualOverride: isManualOverrideActive,
        },
      };

      await onSavePlayer(updated);
      setEditingPlayer(null);
    } finally {
      setIsSavingPlayer(false);
    }
  };

  const handleDownloadBackup = () => {
    const backupData = {
      branding: {
        leagueName,
        seasonTag,
        logoUrl: leagueLogoUrl,
        leagueEmoji,
      },
      teams: safeTeams,
      players: safePlayers,
      customStats: safeCustomStats,
      matches: safeMatches,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `community_league_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // LOCKED STATE: Require PIN
  if (!isAdminUnlocked) {
    return (
      <div className="max-w-md mx-auto my-12 bg-[#121215] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-white mx-auto flex items-center justify-center shadow-lg">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-black font-chakra text-white tracking-wide">COMMISSIONER HUB</h2>
          <p className="text-xs text-zinc-400">
            Enter the league administrative password to manage match approvals, customize branding, adjust standings, and modify player rosters.
          </p>
        </div>

        <form onSubmit={(e) => handlePinSubmit(e)} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-chakra font-bold text-zinc-300 uppercase">
                Admin Password
              </label>
              <span className="hidden text-[11px] text-zinc-400 font-mono">
                Default: <span className="text-white font-bold">gamesoccer4321</span> or <span className="text-white font-bold">admin</span>
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password..."
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (pinError) setPinError(null);
                }}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-white text-center font-mono tracking-widest pr-10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pinError && (
              <p className="text-xs text-rose-400 font-semibold mt-1.5 text-center flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{pinError}</span>
              </p>
            )}
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-chakra font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              <span>UNLOCK COMMISSIONER HUB</span>
            </button>

            <button
              type="button"
              onClick={handleQuickUnlockDefault}
              className="w-full py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white font-chakra font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Auto-Fill & Unlock (Default Password)</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  const handleSaveAllData = async () => {
    if (!onSaveAllAdminData) return;
    setIsSavingAllData(true);
    setSaveAllSuccess(false);
    setSaveAllNotice(null);
    try {
      const ok = await onSaveAllAdminData();
      if (ok) {
        setSaveAllSuccess(true);
        setSaveAllNotice("All modifications (teams, players, standings, branding, news) saved successfully to server disk & local storage!");
        setTimeout(() => {
          setSaveAllSuccess(false);
        }, 5000);
      } else {
        setSaveAllNotice("Failed to save modifications to server. Please try again.");
      }
    } catch (err) {
      console.error("Save all admin data error:", err);
      setSaveAllNotice("Error saving modifications.");
    } finally {
      setIsSavingAllData(false);
    }
  };

  const handleSaveAdminArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdminArticle || !editingAdminArticle.title?.trim() || !editingAdminArticle.content?.trim()) {
      alert("Please provide both an article title and content.");
      return;
    }
    if (!onSaveArticle) return;
    setIsSavingAdminArticle(true);
    try {
      const parsedTags = adminArticleTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const articleToSave: NewsArticle = {
        id: editingAdminArticle.id || "news_" + Date.now(),
        title: editingAdminArticle.title.trim(),
        subtitle: editingAdminArticle.subtitle?.trim() || "",
        content: editingAdminArticle.content.trim(),
        category: (editingAdminArticle.category as any) || "STORYLINE",
        author: editingAdminArticle.author?.trim() || "League Admin",
        publishedAt: editingAdminArticle.publishedAt || new Date().toISOString(),
        imageUrl: editingAdminArticle.imageUrl?.trim() || undefined,
        tags: parsedTags.length > 0 ? parsedTags : ["News"],
        isPinned: Boolean(editingAdminArticle.isPinned),
      };

      await onSaveArticle(articleToSave);
      setEditingAdminArticle(null);
      setSaveAllNotice(`Article "${articleToSave.title}" saved successfully!`);
      setTimeout(() => setSaveAllNotice(null), 4000);
    } catch (err) {
      console.error("Error saving article:", err);
      alert("Failed to save article.");
    } finally {
      setIsSavingAdminArticle(false);
    }
  };

  // UNLOCKED STATE: Comprehensive Dashboard
  return (
    <div className="space-y-6">
      {/* Top Banner & Commissioner Control Bar */}
      <div className="bg-[#121215] p-4 sm:p-5 rounded-3xl border border-zinc-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center font-bold relative shrink-0">
            <Unlock className="w-5 h-5 text-emerald-400" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-zinc-950 rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black font-chakra text-white">
                COMMISSIONER & ADMIN HUB
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-chakra font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active Session
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              League branding, match queue, official table points, team crests, player master records, and metrics
            </p>
          </div>
        </div>

        {/* Quick Diagnostics & Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
          {onSaveAllAdminData && (
            <button
              onClick={handleSaveAllData}
              disabled={isSavingAllData}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-chakra font-black tracking-wide transition-all shadow-md cursor-pointer ${
                saveAllSuccess
                  ? "bg-emerald-500 text-black border border-emerald-400"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40"
              }`}
              title="Save all data that Admin modified directly to server disk & permanent storage"
            >
              <Save className={`w-3.5 h-3.5 ${isSavingAllData ? "animate-spin" : ""}`} />
              <span>{saveAllSuccess ? "✓ All Data Saved!" : isSavingAllData ? "Saving All Data..." : "Save All Modified Data"}</span>
            </button>
          )}

          {onRecalculateAllStats && (
            <button
              onClick={handleTriggerRecalculate}
              disabled={isRecalculating}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white text-xs font-chakra font-bold transition-colors cursor-pointer"
              title="Recalculate all player statistics and appearances across approved games"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? "animate-spin text-cyan-400" : ""}`} />
              <span>{recalculateSuccess ? "Stats Synced!" : "Recalculate Stats"}</span>
            </button>
          )}

          <button
            onClick={handleDownloadBackup}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white text-xs font-chakra font-bold transition-colors cursor-pointer"
            title="Download full league backup JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          <button
            onClick={onLockAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-rose-950/40 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-chakra font-bold transition-colors cursor-pointer"
            title="Lock administrative session"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Admin</span>
          </button>
        </div>
      </div>

      {/* Save Notification / Alert Banner */}
      {saveAllNotice && (
        <div className={`p-4 rounded-2xl border text-xs font-chakra font-bold flex items-center justify-between gap-3 shadow-md ${
          saveAllSuccess || saveAllNotice.includes("successfully")
            ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-300"
            : "bg-rose-950/50 border-rose-500/50 text-rose-300"
        }`}>
          <div className="flex items-center gap-2.5">
            {saveAllSuccess || saveAllNotice.includes("successfully") ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{saveAllNotice}</span>
          </div>
          <button onClick={() => setSaveAllNotice(null)} className="text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-zinc-800 bg-[#121215] rounded-3xl p-1.5 gap-1.5 overflow-x-auto no-scrollbar shadow-lg">
        <button
          onClick={() => setAdminTab("overview")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-2xl text-xs font-chakra font-black tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
            adminTab === "overview"
              ? "bg-white text-black shadow-md"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Matches & Queue {pendingMatches.length > 0 && `(${pendingMatches.length})`}</span>
        </button>

        <button
          onClick={() => setAdminTab("standings")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-2xl text-xs font-chakra font-black tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
            adminTab === "standings"
              ? "bg-white text-black shadow-md"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <Table2 className="w-4 h-4" />
          <span>Standings & Points</span>
        </button>

        <button
          onClick={() => setAdminTab("branding")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-2xl text-xs font-chakra font-black tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
            adminTab === "branding"
              ? "bg-white text-black shadow-md"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Branding & Logo</span>
        </button>

        <button
          onClick={() => setAdminTab("teams")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-2xl text-xs font-chakra font-black tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
            adminTab === "teams"
              ? "bg-white text-black shadow-md"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Teams ({safeTeams.length})</span>
        </button>

        <button
          onClick={() => setAdminTab("custom_stats")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-2xl text-xs font-chakra font-black tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
            adminTab === "custom_stats"
              ? "bg-white text-black shadow-md"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Custom Stats ({safeCustomStats.length})</span>
        </button>

        <button
          onClick={() => setAdminTab("players")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-2xl text-xs font-chakra font-black tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
            adminTab === "players"
              ? "bg-white text-black shadow-md"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <Users2 className="w-4 h-4" />
          <span>Player Master ({safePlayers.length})</span>
        </button>

        <button
          onClick={() => setAdminTab("news")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-2xl text-xs font-chakra font-black tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
            adminTab === "news"
              ? "bg-white text-black shadow-md"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>News & Media ({news.length})</span>
        </button>

        <button
          onClick={() => setAdminTab("security")}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-2xl text-xs font-chakra font-black tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
            adminTab === "security"
              ? "bg-white text-black shadow-md"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Security & PIN</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & PENDING MATCH QUEUE */}
      {adminTab === "overview" && (
        <div className="space-y-6">
          {/* Season Conclusion Action Banner */}
          {onOpenSeasonConclusion && (
            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-white text-black text-[10px] font-chakra font-black uppercase">
                    COMMISSIONER
                  </span>
                  <span className="text-xs text-zinc-300 font-bold">
                    {activeSeason?.status === "archived" ? "Season Concluded & Awards Archived" : "Season Active"}
                  </span>
                </div>
                <h3 className="text-lg font-black font-chakra text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-white" />
                  Official Season Conclusion & Grand Awards Ceremony
                </h3>
                <p className="text-xs text-zinc-400">
                  Calculate official champions, crown the MVP, Golden Glove, Golden Boot, and distribute seasonal accolades.
                </p>
              </div>

              <button
                onClick={onOpenSeasonConclusion}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-zinc-200 text-black font-chakra font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
              >
                <Trophy className="w-4 h-4 text-black" />
                <span>{activeSeason?.status === "archived" ? "View Grand Awards" : "End Season & Conclude"}</span>
              </button>
            </div>
          )}

          {/* Pending Matches Queue */}
          <div className="bg-[#121215] rounded-3xl border border-zinc-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-white" />
                <h3 className="font-chakra font-black text-white text-base">
                  PENDING MATCH SUBMISSIONS ({pendingMatches.length})
                </h3>
              </div>
              <span className="text-xs text-zinc-400">
                {pendingMatches.length === 0 ? "All verified" : "Awaiting approval"}
              </span>
            </div>

            {pendingMatches.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-white/60" />
                <span>No pending match submissions right now. All games are approved and synced!</span>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingMatches.map((m) => {
                  const home = getTeam(m.homeTeamId);
                  const away = getTeam(m.awayTeamId);

                  return (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-chakra font-bold text-white text-sm">{m.title}</span>
                          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] font-chakra font-bold">
                            Submitted by {m.submittedBy}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-300 font-chakra font-semibold flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <TeamBadge team={home} size="xs" />
                            <span>{home?.name}</span>
                          </div>
                          <strong className="text-white text-sm font-mono">
                            {m.homeScore} - {m.awayScore}
                          </strong>
                          <div className="flex items-center gap-1.5">
                            <TeamBadge team={away} size="xs" />
                            <span>{away?.name}</span>
                          </div>
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          Date: {m.date} &bull; {(m.events || []).length} match events recorded
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => onOpenMatchDetails(m)}
                          className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-chakra font-bold transition-colors cursor-pointer border border-zinc-800"
                        >
                          Review Details
                        </button>
                        <button
                          onClick={() => onApproveMatch(m.id)}
                          className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-chakra font-black transition-all shadow-md cursor-pointer"
                        >
                          Approve Result
                        </button>
                        <button
                          onClick={() => onRejectMatch(m.id)}
                          className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs cursor-pointer"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ALL MATCH RECORDS & RESULTS MANAGEMENT */}
          <div className="bg-[#121215] rounded-3xl border border-zinc-800 p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-white" />
                <div>
                  <h3 className="font-chakra font-black text-white text-base">
                    ALL MATCH RECORDS ({safeMatches.length})
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Review, edit player performance stats, or manage all historical and upcoming games
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {onOpenSubmitMatch && (
                  <button
                    onClick={onOpenSubmitMatch}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-chakra font-black shadow-md cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4 text-black" />
                    <span>Record New Game</span>
                  </button>
                )}

                <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[11px] font-chakra font-bold">
                  <button
                    type="button"
                    onClick={() => setMatchesFilter("all")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      matchesFilter === "all" ? "bg-white text-black font-black" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    All ({safeMatches.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatchesFilter("approved")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      matchesFilter === "approved" ? "bg-white text-black font-black" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Approved ({safeMatches.filter(m => m.status === "APPROVED").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatchesFilter("pending")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      matchesFilter === "pending" ? "bg-white text-black font-black" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Pending ({safeMatches.filter(m => m.status === "PENDING_APPROVAL").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatchesFilter("scheduled")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      matchesFilter === "scheduled" ? "bg-white text-black font-black" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Scheduled ({safeMatches.filter(m => m.status === "SCHEDULED").length})
                  </button>
                </div>
              </div>
            </div>

            {/* Match List */}
            <div className="space-y-3">
              {safeMatches
                .filter(m => {
                  if (matchesFilter === "approved") return m.status === "APPROVED";
                  if (matchesFilter === "pending") return m.status === "PENDING_APPROVAL";
                  if (matchesFilter === "scheduled") return m.status === "SCHEDULED";
                  return true;
                })
                .map(m => {
                  const home = getTeam(m.homeTeamId);
                  const away = getTeam(m.awayTeamId);
                  const isApproved = m.status === "APPROVED";
                  const isPending = m.status === "PENDING_APPROVAL";

                  return (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-chakra font-black text-white text-sm">
                            {m.title || (m.gameNumber ? `Soccer Game #${m.gameNumber}` : "Match")}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-chakra font-bold ${
                              isApproved
                                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                : isPending
                                ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                                : "bg-blue-500/10 border border-blue-500/30 text-blue-300"
                            }`}
                          >
                            {m.status}
                          </span>
                          {m.date && (
                            <span className="text-[11px] text-zinc-500 font-mono">
                              {m.date}
                            </span>
                          )}
                          {m.venue && (
                            <span className="text-[11px] text-zinc-500">
                              &bull; {m.venue}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-zinc-300 font-chakra font-semibold flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <TeamBadge team={home} size="xs" />
                            <span>{home?.name}</span>
                          </div>
                          <strong className="text-white text-base font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                            {m.homeScore} - {m.awayScore}
                          </strong>
                          <div className="flex items-center gap-1.5">
                            <TeamBadge team={away} size="xs" />
                            <span>{away?.name}</span>
                          </div>
                          {m.penaltyShootout?.isShootout && (
                            <span className="text-[11px] font-chakra font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30">
                              PK Shootout: {m.penaltyShootout.homeScore} - {m.penaltyShootout.awayScore}
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                          <span>{(m.events || []).length} match events</span>
                          &bull;
                          <span>
                            {Array.isArray(m.playedPlayerIds)
                              ? `${m.playedPlayerIds.length} players recorded`
                              : "Squad rosters recorded"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                        {onEditMatch && (
                          <button
                            type="button"
                            onClick={() => onEditMatch(m)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-chakra font-bold transition-colors cursor-pointer"
                            title="Edit Match Stats & Events"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Game</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onOpenMatchDetails(m)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-chakra font-bold transition-colors cursor-pointer"
                          title="Open Match Details"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteMatchClick(m.id, m.title || "Match")}
                          className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs transition-colors cursor-pointer"
                          title="Delete Match Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

              {safeMatches.length === 0 && (
                <div className="text-center py-8 text-zinc-500 text-xs flex flex-col items-center gap-2">
                  <Calendar className="w-8 h-8 text-zinc-600" />
                  <span>No matches on record yet. Click "Record New Game" to register your first match!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: STANDINGS & POINTS DEDUCTIONS / OVERRIDES */}
      {adminTab === "standings" && (
        <div className="bg-[#121215] rounded-3xl border border-zinc-800 p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Table2 className="w-5 h-5 text-white" />
                <h3 className="font-chakra font-black text-white text-base">
                  LEAGUE TABLE STANDINGS & POINT ADJUSTMENTS
                </h3>
              </div>
              <p className="text-xs text-zinc-400">
                Apply point deductions, disciplinary penalties, bonus points, or full manual overrides to official standings.
              </p>
            </div>

            {onOpenModifyTable && (
              <button
                type="button"
                onClick={() => onOpenModifyTable()}
                className="px-4 py-2.5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-chakra font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
              >
                <Sliders className="w-4 h-4 text-black" />
                <span>Open Full Modifier Modal</span>
              </button>
            )}
          </div>

          {/* Standings Summary Table */}
          {(() => {
            const standings = calculateStandings(safeTeams, safeMatches, activeSeason?.tableAdjustments);

            return (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-chakra font-bold text-zinc-400 uppercase tracking-wider">
                      <th className="py-3 px-3 w-10 text-center">#</th>
                      <th className="py-3 px-3">Team</th>
                      <th className="py-3 px-2 text-center w-10" title="Played">P</th>
                      <th className="py-3 px-2 text-center w-10 text-white" title="Wins (3 pts)">W</th>
                      <th className="py-3 px-2 text-center w-10 text-cyan-400" title="Penalty Wins (2 pts)">PW</th>
                      <th className="py-3 px-2 text-center w-10" title="Draws (1 pt)">D</th>
                      <th className="py-3 px-2 text-center w-10 text-zinc-400" title="Losses (0 pts)">L</th>
                      <th className="py-3 px-2 text-center w-12">GD</th>
                      <th className="py-3 px-3 text-center w-16 text-white bg-zinc-900/60 font-black">PTS</th>
                      <th className="py-3 px-3">Adjustment Status</th>
                      <th className="py-3 px-3 text-center w-40">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-xs">
                    {standings.map((row, idx) => {
                      const origTeam = safeTeams.find((t) => t.id === row.teamId);
                      const currentAdj = activeSeason?.tableAdjustments?.[row.teamId];
                      const hasAdj = !!currentAdj && (
                        (typeof currentAdj.pointsAdjustment === "number" && currentAdj.pointsAdjustment !== 0) ||
                        currentAdj.overrideEnabled
                      );

                      const handleQuickPointChange = async (delta: number) => {
                        if (!onSaveTableAdjustments) return;
                        const existing = activeSeason?.tableAdjustments || {};
                        const currentTeamAdj = existing[row.teamId] || {};
                        const newPtsAdj = (currentTeamAdj.pointsAdjustment || 0) + delta;
                        
                        const updated = {
                          ...existing,
                          [row.teamId]: {
                            ...currentTeamAdj,
                            pointsAdjustment: newPtsAdj,
                            notes: currentTeamAdj.notes || (delta < 0 ? "Disciplinary deduction" : "Bonus points"),
                            updatedAt: new Date().toISOString()
                          }
                        };
                        await onSaveTableAdjustments(updated);
                      };

                      const handleQuickReset = async () => {
                        if (!onSaveTableAdjustments) return;
                        const existing = { ...(activeSeason?.tableAdjustments || {}) };
                        delete existing[row.teamId];
                        await onSaveTableAdjustments(existing);
                      };

                      return (
                        <tr key={row.teamId} className="hover:bg-zinc-900/30 transition-colors">
                          <td className="py-3.5 px-3 text-center font-mono font-bold text-zinc-400">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <TeamBadge team={origTeam} size="sm" />
                              <span className="font-chakra font-bold text-white text-sm">
                                {row.teamName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-2 text-center font-mono text-zinc-300">{row.played}</td>
                          <td className="py-3.5 px-2 text-center font-mono text-white font-bold">{row.won}</td>
                          <td className="py-3.5 px-2 text-center font-mono text-cyan-400 font-bold">{row.penaltyWon || 0}</td>
                          <td className="py-3.5 px-2 text-center font-mono text-zinc-400">{row.drawn}</td>
                          <td className="py-3.5 px-2 text-center font-mono text-zinc-400">{row.lost}</td>
                          <td className="py-3.5 px-2 text-center font-mono font-bold">
                            <span className={row.goalDifference > 0 ? "text-emerald-400" : row.goalDifference < 0 ? "text-rose-400" : "text-zinc-500"}>
                              {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center bg-zinc-900/40">
                            <div className="flex flex-col items-center">
                              <span className="px-2 py-0.5 rounded-lg bg-zinc-950 border border-zinc-700 font-mono font-black text-white text-sm">
                                {row.points}
                              </span>
                              {typeof row.pointsAdjustment === "number" && row.pointsAdjustment !== 0 && (
                                <span className={`text-[9px] font-mono font-bold mt-0.5 ${row.pointsAdjustment > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                  ({row.pointsAdjustment > 0 ? `+${row.pointsAdjustment}` : row.pointsAdjustment})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            {hasAdj ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-chakra font-bold">
                                  {currentAdj?.overrideEnabled ? "Full Overrides Active" : `Points Adj: ${currentAdj?.pointsAdjustment && currentAdj.pointsAdjustment > 0 ? "+" : ""}${currentAdj?.pointsAdjustment} pts`}
                                </span>
                                {currentAdj?.notes && (
                                  <p className="text-[10px] text-zinc-400 truncate max-w-[200px]" title={currentAdj.notes}>
                                    {currentAdj.notes}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-zinc-500 font-mono">Standard (Calculated)</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Quick -3 deduction (common penalty) */}
                              <button
                                type="button"
                                onClick={() => handleQuickPointChange(-3)}
                                className="px-2 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 font-mono text-[10px] font-bold transition-colors cursor-pointer"
                                title="Deduct 3 points"
                              >
                                -3p
                              </button>
                              {/* Quick -1 deduction */}
                              <button
                                type="button"
                                onClick={() => handleQuickPointChange(-1)}
                                className="px-1.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-rose-400 font-mono text-[10px] font-bold transition-colors cursor-pointer"
                                title="Deduct 1 point"
                              >
                                -1p
                              </button>
                              {/* Quick +1 bonus */}
                              <button
                                type="button"
                                onClick={() => handleQuickPointChange(1)}
                                className="px-1.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-emerald-400 font-mono text-[10px] font-bold transition-colors cursor-pointer"
                                title="Add 1 bonus point"
                              >
                                +1p
                              </button>
                              {/* Modify in full modal */}
                              {onOpenModifyTable && origTeam && (
                                <button
                                  type="button"
                                  onClick={() => onOpenModifyTable(origTeam)}
                                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                  title="Edit full stats & overrides"
                                >
                                  <Sliders className="w-3 h-3" />
                                </button>
                              )}
                              {/* Reset */}
                              {hasAdj && (
                                <button
                                  type="button"
                                  onClick={handleQuickReset}
                                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-900/40 border border-zinc-700 text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer"
                                  title="Reset adjustments to calculated default"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 2: LEAGUE BRANDING & LOGO */}
      {adminTab === "branding" && (
        <div className="bg-[#121215] rounded-3xl border border-zinc-800 p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-white" />
              <h3 className="font-chakra font-black text-white text-base">
                LEAGUE LOGO & VISUAL BRANDING
              </h3>
            </div>
            <span className="text-xs text-zinc-400">
              Replace emojis with custom logo images across header & lineups
            </span>
          </div>

          <form onSubmit={handleSaveLeagueBrandingSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Logo Preview Card */}
              <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 flex flex-col items-center justify-center text-center space-y-3">
                <span className="text-[10px] font-chakra font-bold text-zinc-400 uppercase tracking-wider">
                  Live Logo Preview
                </span>
                <div className="w-24 h-24 rounded-3xl bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center overflow-hidden shadow-xl">
                  {leagueLogoUrl ? (
                    <img
                      src={leagueLogoUrl}
                      alt="League Logo"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-4xl">{leagueEmoji || "🏆"}</span>
                  )}
                </div>
                <div className="space-y-0.5">
                  <div className="font-chakra font-black text-white text-sm uppercase">
                    {leagueName || "COMMUNITY LEAGUE"}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400">
                    {seasonTag || "SEASON 2026"}
                  </div>
                </div>
              </div>

              {/* Logo Upload & URL */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-chakra font-bold text-zinc-300 uppercase mb-1">
                      League Name
                    </label>
                    <input
                      type="text"
                      value={leagueName}
                      onChange={(e) => setLeagueName(e.target.value)}
                      placeholder="e.g. COMMUNITY SOCCER LEAGUE"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-chakra font-bold text-zinc-300 uppercase mb-1">
                      Season Badge Text
                    </label>
                    <input
                      type="text"
                      value={seasonTag}
                      onChange={(e) => setSeasonTag(e.target.value)}
                      placeholder="e.g. SEASON 2026"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white outline-none focus:border-white"
                    />
                  </div>
                </div>

                {/* Upload Image File */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <span className="text-xs font-chakra font-bold text-white block uppercase">
                    Upload Custom League Logo (Image / PNG / SVG)
                  </span>
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-chakra font-black cursor-pointer shadow-sm">
                      <Camera className="w-4 h-4 text-black" />
                      <span>Choose Image File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLeagueLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {leagueLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setLeagueLogoUrl("")}
                        className="text-xs text-rose-400 hover:underline font-semibold cursor-pointer"
                      >
                        Clear Image (Revert to Emoji)
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-chakra font-bold text-zinc-400 uppercase mb-1">
                      Or Direct Image Web URL
                    </label>
                    <input
                      type="text"
                      value={leagueLogoUrl}
                      onChange={(e) => setLeagueLogoUrl(e.target.value)}
                      placeholder="https://example.com/league_logo.png"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingBranding}
              className="w-full py-3.5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-chakra font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>{isSavingBranding ? "Applying Branding..." : "Save League Branding & Logo"}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: TEAM LOGOS & BADGES */}
      {adminTab === "teams" && (
        <div className="bg-[#121215] rounded-3xl border border-zinc-800 p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-white" />
              <div>
                <h3 className="font-chakra font-black text-white text-base">
                  TEAM LOGOS, BADGES & SQUADS ({safeTeams.length})
                </h3>
                <p className="text-xs text-zinc-400">
                  Replace team emojis with custom crest logos, colors, and squad rosters
                </p>
              </div>
            </div>

            {onOpenCreateTeam && (
              <button
                type="button"
                onClick={onOpenCreateTeam}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-chakra font-black shadow-md cursor-pointer transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>Create New Team</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeTeams.map((t) => (
              <div
                key={t.id}
                className="bg-zinc-950 rounded-2xl border border-zinc-800 p-4 flex items-center justify-between gap-3 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <TeamBadge team={t} size="lg" />
                  <div>
                    <div className="font-chakra font-black text-white text-sm flex items-center gap-1.5">
                      <span>{t.name}</span>
                      <span className="text-[10px] font-mono text-zinc-400">({t.shortName})</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-sans flex items-center gap-2 mt-0.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: t.primaryColor || "#3b82f6" }}
                      />
                      <span>{t.logoUrl ? "Custom Logo Active" : `Emoji: ${t.badgeEmoji}`}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEditTeam(t)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-chakra font-bold cursor-pointer"
                >
                  Edit Logo
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOM STAT METRICS CREATOR */}
      {adminTab === "custom_stats" && (
        <div className="bg-[#121215] rounded-3xl border border-zinc-800 p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white" />
              <div>
                <h3 className="font-chakra font-black text-white text-base">
                  CUSTOM COMMUNITY STAT DEFINITIONS ({safeCustomStats.length})
                </h3>
                <p className="text-xs text-zinc-400">
                  Configure custom metric types, assign logos or emojis, and define leaderboard awards
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setEditingStatDef(null);
                setNewStatName("");
                setNewStatAwardTitle("");
                setNewStatIconUrl("");
                setIsAddingStat(!isAddingStat);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-zinc-200 text-black font-chakra font-black text-xs uppercase tracking-wider cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-black stroke-[3]" />
              <span>{isAddingStat ? "Cancel" : "Create New Metric"}</span>
            </button>
          </div>

          {/* Create/Edit Stat Form */}
          {isAddingStat && (
            <form onSubmit={handleCreateOrUpdateCustomStat} className="bg-zinc-950 p-4 rounded-2xl border border-zinc-700 space-y-4">
              <h4 className="text-xs font-chakra font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-white" />
                {editingStatDef ? `Edit "${editingStatDef.name}"` : "Create New Metric Definition"}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Metric Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nutmegs, Crucial Blocks"
                    value={newStatName}
                    onChange={(e) => setNewStatName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Category</label>
                  <select
                    value={newStatCategory}
                    onChange={(e) => setNewStatCategory(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none cursor-pointer"
                  >
                    <option value="attacking">Attacking</option>
                    <option value="defending">Defending</option>
                    <option value="playmaking">Playmaking</option>
                    <option value="fun">Fun / Highlights</option>
                    <option value="goalkeeping">Goalkeeping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Award Title</label>
                  <input
                    type="text"
                    placeholder="e.g. King of the Nutmeg 🏆"
                    value={newStatAwardTitle}
                    onChange={(e) => setNewStatAwardTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Icon & Image Logo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    value={newStatIcon}
                    onChange={(e) => setNewStatIcon(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Or Upload Custom Icon Image</label>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-semibold cursor-pointer">
                      <span>Upload File</span>
                      <input type="file" accept="image/*" onChange={handleStatIconUpload} className="hidden" />
                    </label>
                    <input
                      type="text"
                      placeholder="Or paste image URL"
                      value={newStatIconUrl}
                      onChange={(e) => setNewStatIconUrl(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-300 outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-chakra font-black text-xs uppercase tracking-wider cursor-pointer shadow-md"
              >
                {editingStatDef ? "Update Metric Definition" : "Save & Register Metric to League"}
              </button>
            </form>
          )}

          {/* List of Custom Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {safeCustomStats.map((stat) => (
              <div
                key={stat.id}
                className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center overflow-hidden">
                    {stat.iconUrl ? (
                      <img src={stat.iconUrl} alt={stat.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-lg">{stat.iconName || stat.icon || "✨"}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-chakra font-bold text-white text-sm">{stat.name}</div>
                    <div className="text-[10px] text-zinc-400 font-mono uppercase">{stat.category}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditStatDef(stat)}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteCustomStat(stat.id)}
                    className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-300 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PLAYER MASTER ROSTER & STATS MODIFIER */}
      {adminTab === "players" && (
        <div className="bg-[#121215] rounded-3xl border border-zinc-800 p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Users2 className="w-5 h-5 text-white" />
              <div>
                <h3 className="font-chakra font-black text-white text-base">
                  PLAYER MASTER ROSTER & COMPLETE DATA MODIFIER ({safePlayers.length})
                </h3>
                <p className="text-xs text-zinc-400">
                  Select any player to modify profile attributes, game stats, and every custom community metric
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleOpenCreatePlayerModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-chakra font-black shadow-md cursor-pointer transition-all"
              >
                <UserPlus className="w-4 h-4 text-black" />
                <span>Register New Player</span>
              </button>

              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search player..."
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {safePlayers
              .filter((p) => (p.name || "").toLowerCase().includes(playerSearch.toLowerCase()))
              .map((p) => {
                const team = getTeam(p.teamId);
                const totalCustom = Object.values(p.stats?.customStats || {}).reduce((a: number, b: any) => a + Number(b || 0), 0);

                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center font-chakra font-bold text-white overflow-hidden shrink-0">
                        {p.photoUrl ? (
                          <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>#{p.jerseyNumber}</span>
                        )}
                      </div>

                      <div className="truncate min-w-0">
                        <div className="font-chakra font-bold text-white text-sm truncate flex items-center gap-1.5">
                          <span className="truncate">{p.name || "Unnamed Player"}</span>
                          <span className="text-[10px] text-zinc-400 font-mono shrink-0">({p.positionDisplay || p.position})</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-chakra flex items-center gap-1.5 truncate">
                          <TeamBadge team={team} size="xs" />
                          <span className="truncate">{team?.name} &bull; {p.stats?.matchesPlayed || 0} GP &bull; {p.stats?.goals || 0}G &bull; {totalCustom} Custom</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenPlayerMasterEdit(p)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-chakra font-black cursor-pointer shadow-xs"
                      >
                        Mod Data
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePlayerClick(p.id, p.name || "Player")}
                        className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs cursor-pointer transition-colors"
                        title="Delete Player"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 6: SECURITY & COMMISSIONER PIN */}
      {adminTab === "security" && (
        <div className="bg-[#121215] rounded-3xl border border-zinc-800 p-5 sm:p-6 shadow-xl space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-white" />
              <div>
                <h3 className="font-chakra font-black text-white text-base">
                  COMMISSIONER PIN & SECURITY SETTINGS
                </h3>
                <p className="text-xs text-zinc-400">
                  Update the master administrative password required to unlock this dashboard
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-chakra font-bold">
              Protected
            </span>
          </div>

          {/* Current Status Box */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
            <span className="text-[10px] font-chakra font-bold text-zinc-400 uppercase tracking-wider block">
              Active Commissioner Key
            </span>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-white bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-700 tracking-wider">
                  {showCurrentPin ? adminPin : "••••••••••••"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowCurrentPin(!showCurrentPin)}
                  className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  {showCurrentPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showCurrentPin ? "Hide" : "Reveal"}</span>
                </button>
              </div>

              <div className="text-[11px] text-zinc-400 font-mono">
                Default fallback keys: <span className="text-zinc-200">gamesoccer4321</span> &bull; <span className="text-zinc-200">admin</span>
              </div>
            </div>
          </div>

          {/* Change PIN Form */}
          <form onSubmit={handleChangePinSubmit} className="space-y-4">
            <h4 className="text-xs font-chakra font-black text-white uppercase tracking-wider">
              Set New Commissioner Password
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  New Password / PIN
                </label>
                <input
                  type="password"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="Enter new password..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value)}
                  placeholder="Re-enter new password..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-white font-mono"
                />
              </div>
            </div>

            {pinChangeMessage && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  pinChangeMessage.type === "success"
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    : "bg-rose-950/40 border-rose-500/40 text-rose-300"
                }`}
              >
                {pinChangeMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{pinChangeMessage.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSavingPin || !newPinInput}
              className="w-full py-3.5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-chakra font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Key className="w-4 h-4 text-black" />
              <span>{isSavingPin ? "Updating Password..." : "Update Commissioner PIN"}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 7: NEWS & MEDIA ARTICLES */}
      {adminTab === "news" && (
        <div className="bg-[#121215] rounded-3xl border border-zinc-800 p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-white" />
              <div>
                <h3 className="font-chakra font-black text-white text-base">
                  LEAGUE NEWS &amp; EDITORIAL MANAGEMENT ({news.length})
                </h3>
                <p className="text-xs text-zinc-400">
                  Publish, modify, or permanently delete league news articles and match stories
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setEditingAdminArticle({
                    id: "news_" + Date.now(),
                    title: "",
                    subtitle: "",
                    content: "",
                    category: "STORYLINE",
                    author: "League Commissioner",
                    publishedAt: new Date().toISOString(),
                    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
                    tags: ["News"],
                    isPinned: false,
                  });
                  setAdminArticleTags("News");
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-chakra font-black shadow-md cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>Write Story</span>
              </button>

              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={newsSearch}
                  onChange={(e) => setNewsSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick Notice about Saving */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between flex-wrap gap-2 text-xs text-zinc-400">
            <span>Any deleted or published article is automatically synced and will also be backed up with <strong>Save All Modified Data</strong>.</span>
            {onSaveAllAdminData && (
              <button
                type="button"
                onClick={handleSaveAllData}
                className="px-3 py-1 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-chakra font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save All Data</span>
              </button>
            )}
          </div>

          {/* Articles list */}
          {news.length === 0 ? (
            <div className="text-center py-12 bg-zinc-950 rounded-2xl border border-zinc-800">
              <Newspaper className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-400">No news articles in the database.</p>
              <button
                type="button"
                onClick={() => {
                  setEditingAdminArticle({
                    id: "news_" + Date.now(),
                    title: "",
                    subtitle: "",
                    content: "",
                    category: "STORYLINE",
                    author: "League Commissioner",
                    publishedAt: new Date().toISOString(),
                    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
                    tags: ["News"],
                    isPinned: false,
                  });
                  setAdminArticleTags("News");
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-white text-black font-chakra font-black text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Story</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {news
                .filter((a) => {
                  if (!newsSearch.trim()) return true;
                  const q = newsSearch.toLowerCase();
                  return (
                    (a.title || "").toLowerCase().includes(q) ||
                    (a.subtitle || "").toLowerCase().includes(q) ||
                    (a.author || "").toLowerCase().includes(q) ||
                    (a.category || "").toLowerCase().includes(q)
                  );
                })
                .map((art) => (
                  <div
                    key={art.id}
                    className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {art.imageUrl ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-zinc-800 shrink-0 bg-zinc-900">
                          <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-600 shrink-0">
                          <Newspaper className="w-6 h-6" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] font-chakra font-bold uppercase">
                            {art.category.replace("_", " ")}
                          </span>
                          {art.isPinned && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-chakra font-bold">
                              PINNED
                            </span>
                          )}
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {new Date(art.publishedAt).toLocaleDateString()}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            By {art.author}
                          </span>
                        </div>
                        <h4 className="font-chakra font-bold text-white text-sm sm:text-base truncate">
                          {art.title}
                        </h4>
                        {art.subtitle && (
                          <p className="text-xs text-zinc-400 truncate max-w-xl">
                            {art.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAdminArticle(art);
                          setAdminArticleTags(Array.isArray(art.tags) ? art.tags.join(", ") : "");
                        }}
                        className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white text-xs font-chakra font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Are you sure you want to permanently delete article "${art.title}"?`)) {
                            if (onDeleteArticle) {
                              await onDeleteArticle(art.id);
                              setSaveAllNotice(`Article "${art.title}" was deleted.`);
                              setTimeout(() => setSaveAllNotice(null), 4000);
                            }
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-chakra font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        title="Delete article permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Article</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ADMIN ARTICLE WRITER / EDITOR MODAL */}
      {editingAdminArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#121215] border border-zinc-700 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-white" />
                <h3 className="font-chakra font-black text-white text-lg">
                  {editingAdminArticle.id && news.some((n) => n.id === editingAdminArticle.id)
                    ? "Edit News Article"
                    : "Create & Publish News Story"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingAdminArticle(null)}
                className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminArticle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Article Headline / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blue Fire Crowned Champions of Season 2026!"
                  value={editingAdminArticle.title || ""}
                  onChange={(e) => setEditingAdminArticle({ ...editingAdminArticle, title: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Decisive final minute penalty seals the trophy in front of electric crowd"
                  value={editingAdminArticle.subtitle || ""}
                  onChange={(e) => setEditingAdminArticle({ ...editingAdminArticle, subtitle: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Category</label>
                  <select
                    value={editingAdminArticle.category || "STORYLINE"}
                    onChange={(e) => setEditingAdminArticle({ ...editingAdminArticle, category: e.target.value as any })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="MATCH_REPORT">Match Report</option>
                    <option value="INTERVIEW">Player Interview</option>
                    <option value="TRANSFER">Transfer &amp; Signing</option>
                    <option value="TACTICAL">Tactical Breakdown</option>
                    <option value="STORYLINE">Storyline &amp; Drama</option>
                    <option value="ANNOUNCEMENT">Official League Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Author Byline</label>
                  <input
                    type="text"
                    value={editingAdminArticle.author || "League Commissioner"}
                    onChange={(e) => setEditingAdminArticle({ ...editingAdminArticle, author: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={editingAdminArticle.imageUrl || ""}
                  onChange={(e) => setEditingAdminArticle({ ...editingAdminArticle, imageUrl: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Article Content *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Write the full news story here..."
                  value={editingAdminArticle.content || ""}
                  onChange={(e) => setEditingAdminArticle({ ...editingAdminArticle, content: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white outline-none leading-relaxed focus:border-white"
                />
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Final, Blue Fire, Drama"
                    value={adminArticleTags}
                    onChange={(e) => setAdminArticleTags(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none w-64"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="admin-pin-check"
                    checked={Boolean(editingAdminArticle.isPinned)}
                    onChange={(e) => setEditingAdminArticle({ ...editingAdminArticle, isPinned: e.target.checked })}
                    className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 accent-white cursor-pointer"
                  />
                  <label htmlFor="admin-pin-check" className="text-white font-bold text-xs cursor-pointer">
                    Pin Article to Top
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-4 border-t border-zinc-800">
                {editingAdminArticle.id && news.some((n) => n.id === editingAdminArticle.id) ? (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm(`Permanently delete article "${editingAdminArticle.title}"?`)) {
                        if (onDeleteArticle && editingAdminArticle.id) {
                          await onDeleteArticle(editingAdminArticle.id);
                          setEditingAdminArticle(null);
                        }
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-chakra font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Story</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingAdminArticle(null)}
                    className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white font-chakra font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingAdminArticle}
                    className="px-5 py-2 rounded-xl bg-white text-black font-chakra font-black text-xs uppercase tracking-wider cursor-pointer shadow-md hover:bg-zinc-200"
                  >
                    {isSavingAdminArticle ? "Saving..." : "Save & Publish"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEAM EDIT MODAL */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121215] border border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-white" />
                <h3 className="font-chakra font-black text-white text-base">Edit Team Logo & Crest</h3>
              </div>
              <button
                onClick={() => setEditingTeam(null)}
                className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTeamModal} className="space-y-4">
              <div className="flex items-center justify-center pb-2">
                <TeamBadge
                  team={{
                    ...editingTeam,
                    name: teamNameInput,
                    shortName: teamShortNameInput,
                    badgeEmoji: teamEmojiInput,
                    logoUrl: teamLogoUrlInput,
                    primaryColor: teamColorInput,
                  }}
                  size="xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Team Name</label>
                  <input
                    type="text"
                    value={teamNameInput}
                    onChange={(e) => setTeamNameInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Short Code</label>
                  <input
                    type="text"
                    value={teamShortNameInput}
                    onChange={(e) => setTeamShortNameInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-2">
                <label className="block text-xs font-semibold text-zinc-300">Team Logo Image (Upload / URL)</label>
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs font-semibold cursor-pointer">
                    <span>Upload Crest</span>
                    <input type="file" accept="image/*" onChange={handleTeamLogoUpload} className="hidden" />
                  </label>
                  {teamLogoUrlInput && (
                    <button
                      type="button"
                      onClick={() => setTeamLogoUrlInput("")}
                      className="text-xs text-rose-400 font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Or paste image URL"
                  value={teamLogoUrlInput}
                  onChange={(e) => setTeamLogoUrlInput(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-300 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Fallback Emoji</label>
                  <input
                    type="text"
                    value={teamEmojiInput}
                    onChange={(e) => setTeamEmojiInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Primary Color</label>
                  <input
                    type="color"
                    value={teamColorInput}
                    onChange={(e) => setTeamColorInput(e.target.value)}
                    className="w-full h-9 bg-zinc-950 border border-zinc-700 rounded-xl p-1 outline-none cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-white hover:bg-zinc-200 text-black font-chakra font-black text-xs uppercase tracking-wider cursor-pointer shadow-md"
              >
                Save Team Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MASTER PLAYER DATA & CUSTOM STATS MODIFIER MODAL */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#121215] border border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[94vh] overflow-y-auto shadow-2xl flex flex-col my-auto space-y-5 p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center font-chakra font-black text-lg text-white overflow-hidden">
                  {editPlayerPhotoUrl ? (
                    <img src={editPlayerPhotoUrl} alt={editPlayerName} className="w-full h-full object-cover" />
                  ) : (
                    <span>#{editPlayerJersey}</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-chakra font-bold text-zinc-400 uppercase tracking-widest block">
                    Commissioner Full Player Editor
                  </span>
                  <h3 className="font-chakra font-black text-white text-lg">{editPlayerName}</h3>
                </div>
              </div>

              <button
                onClick={() => setEditingPlayer(null)}
                className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Core Identity Section */}
            <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-4 space-y-4">
              <h4 className="text-xs font-chakra font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-white" />
                Profile Identity, Photo & Position
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editPlayerName}
                    onChange={(e) => setEditPlayerName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Position Display</label>
                  <input
                    type="text"
                    value={editPlayerPositionDisplay}
                    onChange={(e) => setEditPlayerPositionDisplay(e.target.value)}
                    placeholder="e.g. FWD / MID"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Jersey Number</label>
                  <input
                    type="number"
                    value={editPlayerJersey}
                    onChange={(e) => setEditPlayerJersey(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Assigned Team</label>
                  <select
                    value={editPlayerTeamId}
                    onChange={(e) => setEditPlayerTeamId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                  >
                    {safeTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.badgeEmoji || "🛡️"} {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Preferred Foot</label>
                  <select
                    value={editPlayerFoot}
                    onChange={(e) => setEditPlayerFoot(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                  >
                    <option value="Right">Right</option>
                    <option value="Left">Left</option>
                    <option value="Both">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Nickname / Moniker</label>
                  <input
                    type="text"
                    value={editPlayerNickname}
                    onChange={(e) => setEditPlayerNickname(e.target.value)}
                    placeholder="e.g. El Mago"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="flex items-center gap-3">
                <label className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs font-semibold cursor-pointer">
                  <span>Upload Photo Image</span>
                  <input type="file" accept="image/*" onChange={handlePlayerPhotoUpload} className="hidden" />
                </label>
                <input
                  type="text"
                  placeholder="Or paste photo image URL"
                  value={editPlayerPhotoUrl}
                  onChange={(e) => setEditPlayerPhotoUrl(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-300 outline-none"
                />
              </div>
            </div>

            {/* Official Match Stats Modification */}
            <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-4 space-y-4">
              <h4 className="text-xs font-chakra font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-white" />
                Official Performance Stats
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-[10px] font-chakra font-bold text-zinc-400 block uppercase">Games Played</span>
                  <input
                    type="number"
                    min="0"
                    value={pStatMatches}
                    onChange={(e) => setPStatMatches(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-1 text-center font-chakra font-black text-sm text-white outline-none mt-1"
                  />
                </div>

                <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-[10px] font-chakra font-bold text-zinc-400 block uppercase">Goals</span>
                  <input
                    type="number"
                    min="0"
                    value={pStatGoals}
                    onChange={(e) => setPStatGoals(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-1 text-center font-chakra font-black text-sm text-white outline-none mt-1"
                  />
                </div>

                <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-[10px] font-chakra font-bold text-zinc-400 block uppercase">Assists</span>
                  <input
                    type="number"
                    min="0"
                    value={pStatAssists}
                    onChange={(e) => setPStatAssists(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-1 text-center font-chakra font-black text-sm text-white outline-none mt-1"
                  />
                </div>

                <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-[10px] font-chakra font-bold text-zinc-400 block uppercase">Rating</span>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={pStatRating}
                    onChange={(e) => setPStatRating(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-1 text-center font-chakra font-black text-sm text-white outline-none mt-1"
                  />
                </div>
              </div>

              {/* Stat Override Protection Status */}
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-chakra font-black text-emerald-400 uppercase">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Override Protection Active</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Modifying stats here locks this player's custom values. Game scores &amp; match results will NOT be overridden, and future match recalculations will preserve your custom player stats.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isManualOverrideActive}
                    onChange={(e) => setIsManualOverrideActive(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-white hidden sm:inline">Protect Stats</span>
                </label>
              </div>

              {/* Match Appearance Picker */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-chakra font-black text-zinc-300 uppercase tracking-wider block">
                      Pick Which Games {editPlayerName} Played
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Check or uncheck matches to set appearances (currently <strong>{pStatMatches}</strong> game{pStatMatches === 1 ? "" : "s"} played).
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPStatMatches(1)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold cursor-pointer transition-all"
                    >
                      Set to 1 Game Played
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {safeMatches
                    .filter((m) => m.status === "APPROVED")
                    .map((m) => {
                      const didPlay = !!playerMatchAppearances[m.id];
                      const homeT = getTeam(m.homeTeamId);
                      const awayT = getTeam(m.awayTeamId);

                      return (
                        <div
                          key={m.id}
                          onClick={() => handleTogglePlayerMatchAppearance(m.id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            didPlay
                              ? "bg-emerald-950/20 border-emerald-500/40 text-white"
                              : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-sm">{homeT?.badgeEmoji || "🛡️"}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-chakra font-bold text-xs text-white">
                                  {m.gameNumber ? `Soccer Game #${m.gameNumber}` : "Match"}
                                </span>
                                <span className="text-[11px] text-zinc-400">
                                  {homeT?.name || "Home"} {m.homeScore} - {m.awayScore} {awayT?.name || "Away"}
                                </span>
                                {m.date && (
                                  <span className="text-[10px] text-zinc-500">
                                    ({new Date(m.date).toLocaleDateString()})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {didPlay ? (
                              <div className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-chakra font-black flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>PLAYED</span>
                              </div>
                            ) : (
                              <div className="px-2.5 py-0.5 rounded-lg bg-zinc-800 text-zinc-400 text-[11px] font-chakra font-bold flex items-center gap-1">
                                <X className="w-3 h-3 text-zinc-500" />
                                <span>DID NOT PLAY</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {safeMatches.filter((m) => m.status === "APPROVED").length === 0 && (
                    <div className="text-xs text-zinc-500 italic p-2">
                      No approved matches recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Community Stats Modifier */}
            <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-4 space-y-4">
              <h4 className="text-xs font-chakra font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                Custom Community Stats Modifier
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {safeCustomStats.map((stat) => {
                  const count = playerCustomStatsRecord[stat.id] || 0;
                  return (
                    <div
                      key={stat.id}
                      className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-2"
                    >
                      <div className="truncate flex-1">
                        <div className="font-chakra font-bold text-white text-xs truncate flex items-center gap-1">
                          {stat.iconUrl ? (
                            <img src={stat.iconUrl} alt={stat.name} className="w-3.5 h-3.5 object-contain" />
                          ) : (
                            <span>{stat.iconName || stat.icon || "✨"}</span>
                          )}
                          <span className="truncate">{stat.name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPlayerCustomStatsRecord((prev) => ({
                            ...prev,
                            [stat.id]: Math.max(0, (prev[stat.id] || 0) - 1),
                          }))}
                          className="w-6 h-6 rounded bg-zinc-800 text-white flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={count}
                          onChange={(e) => setPlayerCustomStatsRecord((prev) => ({
                            ...prev,
                            [stat.id]: Math.max(0, Number(e.target.value)),
                          }))}
                          className="w-10 bg-zinc-950 border border-zinc-700 rounded py-0.5 text-center font-chakra font-black text-xs text-white outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setPlayerCustomStatsRecord((prev) => ({
                            ...prev,
                            [stat.id]: (prev[stat.id] || 0) + 1,
                          }))}
                          className="w-6 h-6 rounded bg-zinc-800 text-white flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSavePlayerMaster}
              disabled={isSavingPlayer}
              className="w-full py-3.5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-chakra font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>{isSavingPlayer ? "Saving Changes..." : "Save All Player Data & Custom Stats"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
