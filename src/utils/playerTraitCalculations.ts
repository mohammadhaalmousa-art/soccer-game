import { PlayerProfile, Match, CustomStatDefinition } from "../types";

export interface PlayerTraitScores {
  finishing: number; // 0 - 100 percentile
  playmaking: number; // 0 - 100 percentile
  defending: number; // 0 - 100 percentile
  rating: number; // 0 - 100 percentile
  reliability: number; // 0 - 100 percentile
  overallOvr: number; // 0 - 99 overall rating
  archetype: string;
  summary: string;
}

export function calculatePlayerTraits(
  player: PlayerProfile,
  allPlayers: PlayerProfile[],
  _matches: Match[] = [],
  _customStats: CustomStatDefinition[] = []
): PlayerTraitScores {
  const safePlayers = allPlayers.length > 0 ? allPlayers : [player];

  // Helper for percentile calculation
  const getPercentile = (rawValues: number[], targetVal: number): number => {
    if (rawValues.length <= 1) return 75;
    const sorted = [...rawValues].sort((a, b) => a - b);
    const belowCount = sorted.filter((v) => v < targetVal).length;
    const equalCount = sorted.filter((v) => v === targetVal).length;
    
    // Percentile rank formula
    const rank = ((belowCount + 0.5 * equalCount) / sorted.length) * 100;
    // Map cleanly to 25-99 range for enjoyable video-game style radar dynamics
    return Math.min(99, Math.max(30, Math.round(rank)));
  };

  // 1. Finishing Composite: Goals + Goals/60 + xG
  const rawFinishing = (p: PlayerProfile) => {
    const goals = p.stats?.goals || 0;
    const g60 = p.stats?.goalsPer60 || (goals / Math.max(p.stats?.matchesPlayed || 1, 1));
    const xg = p.stats?.xg || goals * 0.85;
    return goals * 2.5 + g60 * 5 + xg * 1.5;
  };

  // 2. Playmaking Composite: Assists + Assists/60 + Goal Involvement
  const rawPlaymaking = (p: PlayerProfile) => {
    const assists = p.stats?.assists || 0;
    const a60 = p.stats?.assistsPer60 || (assists / Math.max(p.stats?.matchesPlayed || 1, 1));
    const customPlaymaking = (p.stats?.customStats?.stat_big_chances || 0) + (p.stats?.customStats?.stat_nutmegs || 0);
    return assists * 3 + a60 * 6 + customPlaymaking * 1.2;
  };

  // 3. Defending Composite: Clean Sheets + Saves + DPOTMs + Tackles
  const rawDefending = (p: PlayerProfile) => {
    const cleanSheets = p.stats?.cleanSheets || 0;
    const saves = p.stats?.saves || 0;
    const dpotm = p.stats?.dpotmCount || 0;
    const tackles = p.stats?.customStats?.stat_tackles_won || 0;
    
    if (p.position === "GK") {
      return saves * 2 + cleanSheets * 4 + dpotm * 5;
    }
    return cleanSheets * 3 + dpotm * 6 + tackles * 2.5 + (p.position === "DEF" ? 4 : 0);
  };

  // 4. Form & Rating Composite: Average Rating + MOTMs
  const rawRating = (p: PlayerProfile) => {
    const avg = p.stats?.averageRating || 7.5;
    const motm = p.stats?.motmCount || 0;
    return (avg - 5) * 10 + motm * 4;
  };

  // 5. Reliability Composite: Matches Played + Win Rate - Cards Penalty
  const rawReliability = (p: PlayerProfile) => {
    const mp = p.stats?.matchesPlayed || 0;
    const winRate = p.stats?.winRate || 50;
    const yellows = p.stats?.yellowCards || 0;
    const reds = p.stats?.redCards || 0;
    return mp * 4 + (winRate / 100) * 15 - (yellows * 2 + reds * 5);
  };

  // Calculate distributions across league
  const finishingPool = safePlayers.map(rawFinishing);
  const playmakingPool = safePlayers.map(rawPlaymaking);
  const defendingPool = safePlayers.map(rawDefending);
  const ratingPool = safePlayers.map(rawRating);
  const reliabilityPool = safePlayers.map(rawReliability);

  const finishing = getPercentile(finishingPool, rawFinishing(player));
  const playmaking = getPercentile(playmakingPool, rawPlaymaking(player));
  const defending = getPercentile(defendingPool, rawDefending(player));
  const rating = getPercentile(ratingPool, rawRating(player));
  const reliability = getPercentile(reliabilityPool, rawReliability(player));

  // Determine weighted Overall (OVR)
  const weightedOvr = Math.round(
    finishing * 0.25 +
    playmaking * 0.25 +
    defending * 0.2 +
    rating * 0.2 +
    reliability * 0.1
  );

  // Determine Archetype
  let archetype = "All-Round Competitor";
  if (player.position === "GK" || defending >= 85 && player.stats?.saves > 0) {
    archetype = "Goalkeeping Wall";
  } else if (finishing >= 85 && finishing > playmaking) {
    archetype = "Clinical Finisher";
  } else if (playmaking >= 85 && playmaking > finishing) {
    archetype = "Creative Playmaker";
  } else if (defending >= 85) {
    archetype = "Defensive Anchor";
  } else if (rating >= 88) {
    archetype = "Clutch Match Winner";
  } else if (finishing >= 75 && playmaking >= 75) {
    archetype = "Dynamic Dual Threat";
  } else if (reliability >= 85) {
    archetype = "Engine & Workhorse";
  }

  const summary = `Ranked in the top ${100 - Math.max(finishing, playmaking, defending)}% of league players for standout traits.`;

  return {
    finishing,
    playmaking,
    defending,
    rating,
    reliability,
    overallOvr: Math.min(99, Math.max(60, weightedOvr)),
    archetype,
    summary,
  };
}
