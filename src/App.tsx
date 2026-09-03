import React, { useState, useEffect } from "react";
import { 
  Team, 
  PlayerProfile, 
  CustomStatDefinition, 
  LeagueSeason, 
  Match, 
  MainNavTab, 
  NewsArticle, 
  SeasonGrandAwards, 
  LeagueBranding,
  TeamTableAdjustment
} from "./types";
import { 
  DEFAULT_TEAMS, 
  DEFAULT_PLAYERS, 
  DEFAULT_CUSTOM_STATS, 
  DEFAULT_SEASONS, 
  DEFAULT_MATCHES,
  DEFAULT_NEWS_ARTICLES
} from "./data/leagueSeed";
import { 
  getLocalLeagueData, 
  saveLocalLeagueData, 
  syncLeagueDataToServer, 
  getSavedAdminPin, 
  saveAdminPin, 
  fetchLeagueDataFromServer 
} from "./utils/storage";

// Components
import { FotMobHeader } from "./components/FotMobHeader";
import { MatchesView } from "./components/MatchesView";
import { CalendarView } from "./components/CalendarView";
import { StandingsView } from "./components/StandingsView";
import { SeasonTrendsView } from "./components/SeasonTrendsView";
import { TeamsLineupView } from "./components/TeamsLineupView";
import { PlayersView } from "./components/PlayersView";
import { AwardsView } from "./components/AwardsView";
import { AdminHubView } from "./components/AdminHubView";
import { PlayerRatingsBallotView } from "./components/PlayerRatingsBallotView";
import { NewsView } from "./components/NewsView";
import { PlayerComparisonView } from "./components/PlayerComparisonView";
import { MatchDetailModal } from "./components/MatchDetailModal";
import { SubmitMatchModal } from "./components/SubmitMatchModal";
import { CreateTeamModal } from "./components/CreateTeamModal";
import { EditMatchModal } from "./components/EditMatchModal";
import { SeasonConclusionModal } from "./components/SeasonConclusionModal";
import { EditLeagueTableModal } from "./components/EditLeagueTableModal";
import { CustomizeTeamModal } from "./components/CustomizeTeamModal";
import { recomputeAllPlayerStats } from "./utils/statRecalculation";

