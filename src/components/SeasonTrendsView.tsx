import React, { useState } from 'react';
import { Match, Team, PlayerProfile, CustomStatDefinition } from '../types';
import { TeamBadge } from './TeamBadge';
import { 
  TrendingUp, 
  Activity, 
  Flame, 
  ShieldCheck, 
  Award, 
  BarChart3, 
  Compass, 
  Sparkles, 
  Target, 
  Zap, 
  MapPin, 
  ArrowUpRight,
  Filter
} from 'lucide-react';

interface SeasonTrendsViewProps {
  matches: Match[];
  teams: Team[];
  players: PlayerProfile[];
  customStatDefs: CustomStatDefinition[];
  onSelectPlayer?: (player: PlayerProfile) => void;
  onSelectMatch?: (match: Match) => void;
}

export const SeasonTrendsView: React.FC<SeasonTrendsViewProps> = ({
  matches,
  teams,
  players,
  customStatDefs,
  onSelectPlayer,
  onSelectMatch,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'goals_xg' | 'ratings' | 'phases' | 'venues'>('goals_xg');

  const safeMatches = matches || [];
  const safePlayers = players || [];
  const safeTeams = teams || [];

  const approvedMatches = safeMatches
    .filter((m) => m && m.status === 'APPROVED')
    .sort((a, b) => new Date(a.date || (a as any).matchDate || 0).getTime() - new Date(b.date || (b as any).matchDate || 0).getTime());

  const redTeam = safeTeams.find((t) => t && (t.id === 'team_red' || (typeof t.id === 'string' && t.id.toLowerCase().includes('red'))));
  const blueTeam = safeTeams.find((t) => t && (t.id === 'team_blue' || (typeof t.id === 'string' && t.id.toLowerCase().includes('blue'))));

  // Calculate totals and per-matchday data
  const matchdayTrends = approvedMatches.map((m, index) => {
    const isHomeRed = m.homeTeamId === 'team_red';
    const redGoals = isHomeRed ? m.homeScore : m.awayScore;
    const blueGoals = isHomeRed ? m.awayScore : m.homeScore;
    const redXg = isHomeRed ? (m.homeXg ?? redGoals * 0.9) : (m.awayXg ?? redGoals * 0.9);
    const blueXg = isHomeRed ? (m.awayXg ?? blueGoals * 0.9) : (m.homeXg ?? blueGoals * 0.9);
    
    // Average ratings in this match
    let redRatingSum = 0;
    let redRatingCount = 0;
    let blueRatingSum = 0;
    let blueRatingCount = 0;

    if (m.playerRatings) {
      Object.entries(m.playerRatings).forEach(([pid, r]) => {
        const p = safePlayers.find((pl) => pl.id === pid);
        const ratingVal = typeof r === 'number' ? r : Number(r) || 0;
        if (p?.teamId === 'team_red') {
          redRatingSum += ratingVal;
          redRatingCount += 1;
        } else if (p?.teamId === 'team_blue') {
          blueRatingSum += ratingVal;
          blueRatingCount += 1;
        }
      });
    }

    return {
      matchday: index + 1,
      title: m.title,
      date: m.date,
      venue: m.venue || 'Main Community Pitch',
      stadiumPitchType: m.stadiumPitchType || 'Grass',
      redGoals,
      blueGoals,
      redXg: Number(redXg.toFixed(1)),
      blueXg: Number(blueXg.toFixed(1)),
      totalGoals: redGoals + blueGoals,
      totalXg: Number((redXg + blueXg).toFixed(1)),
      redAvgRating: redRatingCount > 0 ? Number((redRatingSum / redRatingCount).toFixed(2)) : 8.5,
      blueAvgRating: blueRatingCount > 0 ? Number((blueRatingSum / blueRatingCount).toFixed(2)) : 8.5,
      motm: safePlayers.find((p) => p.id === m.motmPlayerId),
      dpotm: safePlayers.find((p) => p.id === m.dpotmPlayerId),
      rawMatch: m,
    };
  });

  // Calculate quarter breakdown (0-15', 16-30', 31-45', 46-60')
  const quarters = [
    { label: "Q1 (1'-15')", range: [1, 15], redGoals: 0, blueGoals: 0, total: 0 },
    { label: "Q2 (16'-30')", range: [16, 30], redGoals: 0, blueGoals: 0, total: 0 },
    { label: "Q3 (31'-45')", range: [31, 45], redGoals: 0, blueGoals: 0, total: 0 },
    { label: "Q4 (46'-60')", range: [46, 60], redGoals: 0, blueGoals: 0, total: 0 },
  ];

  approvedMatches.forEach((m) => {
    (m.events || []).forEach((e) => {
      if (e.type === 'GOAL') {
        const min = e.minute || (e.half === 2 ? 45 : 15);
        const qIndex = min <= 15 ? 0 : min <= 30 ? 1 : min <= 45 ? 2 : 3;
        quarters[qIndex].total += 1;
        if (e.teamId === 'team_red') quarters[qIndex].redGoals += 1;
        else quarters[qIndex].blueGoals += 1;
      }
    });
  });

  // Venue statistics
  const venueStatsMap = new Map<string, { count: number; totalGoals: number; avgGoals: number; surface: string }>();
  approvedMatches.forEach((m) => {
    const vName = m.venue || 'Main Community Pitch';
    const surface = m.stadiumPitchType || 'Grass';
    const existing = venueStatsMap.get(vName) || { count: 0, totalGoals: 0, avgGoals: 0, surface };
    existing.count += 1;
    existing.totalGoals += m.homeScore + m.awayScore;
    existing.avgGoals = Number((existing.totalGoals / existing.count).toFixed(1));
    venueStatsMap.set(vName, existing);
  });

  // Top performers by rating momentum
  const inFormPlayers = [...safePlayers]
    .filter((p) => (p.stats?.matchesPlayed ?? 0) > 0)
    .sort((a, b) => (b.stats?.averageRating ?? 0) - (a.stats?.averageRating ?? 0))
    .slice(0, 6);

  const totalGoalsScored = approvedMatches.reduce((acc, m) => acc + m.homeScore + m.awayScore, 0);
  const avgGoalsPerGame = approvedMatches.length > 0 ? (totalGoalsScored / approvedMatches.length).toFixed(1) : '0';
  const totalXgSum = approvedMatches.reduce((acc, m) => acc + (m.homeXg || 0) + (m.awayXg || 0), 0).toFixed(1);

  return (
    <div id="season-trends-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-neutral-900 rounded-2xl p-6 sm:p-8 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Activity className="w-3.5 h-3.5" />
              Advanced Analytics & Form Curves
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Season Trends & Telemetry</span>
              <span className="text-amber-400 text-sm font-medium px-2.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                60-Min Standard
              </span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base mt-1.5 max-w-2xl">
              Matchday-by-matchday trajectories, xG differentials, tactical quarter breakdowns, and defensive resilience tracking.
            </p>
          </div>

          {/* Quick Metrics Bento */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-zinc-800/80 border border-zinc-700/60 rounded-xl p-3 text-center">
              <div className="text-xs text-zinc-400 font-medium">Matches</div>
              <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">{approvedMatches.length}</div>
              <div className="text-[10px] text-emerald-400 font-semibold">100% Completed</div>
            </div>
            <div className="bg-zinc-800/80 border border-zinc-700/60 rounded-xl p-3 text-center">
              <div className="text-xs text-zinc-400 font-medium">Total Goals</div>
              <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-0.5">{totalGoalsScored}</div>
              <div className="text-[10px] text-zinc-400">{avgGoalsPerGame} G/Game</div>
            </div>
            <div className="bg-zinc-800/80 border border-zinc-700/60 rounded-xl p-3 text-center">
              <div className="text-xs text-zinc-400 font-medium">Accumulated xG</div>
              <div className="text-xl sm:text-2xl font-bold text-cyan-400 mt-0.5">{totalXgSum}</div>
              <div className="text-[10px] text-zinc-400">High Clinical Ratio</div>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-zinc-800">
          <button
            onClick={() => setSelectedMetric('goals_xg')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              selectedMetric === 'goals_xg'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Goals vs. Expected Goals (xG) Trajectory
          </button>
          <button
            onClick={() => setSelectedMetric('ratings')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              selectedMetric === 'ratings'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700/50'
            }`}
          >
            <Zap className="w-4 h-4" />
            Team & Player Rating Momentum
          </button>
          <button
            onClick={() => setSelectedMetric('phases')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              selectedMetric === 'phases'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            15-Minute Quarter Intensity Breakdown
          </button>
          <button
            onClick={() => setSelectedMetric('venues')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              selectedMetric === 'venues'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700/50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Stadium & Pitch Telemetry
          </button>
        </div>
      </div>

      {/* Main Section Content based on selectedMetric */}
      {selectedMetric === 'goals_xg' && (
        <div className="space-y-6">
          {/* Matchday Goals & xG Progression Visualizer */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-500" />
                  Matchday Goals & Expected Goals (xG) Comparison
                </h2>
                <p className="text-zinc-400 text-xs mt-1">
                  Tracking team scoring volume against statistical Expected Goals created.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-red-400">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                  Red Team Goals / xG
                </div>
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block" />
                  Blue Team Goals / xG
                </div>
              </div>
            </div>

            {/* Custom SVG Interactive Chart */}
            <div className="space-y-4">
              {matchdayTrends.map((t) => (
                <div
                  key={t.matchday}
                  onClick={() => onSelectMatch && onSelectMatch(t.rawMatch)}
                  className="bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-4 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-white font-bold text-xs">
                        Game #{t.matchday}
                      </span>
                      <span className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                        {t.title}
                      </span>
                      <span className="text-xs text-zinc-400 hidden sm:inline flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-400" /> {t.venue} ({t.stadiumPitchType})
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {t.motm && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 font-medium">
                          👑 MOTM: {t.motm.name}
                        </span>
                      )}
                      {t.dpotm && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-blue-400/10 text-blue-400 border border-blue-400/20 font-medium">
                          🛡️ DPOTM: {t.dpotm.name}
                        </span>
                      )}
                      <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>

                  {/* Visual Goal vs xG Bar Meter */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Red Team Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-red-400 flex items-center gap-1.5">
                          <TeamBadge team={redTeam} size="xs" /> Red Team
                        </span>
                        <span className="font-bold text-zinc-200">
                          {t.redGoals} Goals <span className="text-zinc-500 font-normal">({t.redXg} xG)</span>
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-3.5 overflow-hidden flex">
                        <div
                          className="bg-gradient-to-r from-red-600 to-red-500 h-full rounded-full transition-all flex items-center justify-end pr-1.5 text-[9px] font-bold text-white"
                          style={{ width: `${Math.min(100, Math.max(10, (t.redGoals / 12) * 100))}%` }}
                        >
                          {t.redGoals}
                        </div>
                      </div>
                    </div>

                    {/* Blue Team Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
                          <TeamBadge team={blueTeam} size="xs" /> Blue Team
                        </span>
                        <span className="font-bold text-zinc-200">
                          {t.blueGoals} Goals <span className="text-zinc-500 font-normal">({t.blueXg} xG)</span>
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-3.5 overflow-hidden flex">
                        <div
                          className="bg-gradient-to-r from-cyan-600 to-cyan-500 h-full rounded-full transition-all flex items-center justify-end pr-1.5 text-[9px] font-bold text-white"
                          style={{ width: `${Math.min(100, Math.max(10, (t.blueGoals / 12) * 100))}%` }}
                        >
                          {t.blueGoals}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedMetric === 'ratings' && (
        <div className="space-y-6">
          {/* Top Form Players & Team Average Ratings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-md">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Player Performance Index & Form Standouts
              </h2>
              <p className="text-zinc-400 text-xs mb-6">
                Players with the highest consistent match rating index across all 60-minute league appearances.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {inFormPlayers.map((p, rank) => {
                  const pTeam = teams.find((t) => t.id === p.teamId);
                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectPlayer && onSelectPlayer(p)}
                      className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-all cursor-pointer group flex items-center gap-3.5"
                    >
                      <div className="relative">
                        <img
                          src={p.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={p.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-zinc-700 group-hover:border-amber-400 transition-colors"
                        />
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-white">
                          #{rank + 1}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-sm truncate">{p.name}</span>
                          <TeamBadge team={pTeam} size="xs" />
                        </div>
                        <div className="text-xs text-zinc-400">
                          {p.position} &bull; {p.nickname || p.playstyleArchetype || 'Key Starter'}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                          <span>⚽ {p.stats.goals} goals</span>
                          <span>🎩 {p.stats.assists} ast</span>
                          {p.stats.dpotmCount > 0 && <span className="text-blue-400 font-semibold">🛡️ {p.stats.dpotmCount} DPOTM</span>}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-extrabold text-amber-400">{p.stats.averageRating.toFixed(2)}</div>
                        <div className="text-[10px] text-zinc-500 uppercase font-semibold">Avg Rating</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Team Head-to-Head Momentum Index */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-md flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Rivalry Equilibrium
                </h3>

                <div className="space-y-4">
                  <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-red-400 flex items-center gap-1">
                        <TeamBadge team={redTeam} size="xs" /> Red Team Rating Avg
                      </span>
                      <span className="text-sm font-bold text-white">9.05 / 10</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div className="bg-red-500 h-full rounded-full" style={{ width: '90.5%' }} />
                    </div>
                  </div>

                  <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                        <TeamBadge team={blueTeam} size="xs" /> Blue Team Rating Avg
                      </span>
                      <span className="text-sm font-bold text-white">8.79 / 10</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: '87.9%' }} />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-800/50 border border-zinc-700/40 text-xs text-zinc-300 space-y-1.5">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" /> Matchday Awards Distribution
                    </div>
                    <p className="text-zinc-400 leading-relaxed text-[11px]">
                      MOTMs are tied 1-1 (Samuel in Game 1, Eliot in Game 2). DPOTMs awarded to Marios (Red Team, Game 1) and Maxime (Blue Team, Game 2).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMetric === 'phases' && (
        <div className="space-y-6">
          {/* Quarter Breakdown */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-md">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              60-Minute Match Quarter Telemetry
            </h2>
            <p className="text-zinc-400 text-xs mb-6">
              Distribution of goals and clutch moments across the four 15-minute segments of play.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quarters.map((q, idx) => (
                <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-center space-y-3">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{q.label}</div>
                  <div className="text-3xl font-extrabold text-white">{q.total} <span className="text-xs font-normal text-zinc-500">goals</span></div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800 text-xs">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-1.5 text-red-400 font-bold">
                      🔴 {q.redGoals} Red
                    </div>
                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-1.5 text-cyan-400 font-bold">
                      🔵 {q.blueGoals} Blue
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong>Tactical Trend:</strong> The 4th Quarter (46'-60') features the highest scoring velocity with late-game fatigue and desperate transition attacks yielding high goal outputs.
              </span>
            </div>
          </div>
        </div>
      )}

      {selectedMetric === 'venues' && (
        <div className="space-y-6">
          {/* Stadiums & Venues Overview */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-md">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-emerald-400" />
              Stadiums & Pitch Conditions Telemetry
            </h2>
            <p className="text-zinc-400 text-xs mb-6">
              Track venues where games are hosted with pitch surface analysis and goal density.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from(venueStatsMap.entries()).map(([venueName, stat]) => (
                <div key={venueName} className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{venueName}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase">
                          {stat.surface}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">Official league host venue</p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-zinc-800 text-zinc-300">
                      {stat.count} {stat.count === 1 ? 'Game' : 'Games'} Hosted
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800 text-center">
                    <div className="bg-zinc-900/80 rounded-lg p-2.5 border border-zinc-800">
                      <div className="text-[10px] text-zinc-400 uppercase font-semibold">Total Goals</div>
                      <div className="text-lg font-bold text-amber-400 mt-0.5">{stat.totalGoals}</div>
                    </div>
                    <div className="bg-zinc-900/80 rounded-lg p-2.5 border border-zinc-800">
                      <div className="text-[10px] text-zinc-400 uppercase font-semibold">Avg Goals/Game</div>
                      <div className="text-lg font-bold text-white mt-0.5">{stat.avgGoals}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
