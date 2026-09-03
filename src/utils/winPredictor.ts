import { Team, PlayerProfile, Match } from "../types";

export interface WinPredictionResult {
  homeTeamId: string;
  awayTeamId: string;
  homeWinProb: number; // 0 - 100
  drawProb: number;    // 0 - 100
  awayWinProb: number; // 0 - 100
  expectedHomeScore: number;
  expectedAwayScore: number;
  homeAttackRating: number; // 0 - 100
  homeDefenseRating: number; // 0 - 100
  awayAttackRating: number; // 0 - 100
  awayDefenseRating: number; // 0 - 100
  headToHeadSummary: {
    homeWins: number;
    awayWins: number;
    draws: number;
    totalPlayed: number;
  };
  keyFactors: string[];
  favoriteTeamId: string | null;
  confidenceRating: "HIGH" | "MEDIUM" | "BALANCED";
}

/**
 * Calculates win prediction based on actual approved match results,
 * goals per 60 mins, xG differential, player ratings, and head-to-head records.
 */
export function calculateMatchWinPrediction(
  homeTeamId: string,
  awayTeamId: string,
  matches: Match[],
  players: PlayerProfile[],
  teams: Team[]
): WinPredictionResult {
  const safeMatches = matches || [];
  const safePlayers = players || [];
  const safeTeams = teams || [];

  const approved = safeMatches.filter((m) => m.status === "APPROVED");
  const homeTeam = safeTeams.find((t) => t.id === homeTeamId);
  const awayTeam = safeTeams.find((t) => t.id === awayTeamId);

  // 1. Head to Head Matches
  const h2h = approved.filter(
    (m) =>
      (m.homeTeamId === homeTeamId && m.awayTeamId === awayTeamId) ||
      (m.homeTeamId === awayTeamId && m.awayTeamId === homeTeamId)
  );

  let homeH2hWins = 0;
  let awayH2hWins = 0;
  let h2hDraws = 0;

  h2h.forEach((m) => {
    const isHomeActualHome = m.homeTeamId === homeTeamId;
    const homeTeamScore = isHomeActualHome ? m.homeScore : m.awayScore;
    const awayTeamScore = isHomeActualHome ? m.awayScore : m.homeScore;

    if (homeTeamScore > awayTeamScore) {
      homeH2hWins += 1;
    } else if (awayTeamScore > homeTeamScore) {
      awayH2hWins += 1;
    } else {
      // Draw (check penalty winner if available)
      if (m.penaltyWinnerTeamId === homeTeamId) {
        homeH2hWins += 0.5;
        h2hDraws += 1;
      } else if (m.penaltyWinnerTeamId === awayTeamId) {
        awayH2hWins += 0.5;
        h2hDraws += 1;
      } else {
        h2hDraws += 1;
      }
    }
  });

  // 2. Compute Team Baseline Performance
  const computeTeamMetrics = (teamId: string) => {
    const teamMatches = approved.filter(
      (m) => m.homeTeamId === teamId || m.awayTeamId === teamId
    );
    const teamPlayers = safePlayers.filter((p) => p.teamId === teamId);

    let totalGoalsScored = 0;
    let totalGoalsConceded = 0;
    let totalXgFor = 0;
    let totalWins = 0;

    teamMatches.forEach((m) => {
      const isHome = m.homeTeamId === teamId;
      const scored = isHome ? m.homeScore : m.awayScore;
      const conceded = isHome ? m.awayScore : m.homeScore;
      const xg = isHome ? (m.homeXg || scored * 0.9) : (m.awayXg || scored * 0.9);

      totalGoalsScored += scored;
      totalGoalsConceded += conceded;
      totalXgFor += xg;

      if (scored > conceded || m.penaltyWinnerTeamId === teamId) {
        totalWins += 1;
      }
    });

    const gamesCount = Math.max(teamMatches.length, 1);
    const avgScoredPer60 = totalGoalsScored / gamesCount;
    const avgConcededPer60 = totalGoalsConceded / gamesCount;
    const avgXgPer60 = totalXgFor / gamesCount;

    // Player ratings average
    const totalRating = teamPlayers.reduce((acc, p) => acc + (p.stats.averageRating || 8.0), 0);
    const avgRating = teamPlayers.length > 0 ? totalRating / teamPlayers.length : 8.5;

    // Attack rating (0-100)
    const attackRating = Math.min(
      99,
      Math.max(40, Math.round(avgScoredPer60 * 8 + avgXgPer60 * 4 + (avgRating - 7) * 15))
    );

    // Defense rating (0-100)
    const defenseRating = Math.min(
      99,
      Math.max(40, Math.round(90 - avgConcededPer60 * 8 + (avgRating - 7) * 10))
    );

    return {
      gamesCount,
      avgScoredPer60,
      avgConcededPer60,
      avgXgPer60,
      avgRating,
      attackRating,
      defenseRating,
      winPct: totalWins / gamesCount,
    };
  };

  const homeMetrics = computeTeamMetrics(homeTeamId);
  const awayMetrics = computeTeamMetrics(awayTeamId);

  // Expected scores calculation per 60-min match
  const rawExpectedHome = (homeMetrics.avgScoredPer60 + awayMetrics.avgConcededPer60) / 2 || 6.5;
  const rawExpectedAway = (awayMetrics.avgScoredPer60 + homeMetrics.avgConcededPer60) / 2 || 6.0;

  // Probability weightings
  const homePower = homeMetrics.attackRating * 1.1 + homeMetrics.defenseRating * 0.9 + (homeH2hWins * 10);
  const awayPower = awayMetrics.attackRating * 1.1 + awayMetrics.defenseRating * 0.9 + (awayH2hWins * 10);
  const totalPower = homePower + awayPower;

  let homeProb = Math.round((homePower / totalPower) * 78);
  let awayProb = Math.round((awayPower / totalPower) * 78);
  let drawProb = 100 - (homeProb + awayProb);

  // Normalize
  if (drawProb < 16) {
    drawProb = 18;
    const rem = 82;
    homeProb = Math.round((homePower / totalPower) * rem);
    awayProb = 100 - homeProb - drawProb;
  }

  // Key factors insights
  const keyFactors: string[] = [];
  if (h2h.length > 0) {
    keyFactors.push(`Head-to-Head: ${h2h.length} previous clashes (${homeTeam?.shortName || "Home"} ${Math.round(homeH2hWins)}W - ${Math.round(awayH2hWins)}W ${awayTeam?.shortName || "Away"})`);
  }
  if (homeMetrics.avgScoredPer60 > 5) {
    keyFactors.push(`${homeTeam?.name || "Home team"} averages ${homeMetrics.avgScoredPer60.toFixed(1)} goals per 60-minute game`);
  }
  if (awayMetrics.avgXgPer60 > 5) {
    keyFactors.push(`${awayTeam?.name || "Away team"} generates high-threat ${awayMetrics.avgXgPer60.toFixed(1)} xG per match`);
  }
  keyFactors.push(`60-Minute Game Tempo: Fast-paced end-to-end community format with high shot frequency`);

  const favoriteTeamId = homeProb > awayProb ? homeTeamId : awayProb > homeProb ? awayTeamId : null;
  const diff = Math.abs(homeProb - awayProb);
  const confidenceRating = diff > 20 ? "HIGH" : diff > 8 ? "MEDIUM" : "BALANCED";

  return {
    homeTeamId,
    awayTeamId,
    homeWinProb: homeProb,
    drawProb,
    awayWinProb: awayProb,
    expectedHomeScore: Math.round(rawExpectedHome),
    expectedAwayScore: Math.round(rawExpectedAway),
    homeAttackRating: homeMetrics.attackRating,
    homeDefenseRating: homeMetrics.defenseRating,
    awayAttackRating: awayMetrics.attackRating,
    awayDefenseRating: awayMetrics.defenseRating,
    headToHeadSummary: {
      homeWins: Math.floor(homeH2hWins),
      awayWins: Math.floor(awayH2hWins),
      draws: h2hDraws,
      totalPlayed: h2h.length,
    },
    keyFactors,
    favoriteTeamId,
    confidenceRating,
  };
}
