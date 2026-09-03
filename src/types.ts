export type TeamId = string;
export type Position = 'GK' | 'DEF' | 'MID' | 'FWD' | string;

export interface CustomStatDefinition {
  id: string;
  name: string;
  shortLabel?: string;
  icon?: string;
  iconName?: string;
  iconUrl?: string; // Custom image/logo URL or base64
  description?: string;
  category: 'attacking' | 'defending' | 'playmaking' | 'fun' | 'goalkeeping';
  awardTitle?: string;
}

export interface LeagueBranding {
  logoUrl?: string;
  name?: string;
  leagueName?: string;
  badgeEmoji?: string;
  leagueEmoji?: string;
  subtitle?: string;
  seasonBadge?: string;
  seasonTag?: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  nickname?: string;
  teamId: TeamId;
  temporaryTeamId?: TeamId;
  isTemporaryTransfer?: boolean;
  temporaryTransferNote?: string;
  jerseyNumber: number;
  position: Position;
  positionDisplay?: string;
  secondaryPositions?: Position[];
  photoUrl?: string;
  bio?: string;
  preferredFoot?: 'Right' | 'Left' | 'Both';
  // Personalized player identity fields
  walkoutSong?: {
    title: string;
    artist: string;
    genre?: string;
    previewAudio?: string;
    spotifyUrl?: string;
  };
  playstyleArchetype?: string;
  signatureCelebration?: string;
  favoriteProClub?: string;
  favoriteProPlayer?: string;
  bootModel?: string;
  personalQuote?: string;
  stats: {
    matchesPlayed: number;
    goals: number;
    assists: number;
    xg: number;
    xgPer60: number;
    goalsPer60: number;
    assistsPer60: number;
    yellowCards: number;
    redCards: number;
    cleanSheets: number;
    saves: number;
    motmCount: number;
    dpotmCount?: number; // Defensive Player of the Match
    averageRating: number;
    ratingCount?: number;
    winRate?: number;
    customStats: Record<string, number>;
    isManualOverride?: boolean;
  };
  manualStatsOverride?: boolean;
  ratingHistory?: {
    matchId: string;
    matchTitle: string;
    rating: number;
    date: string;
  }[];
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  badgeEmoji: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  slogan?: string;
  homeStadium?: string;
  formation: string;
  captainPlayerId?: string;
  startingLineup: string[]; // player IDs
  substitutes?: string[]; // player IDs
  bench?: string[];
  tableAdjustment?: TeamTableAdjustment;
}

export interface MatchEvent {
  id: string;
  minute?: number; // 1 to 60 minutes
  half?: 1 | 2; // 1 = 1st Half (1-30'), 2 = 2nd Half (31-60')
  type: 'GOAL' | 'ASSIST' | 'YELLOW_CARD' | 'RED_CARD' | 'CUSTOM_STAT' | 'OWN_GOAL';
  playerId: string;
  assistPlayerId?: string;
  customStatId?: string;
  xgValue?: number; // Expected Goal value between 0.05 and 0.99
  teamId: TeamId;
  note?: string;
}

export interface PenaltyShot {
  id: string;
  round: number; // 1, 2, 3...
  teamId: string; // homeTeamId or awayTeamId / redTeam or blueTeam
  playerId?: string;
  playerName: string;
  scored: boolean; // true = scored (⚽), false = missed/saved (❌)
  goalkeeperName?: string;
  note?: string; // e.g. "Bottom corner", "Saved by Eliot", "Crossbar"
}

export interface PenaltyShootoutData {
  homeScore: number;
  awayScore: number;
  winnerTeamId?: string;
  shots: PenaltyShot[];
}

export interface HistoricalPlayerStat {
  id?: string;
  name: string;
  position?: string;
  goals: number;
  assists: number;
  rating?: number;
  note?: string;
}

export interface HistoricalTeamPerformance {
  name: string;
  score: number;
  penaltyScore?: number;
  players: HistoricalPlayerStat[];
}

export interface HistoricalGameArchive {
  id: string;
  title: string;
  date: string;
  summary: string;
  mvp: string;
  scoreDisplay?: string;
  winnerName?: string;
  venue?: string;
  redTeam: HistoricalTeamPerformance;
  blueTeam: HistoricalTeamPerformance;
  penaltyShootout?: PenaltyShootoutData;
  updatedAt?: number;
  updatedBy?: string;
}

export interface MatchLineup {
  formation: string;
  starters: string[];
  subs: string[];
}

export interface MatchRatingBallot {
  id: string;
  voterPlayerId?: string;
  voterName: string;
  ratings: Record<string, number>;
  submittedAt: number;
}

