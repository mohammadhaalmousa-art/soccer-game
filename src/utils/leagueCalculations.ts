import { Team, PlayerProfile, Match, TeamStanding, CustomStatDefinition, SeasonGrandAwards, TeamTableAdjustment, LeagueSeason } from "../types";
import { getTeamLogoUrl } from "../components/TeamBadge";

export function calculateStandings(
  teams: Team[],
  matches: Match[],
  seasonOrId?: LeagueSeason | string,
  tableAdjustments?: Record<string, TeamTableAdjustment>
): TeamStanding[] {
  const seasonId = typeof seasonOrId === "string" ? seasonOrId : seasonOrId?.id;
  const effectiveAdjustments =
    tableAdjustments ||
    (typeof seasonOrId === "object" && seasonOrId?.tableAdjustments
      ? seasonOrId.tableAdjustments
      : undefined);

  // Only include APPROVED matches
  const approvedMatches = matches.filter(
    (m) => m.status === "APPROVED" && (!seasonId || m.seasonId === seasonId)
  );

  const standingsMap = new Map<string, TeamStanding>();

  // Initialize for all teams
  for (const team of teams) {
    standingsMap.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      shortName: team.shortName,
      badgeEmoji: team.badgeEmoji,
      logoUrl: team.logoUrl || getTeamLogoUrl(team.id),
      primaryColor: team.primaryColor,
      played: 0,
      won: 0,
      penaltyWon: 0,
      drawn: 0,
      penaltyLost: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      xgFor: 0,
      xgAgainst: 0,
      xgDifference: 0,
      points: 0,
      form: [],
    });
  }

  // Sort matches chronologically
  const sortedMatches = [...approvedMatches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const match of sortedMatches) {
    const home = standingsMap.get(match.homeTeamId);
    const away = standingsMap.get(match.awayTeamId);

    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;
    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;

    const homeXg = match.homeXg ?? Number((match.homeScore * 0.9 + 0.5).toFixed(1));
    const awayXg = match.awayXg ?? Number((match.awayScore * 0.9 + 0.5).toFixed(1));
    home.xgFor = Number((home.xgFor + homeXg).toFixed(1));
    home.xgAgainst = Number((home.xgAgainst + awayXg).toFixed(1));
    away.xgFor = Number((away.xgFor + awayXg).toFixed(1));
    away.xgAgainst = Number((away.xgAgainst + homeXg).toFixed(1));

    if (match.homeScore > match.awayScore) {
      // Home Regulation Win: 3 points, Away Regulation Loss: 0 points
      home.won += 1;
      home.points += 3;
      home.form.push("W");
      away.lost += 1;
      away.points += 0;
      away.form.push("L");
    } else if (match.homeScore < match.awayScore) {
      // Away Regulation Win: 3 points, Home Regulation Loss: 0 points
      away.won += 1;
      away.points += 3;
      away.form.push("W");
      home.lost += 1;
      home.points += 0;
      home.form.push("L");
    } else {
      // Tie score in regular time: Check if decided on penalties
      if (match.penaltyWinnerTeamId) {
        if (match.penaltyWinnerTeamId === match.homeTeamId) {
          // Home Win on Penalties: 2 points, Away Loss on Penalties: 0 points
          home.penaltyWon = (home.penaltyWon || 0) + 1;
          home.points += 2;
          home.form.push("W");
          away.penaltyLost = (away.penaltyLost || 0) + 1;
          away.points += 0;
          away.form.push("L");
        } else if (match.penaltyWinnerTeamId === match.awayTeamId) {
          // Away Win on Penalties: 2 points, Home Loss on Penalties: 0 points
          away.penaltyWon = (away.penaltyWon || 0) + 1;
          away.points += 2;
          away.form.push("W");
          home.penaltyLost = (home.penaltyLost || 0) + 1;
          home.points += 0;
          home.form.push("L");
        } else {
          // Standard Draw: 1 point each
          home.drawn += 1;
          home.points += 1;
          home.form.push("D");
          away.drawn += 1;
          away.points += 1;
          away.form.push("D");
        }
      } else {
        // Standard Draw: 1 point each
        home.drawn += 1;
        home.points += 1;
        home.form.push("D");
        away.drawn += 1;
        away.points += 1;
        away.form.push("D");
      }
    }

    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;
    home.xgDifference = Number((home.xgFor - home.xgAgainst).toFixed(1));
    away.xgDifference = Number((away.xgFor - away.xgAgainst).toFixed(1));
  }

  // Apply table adjustments & overrides (if configured for this season / team)
  for (const team of teams) {
    const standing = standingsMap.get(team.id);
    if (!standing) continue;

    const adj = effectiveAdjustments?.[team.id] || team.tableAdjustment;
    standing.originalPoints = standing.points;

    if (adj) {
      if (adj.overrideEnabled) {
        standing.isOverridden = true;
        if (typeof adj.playedOverride === "number") standing.played = adj.playedOverride;
        if (typeof adj.wonOverride === "number") standing.won = adj.wonOverride;
        if (typeof adj.penaltyWonOverride === "number") standing.penaltyWon = adj.penaltyWonOverride;
        if (typeof adj.drawnOverride === "number") standing.drawn = adj.drawnOverride;
        if (typeof adj.penaltyLostOverride === "number") standing.penaltyLost = adj.penaltyLostOverride;
        if (typeof adj.lostOverride === "number") standing.lost = adj.lostOverride;
        if (typeof adj.goalsForOverride === "number") standing.goalsFor = adj.goalsForOverride;
        if (typeof adj.goalsAgainstOverride === "number") standing.goalsAgainst = adj.goalsAgainstOverride;
        standing.goalDifference = standing.goalsFor - standing.goalsAgainst;

        if (typeof adj.pointsOverride === "number") {
          standing.points = adj.pointsOverride;
        } else {
          standing.points =
            standing.won * 3 +
            (standing.penaltyWon || 0) * 2 +
            standing.drawn * 1 +
            (adj.pointsAdjustment || 0);
        }

        if (typeof adj.pointsAdjustment === "number") {
          standing.pointsAdjustment = adj.pointsAdjustment;
        }
        if (adj.notes) {
          standing.adjustmentNotes = adj.notes;
        }
      } else if (typeof adj.pointsAdjustment === "number" && adj.pointsAdjustment !== 0) {
        standing.points += adj.pointsAdjustment;
        standing.pointsAdjustment = adj.pointsAdjustment;
        standing.adjustmentNotes = adj.notes;
      }
    }
  }

  // Convert to array and sort by: Points (desc) -> Goal Diff (desc) -> Goals For (desc) -> Regulation Wins (desc)
  const list = Array.from(standingsMap.values());
  list.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return b.won - a.won;
  });

  // Limit form to last 5
  return list.map((item) => ({
    ...item,
    form: item.form.slice(-5),
  }));
}

