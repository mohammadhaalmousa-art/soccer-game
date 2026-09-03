import { Team, PlayerProfile, CustomStatDefinition, LeagueSeason, Match, NewsArticle, LeagueBranding } from "../types";
import { DEFAULT_TEAMS, DEFAULT_PLAYERS, DEFAULT_CUSTOM_STATS, DEFAULT_SEASONS, DEFAULT_MATCHES, DEFAULT_NEWS_ARTICLES, DEFAULT_BRANDING } from "../data/leagueSeed";

const LOCAL_STORAGE_KEY_LEAGUE = "COMMUNITY_LEAGUE_HUB_V1";
const LOCAL_STORAGE_KEY_ADMIN_PIN = "COMMUNITY_LEAGUE_ADMIN_PIN_V1";

export interface LeagueState {
  teams: Team[];
  players: PlayerProfile[];
  customStats: CustomStatDefinition[];
  seasons: LeagueSeason[];
  matches: Match[];
  news?: NewsArticle[];
  branding?: LeagueBranding;
  pendingCount?: number;
}

export function getLocalLeagueData(): LeagueState {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_LEAGUE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.teams) && Array.isArray(parsed.players)) {
        if (Array.isArray(parsed.matches)) {
          parsed.matches = parsed.matches.filter(
            (m: any) =>
              m.id !== "match_1788393953358_fouv" &&
              m.title !== "Game 3" &&
              m.status !== "REJECTED"
          );
        }
        // Ensure branding fallback
        if (!parsed.branding) {
          try {
            const b = localStorage.getItem("soccer_custom_league_branding");
            if (b) parsed.branding = JSON.parse(b);
          } catch {}
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read local league storage:", err);
  }

  let initialBranding: LeagueBranding | undefined = undefined;
  try {
    const b = localStorage.getItem("soccer_custom_league_branding");
    if (b) initialBranding = JSON.parse(b);
  } catch {}

  return {
    teams: DEFAULT_TEAMS,
    players: DEFAULT_PLAYERS,
    customStats: DEFAULT_CUSTOM_STATS,
    seasons: DEFAULT_SEASONS,
    matches: DEFAULT_MATCHES,
    news: DEFAULT_NEWS_ARTICLES,
    branding: initialBranding || DEFAULT_BRANDING,
    pendingCount: 0,
  };
}

export function saveLocalLeagueData(data: LeagueState): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_LEAGUE, JSON.stringify(data));
    if (data.branding) {
      localStorage.setItem("soccer_custom_league_branding", JSON.stringify(data.branding));
    }
  } catch (err) {
    console.warn("Could not save local league data:", err);
  }
}

export function getSavedAdminPin(): string {
  try {
    return localStorage.getItem(LOCAL_STORAGE_KEY_ADMIN_PIN) || "";
  } catch {
    return "";
  }
}

export function saveAdminPin(pin: string): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_ADMIN_PIN, pin);
  } catch {}
}

export async function fetchLeagueDataFromServer(): Promise<LeagueState | null> {
  try {
    const res = await fetch("/api/league");
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.teams) && Array.isArray(data.players)) {
        saveLocalLeagueData(data);
        return data;
      }
    }
  } catch (err) {
    console.warn("Could not fetch league data from server, using local cache:", err);
  }
  return null;
}

export async function syncLeagueDataToServer(data: LeagueState): Promise<LeagueState | null> {
  try {
    const res = await fetch("/api/league/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const resp = await res.json();
      if (resp.league) {
        saveLocalLeagueData(resp.league);
        return resp.league;
      }
    }
  } catch (err) {
    console.warn("Could not sync league data to server:", err);
  }
  return null;
}
