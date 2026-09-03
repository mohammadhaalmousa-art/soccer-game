import React from "react";
import { MainNavTab, LeagueSeason, LeagueBranding } from "../types";
import { 
  Trophy, 
  CalendarDays,
  Calendar,
  Table2, 
  Users2, 
  UserCheck, 
  Award, 
  ShieldAlert, 
  Plus, 
  Sparkles, 
  Lock, 
  Unlock, 
  Newspaper, 
  GitCompare, 
  TrendingUp, 
  Sun, 
  Moon,
} from "lucide-react";

interface FotMobHeaderProps {
  currentTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  activeSeason: LeagueSeason;
  seasons: LeagueSeason[];
  onSelectSeason: (season: LeagueSeason) => void;
  pendingCount: number;
  isAdminUnlocked: boolean;
  onOpenAdminAuth: () => void;
  onOpenSubmitMatch: () => void;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
  leagueBranding?: LeagueBranding;
}

export const FotMobHeader: React.FC<FotMobHeaderProps> = ({
  currentTab,
  onSelectTab,
  activeSeason,
  seasons,
  onSelectSeason,
  pendingCount,
  isAdminUnlocked,
  onOpenAdminAuth,
  onOpenSubmitMatch,
  theme = "dark",
  onToggleTheme,
  leagueBranding,
}) => {
  const leagueName = leagueBranding?.leagueName || "COMMUNITY LEAGUE";
  const seasonTag = leagueBranding?.seasonTag || "SEASON 2026";
  const logoUrl = leagueBranding?.logoUrl;
  const leagueEmoji = leagueBranding?.leagueEmoji || "🏆";

  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800 shadow-md">
      {/* Top Banner / Brand */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 pb-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: League Brand & Season Selector */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-0.5 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="League Logo"
                className="w-full h-full object-contain p-0.5"
              />
            ) : (
              <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center text-base">
                {leagueEmoji ? <span>{leagueEmoji}</span> : <Trophy className="w-5 h-5 text-white" />}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-chakra font-black tracking-wider text-white text-sm sm:text-base uppercase flex items-center gap-2">
                {leagueName}
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {seasonTag}
                </span>
              </span>
            </div>
            {/* Season switcher dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-sans mt-0.5">
              <span>Season:</span>
              <select
                value={activeSeason.id}
                onChange={(e) => {
                  const s = seasons.find((item) => item.id === e.target.value);
                  if (s) onSelectSeason(s);
                }}
                className="bg-zinc-900 border border-zinc-700 text-white rounded-lg px-2 py-0.5 text-xs font-semibold focus:outline-none focus:border-white cursor-pointer"
              >
                {seasons.map((s) => (
                  <option key={s.id} value={s.id} className="bg-zinc-900 text-white">
                    {s.name} {s.status === "active" ? "• Active" : "(Archived)"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all cursor-pointer touch-manipulation shadow-sm"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-sky-400" />
              )}
            </button>
          )}

          {/* Submit Result CTA Button */}
          <button
            onClick={onOpenSubmitMatch}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-chakra font-black text-xs sm:text-sm transition-all shadow-sm cursor-pointer touch-manipulation min-h-[38px]"
          >
            <Plus className="w-4 h-4 text-black stroke-[3]" />
            <span className="hidden xs:inline">Submit Result</span>
            <span className="xs:hidden">Submit</span>
          </button>

          {/* Admin Mode Toggle Button */}
          <button
            onClick={onOpenAdminAuth}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-chakra font-bold transition-all cursor-pointer touch-manipulation min-h-[38px] ${
              isAdminUnlocked
                ? "bg-zinc-800 border-white text-white"
                : "bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700"
            }`}
          >
            {isAdminUnlocked ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Admin Mode</span>
                {pendingCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] font-black flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Admin</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Minimalist FotMob Style) */}
      <nav className="max-w-7xl mx-auto px-2 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar py-1.5">
        <TabButton
          label="Matches"
          icon={<Calendar className="w-4 h-4" />}
          isActive={currentTab === "matches"}
          onClick={() => onSelectTab("matches")}
        />
        <TabButton
          label="Calendar"
          icon={<CalendarDays className="w-4 h-4" />}
          isActive={currentTab === "calendar"}
          onClick={() => onSelectTab("calendar")}
        />
        <TabButton
          label="Table"
          icon={<Table2 className="w-4 h-4" />}
          isActive={currentTab === "standings"}
          onClick={() => onSelectTab("standings")}
        />
        <TabButton
          label="Teams & Lineups"
          icon={<Users2 className="w-4 h-4" />}
          isActive={currentTab === "teams"}
          onClick={() => onSelectTab("teams")}
        />
        <TabButton
          label="Players"
          icon={<UserCheck className="w-4 h-4" />}
          isActive={currentTab === "players"}
          onClick={() => onSelectTab("players")}
        />
        <TabButton
          label="News"
          icon={<Newspaper className="w-4 h-4" />}
          isActive={currentTab === "news"}
          onClick={() => onSelectTab("news")}
        />
        <TabButton
          label="Compare"
          icon={<GitCompare className="w-4 h-4" />}
          isActive={currentTab === "comparisons"}
          onClick={() => onSelectTab("comparisons")}
        />
        <TabButton
          label="Trends"
          icon={<TrendingUp className="w-4 h-4" />}
          isActive={currentTab === "trends"}
          onClick={() => onSelectTab("trends")}
          highlightBadge="Live"
        />
        <TabButton
          label="Awards"
          icon={<Award className="w-4 h-4" />}
          isActive={currentTab === "awards"}
          onClick={() => onSelectTab("awards")}
        />
        <TabButton
          label="Rate Players"
          icon={<Sparkles className="w-4 h-4" />}
          isActive={currentTab === "ratings_ballot"}
          onClick={() => onSelectTab("ratings_ballot")}
          highlightBadge="Ballot"
        />
        <TabButton
          label="Admin Hub"
          icon={<ShieldAlert className="w-4 h-4" />}
          isActive={currentTab === "admin"}
          onClick={() => onSelectTab("admin")}
          badgeCount={pendingCount > 0 ? pendingCount : undefined}
        />
      </nav>
    </header>
  );
};

interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  badgeCount?: number;
  highlightBadge?: string;
}

const TabButton: React.FC<TabButtonProps> = ({
  label,
  icon,
  isActive,
  onClick,
  badgeCount,
  highlightBadge,
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative px-3 py-2 rounded-xl font-chakra text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer touch-manipulation shrink-0 ${
        isActive
          ? "bg-white text-black shadow-sm"
          : "text-zinc-400 hover:text-white hover:bg-zinc-900"
      }`}
    >
      <span className={isActive ? "text-black" : "text-zinc-400"}>{icon}</span>
      <span>{label}</span>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className={`px-1.5 py-0.2 rounded-full font-sans text-[10px] font-black ${
          isActive ? "bg-black text-white" : "bg-white text-black"
        }`}>
          {badgeCount}
        </span>
      )}
      {highlightBadge && (
        <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold ${
          isActive ? "bg-zinc-200 text-black border border-zinc-300" : "bg-zinc-800 text-zinc-300 border border-zinc-700"
        }`}>
          {highlightBadge}
        </span>
      )}
    </button>
  );
};