export function computeAggregatedPlayerStats(players: PlayerProfile[], matches: Match[]) {
  const approvedMatches = matches.filter((m) => m.status === "APPROVED");

  // Clone player stats map
  const statsMap = new Map<string, PlayerProfile["stats"]>();
  const ratingAccumulator = new Map<string, { total: number; count: number }>();
  const customStatsAccumulator = new Map<string, Record<string, number>>();

  for (const player of players) {
    statsMap.set(player.id, {
      matchesPlayed: 0,
      goals: 0,
      assists: 0,
      xg: player.stats.xg || 0,
      xgPer60: player.stats.xgPer60 || 0,
      goalsPer60: player.stats.goalsPer60 || 0,
      assistsPer60: player.stats.assistsPer60 || 0,
      winRate: player.stats.winRate || 0,
      ratingCount: player.stats.ratingCount || 0,
      yellowCards: 0,
      redCards: 0,
      cleanSheets: 0,
      saves: 0,
      motmCount: 0,
      dpotmCount: 0,
      averageRating: 0,
      customStats: {},
    });
    ratingAccumulator.set(player.id, { total: 0, count: 0 });
    customStatsAccumulator.set(player.id, {});
  }

  for (const match of approvedMatches) {
    // Check MOTM
    if (match.motmPlayerId && statsMap.has(match.motmPlayerId)) {
      statsMap.get(match.motmPlayerId)!.motmCount += 1;
    }

    // Check DPOTM (Defensive Player of the Match)
    if (match.dpotmPlayerId && statsMap.has(match.dpotmPlayerId)) {
      statsMap.get(match.dpotmPlayerId)!.dpotmCount += 1;
    }

    // Check appearances from lineups or ratings
    const participatedPlayerIds = new Set<string>();
    if (match.lineups) {
      match.lineups.home.starters.forEach((id) => participatedPlayerIds.add(id));
      match.lineups.away.starters.forEach((id) => participatedPlayerIds.add(id));
    }
    Object.keys(match.playerRatings || {}).forEach((id) => participatedPlayerIds.add(id));

    participatedPlayerIds.forEach((pid) => {
      if (statsMap.has(pid)) {
        statsMap.get(pid)!.matchesPlayed += 1;
      }
    });

    // Check Clean Sheets for GKs & DEF in 0 goal matches
    if (match.homeScore === 0) {
      // Away team clean sheet
      const awayTeamStarters = match.lineups?.away.starters || [];
      awayTeamStarters.forEach((pid) => {
        const p = players.find((pl) => pl.id === pid);
        if (p && (p.position === "GK" || p.position === "DEF") && statsMap.has(pid)) {
          statsMap.get(pid)!.cleanSheets += 1;
        }
      });
    }
    if (match.awayScore === 0) {
      // Home team clean sheet
      const homeTeamStarters = match.lineups?.home.starters || [];
      homeTeamStarters.forEach((pid) => {
        const p = players.find((pl) => pl.id === pid);
        if (p && (p.position === "GK" || p.position === "DEF") && statsMap.has(pid)) {
          statsMap.get(pid)!.cleanSheets += 1;
        }
      });
    }

    // Aggregate Events
    for (const evt of (match.events || [])) {
      const pStats = statsMap.get(evt.playerId);
      if (pStats) {
        if (evt.type === "GOAL") pStats.goals += 1;
        if (evt.type === "YELLOW_CARD") pStats.yellowCards += 1;
        if (evt.type === "RED_CARD") pStats.redCards += 1;
        if (evt.type === "CUSTOM_STAT" && evt.customStatId) {
          const cMap = customStatsAccumulator.get(evt.playerId) || {};
          cMap[evt.customStatId] = (cMap[evt.customStatId] || 0) + 1;
          customStatsAccumulator.set(evt.playerId, cMap);
          if (evt.customStatId === "saves" || evt.customStatId === "key_saves") {
            pStats.saves += 1;
          }
        }
      }

      if (evt.assistPlayerId && statsMap.has(evt.assistPlayerId)) {
        statsMap.get(evt.assistPlayerId)!.assists += 1;
      }
    }

    // Aggregate Ratings
    if (match.playerRatings) {
      const hasLineupData = Boolean(
        match.lineups?.home?.starters?.length ||
        match.lineups?.away?.starters?.length
      );

      for (const [pid, rating] of Object.entries(match.playerRatings)) {
        if (ratingAccumulator.has(pid) && typeof rating === "number" && rating > 0) {
          // If match has lineup data, only count ratings for players who actually participated
          if (hasLineupData) {
            const wasInLineup = Boolean(
              match.lineups?.home?.starters?.includes(pid) ||
              match.lineups?.home?.subs?.includes(pid) ||
              match.lineups?.away?.starters?.includes(pid) ||
              match.lineups?.away?.subs?.includes(pid)
            );
            const hadEvents = (match.events || []).some(
              (e) => e.playerId === pid || e.assistPlayerId === pid
            );
            if (!wasInLineup && !hadEvents) continue;
          }

          const acc = ratingAccumulator.get(pid)!;
          acc.total += rating;
          acc.count += 1;
        }
      }
    }
  }

  // Combine
  return players.map((player) => {
    const computed = statsMap.get(player.id) || { ...player.stats };
    const ratingAcc = ratingAccumulator.get(player.id);
    const customStats = customStatsAccumulator.get(player.id) || {};
    const totalMatches = Math.max(player.stats.matchesPlayed, computed.matchesPlayed);

    let avgRating = 0;
    let finalRatingCount = player.stats.ratingCount || 0;

    if (ratingAcc && ratingAcc.count > 0) {
      // When ratingAcc.count === 1, total / 1 is that exact singular rating!
      avgRating = Number((ratingAcc.total / ratingAcc.count).toFixed(2));
      finalRatingCount = ratingAcc.count;
    } else if (totalMatches === 1) {
      // If a player played one game, use that singular rating directly (never do math with 0)
      if (player.ratingHistory && player.ratingHistory.length === 1 && player.ratingHistory[0].rating > 0) {
        avgRating = player.ratingHistory[0].rating;
      } else if (player.stats.averageRating > 0) {
        avgRating = player.stats.averageRating;
      }
      finalRatingCount = avgRating > 0 ? 1 : 0;
    } else if (totalMatches > 1 && player.stats.averageRating > 0) {
      avgRating = player.stats.averageRating;
    } else {
      avgRating = 0;
      finalRatingCount = 0;
    }

    // Merge baseline seeds with computed events
    const mergedCustomStats = { ...player.stats.customStats };
    for (const [k, v] of Object.entries(customStats)) {
      mergedCustomStats[k] = (mergedCustomStats[k] || 0) + v;
    }

    return {
      ...player,
      stats: {
        matchesPlayed: totalMatches,
        goals: Math.max(player.stats.goals, computed.goals),
        assists: Math.max(player.stats.assists, computed.assists),
        xg: player.stats.xg,
        xgPer60: player.stats.xgPer60,
        goalsPer60: player.stats.goalsPer60,
        assistsPer60: player.stats.assistsPer60,
        winRate: totalMatches > 0 ? player.stats.winRate : 0,
        ratingCount: finalRatingCount,
        yellowCards: Math.max(player.stats.yellowCards, computed.yellowCards),
        redCards: Math.max(player.stats.redCards, computed.redCards),
        cleanSheets: Math.max(player.stats.cleanSheets, computed.cleanSheets),
        saves: Math.max(player.stats.saves, computed.saves),
        motmCount: Math.max(player.stats.motmCount, computed.motmCount),
        dpotmCount: Math.max(player.stats.dpotmCount || 0, computed.dpotmCount || 0),
        averageRating: avgRating,
        customStats: mergedCustomStats,
      },
    };
  });
}

