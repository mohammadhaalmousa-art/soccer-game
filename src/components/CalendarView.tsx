import React, { useState, useMemo } from "react";
import { Match, Team, PlayerProfile } from "../types";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  CalendarDays,
  List,
  Filter,
  Star,
  Award,
  Sparkles,
  ArrowRight,
  Shield,
} from "lucide-react";
import { TeamBadge } from "./TeamBadge";

interface CalendarViewProps {
  matches: Match[];
  teams: Team[];
  players: PlayerProfile[];
  onSelectMatch: (match: Match) => void;
  onOpenSubmitMatch?: () => void;
  onOpenRateMatch?: (matchId: string) => void;
  onScheduleMatch?: (matchData: Partial<Match>) => void;
  onOpenChangeTeamLogo?: (team: Team) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  matches,
  teams,
  players,
  onSelectMatch,
  onOpenSubmitMatch,
  onOpenRateMatch,
  onScheduleMatch,
  onOpenChangeTeamLogo,
}) => {
  // Current calendar view date (defaults to the date of the latest match or current month)
  const initialDate = useMemo(() => {
    if (matches.length > 0) {
      // Find latest match date
      const sorted = [...matches].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const latest = new Date(sorted[0].date);
      if (!isNaN(latest.getTime())) return latest;
    }
    return new Date();
  }, [matches]);

  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    // Format YYYY-MM-DD
    const d = initialDate;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  });

  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "scheduled">("all");
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);

  // Form state for scheduling
  const [scheduleDate, setScheduleDate] = useState<string>(selectedDateStr);
  const [scheduleTime, setScheduleTime] = useState<string>("18:30");
  const [scheduleHomeTeam, setScheduleHomeTeam] = useState<string>(teams[0]?.id || "team_blue");
  const [scheduleAwayTeam, setScheduleAwayTeam] = useState<string>(teams[1]?.id || "team_red");
  const [scheduleVenue, setScheduleVenue] = useState<string>("Community Stadium Turf A");
  const [scheduleTitle, setScheduleTitle] = useState<string>("");
  const [scheduleNotes, setScheduleNotes] = useState<string>("");

  const getTeam = (teamId: string) => teams.find((t) => t.id === teamId);

  // Month navigation
  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateStr(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
        now.getDate()
      ).padStart(2, "0")}`
    );
  };

  // Filtered matches
  const safeMatches = matches || [];
  const safeTeams = teams || [];
  const safePlayers = players || [];

  const filteredMatches = useMemo(() => {
    return safeMatches.filter((m) => {
      if (teamFilter !== "all" && m.homeTeamId !== teamFilter && m.awayTeamId !== teamFilter) {
        return false;
      }
      if (statusFilter === "completed" && m.status !== "APPROVED") return false;
      if (statusFilter === "scheduled" && m.status === "APPROVED") return false;
      return true;
    });
  }, [safeMatches, teamFilter, statusFilter]);

  // Map matches by date string YYYY-MM-DD
  const matchesByDate = useMemo(() => {
    const map: Record<string, Match[]> = {};
    filteredMatches.forEach((m) => {
      // normalize date to YYYY-MM-DD
      const d = new Date(m.date);
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;
        if (!map[key]) map[key] = [];
        map[key].push(m);
      }
    });
    return map;
  }, [filteredMatches]);

  // Calendar grid calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleString("en-US", { month: "long", year: "numeric" });

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Selected date matches
  const selectedDayMatches = matchesByDate[selectedDateStr] || [];

  // Handle schedule submission
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleDate) return;

    const nextMatchNum = matches.length + 1;
    const matchData: Partial<Match> = {
      id: `match_scheduled_${Date.now()}`,
      seasonId: "season_2026",
      matchNumber: nextMatchNum,
      title: scheduleTitle.trim() || `Matchday #${nextMatchNum}`,
      date: `${scheduleDate}T${scheduleTime || "18:00"}:00Z`,
      homeTeamId: scheduleHomeTeam,
      awayTeamId: scheduleAwayTeam,
      homeScore: 0,
      awayScore: 0,
      status: "SCHEDULED",
      submittedBy: "League Administrator",
      submittedAt: Date.now(),
      venue: scheduleVenue.trim() || "Main Community Turf",
      notes: scheduleNotes.trim(),
      events: [],
      playerRatings: {},
      ratingBallots: [],
    };

    if (onScheduleMatch) {
      onScheduleMatch(matchData);
    }
    setIsScheduleModalOpen(false);
    setSelectedDateStr(scheduleDate);
  };

  // Days of week header
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12" id="calendar-view-container">
      {/* Top Header & Action Bar */}
      <div className="bg-[#121215] border border-zinc-800 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              League Fixtures & Schedule
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-chakra font-black tracking-tight text-white">
            MATCH CALENDAR
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-0.5">
            Browse match days, examine historical game dates, and schedule upcoming fixtures.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View mode toggle */}
          <div className="bg-zinc-900/90 border border-zinc-800 p-1 rounded-2xl flex items-center">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-xl text-xs font-chakra font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-xl text-xs font-chakra font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Schedule List</span>
            </button>
          </div>

          {/* Schedule button */}
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-white hover:bg-zinc-200 text-black font-chakra font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-black stroke-[3]" />
            <span>Schedule Game</span>
          </button>
        </div>
      </div>

      {/* Filter & Subheader Controls */}
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Month Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-chakra font-bold text-white text-sm md:text-base min-w-[150px] text-center">
            {monthName}
          </span>
          <button
            onClick={nextMonth}
            className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-xs font-chakra font-bold text-zinc-300 hover:text-white transition-all cursor-pointer ml-1"
          >
            Today
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Team Filter */}
          <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 rounded-xl px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="bg-transparent text-xs font-chakra font-bold text-zinc-200 outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-900 text-white">
                All Teams
              </option>
              {teams.map((t) => (
                <option key={t.id} value={t.id} className="bg-zinc-900 text-white">
                  {t.badgeEmoji} {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-zinc-900/80 border border-zinc-800 rounded-xl p-0.5">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-chakra font-bold transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All ({matches.length})
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-chakra font-bold transition-all cursor-pointer ${
                statusFilter === "completed"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter("scheduled")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-chakra font-bold transition-all cursor-pointer ${
                statusFilter === "scheduled"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Upcoming
            </button>
          </div>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Calendar Grid (2 Columns on Large) */}
          <div className="lg:col-span-2 bg-[#121215] border border-zinc-800 rounded-3xl p-4 md:p-6 shadow-xl">
            {/* Weekdays Header */}
            <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="py-1.5 text-[11px] font-chakra font-bold uppercase tracking-wider text-zinc-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 md:gap-2">
              {/* Prev Month trailing days */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => {
                const prevDayNum = daysInPrevMonth - firstDayIndex + idx + 1;
                return (
                  <div
                    key={`prev-${idx}`}
                    className="min-h-[70px] md:min-h-[88px] rounded-2xl bg-zinc-950/40 border border-zinc-900/60 p-1.5 opacity-30 select-none flex flex-col justify-between"
                  >
                    <span className="text-xs font-mono text-zinc-600">{prevDayNum}</span>
                  </div>
                );
              })}

              {/* Current Month Days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
                  dayNum
                ).padStart(2, "0")}`;
                const isSelected = selectedDateStr === dateKey;

                // Today check
                const now = new Date();
                const isToday =
                  now.getFullYear() === year &&
                  now.getMonth() === month &&
                  now.getDate() === dayNum;

                const dayMatches = matchesByDate[dateKey] || [];

                return (
                  <div
                    key={dateKey}
                    onClick={() => setSelectedDateStr(dateKey)}
                    className={`min-h-[75px] md:min-h-[92px] rounded-2xl border p-2 transition-all cursor-pointer flex flex-col justify-between relative group ${
                      isSelected
                        ? "bg-zinc-800/90 border-white ring-1 ring-white/50"
                        : isToday
                        ? "bg-zinc-900/90 border-zinc-700 hover:border-zinc-500"
                        : "bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-bold ${
                          isSelected
                            ? "text-white"
                            : isToday
                            ? "text-zinc-200 bg-zinc-800 px-1.5 py-0.5 rounded-md"
                            : "text-zinc-400 group-hover:text-zinc-200"
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayMatches.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-white ring-2 ring-zinc-900 animate-pulse" />
                      )}
                    </div>

                    {/* Match Indicator Badges */}
                    <div className="space-y-1 mt-1">
                      {dayMatches.slice(0, 2).map((m) => {
                        const homeTeam = getTeam(m.homeTeamId);
                        const awayTeam = getTeam(m.awayTeamId);
                        const isDone = m.status === "APPROVED";

                        return (
                          <div
                            key={m.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectMatch(m);
                            }}
                            className="text-[10px] font-chakra font-bold px-1.5 py-0.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-600 flex items-center justify-between gap-1 truncate text-zinc-300 hover:text-white transition-colors"
                            title={`${m.title}: ${homeTeam?.name} vs ${awayTeam?.name}`}
                          >
                            <span className="truncate flex items-center gap-1">
                              <TeamBadge team={homeTeam} size="xs" />
                              <span className="text-zinc-500">v</span>
                              <TeamBadge team={awayTeam} size="xs" />
                            </span>
                            <span className="font-mono text-white text-[9px] shrink-0 font-black">
                              {isDone ? `${m.homeScore}-${m.awayScore}` : "VS"}
                            </span>
                          </div>
                        );
                      })}
                      {dayMatches.length > 2 && (
                        <span className="text-[9px] text-zinc-500 font-chakra block text-center">
                          +{dayMatches.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white" />
                  <span>Scheduled / Played</span>
                </div>
                {teams.map((t) => (
                  <div key={t.id} className="flex items-center gap-1.5 bg-zinc-900/60 px-2 py-1 rounded-xl border border-zinc-800">
                    <TeamBadge team={t} size="xs" />
                    <span className="font-chakra font-semibold text-zinc-200">{t.name}</span>
                    {onOpenChangeTeamLogo && (
                      <button
                        type="button"
                        onClick={() => onOpenChangeTeamLogo(t)}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-chakra font-bold ml-1 cursor-pointer underline"
                      >
                        Change Logo
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                Click any day to view or schedule games
              </span>
            </div>
          </div>

          {/* Selected Date Inspector Sidebar (1 Column) */}
          <div className="space-y-4">
            <div className="bg-[#121215] border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 block">
                    Selected Matchday
                  </span>
                  <h3 className="font-chakra font-black text-lg text-white">
                    {new Date(`${selectedDateStr}T12:00:00Z`).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setScheduleDate(selectedDateStr);
                    setIsScheduleModalOpen(true);
                  }}
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white transition-all cursor-pointer"
                  title="Add fixture on this date"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {selectedDayMatches.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-zinc-600">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-chakra font-bold text-zinc-300">
                      No Matches on this Date
                    </p>
                    <p className="text-xs text-zinc-500 max-w-[200px] mx-auto mt-0.5">
                      Schedule an upcoming match or log a completed game score.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setScheduleDate(selectedDateStr);
                      setIsScheduleModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-xs font-chakra font-bold text-white transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Fixture</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayMatches.map((m) => {
                    const homeTeam = getTeam(m.homeTeamId);
                    const awayTeam = getTeam(m.awayTeamId);
                    const isDone = m.status === "APPROVED";
                    const isPenalty = m.penaltyWinnerTeamId && m.penaltyScore;

                    return (
                      <div
                        key={m.id}
                        className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-600 transition-all space-y-3"
                      >
                        {/* Match Title & Status */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-chakra font-black text-white tracking-wide">
                            {m.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-chakra font-bold uppercase ${
                              isDone
                                ? "bg-white text-black"
                                : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                            }`}
                          >
                            {isDone ? "Final" : "Scheduled"}
                          </span>
                        </div>

                        {/* Scoreboard Preview */}
                        <div className="flex items-center justify-between py-1">
                          {/* Home */}
                          <div className="flex items-center gap-2 flex-1">
                            <div
                              className={`relative group shrink-0 ${onOpenChangeTeamLogo ? "cursor-pointer" : ""}`}
                              onClick={(e) => {
                                if (homeTeam && onOpenChangeTeamLogo) {
                                  e.stopPropagation();
                                  onOpenChangeTeamLogo(homeTeam);
                                }
                              }}
                              title={onOpenChangeTeamLogo ? `Change ${homeTeam?.name} logo/emoji` : undefined}
                            >
                              <TeamBadge team={homeTeam} size="md" />
                              {onOpenChangeTeamLogo && (
                                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-700 text-cyan-300 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px]">
                                  ✎
                                </span>
                              )}
                            </div>
                            <span className="font-chakra font-bold text-sm text-white truncate">
                              {homeTeam?.name || "Red Team"}
                            </span>
                          </div>

                          {/* Center Score */}
                          <div className="px-3 text-center">
                            {isDone ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xl font-chakra font-black text-white">
                                  {m.homeScore}
                                </span>
                                <span className="text-xs text-zinc-600">-</span>
                                <span className="text-xl font-chakra font-black text-white">
                                  {m.awayScore}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-950 px-2 py-1 rounded-md border border-zinc-800">
                                VS
                              </span>
                            )}
                          </div>

                          {/* Away */}
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            <span className="font-chakra font-bold text-sm text-white truncate text-right">
                              {awayTeam?.name || "Blue Team"}
                            </span>
                            <div
                              className={`relative group shrink-0 ${onOpenChangeTeamLogo ? "cursor-pointer" : ""}`}
                              onClick={(e) => {
                                if (awayTeam && onOpenChangeTeamLogo) {
                                  e.stopPropagation();
                                  onOpenChangeTeamLogo(awayTeam);
                                }
                              }}
                              title={onOpenChangeTeamLogo ? `Change ${awayTeam?.name} logo/emoji` : undefined}
                            >
                              <TeamBadge team={awayTeam} size="md" />
                              {onOpenChangeTeamLogo && (
                                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-700 text-cyan-300 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px]">
                                  ✎
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Penalty note if any */}
                        {isPenalty && (
                          <div className="text-[11px] text-center font-chakra text-zinc-400 bg-zinc-950/60 py-1 rounded-lg border border-zinc-800/80">
                            {getTeam(m.penaltyWinnerTeamId!)?.name} won penalties (
                            {m.penaltyScore?.home} - {m.penaltyScore?.away})
                          </div>
                        )}

                        {/* Venue & Time */}
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-800/60">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-zinc-500" />
                            <span className="truncate max-w-[140px]">
                              {m.venue || "Community Turf"}
                            </span>
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            <span>
                              {new Date(m.date).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => onSelectMatch(m)}
                            className="flex-1 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-chakra font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>Match Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          {onOpenRateMatch && isDone && (
                            <button
                              onClick={() => onOpenRateMatch(m.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-chakra font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                              title="Rate players in this game"
                            >
                              <Star className="w-3.5 h-3.5 text-white" />
                              <span className="hidden sm:inline">Rate</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Stats Summary Card */}
            <div className="bg-[#121215] border border-zinc-800 rounded-3xl p-5 space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 block">
                League Season Snapshot
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block uppercase font-chakra font-bold">
                    Matches Recorded
                  </span>
                  <span className="text-xl font-chakra font-black text-white">
                    {matches.length}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block uppercase font-chakra font-bold">
                    Active Rosters
                  </span>
                  <span className="text-xl font-chakra font-black text-white">
                    {players.length} Players
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Schedule List View */
        <div className="bg-[#121215] border border-zinc-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-chakra font-black text-lg text-white">
              ALL FIXTURES & MATCHDAYS ({filteredMatches.length})
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              Sorted by date
            </span>
          </div>

          <div className="space-y-3">
            {filteredMatches.map((m) => {
              const homeTeam = getTeam(m.homeTeamId);
              const awayTeam = getTeam(m.awayTeamId);
              const isDone = m.status === "APPROVED";
              const dateObj = new Date(m.date);

              return (
                <div
                  key={m.id}
                  onClick={() => onSelectMatch(m)}
                  className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  {/* Date & Title */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-[10px] font-mono uppercase text-zinc-500">
                        {dateObj.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-base font-chakra font-black text-white leading-none">
                        {dateObj.getDate()}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-chakra font-black text-white text-base group-hover:text-zinc-200">
                          {m.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-chakra font-bold uppercase ${
                            isDone
                              ? "bg-white text-black"
                              : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                          }`}
                        >
                          {isDone ? "Final" : "Scheduled"}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {m.venue || "Community Turf"}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Matchup & Score */}
                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="flex items-center gap-3 text-sm font-chakra font-bold text-white">
                      <span 
                        className={`flex items-center gap-2 ${onOpenChangeTeamLogo ? "hover:text-cyan-300 cursor-pointer" : ""}`}
                        onClick={(e) => {
                          if (homeTeam && onOpenChangeTeamLogo) {
                            e.stopPropagation();
                            onOpenChangeTeamLogo(homeTeam);
                          }
                        }}
                        title={onOpenChangeTeamLogo ? `Change ${homeTeam?.name} logo/emoji` : undefined}
                      >
                        <TeamBadge team={homeTeam} size="xs" />
                        <span>{homeTeam?.name}</span>
                      </span>

                      {isDone ? (
                        <span className="px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 font-mono font-black text-base text-white">
                          {m.homeScore} - {m.awayScore}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 font-mono font-bold text-xs text-zinc-400">
                          VS
                        </span>
                      )}

                      <span 
                        className={`flex items-center gap-2 ${onOpenChangeTeamLogo ? "hover:text-cyan-300 cursor-pointer" : ""}`}
                        onClick={(e) => {
                          if (awayTeam && onOpenChangeTeamLogo) {
                            e.stopPropagation();
                            onOpenChangeTeamLogo(awayTeam);
                          }
                        }}
                        title={onOpenChangeTeamLogo ? `Change ${awayTeam?.name} logo/emoji` : undefined}
                      >
                        <span>{awayTeam?.name}</span>
                        <TeamBadge team={awayTeam} size="xs" />
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors hidden md:block" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SCHEDULE MODAL */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-zinc-800 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-chakra font-black text-lg text-white">
                  SCHEDULE MATCH FIXTURE
                </h3>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs font-chakra">
              <div>
                <label className="text-zinc-400 uppercase font-bold block mb-1">
                  Match Title / Round Name
                </label>
                <input
                  type="text"
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  placeholder={`Matchday #${matches.length + 1} - Showdown`}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-white text-white rounded-xl px-3.5 py-2.5 outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 uppercase font-bold block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-white text-white rounded-xl px-3 py-2 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 uppercase font-bold block mb-1">
                    Kickoff Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-white text-white rounded-xl px-3 py-2 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 uppercase font-bold block mb-1">
                    Home Team
                  </label>
                  <select
                    value={scheduleHomeTeam}
                    onChange={(e) => setScheduleHomeTeam(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-white text-white rounded-xl px-3 py-2 outline-none font-bold"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.badgeEmoji} {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 uppercase font-bold block mb-1">
                    Away Team
                  </label>
                  <select
                    value={scheduleAwayTeam}
                    onChange={(e) => setScheduleAwayTeam(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-white text-white rounded-xl px-3 py-2 outline-none font-bold"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.badgeEmoji} {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 uppercase font-bold block mb-1">
                  Venue / Pitch Location
                </label>
                <input
                  type="text"
                  value={scheduleVenue}
                  onChange={(e) => setScheduleVenue(e.target.value)}
                  placeholder="Community Turf Stadium Pitch A"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-white text-white rounded-xl px-3.5 py-2.5 outline-none font-sans"
                />
              </div>

              <div>
                <label className="text-zinc-400 uppercase font-bold block mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  rows={2}
                  placeholder="Bring home/away jerseys, 6-a-side format"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-white text-white rounded-xl px-3.5 py-2 outline-none font-sans"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
