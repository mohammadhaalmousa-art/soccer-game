import { Match, PlayerProfile, Team, CustomStatDefinition } from "../types";

/**
 * Pure helper function to recompute all player profiles' cumulative stats
 * based on all approved matches in the league.
 */
export function recomputeAllPlayerStats(
  matches: Match[],
  players: PlayerProfile[],
  customStats: CustomStatDefinition[]
): PlayerProfile[] {
  const approvedMatches = matches.filter((m) => m.status === "APPROVED");

  return players.map((player) => {
    let matchesPlayed = 0;
    let goals = 0;
    let assists = 0;
    let yellowCards = 0;
    let redCards = 0;
    let motmCount = 0;
    let totalRatingsSum = 0;
    let ratingCount = 0;
    const ratingHistory: Array<{ matchId: string; matchTitle: string; rating: number; date: string }> = [];

    const customStatCounts: Record<string, number> = {};
    customStats.forEach((cs) => {
      customStatCounts[cs.id] = 0;
    });

    let totalXg = 0;
    let winsCount = 0;

    approvedMatches.forEach((match) => {
      const isLoanedHome = ((match as any).loanedPlayers || []).some(
        (l: any) => l.playerId === player.id && l.loanedToTeamId === match.homeTeamId
      );
      const isLoanedAway = ((match as any).loanedPlayers || []).some(
        (l: any) => l.playerId === player.id && l.loanedToTeamId === match.awayTeamId
      );
      const isHome = match.homeTeamId === player.teamId || isLoanedHome;
      const isAway = match.awayTeamId === player.teamId || isLoanedAway;

      if (!isHome && !isAway) return;

      // Check if player participated in events or lineups
      const hasEvents = (match.events || []).some(
        (e) => e.playerId === player.id || e.assistPlayerId === player.id
      );
      const isStarter =
        (isHome && (match.lineups?.home?.starters?.includes(player.id) || match.lineups?.home?.subs?.includes(player.id))) ||
        (isAway && (match.lineups?.away?.starters?.includes(player.id) || match.lineups?.away?.subs?.includes(player.id)));

      const hasLineupData = Boolean(
        match.lineups?.home?.starters?.length ||
        match.lineups?.away?.starters?.length
      );

      const didPlay = hasLineupData
        ? isStarter || hasEvents
        : isStarter || hasEvents || (match.playerRatings && match.playerRatings[player.id] !== undefined && Number(match.playerRatings[player.id]) > 1);

      // If player actually participated in this match
      if (didPlay) {
        matchesPlayed += 1;
        const myScore = isHome ? match.homeScore : match.awayScore;
        const oppScore = isHome ? match.awayScore : match.homeScore;
        if (myScore > oppScore || match.penaltyWinnerTeamId === player.teamId) {
          winsCount += 1;
        }

        // Check Ratings (Only valid positive ratings for games the player actually played in)
        if (match.playerRatings && match.playerRatings[player.id] !== undefined) {
          const r = Number(match.playerRatings[player.id]);
          if (!isNaN(r) && r > 0) {
            totalRatingsSum += r;
            ratingCount += 1;
            ratingHistory.push({
              matchId: match.id,
              matchTitle: match.title,
              rating: r,
              date: match.date || (match as any).matchDate || "",
            });
          }
        }
      }

      // Check MOTM
      if (match.motmPlayerId === player.id) {
        motmCount += 1;
      }

      // Count events
      (match.events || []).forEach((e) => {
        if (e.type === "GOAL") {
          if (e.playerId === player.id) {
            goals += 1;
            totalXg += e.xgValue ?? 0.65;
          }
          if (e.assistPlayerId === player.id) assists += 1;
        } else if (e.type === "YELLOW_CARD" && e.playerId === player.id) {
          yellowCards += 1;
        } else if (e.type === "RED_CARD" && e.playerId === player.id) {
          redCards += 1;
        } else if (e.type === "CUSTOM_STAT" && e.playerId === player.id && e.customStatId) {
          customStatCounts[e.customStatId] = (customStatCounts[e.customStatId] || 0) + 1;
        }
      });
    });

    let averageRating = 0;
    if (ratingCount > 0) {
      // If ratingCount === 1, totalRatingsSum / 1 is that exact singular rating!
      averageRating = Number((totalRatingsSum / ratingCount).toFixed(2));
    } else if (matchesPlayed === 1) {
      // If a player played one game, use that singular rating directly (never do math with 0)
      if (player.ratingHistory && player.ratingHistory.length === 1 && player.ratingHistory[0].rating > 0) {
        averageRating = player.ratingHistory[0].rating;
      } else if (player.stats?.averageRating && player.stats.averageRating > 0) {
        averageRating = player.stats.averageRating;
      }
    } else if (matchesPlayed > 1 && player.stats?.averageRating && player.stats.averageRating > 0) {
      averageRating = player.stats.averageRating;
    } else {
      averageRating = 0;
    }

    const effectiveMatches = Math.max(matchesPlayed, 1);
    const goalsPer60 = Number((goals / effectiveMatches).toFixed(2));
    const assistsPer60 = Number((assists / effectiveMatches).toFixed(2));
    const finalXg = Number(totalXg.toFixed(2));
    const xgPer60 = Number((finalXg / effectiveMatches).toFixed(2));
    const winRate = matchesPlayed > 0 ? Math.round((winsCount / matchesPlayed) * 100) : 0;
    const finalRatingCount = ratingCount > 0 ? ratingCount : (matchesPlayed === 1 && averageRating > 0 ? 1 : 0);

    return {
      ...player,
      ratingHistory: ratingHistory.length > 0 ? ratingHistory : (player.ratingHistory || []),
      stats: {
        ...player.stats,
        matchesPlayed,
        goals,
        assists,
        xg: finalXg,
        xgPer60,
        goalsPer60,
        assistsPer60,
        winRate,
        yellowCards,
        redCards,
        motmCount,
        averageRating,
        ratingCount: finalRatingCount,
        customStats: customStatCounts,
      },
    };
  });
}