export interface Match {
  id: string;
  seasonId?: string;
  matchNumber?: number;
  title: string;
  date?: string;
  matchDate?: string;
  matchTime?: string;
  location?: string;
  durationMinutes?: number;
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  homeScore: number;
  awayScore: number;
  homeXg?: number; // Team Expected Goals (e.g. 10.4)
  awayXg?: number; // Team Expected Goals (e.g. 7.9)
  penaltyScore?: {
    home: number;
    away: number;
  };
  penaltyWinnerTeamId?: TeamId;
  penaltyShootout?: PenaltyShootoutData;
  outcomeNote?: string;
  status: 'SCHEDULED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  submittedBy?: string;
  submittedAt?: number;
  approvedBy?: string;
  approvedAt?: number;
  venue?: string;
  notes?: string;
  events: MatchEvent[];
  playerRatings: Record<string, number>; // player ID -> rating 1.0 to 10.0
  ratingBallots?: MatchRatingBallot[];
  motmPlayerId?: string;
  dpotmPlayerId?: string; // Defensive Player of the Match
  stadiumPitchType?: 'Grass' | 'Turf' | 'Indoor' | 'Futsal';
  highlights?: string | string[];
  lastModifiedAt?: number;
  loanedPlayers?: { playerId: string; loanedToTeamId: string; note?: string }[];
  playedPlayerIds?: string[]; // List of player IDs who participated / played in this match
  matchFormat?: string; // e.g. "5v5", "6v6", "7v7", "8v8", "9v9", "11v11"
  playerCount?: number; // Number of starters per side
  lineups?: {
    home: MatchLineup;
    away: MatchLineup;
  };
}

export interface NewsArticle {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  category: 'MATCH_REPORT' | 'STORYLINE' | 'TRANSFER' | 'NOTICE' | 'TACTICAL';
  author: string;
  publishedAt: string; // ISO date string
  imageUrl?: string;
  tags: string[];
  isPinned?: boolean;
  relatedPlayerIds?: string[];
  relatedTeamIds?: string[];
  relatedMatchId?: string;
}

export interface AwardConfig {
  id: string;
  title: string;
  subtitle?: string;
  statKey: string;
  statType: 'standard' | 'custom';
  icon: string;
  badgeEmoji?: string;
  calculationMode: 'highest' | 'lowest' | 'average';
  enabled: boolean;
  colorScheme?: 'amber' | 'emerald' | 'cyan' | 'purple' | 'rose' | 'blue';
}

export interface SeasonGrandAwards {
  concludedDate: string;
  leagueChampionsTeamId: string;
  playerOfTheSeasonId: string;
  defensivePlayerOfTheSeasonId: string;
  goldenGlovePlayerId: string;
  goldenBootPlayerId: string;
  mostImprovedPlayerId: string;
  playmakerOfTheSeasonId?: string;
  finalSummaryNotes?: string;
}

export interface TeamTableAdjustment {
  teamId: string;
  pointsAdjustment?: number; // e.g. -3 or +2
  overrideEnabled?: boolean;
  playedOverride?: number;
  wonOverride?: number;
  penaltyWonOverride?: number;
  drawnOverride?: number;
  penaltyLostOverride?: number;
  lostOverride?: number;
  goalsForOverride?: number;
  goalsAgainstOverride?: number;
  pointsOverride?: number;
  notes?: string;
  updatedAt?: number;
  updatedBy?: string;
}

export interface LeagueSeason {
  id: string;
  name: string;
  year: string;
  status: 'active' | 'archived';
  description: string;
  championTeamId?: string;
  concludedAt?: string;
  grandAwards?: SeasonGrandAwards;
  tableAdjustments?: Record<string, TeamTableAdjustment>;
  awards?: {
    mvpPlayerId?: string;
    defensiveMvpPlayerId?: string;
    goldenBootPlayerId?: string;
    playmakerPlayerId?: string;
    goldenGlovePlayerId?: string;
    customAwards?: { title: string; playerId: string; metricName: string; count: number }[];
  };
}

export interface TeamStanding {
  teamId: string;
  teamName: string;
  shortName: string;
  badgeEmoji: string;
  logoUrl?: string;
  primaryColor: string;
  played: number;
  won: number; // Regulation wins (3 pts)
  penaltyWon?: number; // Penalty shootout wins (2 pts)
  drawn: number; // Draws (1 pt)
  penaltyLost?: number; // Penalty shootout losses (0 pts)
  lost: number; // Regulation losses (0 pts)
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  xgFor: number;
  xgAgainst: number;
  xgDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
  pointsAdjustment?: number;
  adjustmentNotes?: string;
  isOverridden?: boolean;
  originalPoints?: number;
}

// Backward compatibility interfaces for voting & ratings view
export type LegacyTeam = 'blue' | 'red';
export interface PlayerItem {
  id?: string;
  name: string;
  team: LegacyTeam;
}
export interface PlayerAverage {
  player: string;
  average: number;
  count: number;
  ratings: number[];
}
export interface RatingSubmission {
  id: string;
  voter: string;
  ratings: Record<string, number>;
  timestamp: number;
}
export interface RatingsApiResponse {
  submissions: RatingSubmission[];
  averages: PlayerAverage[];
  totalSubmissions: number;
  players: PlayerItem[];
}

export type MainNavTab = 
  | 'matches' 
  | 'calendar'
  | 'standings' 
  | 'trends'
  | 'teams' 
  | 'players' 
  | 'comparisons'
  | 'news'
  | 'awards' 
  | 'ratings_ballot' 
  | 'admin';