/**
 * Calculates official Grand Season Awards based on current leaderboards, standings, and performance metrics.
 */
export function calculateGrandAwards(
  teams: Team[],
  players: PlayerProfile[],
  matches: Match[],
  seasonId?: string
): SeasonGrandAwards {
  const standings = calculateStandings(teams, matches, seasonId);
  const updatedPlayers = computeAggregatedPlayerStats(players, matches);

  // Helper to get effective rating for player awards:
  // "if a player played one game, then for the player award use that singular rating. So dont make the math with a 0 when u make ratings"
  const getAwardRating = (p: PlayerProfile): number => {
    const mp = p.stats?.matchesPlayed || 0;
    const rc = p.stats?.ratingCount || 0;
    if (mp === 0 && rc === 0) return 0; // Unplayed players cannot win rating awards

    if (mp === 1 || rc === 1) {
      if (p.ratingHistory && p.ratingHistory.length === 1 && p.ratingHistory[0].rating > 0) {
        return p.ratingHistory[0].rating;
      }
      return p.stats?.averageRating || 0;
    }
    return p.stats?.averageRating || 0;
  };

  const activePlayers = updatedPlayers.filter((p) => (p.stats.matchesPlayed || 0) > 0);
  const candidates = activePlayers.length > 0 ? activePlayers : updatedPlayers;

  // 1. League Champions: Top team by points / GD / GF
  const championTeamId = standings.length > 0 ? standings[0].teamId : teams[0]?.id || "team_red";

  // 2. Golden Boot: Most goals
  const goldenBootPlayer = [...candidates].sort((a, b) => {
    if (b.stats.goals !== a.stats.goals) return b.stats.goals - a.stats.goals;
    if (b.stats.assists !== a.stats.assists) return b.stats.assists - a.stats.assists;
    return getAwardRating(b) - getAwardRating(a);
  })[0];

  // 3. Golden Glove: Top Goalkeeper (position === 'GK' with highest saves/rating/clean sheets)
  const gks = candidates.filter((p) => p.position === "GK");
  const goldenGlovePlayer =
    gks.length > 0
      ? gks.sort((a, b) => {
          const scoreA = (a.stats.saves || 0) * 1.5 + (a.stats.cleanSheets || 0) * 5 + getAwardRating(a);
          const scoreB = (b.stats.saves || 0) * 1.5 + (b.stats.cleanSheets || 0) * 5 + getAwardRating(b);
          return scoreB - scoreA;
        })[0]
      : candidates[0];

  // 4. Defensive Player of the Season: Defenders/DMs with highest DPOTM + tackles + rating
  const defenders = candidates.filter((p) => p.position === "DEF" || p.position === "GK");
  const defensiveCandidates = defenders.length > 0 ? defenders : candidates;
  const defensivePlayerOfTheSeason = [...defensiveCandidates].sort((a, b) => {
    const dpotmA = a.stats.dpotmCount || 0;
    const dpotmB = b.stats.dpotmCount || 0;
    if (dpotmB !== dpotmA) return dpotmB - dpotmA;
    const tacklesA = (a.stats.customStats?.tackles_won || 0) + (a.stats.cleanSheets || 0) * 3;
    const tacklesB = (b.stats.customStats?.tackles_won || 0) + (b.stats.cleanSheets || 0) * 3;
    if (tacklesB !== tacklesA) return tacklesB - tacklesA;
    return getAwardRating(b) - getAwardRating(a);
  })[0];

  // 5. Player of the Season (MVP): Top overall contribution
  // Uses the singular rating directly for 1 game played without making math with 0
  const playerOfTheSeason = [...candidates].sort((a, b) => {
    const ratingA = getAwardRating(a);
    const ratingB = getAwardRating(b);
    const scoreA = ratingA * 2.5 + (a.stats.goals || 0) * 1.2 + (a.stats.assists || 0) + (a.stats.motmCount || 0) * 2;
    const scoreB = ratingB * 2.5 + (b.stats.goals || 0) * 1.2 + (b.stats.assists || 0) + (b.stats.motmCount || 0) * 2;
    return scoreB - scoreA;
  })[0];

  // 6. Most Improved Player: Player with largest rating climb or breakout
  const mostImprovedPlayer = [...candidates].sort((a, b) => {
    const histA = a.ratingHistory || [];
    const deltaA = histA.length >= 2 ? histA[histA.length - 1].rating - histA[0].rating : 0;
    const histB = b.ratingHistory || [];
    const deltaB = histB.length >= 2 ? histB[histB.length - 1].rating - histB[0].rating : 0;
    if (deltaB !== deltaA) return deltaB - deltaA;
    return (b.stats.ratingCount || 0) - (a.stats.ratingCount || 0);
  })[0];

  // Playmaker of the season
  const playmaker = [...candidates].sort((a, b) => {
    const pA = (a.stats.assists || 0) * 2 + (a.stats.customStats?.big_chances_created || 0);
    const pB = (b.stats.assists || 0) * 2 + (b.stats.customStats?.big_chances_created || 0);
    return pB - pA;
  })[0];

  return {
    concludedDate: new Date().toISOString(),
    leagueChampionsTeamId: championTeamId,
    playerOfTheSeasonId: playerOfTheSeason?.id || updatedPlayers[0]?.id || "p_samuel",
    defensivePlayerOfTheSeasonId: defensivePlayerOfTheSeason?.id || "p_marios",
    goldenGlovePlayerId: goldenGlovePlayer?.id || "p_eliot",
    goldenBootPlayerId: goldenBootPlayer?.id || "p_samuel",
    mostImprovedPlayerId: mostImprovedPlayer?.id || "p_maxime",
    playmakerOfTheSeasonId: playmaker?.id || "p_mohammad",
    finalSummaryNotes: `Official Season Conclusion. Top scorer: ${goldenBootPlayer?.name} (${goldenBootPlayer?.stats.goals} goals). Top defender: ${defensivePlayerOfTheSeason?.name}. Golden Glove: ${goldenGlovePlayer?.name}.`,
  };
}