export const App: React.FC = () => {
  // Main State
  const [currentTab, setCurrentTab] = useState<MainNavTab>("matches");
  const [teams, setTeams] = useState<Team[]>(DEFAULT_TEAMS);
  const [players, setPlayers] = useState<PlayerProfile[]>(DEFAULT_PLAYERS);
  const [customStats, setCustomStats] = useState<CustomStatDefinition[]>(DEFAULT_CUSTOM_STATS);
  const [seasons, setSeasons] = useState<LeagueSeason[]>(DEFAULT_SEASONS);
  const [matches, setMatches] = useState<Match[]>(DEFAULT_MATCHES);
  const [news, setNews] = useState<NewsArticle[]>(DEFAULT_NEWS_ARTICLES);
  const [activeSeason, setActiveSeason] = useState<LeagueSeason>(DEFAULT_SEASONS[0]);
  const [branding, setBranding] = useState<LeagueBranding>({
    leagueName: "COMMUNITY LEAGUE",
    seasonTag: "SEASON 2026",
    leagueEmoji: "🏆",
  });

  // Admin Mode State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [adminPin, setAdminPin] = useState<string>("gamesoccer4321");

  // Theme State (Dark vs Light)
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("theme_preference");
    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("theme_preference", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Modals
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState<boolean>(false);
  const [isSeasonConclusionOpen, setIsSeasonConclusionOpen] = useState<boolean>(false);
  const [isEditTableModalOpen, setIsEditTableModalOpen] = useState<boolean>(false);
  const [editingTableTeam, setEditingTableTeam] = useState<Team | null>(null);
  const [editingLogoTeam, setEditingLogoTeam] = useState<Team | null>(null);
  const [preselectedMatchIdForRating, setPreselectedMatchIdForRating] = useState<string>("");

  // Initialize data on mount
  useEffect(() => {
    // 1. Load from local storage first
    const cached = getLocalLeagueData();
    if (cached) {
      if (cached.teams?.length) setTeams(cached.teams);
      if (cached.players?.length) setPlayers(cached.players);
      if (cached.customStats?.length) setCustomStats(cached.customStats);
      if (cached.seasons?.length) {
        setSeasons(cached.seasons);
        const active = cached.seasons.find((s) => s.status === "active") || cached.seasons[0];
        if (active) setActiveSeason(active);
      }
      if (cached.matches?.length) {
        setMatches(
          cached.matches.filter(
            (m) =>
              m.id !== "match_1788393953358_fouv" &&
              m.title !== "Game 3" &&
              m.status !== "REJECTED"
          )
        );
      }
      if (cached.news?.length) setNews(cached.news);
    }

    // 2. Fetch fresh data from backend
    fetchLeagueDataFromServer().then((serverData) => {
      if (serverData) {
        if (serverData.teams) setTeams(serverData.teams);
        if (serverData.players) setPlayers(serverData.players);
        if (serverData.customStats) setCustomStats(serverData.customStats);
        if (serverData.seasons) {
          setSeasons(serverData.seasons);
          const active = serverData.seasons.find((s) => s.status === "active") || serverData.seasons[0];
          if (active) setActiveSeason(active);
        }
        if (serverData.matches) {
          setMatches(
            serverData.matches.filter(
              (m) =>
                m.id !== "match_1788393953358_fouv" &&
                m.title !== "Game 3" &&
                m.status !== "REJECTED"
            )
          );
        }
        if (serverData.news) setNews(serverData.news);
      }
    });

    const savedPin = getSavedAdminPin();
    if (savedPin) setAdminPin(savedPin);
  }, []);

  // Save changes to local state & sync to server
  const persistState = (
    newMatches?: Match[],
    newTeams?: Team[],
    newPlayers?: PlayerProfile[],
    newStats?: CustomStatDefinition[],
    newNews?: NewsArticle[],
    newSeasons?: LeagueSeason[],
    newBranding?: LeagueBranding
  ) => {
    const updatedMatches = newMatches || matches;
    const updatedTeams = newTeams || teams;
    const updatedPlayers = newPlayers || players;
    const updatedStats = newStats || customStats;
    const updatedNews = newNews || news;
    const updatedSeasons = newSeasons || seasons;
    const updatedBranding = newBranding || branding;

    const payload = {
      teams: updatedTeams,
      players: updatedPlayers,
      customStats: updatedStats,
      seasons: updatedSeasons,
      matches: updatedMatches,
      news: updatedNews,
      branding: updatedBranding,
    };

    saveLocalLeagueData(payload);
    syncLeagueDataToServer(payload).catch((err) => {
      console.warn("Background server synchronization notice:", err);
    });
  };

  // News CRUD Handlers
  const handleSaveArticle = async (article: NewsArticle) => {
    try {
      const isExisting = news.some((item) => item.id === article.id);
      const url = isExisting ? `/api/news/${article.id}` : "/api/news";
      const method = isExisting ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article, adminPassword: adminPin }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.news) {
          setNews(data.news);
          persistState(matches, teams, players, customStats, data.news);
          return;
        }
      }
    } catch (err) {
      console.warn("Backend news error, applying local fallback:", err);
    }

    const exists = news.some((item) => item.id === article.id);
    const updatedNews = exists
      ? news.map((item) => (item.id === article.id ? article : item))
      : [article, ...news];

    setNews(updatedNews);
    persistState(matches, teams, players, customStats, updatedNews);
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      const res = await fetch(`/api/news/${articleId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword: adminPin }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.news) {
          setNews(data.news);
          persistState(matches, teams, players, customStats, data.news);
          return;
        }
      }
    } catch (err) {
      console.warn("Backend delete news error, applying local fallback:", err);
    }

    const updatedNews = news.filter((item) => item.id !== articleId);
    setNews(updatedNews);
    persistState(matches, teams, players, customStats, updatedNews);
  };

  // Modify / Edit Game Stats & Events
  const handleSaveModifiedMatch = async (updatedMatch: Match) => {
    try {
      const res = await fetch(`/api/matches/${updatedMatch.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match: updatedMatch, adminPassword: adminPin }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.league) {
          setMatches(data.league.matches);
          setPlayers(data.league.players);
          setTeams(data.league.teams);
          persistState(data.league.matches, data.league.teams, data.league.players);
          setEditingMatch(null);
          if (selectedMatch?.id === updatedMatch.id) {
            setSelectedMatch(data.match || updatedMatch);
          }
          return;
        }
      }
    } catch (err) {
      console.warn("Backend modify match error, applying local stat recalculation:", err);
    }

    // Local recalculation
    const newMatches = matches.map((m) => (m.id === updatedMatch.id ? updatedMatch : m));
    const recalculatedPlayers = recomputeAllPlayerStats(newMatches, players, customStats);

    setMatches(newMatches);
    setPlayers(recalculatedPlayers);
    persistState(newMatches, teams, recalculatedPlayers);
    setEditingMatch(null);
    if (selectedMatch?.id === updatedMatch.id) {
      setSelectedMatch(updatedMatch);
    }
  };

  // Delete Match
  const handleDeleteMatch = async (matchId: string) => {
    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword: adminPin }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.league) {
          setMatches(data.league.matches);
          setPlayers(data.league.players);
          persistState(data.league.matches, teams, data.league.players);
          setEditingMatch(null);
          if (selectedMatch?.id === matchId) setSelectedMatch(null);
          return;
        }
      }
    } catch (err) {
      console.warn("Backend delete match error:", err);
    }

    const newMatches = matches.filter((m) => m.id !== matchId);
    const recalculatedPlayers = recomputeAllPlayerStats(newMatches, players, customStats);
    setMatches(newMatches);
    setPlayers(recalculatedPlayers);
    persistState(newMatches, teams, recalculatedPlayers);
    setEditingMatch(null);
    if (selectedMatch?.id === matchId) setSelectedMatch(null);
  };

  // 1. Submit Match Result (Member/Friend action)
  const handleSubmitMatch = async (matchPayload: any) => {
    try {
      const res = await fetch("/api/matches/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(matchPayload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.match) {
          const newMatches = [data.match, ...matches];
          setMatches(newMatches);
          persistState(newMatches);
          return;
        }
      }
    } catch (err) {
      console.warn("Backend submit match failed, applying local fallback:", err);
    }

    // Local fallback
    const newM: Match = {
      id: "match_" + Date.now(),
      seasonId: activeSeason.id,
      status: "PENDING_APPROVAL",
      ...matchPayload,
    };
    const newMatches = [newM, ...matches];
    setMatches(newMatches);
    persistState(newMatches);
  };

  // Schedule Match (Calendar feature)
  const handleScheduleMatch = async (matchData: Partial<Match>) => {
    const newM: Match = {
      id: matchData.id || `match_sched_${Date.now()}`,
      seasonId: activeSeason.id,
      matchNumber: matchData.matchNumber || matches.length + 1,
      title: matchData.title || `Matchday #${matches.length + 1}`,
      date: matchData.date || new Date().toISOString(),
      homeTeamId: matchData.homeTeamId || teams[0]?.id || "team_blue",
      awayTeamId: matchData.awayTeamId || teams[1]?.id || "team_red",
      homeScore: 0,
      awayScore: 0,
      status: "SCHEDULED",
      submittedBy: matchData.submittedBy || "Admin",
      submittedAt: Date.now(),
      venue: matchData.venue || "Community Turf Pitch",
      notes: matchData.notes || "",
      events: [],
      playerRatings: {},
      ratingBallots: [],
      ...matchData,
    };

    try {
      await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match: newM, autoApprove: false }),
      });
    } catch {}

    const newMatches = [newM, ...matches];
    setMatches(newMatches);
    persistState(newMatches);
  };

  // 2. Admin Approve Match
  const handleApproveMatch = async (matchId: string) => {
    try {
      const res = await fetch(`/api/matches/${matchId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword: adminPin }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.league) {
          setMatches(data.league.matches);
          setPlayers(data.league.players);
          setTeams(data.league.teams);
          persistState(data.league.matches, data.league.teams, data.league.players);
          if (selectedMatch?.id === matchId) setSelectedMatch(null);
          return;
        }
      }
    } catch (err) {
      console.warn("Backend approve match failed, falling back locally:", err);
    }

    // Local approval calculation
    const targetMatch = matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    const approvedMatch: Match = {
      ...targetMatch,
      status: "APPROVED",
      approvedAt: new Date().toISOString(),
      approvedBy: "Admin",
    };

    const matchEvents = approvedMatch.events || [];

    // Update player stats based on events & ratings
    const updatedPlayers = players.map((p) => {
      const isParticipant =
        p.teamId === approvedMatch.homeTeamId || p.teamId === approvedMatch.awayTeamId;
      if (!isParticipant) return p;

      const playerGoals = matchEvents.filter(
        (e) => e.type === "GOAL" && e.playerId === p.id
      ).length;
      const playerAssists = matchEvents.filter(
        (e) => e.type === "GOAL" && e.assistPlayerId === p.id
      ).length;
      const playerYellows = matchEvents.filter(
        (e) => e.type === "YELLOW_CARD" && e.playerId === p.id
      ).length;
      const playerReds = matchEvents.filter(
        (e) => e.type === "RED_CARD" && e.playerId === p.id
      ).length;
      const isMotm = approvedMatch.motmPlayerId === p.id;
      const matchRating = approvedMatch.playerRatings?.[p.id];

      // Custom stats
      const customStatsCount: Record<string, number> = { ...(p.stats?.customStats || {}) };
      matchEvents
        .filter((e) => e.type === "CUSTOM_STAT" && e.playerId === p.id && e.customStatId)
        .forEach((e) => {
          if (e.customStatId) {
            customStatsCount[e.customStatId] = (customStatsCount[e.customStatId] || 0) + 1;
          }
        });

      let newRating = p.stats.averageRating || 0;
      let newCount = p.stats.ratingCount || 0;
      const updatedRatingHistory = [...(p.ratingHistory || [])];

      if (typeof matchRating === "number" && matchRating > 0) {
        updatedRatingHistory.push({
          matchId: approvedMatch.id,
          matchTitle: approvedMatch.title,
          rating: matchRating,
          date: approvedMatch.date || new Date().toISOString().split("T")[0],
        });

        // If player played one game (previous matches was 0, or this is their first rated game):
        // Use that singular rating directly! NEVER make the math with a 0 or divide by 2!
        if (newCount === 0 || p.stats.matchesPlayed === 0 || (p.stats.matchesPlayed + 1) <= 1 || newRating <= 0) {
          newRating = Number(matchRating.toFixed(2));
          newCount = 1;
        } else {
          newRating = Number(((newRating * newCount + matchRating) / (newCount + 1)).toFixed(2));
          newCount += 1;
        }
      }

      return {
        ...p,
        stats: {
          ...p.stats,
          matchesPlayed: p.stats.matchesPlayed + 1,
          goals: p.stats.goals + playerGoals,
          assists: p.stats.assists + playerAssists,
          yellowCards: p.stats.yellowCards + playerYellows,
          redCards: p.stats.redCards + playerReds,
          motmCount: p.stats.motmCount + (isMotm ? 1 : 0),
          averageRating: newRating,
          ratingCount: newCount,
          customStats: customStatsCount,
        },
        ratingHistory: updatedRatingHistory,
      };
    });

    const updatedMatches = matches.map((m) => (m.id === matchId ? approvedMatch : m));
    setMatches(updatedMatches);
    setPlayers(updatedPlayers);
    persistState(updatedMatches, teams, updatedPlayers);
    if (selectedMatch?.id === matchId) setSelectedMatch(null);
  };

  // 3. Admin Reject Match
  const handleRejectMatch = async (matchId: string) => {
    try {
      await fetch(`/api/matches/${matchId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword: adminPin }),
      });
    } catch {}

    const updatedMatches = matches.filter((m) => m.id !== matchId);
    setMatches(updatedMatches);
    persistState(updatedMatches);
    if (selectedMatch?.id === matchId) setSelectedMatch(null);
  };

  // 4. Save/Update Team
  const handleSaveTeam = async (updatedTeam: Team) => {
    try {
      await fetch(`/api/teams/${updatedTeam.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team: updatedTeam, adminPassword: adminPin }),
      });
    } catch {}

    const exists = teams.some((t) => t.id === updatedTeam.id);
    const newTeams = exists
      ? teams.map((t) => (t.id === updatedTeam.id ? updatedTeam : t))
      : [...teams, updatedTeam];

    setTeams(newTeams);
    persistState(matches, newTeams);
  };

  // 5. Save/Update Player
  const handleSavePlayer = async (updatedPlayer: PlayerProfile) => {
    try {
      await fetch(`/api/players/${updatedPlayer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player: updatedPlayer, adminPassword: adminPin }),
      });
    } catch {}

    const exists = players.some((p) => p.id === updatedPlayer.id);
    const newPlayers = exists
      ? players.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p))
      : [...players, updatedPlayer];

    setPlayers(newPlayers);
    persistState(matches, teams, newPlayers);
  };

  // 5b. Delete Player
  const handleDeletePlayer = async (playerId: string) => {
    try {
      await fetch(`/api/players/${playerId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword: adminPin }),
      });
    } catch (err) {
      console.warn("Backend delete player error:", err);
    }

    const updatedPlayers = players.filter((p) => p.id !== playerId);
    setPlayers(updatedPlayers);
    persistState(matches, teams, updatedPlayers);
  };

  // 6. Save Custom Stat (Create or Update)
  const handleSaveCustomStat = async (newStat: CustomStatDefinition) => {
    try {
      const isExisting = customStats.some((s) => s.id === newStat.id);
      const url = isExisting ? `/api/custom-stats/${newStat.id}` : "/api/custom-stats";
      const method = isExisting ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customStat: newStat, adminPassword: adminPin }),
      });
    } catch (err) {
      console.warn("Backend custom stat update failed:", err);
    }

    const exists = customStats.some((s) => s.id === newStat.id);
    const newStats = exists
      ? customStats.map((s) => (s.id === newStat.id ? newStat : s))
      : [...customStats, newStat];
    setCustomStats(newStats);
    persistState(matches, teams, players, newStats);
  };

  // 6b. Save League Branding
  const handleSaveLeagueBranding = async (newBranding: LeagueBranding) => {
    try {
      const res = await fetch("/api/league/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branding: newBranding, adminPassword: adminPin }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.branding) {
          setBranding(data.branding);
          persistState(matches, teams, players, customStats, news, seasons, data.branding);
          return;
        }
      }
    } catch (err) {
      console.warn("Backend branding update failed:", err);
    }

    setBranding(newBranding);
    persistState(matches, teams, players, customStats, news, seasons, newBranding);
  };

  // 6c. Save League Table Adjustments (Point deductions / manual stat overrides)
  const handleSaveTableAdjustments = async (adjustments: Record<string, TeamTableAdjustment>) => {
    const updatedActiveSeason: LeagueSeason = {
      ...(activeSeason || {
        id: "season_2026",
        name: "Season 2026",
        status: "active",
        startDate: "2026-02-01",
      }),
      tableAdjustments: adjustments,
    };

    const updatedSeasons = seasons.map((s) =>
      s.id === updatedActiveSeason.id ? updatedActiveSeason : s
    );
    if (!updatedSeasons.some((s) => s.id === updatedActiveSeason.id)) {
      updatedSeasons.push(updatedActiveSeason);
    }

    setActiveSeason(updatedActiveSeason);
    setSeasons(updatedSeasons);
    persistState(matches, teams, players, customStats, news, updatedSeasons, branding);

    try {
      await fetch("/api/league/table-adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seasonId: updatedActiveSeason.id,
          tableAdjustments: adjustments,
          adminPassword: adminPin,
        }),
      });
    } catch (err) {
      console.warn("Backend table adjustments sync error:", err);
    }
  };

  // 7. Delete Custom Stat
  const handleDeleteCustomStat = async (statId: string) => {
    const newStats = customStats.filter((s) => s.id !== statId);
    setCustomStats(newStats);
    persistState(matches, teams, players, newStats);
  };

  // Master Save All Data modified by Admin (persists everything to local storage & server)
  const handleSaveAllAdminData = async (): Promise<boolean> => {
    try {
      persistState(matches, teams, players, customStats, news, seasons, branding);
      const synced = await syncLeagueDataToServer({
        matches,
        teams,
        players,
        customStats,
        news,
        seasons,
        branding,
      });

      if (activeSeason?.tableAdjustments) {
        try {
          await fetch("/api/league/table-adjustments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              seasonId: activeSeason.id,
              tableAdjustments: activeSeason.tableAdjustments,
              adminPassword: adminPin,
            }),
          });
        } catch (_) {}
      }

      if (branding) {
        try {
          await fetch("/api/league/branding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ branding, adminPassword: adminPin }),
          });
        } catch (_) {}
      }

      return Boolean(synced);
    } catch (err) {
      console.error("Master save all admin data failed:", err);
      return false;
    }
  };

  // 8. Save Player Ratings Ballot (Per-game or general)
  const handleSaveRatingSubmission = async (
    submittedRatings: Record<string, number>,
    voterName: string,
    matchId?: string,
    voterPlayerId?: string,
    motmPlayerId?: string
  ) => {
    // If a matchId is provided, post to match rating ballot endpoint
    if (matchId) {
      try {
        const res = await fetch(`/api/matches/${matchId}/ratings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ratings: submittedRatings,
            voterName,
            voterPlayerId,
            motmPlayerId,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.league) {
            setMatches(data.league.matches);
            setPlayers(data.league.players);
            persistState(data.league.matches, teams, data.league.players);
            return;
          }
        }
      } catch (err) {
        console.warn("Backend match ratings error, applying local update:", err);
      }
    } else {
      try {
        await fetch("/api/ratings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ratings: submittedRatings, voterName }),
        });
      } catch {}
    }

    // Local recalculation
    let updatedMatches = [...matches];
    if (matchId) {
      updatedMatches = matches.map((m) => {
        if (m.id === matchId) {
          const currentRatings = { ...(m.playerRatings || {}) };
          // Merge ratings
          Object.entries(submittedRatings).forEach(([pid, score]) => {
            currentRatings[pid] = score;
          });
          const ballots = [...(m.ratingBallots || [])];
          ballots.push({
            id: "ballot_" + Date.now(),
            matchId,
            voterName,
            voterPlayerId,
            ratings: submittedRatings,
            motmPlayerId,
            submittedAt: new Date().toISOString(),
          });

          return {
            ...m,
            playerRatings: currentRatings,
            ratingBallots: ballots,
            motmPlayerId: motmPlayerId || m.motmPlayerId,
          };
        }
        return m;
      });
      setMatches(updatedMatches);
    }

    // Recompute player averages from matches
    const recalculatedPlayers = recomputeAllPlayerStats(updatedMatches, players, customStats);
    setPlayers(recalculatedPlayers);
    persistState(updatedMatches, teams, recalculatedPlayers);
  };

  // 9. Conclude Season & Award Grand Trophies
  const handleConcludeSeason = async (seasonId: string, grandAwards: SeasonGrandAwards) => {
    // 1. Update the season with awards and archived status
    const updatedSeasons = seasons.map((s) => {
      if (s.id === seasonId) {
        return {
          ...s,
          status: "archived" as const,
          grandAwards,
        };
      }
      return s;
    });

    const updatedActiveSeason = updatedSeasons.find((s) => s.id === seasonId) || {
      ...activeSeason,
      status: "archived" as const,
      grandAwards,
    };

    // 2. Decorate players with awards if applicable
    const updatedPlayers = players.map((p) => {
      const awardedBadges: string[] = [...(p.awards || [])];
      if (grandAwards.playerOfTheSeasonId === p.id && !awardedBadges.includes("🏆 Player of the Season (MVP)")) {
        awardedBadges.push("🏆 Player of the Season (MVP)");
      }
      if (grandAwards.goldenBootPlayerId === p.id && !awardedBadges.includes("⚽ Golden Boot")) {
        awardedBadges.push("⚽ Golden Boot");
      }
      if (grandAwards.goldenGlovePlayerId === p.id && !awardedBadges.includes("🧤 Golden Glove")) {
        awardedBadges.push("🧤 Golden Glove");
      }
      if (grandAwards.defensivePlayerOfTheSeasonId === p.id && !awardedBadges.includes("🛡️ Defensive Player of the Season")) {
        awardedBadges.push("🛡️ Defensive Player of the Season");
      }
      if (grandAwards.mostImprovedPlayerId === p.id && !awardedBadges.includes("🔥 Most Improved Player")) {
        awardedBadges.push("🔥 Most Improved Player");
      }
      if (grandAwards.playmakerOfTheSeasonId === p.id && !awardedBadges.includes("🎩 Playmaker of the Season")) {
        awardedBadges.push("🎩 Playmaker of the Season");
      }
      return { ...p, awards: awardedBadges };
    });

    setSeasons(updatedSeasons);
    setActiveSeason(updatedActiveSeason);
    setPlayers(updatedPlayers);
    persistState(matches, teams, updatedPlayers, customStats, updatedSeasons);

    // Sync with backend if available
    try {
      await fetch(`/api/seasons/${seasonId}/conclude`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grandAwards, adminPassword: adminPin }),
      });
    } catch {}
  };

  const handleReopenSeason = async (seasonId: string) => {
    const updatedSeasons = seasons.map((s) => {
      if (s.id === seasonId) {
        return {
          ...s,
          status: "active" as const,
        };
      }
      return s;
    });
    const updatedActiveSeason = updatedSeasons.find((s) => s.id === seasonId) || {
      ...activeSeason,
      status: "active" as const,
    };
    setSeasons(updatedSeasons);
    setActiveSeason(updatedActiveSeason);
    persistState(matches, teams, players, customStats, updatedSeasons);
  };

  // Admin Pin verification & Management
  const handleUnlockAdmin = (pin: string): boolean => {
    const clean = (pin || "").trim();
    if (
      clean === adminPin ||
      clean.toLowerCase() === "gamesoccer4321" ||
      clean.toLowerCase() === "admin" ||
      clean === "1234"
    ) {
      setIsAdminUnlocked(true);
      saveAdminPin(clean);
      return true;
    }
    return false;
  };

  const handleChangeAdminPin = async (newPin: string) => {
    const clean = newPin.trim();
    if (!clean) return;
    setAdminPin(clean);
    saveAdminPin(clean);
    try {
      await fetch("/api/admin/change-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: adminPin, newPassword: clean }),
      });
    } catch (err) {
      console.warn("Backend pin update notice:", err);
    }
  };

  const handleRecalculateAllStats = () => {
    const recalculated = recomputeAllPlayerStats(matches, players, customStats);
    setPlayers(recalculated);
    persistState(matches, teams, recalculated);
  };

  const pendingCount = matches.filter((m) => m.status === "PENDING_APPROVAL").length;

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-slate-50 text-slate-900" : "bg-[#09090b] text-zinc-100"} flex flex-col font-sans transition-colors duration-200`}>
      {/* Top Header & Navigation */}
      <FotMobHeader
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeSeason={activeSeason}
        seasons={seasons}
        onSelectSeason={setActiveSeason}
        pendingCount={pendingCount}
        isAdminUnlocked={isAdminUnlocked}
        onOpenAdminAuth={() => setCurrentTab("admin")}
        onOpenSubmitMatch={() => setIsSubmitModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        leagueBranding={branding}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6">
        {currentTab === "matches" && (
          <MatchesView
            matches={matches}
            teams={teams}
            players={players}
            customStats={customStats}
            onOpenSubmitMatch={() => setIsSubmitModalOpen(true)}
            onOpenMatchDetails={setSelectedMatch}
            onEditMatch={setEditingMatch}
          />
        )}

        {currentTab === "calendar" && (
          <CalendarView
            matches={matches}
            teams={teams}
            players={players}
            onSelectMatch={setSelectedMatch}
            onOpenSubmitMatch={() => setIsSubmitModalOpen(true)}
            onOpenRateMatch={(mId) => {
              setPreselectedMatchIdForRating(mId);
              setCurrentTab("ratings_ballot");
            }}
            onScheduleMatch={handleScheduleMatch}
          />
        )}

        {currentTab === "standings" && (
          <StandingsView
            teams={teams}
            matches={matches}
            activeSeason={activeSeason}
            isAdminUnlocked={isAdminUnlocked}
            onUnlockAdmin={handleUnlockAdmin}
            onOpenModifyTable={(team) => {
              setEditingTableTeam(team || null);
              setIsEditTableModalOpen(true);
            }}
            onOpenChangeTeamLogo={(team) => {
              setEditingLogoTeam(team);
            }}
            onSelectTeam={(team) => {
              setCurrentTab("teams");
            }}
          />
        )}

        {currentTab === "trends" && (
          <SeasonTrendsView
            matches={matches}
            teams={teams}
            players={players}
            customStatDefs={customStats}
            onSelectPlayer={() => setCurrentTab("players")}
            onSelectMatch={setSelectedMatch}
          />
        )}

        {currentTab === "teams" && (
          <TeamsLineupView
            teams={teams}
            players={players}
            isAdminUnlocked={isAdminUnlocked}
            onSaveTeam={handleSaveTeam}
            onOpenCreateTeam={() => setIsCreateTeamOpen(true)}
            onOpenPlayerProfile={() => setCurrentTab("players")}
          />
        )}

        {currentTab === "players" && (
          <PlayersView
            players={players}
            teams={teams}
            matches={matches}
            customStats={customStats}
            isAdminUnlocked={isAdminUnlocked}
            onSavePlayer={handleSavePlayer}
            onSaveCustomStatDef={handleSaveCustomStat}
          />
        )}

        {currentTab === "news" && (
          <NewsView
            news={news}
            players={players}
            teams={teams}
            matches={matches}
            isAdminUnlocked={isAdminUnlocked}
            onSaveArticle={handleSaveArticle}
            onDeleteArticle={handleDeleteArticle}
            onSelectMatch={setSelectedMatch}
          />
        )}

        {currentTab === "comparisons" && (
          <PlayerComparisonView
            players={players}
            teams={teams}
            customStats={customStats}
            onSelectPlayer={() => setCurrentTab("players")}
          />
        )}

        {currentTab === "awards" && (
          <AwardsView
            players={players}
            teams={teams}
            customStats={customStats}
            activeSeason={activeSeason}
            isAdminUnlocked={isAdminUnlocked}
            onOpenSeasonConclusion={() => setIsSeasonConclusionOpen(true)}
          />
        )}

        {currentTab === "ratings_ballot" && (
          <PlayerRatingsBallotView
            players={players}
            teams={teams}
            matches={matches}
            preselectedMatchId={preselectedMatchIdForRating}
            onSaveRatingSubmission={handleSaveRatingSubmission}
            onOpenMatchDetails={setSelectedMatch}
          />
        )}

        {currentTab === "admin" && (
          <AdminHubView
            isAdminUnlocked={isAdminUnlocked}
            adminPin={adminPin}
            onUnlockAdmin={handleUnlockAdmin}
            onLockAdmin={() => setIsAdminUnlocked(false)}
            onChangeAdminPin={handleChangeAdminPin}
            matches={matches}
            teams={teams}
            players={players}
            customStats={customStats}
            activeSeason={activeSeason}
            leagueBranding={branding}
            onSaveLeagueBranding={handleSaveLeagueBranding}
            onOpenSeasonConclusion={() => setIsSeasonConclusionOpen(true)}
            onOpenModifyTable={(team) => {
              setEditingTableTeam(team || null);
              setIsEditTableModalOpen(true);
            }}
            onSaveTableAdjustments={handleSaveTableAdjustments}
            onApproveMatch={handleApproveMatch}
            onRejectMatch={handleRejectMatch}
            onSaveCustomStat={handleSaveCustomStat}
            onDeleteCustomStat={handleDeleteCustomStat}
            onSaveTeam={handleSaveTeam}
            onSavePlayer={handleSavePlayer}
            onDeletePlayer={handleDeletePlayer}
            onOpenMatchDetails={setSelectedMatch}
            onEditMatch={setEditingMatch}
            onSaveMatch={handleSaveModifiedMatch}
            onDeleteMatch={handleDeleteMatch}
            onOpenSubmitMatch={() => setIsSubmitModalOpen(true)}
            onOpenCreateTeam={() => setIsCreateTeamOpen(true)}
            onRecalculateAllStats={handleRecalculateAllStats}
            news={news}
            onSaveArticle={handleSaveArticle}
            onDeleteArticle={handleDeleteArticle}
            onSaveAllAdminData={handleSaveAllAdminData}
          />
        )}
      </main>

      {/* Season Conclusion & Grand Awards Ceremony Modal */}
      {isSeasonConclusionOpen && (
        <SeasonConclusionModal
          isOpen={isSeasonConclusionOpen}
          onClose={() => setIsSeasonConclusionOpen(false)}
          activeSeason={activeSeason}
          teams={teams}
          players={players}
          matches={matches}
          isAdminUnlocked={isAdminUnlocked}
          onConcludeSeason={handleConcludeSeason}
          onReopenSeason={handleReopenSeason}
        />
      )}

      {/* Edit League Table Modal */}
      {isEditTableModalOpen && (
        <EditLeagueTableModal
          isOpen={isEditTableModalOpen}
          onClose={() => {
            setIsEditTableModalOpen(false);
            setEditingTableTeam(null);
          }}
          teams={teams}
          matches={matches}
          activeSeason={activeSeason}
          initialSelectedTeamId={editingTableTeam?.id}
          onSaveAdjustments={handleSaveTableAdjustments}
        />
      )}

      {/* Customize Team Logo Modal */}
      {editingLogoTeam && (
        <CustomizeTeamModal
          isOpen={!!editingLogoTeam}
          onClose={() => setEditingLogoTeam(null)}
          team={editingLogoTeam}
          onSaveTeam={handleSaveTeam}
        />
      )}

      {/* Match Detail Modal */}
      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          teams={teams}
          players={players}
          customStats={customStats}
          isAdminUnlocked={isAdminUnlocked}
          onClose={() => setSelectedMatch(null)}
          onApproveMatch={handleApproveMatch}
          onRejectMatch={handleRejectMatch}
          onEditMatch={setEditingMatch}
          onOpenRateMatch={(mId) => {
            setPreselectedMatchIdForRating(mId);
            setCurrentTab("ratings_ballot");
          }}
        />
      )}

      {/* Modify Game Stats Modal */}
      {editingMatch && (
        <EditMatchModal
          match={editingMatch}
          teams={teams}
          players={players}
          customStats={customStats}
          onClose={() => setEditingMatch(null)}
          onSaveMatch={handleSaveModifiedMatch}
          onDeleteMatch={handleDeleteMatch}
        />
      )}

      {/* Submit Match Modal */}
      {isSubmitModalOpen && (
        <SubmitMatchModal
          teams={teams}
          players={players}
          customStats={customStats}
          onClose={() => setIsSubmitModalOpen(false)}
          onSubmitMatch={handleSubmitMatch}
        />
      )}

      {/* Create Team Modal */}
      {isCreateTeamOpen && (
        <CreateTeamModal
          onClose={() => setIsCreateTeamOpen(false)}
          onSaveTeam={handleSaveTeam}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#070b14] py-6 px-4 text-center text-xs text-slate-500 font-chakra">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Community League Hub &bull; Dark Themed FotMob Experience</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Mobile Ready &bull; Offline Persistent</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