// Tactical Formations presets
export interface FormationPreset {
  id: string;
  name: string;
  category: "4v4" | "5v5" | "6v6" | "7v7" | "8v8" | "9v9" | "11v11" | "Custom";
  slots: {
    id: string;
    role: "GK" | "DEF" | "MID" | "FWD";
    label: string;
    top: number; // percentage from top 0-100
    left: number; // percentage from left 0-100
  }[];
}

export const FORMATION_PRESETS: FormationPreset[] = [
  // 7v7 Formations
  {
    id: "7v7_3-2-1",
    name: "3-2-1 (7-a-side Balanced)",
    category: "7v7",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: 88, left: 50 },
      { id: "lb", role: "DEF", label: "LB", top: 68, left: 20 },
      { id: "cb", role: "DEF", label: "CB", top: 70, left: 50 },
      { id: "rb", role: "DEF", label: "RB", top: 68, left: 80 },
      { id: "lm", role: "MID", label: "LM", top: 42, left: 32 },
      { id: "rm", role: "MID", label: "RM", top: 42, left: 68 },
      { id: "st", role: "FWD", label: "ST", top: 16, left: 50 },
    ],
  },
  {
    id: "7v7_2-3-1",
    name: "2-3-1 (7-a-side Attacking)",
    category: "7v7",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: 88, left: 50 },
      { id: "lcb", role: "DEF", label: "LCB", top: 70, left: 30 },
      { id: "rcb", role: "DEF", label: "RCB", top: 70, left: 70 },
      { id: "lw", role: "MID", label: "LW", top: 42, left: 20 },
      { id: "cm", role: "MID", label: "CAM", top: 45, left: 50 },
      { id: "rw", role: "MID", label: "RW", top: 42, left: 80 },
      { id: "st", role: "FWD", label: "ST", top: 16, left: 50 },
    ],
  },
  {
    id: "7v7_2-2-2",
    name: "2-2-2 (7-a-side Direct)",
    category: "7v7",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: 88, left: 50 },
      { id: "lcb", role: "DEF", label: "LCB", top: 70, left: 32 },
      { id: "rcb", role: "DEF", label: "RCB", top: 70, left: 68 },
      { id: "lcm", role: "MID", label: "LCM", top: 44, left: 32 },
      { id: "rcm", role: "MID", label: "RCM", top: 44, left: 68 },
      { id: "lst", role: "FWD", label: "LF", top: 18, left: 32 },
      { id: "rst", role: "FWD", label: "RF", top: 18, left: 68 },
    ],
  },

  // 5v5 Formations
  {
    id: "5v5_1-2-1",
    name: "1-2-1 (5-a-side Futsal Diamond)",
    category: "5v5",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: 88, left: 50 },
      { id: "fixo", role: "DEF", label: "FIXO", top: 66, left: 50 },
      { id: "ala_l", role: "MID", label: "ALA L", top: 44, left: 22 },
      { id: "ala_r", role: "MID", label: "ALA R", top: 44, left: 78 },
      { id: "pivo", role: "FWD", label: "PIVO", top: 18, left: 50 },
    ],
  },
  {
    id: "5v5_2-2",
    name: "2-2 (5-a-side Square Box)",
    category: "5v5",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: 88, left: 50 },
      { id: "ld", role: "DEF", label: "LD", top: 66, left: 30 },
      { id: "rd", role: "DEF", label: "RD", top: 66, left: 70 },
      { id: "lf", role: "FWD", label: "LF", top: 25, left: 30 },
      { id: "rf", role: "FWD", label: "RF", top: 25, left: 70 },
    ],
  },

  // 6v6 Formations
  {
    id: "6v6_2-2-1",
    name: "2-2-1 (6-a-side Balanced)",
    category: "6v6",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: 88, left: 50 },
      { id: "ld", role: "DEF", label: "LB", top: 68, left: 30 },
      { id: "rd", role: "DEF", label: "RB", top: 68, left: 70 },
      { id: "lm", role: "MID", label: "LM", top: 44, left: 30 },
      { id: "rm", role: "MID", label: "RM", top: 44, left: 70 },
      { id: "st", role: "FWD", label: "ST", top: 18, left: 50 },
    ],
  },
  {
    id: "6v6_2-1-2",
    name: "2-1-2 (6-a-side Attack)",
    category: "6v6",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: 88, left: 50 },
      { id: "ld", role: "DEF", label: "LB", top: 68, left: 30 },
      { id: "rd", role: "DEF", label: "RB", top: 68, left: 70 },
      { id: "cm", role: "MID", label: "CM", top: 45, left: 50 },
      { id: "lf", role: "FWD", label: "LF", top: 20, left: 32 },
      { id: "rf", role: "FWD", label: "RF", top: 20, left: 68 },
    ],
  },

  // 4v4 Formations
  {
    id: "4v4_1-2-1",
    name: "1-1-1 (4-a-side Spine)",
    category: "4v4",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: 88, left: 50 },
      { id: "def", role: "DEF", label: "DEF", top: 66, left: 50 },
      { id: "mid", role: "MID", label: "MID", top: 42, left: 50 },
      { id: "fwd", role: "FWD", label: "FWD", top: 18, left: 50 },
    ],
  },

  // 8v8 Formations
  {
    id: "8v8_3-3-1",
    name: "3-3-1 (8-a-side Solid)",
    category: "8v8",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: 88, left: 50 },
      { id: "lb", role: "DEF", label: "LB", top: 70, left: 22 },
      { id: "cb", role: "DEF", label: "CB", top: 72, left: 50 },
      { id: "rb", role: "DEF", label: "RB", top: 70, left: 78 },
      { id: "lm", role: "MID", label: "LM", top: 44, left: 25 },
      { id: "cm", role: "MID", label: "CM", top: 46, left: 50 },
      { id: "rm", role: "MID", label: "RM", top: 44, left: 75 },
      { id: "st", role: "FWD", label: "ST", top: 18, left: 50 },
    ],
  },

  // 9v9 Formations
  {
    id: "9v9_3-3-2",
    name: "3-3-2 (9-a-side Dual Strike)",
    category: "9v9",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: 88, left: 50 },
      { id: "lb", role: "DEF", label: "LB", top: 70, left: 22 },
      { id: "cb", role: "DEF", label: "CB", top: 72, left: 50 },
      { id: "rb", role: "DEF", label: "RB", top: 70, left: 78 },
      { id: "lm", role: "MID", label: "LM", top: 46, left: 25 },
      { id: "cm", role: "MID", label: "CM", top: 48, left: 50 },
      { id: "rm", role: "MID", label: "RM", top: 46, left: 75 },
      { id: "lf", role: "FWD", label: "LF", top: 18, left: 35 },
      { id: "rf", role: "FWD", label: "RF", top: 18, left: 65 },
    ],
  },

  // 11v11 Formations
  {
    id: "11v11_4-3-3",
    name: "4-3-3 (11-a-side Classic)",
    category: "11v11",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: 90, left: 50 },
      { id: "lb", role: "DEF", label: "LB", top: 72, left: 16 },
      { id: "lcb", role: "DEF", label: "LCB", top: 74, left: 38 },
      { id: "rcb", role: "DEF", label: "RCB", top: 74, left: 62 },
      { id: "rb", role: "DEF", label: "RB", top: 72, left: 84 },
      { id: "cdm", role: "MID", label: "CDM", top: 54, left: 50 },
      { id: "lcm", role: "MID", label: "LCM", top: 42, left: 30 },
      { id: "rcm", role: "MID", label: "RCM", top: 42, left: 70 },
      { id: "lw", role: "FWD", label: "LW", top: 20, left: 20 },
      { id: "st", role: "FWD", label: "ST", top: 14, left: 50 },
      { id: "rw", role: "FWD", label: "RW", top: 20, left: 80 },
    ],
  },
  {
    id: "11v11_4-4-2",
    name: "4-4-2 (11-a-side Standard)",
    category: "11v11",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: 90, left: 50 },
      { id: "lb", role: "DEF", label: "LB", top: 72, left: 16 },
      { id: "lcb", role: "DEF", label: "LCB", top: 74, left: 38 },
      { id: "rcb", role: "DEF", label: "RCB", top: 74, left: 62 },
      { id: "rb", role: "DEF", label: "RB", top: 72, left: 84 },
      { id: "lm", role: "MID", label: "LM", top: 45, left: 18 },
      { id: "lcm", role: "MID", label: "LCM", top: 48, left: 39 },
      { id: "rcm", role: "MID", label: "RCM", top: 48, left: 61 },
      { id: "rm", role: "MID", label: "RM", top: 45, left: 82 },
      { id: "lst", role: "FWD", label: "LS", top: 18, left: 35 },
      { id: "rst", role: "FWD", label: "RS", top: 18, left: 65 },
    ],
  },
];

export function getFormationPreset(formationId: string): FormationPreset {
  if (!formationId || typeof formationId !== "string") return FORMATION_PRESETS[0];
  const q = formationId.toLowerCase();
  const found = FORMATION_PRESETS.find(
    (f) => f.id === formationId || (f.name && f.name.toLowerCase().includes(q))
  );
  if (found) return found;

  // Fallback default
  return FORMATION_PRESETS[0];
}
