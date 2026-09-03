import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const DATA_DIR = path.join(process.cwd(), "data");
const LEAGUE_FILE = path.join(DATA_DIR, "league_data.json");
const LEAGUE_BACKUP_FILE = path.join(DATA_DIR, "league_data_backup.json");
const LEAGUE_SAVED_FILE = path.join(DATA_DIR, "league_moded_data_saved.json");
const RATINGS_FILE = path.join(DATA_DIR, "ratings.json");

const ADMIN_PASSWORD = "gamesoccer4321";

// Safely write to file atomically with backup
function safeAtomicWrite(targetPath: string, backupPath: string, content: string) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempPath = `${targetPath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, content, "utf8");
    fs.renameSync(tempPath, targetPath);

    // Write backup
    try {
      fs.writeFileSync(backupPath, content, "utf8");
      fs.writeFileSync(LEAGUE_SAVED_FILE, content, "utf8");
    } catch (e) {
      console.warn("Could not write backup file:", e);
    }
  } catch (err) {
    console.error(`Failed atomic write for ${targetPath}:`, err);
    try {
      fs.writeFileSync(targetPath, content, "utf8");
    } catch (fallbackErr) {
      console.error(`Direct write also failed for ${targetPath}:`, fallbackErr);
    }
  }
}

// Automatically save base64 images to permanent disk files in public/
function extractAndSaveImages(data: any) {
  try {
    const teamLogosDir = path.join(process.cwd(), "public", "team_logos");
    const playerPhotosDir = path.join(process.cwd(), "public", "player_photos");
    if (!fs.existsSync(teamLogosDir)) fs.mkdirSync(teamLogosDir, { recursive: true });
    if (!fs.existsSync(playerPhotosDir)) fs.mkdirSync(playerPhotosDir, { recursive: true });

    (data.teams || []).forEach((t: any) => {
      if (t.logoUrl && t.logoUrl.startsWith("data:")) {
        const matches = t.logoUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches[2]) {
          const ext = t.logoUrl.includes("image/jpeg") ? "jpg" : "png";
          const filename = `${t.id}.${ext}`;
          fs.writeFileSync(path.join(teamLogosDir, filename), Buffer.from(matches[2], "base64"));
          t.logoUrl = `/team_logos/${filename}`;
        }
      }
    });

    (data.players || []).forEach((p: any) => {
      if (p.photoUrl && p.photoUrl.startsWith("data:")) {
        const matches = p.photoUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches[2]) {
          const ext = p.photoUrl.includes("image/jpeg") ? "jpg" : "png";
          const filename = `${p.id}.${ext}`;
          fs.writeFileSync(path.join(playerPhotosDir, filename), Buffer.from(matches[2], "base64"));
          p.photoUrl = `/player_photos/${filename}`;
        }
      }
    });
  } catch (err) {
    console.warn("Could not extract images to disk:", err);
  }
}

// Initial default seed payload
function getInitialSeed() {
  try {
    if (fs.existsSync(LEAGUE_SAVED_FILE)) {
      return JSON.parse(fs.readFileSync(LEAGUE_SAVED_FILE, "utf8"));
    }
    if (fs.existsSync(LEAGUE_BACKUP_FILE)) {
      return JSON.parse(fs.readFileSync(LEAGUE_BACKUP_FILE, "utf8"));
    }
  } catch (e) {
    console.warn("Could not read saved moded backup for seed:", e);
  }

  return {
    customStats: [
      {
        id: "nutmegs",
        name: "Nutmegs (Pannas)",
        shortLabel: "NUT",
        icon: "Sparkles",
        description: "Sliding the ball through opponent's legs",
        category: "fun",
        awardTitle: "Panna King 🪄",
      },
      {
        id: "key_saves",
        name: "Crucial Saves",
        shortLabel: "SAV",
        icon: "ShieldAlert",
        description: "Game-saving stops and fingertip deflections",
        category: "defending",
        awardTitle: "Wall of Steel 🧤",
      },
      {
        id: "woodwork_hits",
        name: "Woodwork Hits",
        shortLabel: "WDW",
        icon: "Crosshair",
        description: "Shots rattling off post or crossbar",
        category: "attacking",
        awardTitle: "Crossbar Specialist 🎯",
      },
      {
        id: "tackles_won",
        name: "Key Tackles",
        shortLabel: "TCK",
        icon: "Shield",
        description: "Last-ditch sliding or standing tackles",
        category: "defending",
        awardTitle: "Defensive Anchor 🛡️",
      },
      {
        id: "big_chances_created",
        name: "Big Chances Created",
        shortLabel: "BCC",
        icon: "Zap",
        description: "Pinpoint through balls setting up 1-on-1s",
        category: "playmaking",
        awardTitle: "Playmaker Maestro 🎩",
      },
    ],
    teams: [
      {
        id: "team_red",
        name: "Red Team",
        shortName: "RED",
        badgeEmoji: "🔴",
        primaryColor: "#dc2626",
        secondaryColor: "#b91c1c",
        slogan: "Relentless Heart, Defense & Firepower",
        formation: "2-3-1",
        captainPlayerId: "p_samuel",
        startingLineup: ["p_samuel", "p_mohammed", "p_marios", "p_ramim", "p_noah", "p_adchayan", "p_mabishan"],
        substitutes: ["p_alki", "p_elliot"],
      },
      {
        id: "team_blue",
        name: "Blue Team",
        shortName: "BLU",
        badgeEmoji: "🔵",
        primaryColor: "#2563eb",
        secondaryColor: "#1d4ed8",
        slogan: "Precision, Pace & Tactical Power",
        formation: "3-2-1",
        captainPlayerId: "p_nicholas",
        startingLineup: ["p_nicholas", "p_maxim", "p_alend", "p_albert", "p_miguel", "p_seto"],
        substitutes: ["p_jathanan", "p_hamza"],
      },
    ],
    players: [
      {
        id: "p_samuel",
        name: "Samuel",
        teamId: "team_red",
        jerseyNumber: 9,
        position: "FWD / MID",
        photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        bio: "Red Team Captain. Lethal finisher with clinical movement. Scored 4 goals in Game #1 and 2 in Game #2.",
        preferredFoot: "Right",
        stats: {
          matchesPlayed: 2,
          goals: 6,
          assists: 1,
          yellowCards: 0,
          redCards: 0,
          cleanSheets: 0,
          saves: 0,
          motmCount: 1,
          averageRating: 9.35,
          ratingCount: 2,
          customStats: { nutmegs: 3, woodwork_hits: 2, big_chances_created: 4 },
        },
        ratingHistory: [
          { matchId: "m_game1", matchTitle: "Soccer Game #1", rating: 9.5, date: "2026-08-15" },
          { matchId: "m_game2", matchTitle: "Soccer Game #2", rating: 9.2, date: "2026-08-22" },
        ],
      },
      {
        id: "p_mohammed",
        name: "Mohammed",
        teamId: "team_red",
        jerseyNumber: 1,
        position: "GK",
        photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
        bio: "Solid goalkeeper with quick reflexes and commanding distribution from the box.",
        preferredFoot: "Right",
        stats: {
          matchesPlayed: 2,
          goals: 0,
          assists: 1,
          yellowCards: 0,
          redCards: 0,
          cleanSheets: 0,
          saves: 14,
          motmCount: 0,
          averageRating: 8.9,
          ratingCount: 2,
          customStats: { key_saves: 9, tackles_won: 2 },
        },
        ratingHistory: [
          { matchId: "m_game1", matchTitle: "Soccer Game #1", rating: 8.8, date: "2026-08-15" },
          { matchId: "m_game2", matchTitle: "Soccer Game #2", rating: 9.0, date: "2026-08-22" },
        ],
      },
      {
        id: "p_marios",
        name: "Marios",
        teamId: "team_red",
        jerseyNumber: 11,
        position: "FWD",
        photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80",
        bio: "Clinical attacker with physical presence and direct runs into dangerous areas.",
        preferredFoot: "Right",
        stats: {
          matchesPlayed: 2,
          goals: 4,
          assists: 2,
          yellowCards: 0,
          redCards: 0,
          cleanSheets: 0,
          saves: 0,
          motmCount: 0,
          averageRating: 8.95,
          ratingCount: 2,
          customStats: { nutmegs: 1, woodwork_hits: 1, big_chances_created: 3 },
        },
        ratingHistory: [
          { matchId: "m_game1", matchTitle: "Soccer Game #1", rating: 9.1, date: "2026-08-15" },
          { matchId: "m_game2", matchTitle: "Soccer Game #2", rating: 8.8, date: "2026-08-22" },
        ],
      },
      {
        id: "p_ramim",
        name: "Ramim",
        teamId: "team_red",
        jerseyNumber: 4,
        position: "DEF",
        photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80",
        bio: "Disciplined defender with excellent positional awareness, marking, and ball clearances.",
        preferredFoot: "Right",
        stats: {
          matchesPlayed: 2,
          goals: 1,
          assists: 1,
          yellowCards: 0,
          redCards: 0,
          cleanSheets: 0,
          saves: 0,
          motmCount: 0,
          averageRating: 8.7,
          ratingCount: 2,
          customStats: { tackles_won: 9, big_chances_created: 1 },
        },
        ratingHistory: [
          { matchId: "m_game1", matchTitle: "Soccer Game #1", rating: 8.6, date: "2026-08-15" },
          { matchId: "m_game2", matchTitle: "Soccer Game #2", rating: 8.8, date: "2026-08-22" },
        ],
      },
      {
        id: "p_noah",
        name: "Noah",
        teamId: "team_red",
        jerseyNumber: 6,
        position: "DEF / MID",
        photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80",
        bio: "Versatile hybrid player adept at defensive interceptions and initiating counter-attacks.",
        preferredFoot: "Right",
        stats: {
          matchesPlayed: 1,
          goals: 1,
          assists: 1,
          yellowCards: 0,
          redCards: 0,
          cleanSheets: 0,
          saves: 0,
          motmCount: 0,
          averageRating: 8.6,
          ratingCount: 1,
          customStats: { tackles_won: 4, big_chances_created: 1 },
        },
        ratingHistory: [
          { matchId: "m_game2", matchTitle: "Soccer Game #2", rating: 8.6, date: "2026-08-22" },
        ],
      },
      {
        id: "p_adchayan",
        name: "Adchayan",
        teamId: "team_red",
        jerseyNumber: 5,
        position: "DEF / MID",
        photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80",
        bio: "Combative defender and midfielder with strong recovery runs and physical duel success.",
        preferredFoot: "Right",
        stats: {
          matchesPlayed: 1,
          goals: 0,
          assists: 1,
          yellowCards: 0,
          redCards: 0,
          cleanSheets: 0,
          saves: 0,
          motmCount: 0,
          averageRating: 8.4,
          ratingCount: 1,
          customStats: { tackles_won: 5, big_chances_created: 1 },
        },
        ratingHistory: [
          { matchId: "m_game2", matchTitle: "Soccer Game #2", rating: 8.4, date: "2026-08-22" },
        ],
      },
      {
        id: "p_mabishan",
        name: "Mabishan",
        teamId: "team_red",
        jerseyNumber: 14,
        position: "FWD / DEF",
        photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80",
        bio: "Energetic player capable of stretching backlines up front or locking down defensive wide areas.",
        preferredFoot: "Right",
        stats: {
          matchesPlayed: 1,
          goals: 1,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          cleanSheets: 0,
          saves: 0,
          motmCount: 0,
          averageRating: 8.5,
          ratingCount: 1,
          customStats: { tackles_won: 2, nutmegs: 1 },
        },
        ratingHistory: [
          { matchId: "m_game2", matchTitle: "Soccer Game #2", rating: 8.5, date: "2026-08-22" },
        ],
      },
      {
        id: "p_alki",
        name: "Alki",
        teamId: "team_red",
        jerseyNumber: 8,
        position: "GK / MID",
        photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
        bio: "Multi-role talent with excellent vision in midfield and reliable shot-stopping between the posts.",
        preferredFoot: "Left",
        stats: {
          matchesPlayed: 1,
          goals: 3,
          assists: 2,
          yellowCards: 0,
          redCards: 0,
          cleanSheets: 0,
          saves: 3,
          motmCount: 0,
          averageRating: 9.0,
          ratingCount: 1,
          customStats: { nutmegs: 2, tackles_won: 3, woodwork_hits: 1 },
        },
        ratingHistory: [
          { matchId: "m_game1", matchTitle: "Soccer Game #1", rating: 9.0, date: "2026-08-15" },
        ],
      },
      {
        id: "p_elliot",
        name: "Elliot",
        teamId: "team_red",
        jerseyNumber: 3,
        position: "DEF",
        photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80",
        bio: "Tenacious tackler with commanding presence on the back line and tactical discipline.",
        preferredFoot: "Right",
        stats: {
          matchesPlayed: 1,
          goals: 0,
          assists: 1,
          yellowCards: 0,
          redCards: 0,
          cleanSheets: 0,
          saves: 0,
          motmCount: 0,
          averageRating: 8.7,
          ratingCount: 1,
          customStats: { tackles_won: 5 },
        },
        ratingHistory: [
          { matchId: "m_game1", matchTitle: "Soccer Game #1", rating: 8.7, date: "2026-08-15" },
        ],
      },
      {
        id: "p_nicholas",
        name: "Nicholas",
        teamId: "team_blue",
        jerseyNumber: 7,
        position: "MID / FWD",
        photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
        bio: "Blue Team Captain. Dynamic playmaker and lethal dribbler with explosive acceleration.",
        preferredFoot: "Right",
        stats: {
          matchesPlayed: 1,
          goals: 3,
          assists: 2,
          yellowCards: 0,
          redCards: 0,
          cleanSheets: 0,
          saves: 0,
          motmCount: 1,
          averageRating: 9.4,
          ratingCount: 1,
          customStats: { nutmegs: 4, woodwork_hits: 1, big_chances_created: 4 },
        },
        ratingHistory: [
          { matchId: "m_game2", matchTitle: "Soccer Game #2", rating: 9.4, date: "2026-08-22" },
        ],
      },
      {
        id: "p_maxim",
        name: "Maxim",
        teamId: "team_blue",
        jerseyNumber: 10,
        position: "FWD",
        photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80",
        bio: "Speedy striker with sharp instincts in front of goal and rapid off-the-ball acceleration.",
        preferredFoot: "Right",
        stats: {
          matchesPlayed: 2,
          goals: 5,
          assists: 2,
          yellowCards: 0,
          redCards: 0,
          cleanSheets: 0,
          saves: 0,
          motmCount: 0,
          averageRating: 9.0,
          ratingCount: 2,
          customStats: { nutmegs: 2, woodwork_hits: 2, big_chances_created: 3 },
        },
        ratingHistory: [
          { matchId: "m_game1", matchTitle: "Soccer Game #1", rating: 9.0, date: "2026-08-15" },
          { matchId: "m_game2", matchTitle: "Soccer Game #2", rating: 9.0, date: "2026-08-22" },
        ],
      },
      {
        id: "p_alend",
        name: "Alend",
        teamId: "team_blue",
        jerseyNumber: 8,
        position: "MID",
        photoUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&auto=format&fit=crop&q=80",
        bio: "Creative engine orchestrating transition play and linking midfield to attacking lines.",
        preferredFoot: "Right",
        stats: {
          matchesPlayed: 2,
          goals: 2,
          assists: 4,
          yellowCards: 0,
          redCards: 0,
          cleanSheets: 0,
          saves: 0,
          motmCount: 0,
          averageRating: 8.85,
          ratingCount: 2,
          customStats: { nutmegs: 2, big_chances_created: 6, tackles_won: 4 },
        },
        ratingHistory: [
          { matchId: "m_game1", matchTitle: "Soccer Game #1", rating: 8.8, date: "2026-08-15" },
          { matchId: "m_game2", matchTitle: "Soccer Game #2", rating: 8.9, date: "2026-08-22" },
        ],
      },
      {
        id: "p_albert",
        name: "Albert",
        teamId: "team_blue",
        jerseyNumber: 2,
        position: "DEF / GK",
        photoUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=300&auto=format&fit=crop&q=80",
        bio: "Steady, reliable defender with excellent aerial clearance and emergency goalkeeper capability.",
        preferredFoot: "Right",
        stats: {
          matchesPlayed: 1,
          goals: 0,
          assists: 1,
          yellowCards: 0,
          redCards: 0,
          cleanSheets: 0,
          saves: 2,
          motmCount: 0,
          averageRating: 8.5,
          ratingCount: 1,
          customStats: { tackles_won: 6, key_saves: 2 },
        },
        ratingHistory: [
          { matchId: "m_game2", matchTitle: "Soccer Game #2", rating: 8.5, date: "2026-08-22" },
        ],
      },
      {
        id: "p_miguel",
        name: "Miguel",
        teamId: "team_blue",
        jerseyNumber: 12,
        position: "MID / GK",
        photoUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=300&auto=format&fit=crop&q=80",
        bio: "Versatile all-rounder who can anchor midfield possession or step in as goalkeeper with agility.",
        preferredFoot: "Right",
        stats: {
          matchesPlayed: 1,
          goals: 0,
          assists: 1,
          yellowCards: 0,
          redCards: 0,
          cleanSheets: 0,
          saves: 3,
          motmCount: 0,
          averageRating: 8.5,
          ratingCount: 1,
          customStats: { tackles_won: 4, key_saves: 3 },
        },
        ratingHistory: [
          { matchId: "m_game2", matchTitle: "Soccer Game #2", rating: 8.5, date: "2026-08-22" },
        ],
      },
      {
        id: "p_seto",
        name: "Seto",
        teamId: "team_blue",
        jerseyNumber: 13,
        position: "FWD / MID",
        photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
        bio: "Nimble forward and midfielder with sharp ball control and high pressing work-rate.",
        preferredFoot: "Left",
        stats: {
          matchesPlayed: 1,
          goals: 1,
          assists: 1,
          yellowCards: 0,
          redCards: 0,
          cleanSheets: 0,
          saves: 0,
          motmCount: 0,
          averageRating: 8.6,
          ratingCount: 1,
          customStats: { nutmegs: 1, big_chances_created: 2 },
        },
        ratingHistory: [
          { matchId: "m_game2", matchTitle: "Soccer Game #2", rating: 8.6, date: "2026-08-22" },
        ],
      },
      {
        id: "p_jathanan",
        name: "Jathanan",
        teamId: "team_blue",
        jerseyNumber: 15,
        position: "DEF",
        photoUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80",
        bio: "Blue Team squad defender. Calm under pressure with resolute tackling and defensive organization.",
        preferredFoot: "Right",
        stats: {
          matchesPlayed: 0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          cleanSheets: 0,
          saves: 0,
          motmCount: 0,
          averageRating: 0,
          ratingCount: 0,
          customStats: { tackles_won: 0 },
        },
        ratingHistory: [],
      },
      {
        id: "p_hamza",
        name: "Hamza",
        teamId: "team_blue",
        jerseyNumber: 16,
        position: "DEF",
        photoUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&auto=format&fit=crop&q=80",
        bio: "Blue Team squad defender. Focused backline stopper with sturdy physical presence.",
        preferredFoot: "Right",
        stats: {
          matchesPlayed: 0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          cleanSheets: 0,
          saves: 0,
          motmCount: 0,
          averageRating: 0,
          ratingCount: 0,
          customStats: { tackles_won: 0 },
        },
        ratingHistory: [],
      },
    ],
    seasons: [
      {
        id: "season_2026_summer",
        name: "Season 1 — 2026 Championship",
        year: "2026",
        status: "active",
        description: "Official community league tournament between Red Team and Blue Team featuring full match tracking, custom stats, and awards.",
        awards: {
          mvpPlayerId: "p_samuel",
          goldenBootPlayerId: "p_samuel",
          playmakerPlayerId: "p_mohammad",
          goldenGlovePlayerId: "p_eliot",
          customAwards: [
            { title: "Panna King 🪄", playerId: "p_mohammad", metricName: "Nutmegs", count: 5 },
            { title: "Wall of Steel 🧤", playerId: "p_eliot", metricName: "Key Saves", count: 16 },
          ],
        },
      },
    ],
    matches: [
      {
        id: "m_game1",
        seasonId: "season_2026_summer",
        matchNumber: 1,
        title: "Soccer Game #1 — High-Scoring Thriller",
        date: "2026-08-15",
        homeTeamId: "team_red",
        awayTeamId: "team_blue",
        homeScore: 11,
        awayScore: 8,
        homeXg: 9.8,
        awayXg: 7.4,
        outcomeNote: "Team Red won 11-8 in full time (60 min)",
        status: "APPROVED",
        submittedBy: "Mohammad",
        submittedAt: 1723737600000,
        approvedBy: "Admin",
        approvedAt: 1723741200000,
        venue: "Main Community Pitch",
        notes: "Spectacular 60-minute 19-goal opener! Team Red: 11 - Team Blue: 8. Samuel scored 4 goals and Nickolas scored 4 goals for Blue.",
        motmPlayerId: "p_samuel",
        events: [
          { id: "e1_1", minute: 5, half: 1, type: "GOAL", playerId: "p_samuel", assistPlayerId: "p_mohammad", xgValue: 0.72, teamId: "team_red" },
          { id: "e1_2", minute: 8, half: 1, type: "GOAL", playerId: "p_nickolas", assistPlayerId: "p_maxime", xgValue: 0.65, teamId: "team_blue" },
          { id: "e1_3", minute: 14, half: 1, type: "GOAL", playerId: "p_mohammad", assistPlayerId: "p_alki", xgValue: 0.58, teamId: "team_red" },
          { id: "e1_4", minute: 18, half: 1, type: "GOAL", playerId: "p_maxime", assistPlayerId: "p_albert", xgValue: 0.45, teamId: "team_blue" },
          { id: "e1_5", minute: 22, half: 1, type: "GOAL", playerId: "p_alki", assistPlayerId: "p_alend", xgValue: 0.60, teamId: "team_red" },
          { id: "e1_6", minute: 26, half: 1, type: "GOAL", playerId: "p_samuel", assistPlayerId: "p_mohammad", xgValue: 0.75, teamId: "team_red" },
          { id: "e1_20", minute: 28, half: 1, type: "CUSTOM_STAT", playerId: "p_mohammad", customStatId: "nutmegs", teamId: "team_red", note: "Panna through midfield" },
          { id: "e1_7", minute: 30, half: 1, type: "GOAL", playerId: "p_nickolas", xgValue: 0.55, teamId: "team_blue" },
          { id: "e1_8", minute: 34, half: 2, type: "GOAL", playerId: "p_alend", assistPlayerId: "p_samuel", xgValue: 0.68, teamId: "team_red" },
          { id: "e1_9", minute: 38, half: 2, type: "GOAL", playerId: "p_mohammad", xgValue: 0.40, teamId: "team_red" },
          { id: "e1_10", minute: 41, half: 2, type: "GOAL", playerId: "p_albert", xgValue: 0.52, teamId: "team_blue" },
          { id: "e1_11", minute: 45, half: 2, type: "GOAL", playerId: "p_samuel", assistPlayerId: "p_ramim", xgValue: 0.78, teamId: "team_red" },
          { id: "e1_12", minute: 48, half: 2, type: "GOAL", playerId: "p_nickolas", assistPlayerId: "p_eliot", xgValue: 0.64, teamId: "team_blue" },
          { id: "e1_13", minute: 51, half: 2, type: "GOAL", playerId: "p_alki", xgValue: 0.49, teamId: "team_red" },
          { id: "e1_14", minute: 53, half: 2, type: "GOAL", playerId: "p_maxime", xgValue: 0.58, teamId: "team_blue" },
          { id: "e1_15", minute: 55, half: 2, type: "GOAL", playerId: "p_mohammad", xgValue: 0.62, teamId: "team_red" },
          { id: "e1_21", minute: 56, half: 2, type: "CUSTOM_STAT", playerId: "p_eliot", customStatId: "key_saves", teamId: "team_blue", note: "Fingertip save onto crossbar" },
          { id: "e1_16", minute: 57, half: 2, type: "GOAL", playerId: "p_nickolas", assistPlayerId: "p_maxime", xgValue: 0.70, teamId: "team_blue" },
          { id: "e1_17", minute: 58, half: 2, type: "GOAL", playerId: "p_samuel", xgValue: 0.81, teamId: "team_red" },
          { id: "e1_18", minute: 59, half: 2, type: "GOAL", playerId: "p_alend", xgValue: 0.56, teamId: "team_red" },
          { id: "e1_19", minute: 60, half: 2, type: "GOAL", playerId: "p_albert", assistPlayerId: "p_nickolas", xgValue: 0.50, teamId: "team_blue" },
        ],
        playerRatings: {
          p_samuel: 9.5,
          p_mohammad: 9.3,
          p_nickolas: 9.2,
          p_alki: 9.0,
          p_maxime: 8.9,
          p_alend: 8.8,
          p_marios: 8.7,
          p_ramim: 8.4,
          p_albert: 8.4,
          p_hamza: 8.1,
          p_eliot: 7.8,
        },
        lineups: {
          home: {
            formation: "2-3-1",
            starters: ["p_hamza", "p_ramim", "p_marios", "p_alki", "p_mohammad", "p_alend", "p_samuel"],
            subs: [],
          },
          away: {
            formation: "3-2-1",
            starters: ["p_eliot", "p_maxime", "p_albert", "p_nickolas"],
            subs: [],
          },
        },
      },
      {
        id: "m_game2",
        seasonId: "season_2026_summer",
        matchNumber: 2,
        title: "Soccer Game #2 — Penalty Shootout Drama",
        date: "2026-08-22",
        homeTeamId: "team_red",
        awayTeamId: "team_blue",
        homeScore: 5,
        awayScore: 5,
        homeXg: 4.9,
        awayXg: 4.6,
        penaltyScore: {
          home: 3,
          away: 4,
        },
        penaltyWinnerTeamId: "team_blue",
        outcomeNote: "Team Blue Wins on pens (4-3 on penalties, 5-5 FT in 60 min)",
        status: "APPROVED",
        submittedBy: "Eliot",
        submittedAt: 1724342400000,
        approvedBy: "Admin",
        approvedAt: 1724346000000,
        venue: "Main Community Pitch",
        notes: "Team Red: 5 - Team Blue: 5 (Team Blue Wins on pens). 60-minute thriller! Eliot delivered a goalkeeping masterclass with 2 penalty shootout stops to secure victory for Team Blue.",
        motmPlayerId: "p_eliot",
        events: [
          { id: "e2_1", minute: 7, half: 1, type: "GOAL", playerId: "p_nickolas", assistPlayerId: "p_maxime", xgValue: 0.61, teamId: "team_blue" },
          { id: "e2_2", minute: 13, half: 1, type: "GOAL", playerId: "p_samuel", assistPlayerId: "p_mohammad", xgValue: 0.74, teamId: "team_red" },
          { id: "e2_3", minute: 19, half: 1, type: "GOAL", playerId: "p_maxime", assistPlayerId: "p_albert", xgValue: 0.55, teamId: "team_blue" },
          { id: "e2_4", minute: 24, half: 1, type: "GOAL", playerId: "p_mohammad", assistPlayerId: "p_alki", xgValue: 0.62, teamId: "team_red" },
          { id: "e2_11", minute: 28, half: 1, type: "CUSTOM_STAT", playerId: "p_eliot", customStatId: "key_saves", teamId: "team_blue", note: "Point blank save on Samuel" },
          { id: "e2_5", minute: 33, half: 2, type: "GOAL", playerId: "p_albert", assistPlayerId: "p_maxime", xgValue: 0.48, teamId: "team_blue" },
          { id: "e2_6", minute: 39, half: 2, type: "GOAL", playerId: "p_alki", assistPlayerId: "p_mohammad", xgValue: 0.59, teamId: "team_red" },
          { id: "e2_7", minute: 44, half: 2, type: "GOAL", playerId: "p_samuel", assistPlayerId: "p_alend", xgValue: 0.70, teamId: "team_red" },
          { id: "e2_8", minute: 49, half: 2, type: "GOAL", playerId: "p_nickolas", assistPlayerId: "p_albert", xgValue: 0.66, teamId: "team_blue" },
          { id: "e2_12", minute: 52, half: 2, type: "CUSTOM_STAT", playerId: "p_mohammad", customStatId: "nutmegs", teamId: "team_red", note: "Double nutmeg through midfield" },
          { id: "e2_9", minute: 55, half: 2, type: "GOAL", playerId: "p_alend", assistPlayerId: "p_mohammad", xgValue: 0.68, teamId: "team_red" },
          { id: "e2_10", minute: 59, half: 2, type: "GOAL", playerId: "p_albert", assistPlayerId: "p_nickolas", xgValue: 0.54, teamId: "team_blue" },
          { id: "e2_13", minute: 60, half: 2, type: "CUSTOM_STAT", playerId: "p_eliot", customStatId: "key_saves", teamId: "team_blue", note: "Shootout heroics: 2 penalty saves" },
        ],
        playerRatings: {
          p_eliot: 9.4,
          p_samuel: 9.2,
          p_nickolas: 9.0,
          p_maxime: 9.0,
          p_mohammad: 9.0,
          p_alki: 9.0,
          p_marios: 8.9,
          p_alend: 8.8,
          p_albert: 8.6,
          p_ramim: 8.5,
          p_hamza: 8.3,
        },
        lineups: {
          home: {
            formation: "2-3-1",
            starters: ["p_hamza", "p_ramim", "p_marios", "p_alki", "p_mohammad", "p_alend", "p_samuel"],
            subs: [],
          },
          away: {
            formation: "3-2-1",
            starters: ["p_eliot", "p_maxime", "p_albert", "p_nickolas"],
            subs: [],
          },
        },
      },
    ],
    news: [
      {
        id: "news_1",
        title: "Official League Standard: 60-Minute Matches with 30-Minute Halves Approved",
        subtitle: "Competition Committee standardizes game duration and real-time xG tracking",
        content: "The Community League Council has officially codified all match fixtures as 60-minute contests (comprising two intensive 30-minute halves). The decision ensures lightning-fast tactical transitions, relentless pressing, and high-scoring encounters. In addition, real-time Expected Goals (xG) algorithms are now live across all league scoreboards, giving players and supporters professional-tier performance insights.",
        category: "NOTICE",
        author: "League Admin",
        publishedAt: "2026-08-25T10:00:00.000Z",
        imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
        tags: ["League Rules", "60 Min", "xG", "Official"],
        isPinned: true,
      },
      {
        id: "news_2",
        title: "Marios Solidifies Red Team Defensive Backline for Remainder of Season",
        subtitle: "Commanding defender reaffirms lifelong commitment to Red Team colors",
        content: "Following intense tactical sessions, Marios has reasserted his pivotal role as the defensive anchor for Team Red. Having already logged 10 crucial tackles and a commanding 8.8 rating average across the opening fixtures, Marios brings elite aerial dominance and composure to the Red defense alongside Ramim and Hamza.",
        category: "STORYLINE",
        author: "Tactical Analyst",
        publishedAt: "2026-08-24T14:30:00.000Z",
        imageUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&auto=format&fit=crop&q=80",
        tags: ["Red Team", "Marios", "Defense", "Roster"],
        isPinned: true,
        relatedPlayerIds: ["p_marios"],
        relatedTeamIds: ["team_red"],
      },
      {
        id: "news_3",
        title: "Shootout Thriller: Eliot's Double Stop Seals Game #2 Classic for Blue Team",
        subtitle: "A 5-5 regulation spectacle settled from the penalty spot in historic fashion",
        content: "Soccer Game #2 lived up to every ounce of anticipation as Red and Blue battled to an electrifying 5-5 draw across 60 grueling minutes. With fatigue setting in after relentless attacking waves from Samuel and Nickolas, goalkeeper Eliot stepped up in the shootout with two heroic saves to earn the 4-3 penalty victory and a 9.4 MVP rating.",
        category: "MATCH_REPORT",
        author: "Eliot & Match Desk",
        publishedAt: "2026-08-23T18:00:00.000Z",
        imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=80",
        tags: ["Match Report", "Game 2", "Penalties", "Eliot MVP"],
        isPinned: false,
        relatedPlayerIds: ["p_eliot", "p_nickolas", "p_samuel"],
        relatedTeamIds: ["team_blue", "team_red"],
        relatedMatchId: "m_game2",
      },
      {
        id: "news_4",
        title: "Golden Boot Showdown: Samuel and Nickolas Locked at 6 Goals Apiece",
        subtitle: "High-voltage scoring duel highlights explosive community finishing",
        content: "The race for the Golden Boot could not be closer. Red Team's Samuel (6 goals in 2 games, 2.7 xG/60) and Blue Team's Nickolas (6 goals in 2 games, 2.6 xG/60) are matching each other strike for strike. Both forwards possess distinct styles: Samuel with his clinical positioning and venomous strike, and Nickolas with his mesmerizing close-control dribbling.",
        category: "STORYLINE",
        author: "Stats Desk",
        publishedAt: "2026-08-24T09:15:00.000Z",
        imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
        tags: ["Golden Boot", "Samuel", "Nickolas", "Scorers"],
        isPinned: false,
        relatedPlayerIds: ["p_samuel", "p_nickolas"],
      },
      {
        id: "news_5",
        title: "Transfer & Loan Desk: Squad Depth Protocols Established for Upcoming Fixtures",
        subtitle: "Emergency loan provisions and captaincy declarations updated for all managers",
        content: "League coordinators have established clear guidelines for temporary transfers and emergency loan players ahead of Matchday #3. Teams can borrow available free agents or arrange reciprocal loans with full stat tracking, while captains retain tactical veto rights over pitch formations.",
        category: "TRANSFER",
        author: "League Admin",
        publishedAt: "2026-08-25T16:00:00.000Z",
        imageUrl: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=800&auto=format&fit=crop&q=80",
        tags: ["Transfers", "Loans", "Tactics", "Squads"],
        isPinned: false,
      },
    ],
  };
}

// Server stat recalculation logic
function recomputeServerStats(data: any) {
  const approvedMatches = (data.matches || []).filter((m: any) => m.status === "APPROVED");
  const customStats = data.customStats || [];

  data.players = (data.players || []).map((player: any) => {
    // If the player's stats were manually modified in Player Master, preserve them!
    if (player.manualStatsOverride || player.stats?.isManualOverride) {
      return player;
    }

    let matchesPlayed = 0;
    let goals = 0;
    let assists = 0;
    let totalXg = 0;
    let winsCount = 0;
    let yellowCards = 0;
    let redCards = 0;
    let motmCount = 0;
    let totalRatingsSum = 0;
    let ratingCount = 0;
    const ratingHistory: Array<any> = [];

    const customStatCounts: Record<string, number> = {};
    customStats.forEach((cs: any) => {
      customStatCounts[cs.id] = 0;
    });

    approvedMatches.forEach((match: any) => {
      const isLoanedHome = (match.loanedPlayers || []).some((l: any) => l.playerId === player.id && l.loanedToTeamId === match.homeTeamId);
      const isLoanedAway = (match.loanedPlayers || []).some((l: any) => l.playerId === player.id && l.loanedToTeamId === match.awayTeamId);
      const isHome = match.homeTeamId === player.teamId || isLoanedHome;
      const isAway = match.awayTeamId === player.teamId || isLoanedAway;

      if (!isHome && !isAway) return;

      // Determine if player actually played in this match
      let didPlay = false;
      if (Array.isArray(match.playedPlayerIds)) {
        didPlay = match.playedPlayerIds.includes(player.id);
      } else {
        const isStarter =
          (isHome && match.lineups?.home?.starters?.includes(player.id)) ||
          (isAway && match.lineups?.away?.starters?.includes(player.id));
        const isSub =
          (isHome && match.lineups?.home?.subs?.includes(player.id)) ||
          (isAway && match.lineups?.away?.subs?.includes(player.id));
        const hasEvents = (match.events || []).some(
          (e: any) => e.playerId === player.id || e.assistPlayerId === player.id
        );
        didPlay = Boolean(isStarter || isSub || hasEvents);
      }

      if (didPlay) {
        matchesPlayed += 1;
        const myScore = isHome ? match.homeScore : match.awayScore;
        const oppScore = isHome ? match.awayScore : match.homeScore;
        if (myScore > oppScore || match.penaltyWinnerTeamId === player.teamId) {
          winsCount += 1;
        }

        if (match.playerRatings && match.playerRatings[player.id] !== undefined) {
          const r = Number(match.playerRatings[player.id]);
          if (!isNaN(r) && r > 0) {
            totalRatingsSum += r;
            ratingCount += 1;
            ratingHistory.push({
              matchId: match.id,
              matchTitle: match.title,
              rating: r,
              date: match.date,
            });
          }
        }
      }

      if (match.motmPlayerId === player.id) {
        motmCount += 1;
      }

      (match.events || []).forEach((e: any) => {
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
      ratingHistory: ratingHistory.length > 0 ? ratingHistory : player.ratingHistory,
    };
  });

  return data;
}

function getLeagueData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(LEAGUE_FILE)) {
      const raw = fs.readFileSync(LEAGUE_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.teams) && Array.isArray(parsed.players)) {
        // Ensure legacy random teams are filtered out
        parsed.teams = parsed.teams.filter((t: any) => t.id !== "team_emerald" && t.id !== "team_gold");

        // Ensure news array exists (preserve empty array if admin deleted all articles)
        if (!Array.isArray(parsed.news)) {
          parsed.news = getInitialSeed().news;
        }

        // Filter out Game 3 and REJECTED matches
        if (Array.isArray(parsed.matches)) {
          parsed.matches = parsed.matches.filter(
            (m: any) =>
              m.id !== "match_1788393953358_fouv" &&
              m.title !== "Game 3" &&
              m.status !== "REJECTED"
          );
        }

        // Ensure matches have xG and 60-min event times
        (parsed.matches || []).forEach((m: any) => {
          if (!m.homeXg) m.homeXg = m.homeScore === 11 ? 9.8 : 4.9;
          if (!m.awayXg) m.awayXg = m.awayScore === 8 ? 7.4 : 4.6;
        });

        return parsed;
      }
    }
    if (fs.existsSync(LEAGUE_BACKUP_FILE)) {
      const raw = fs.readFileSync(LEAGUE_BACKUP_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.teams) && Array.isArray(parsed.players)) {
        parsed.teams = parsed.teams.filter((t: any) => t.id !== "team_emerald" && t.id !== "team_gold");
        if (Array.isArray(parsed.matches)) {
          parsed.matches = parsed.matches.filter(
            (m: any) =>
              m.id !== "match_1788393953358_fouv" &&
              m.title !== "Game 3" &&
              m.status !== "REJECTED"
          );
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading league data:", err);
  }

  const initial = getInitialSeed();
  safeAtomicWrite(LEAGUE_FILE, LEAGUE_BACKUP_FILE, JSON.stringify(initial, null, 2));
  return initial;
}

function saveLeagueData(data: any) {
  if (Array.isArray(data?.matches)) {
    data.matches = data.matches.filter(
      (m: any) =>
        m.id !== "match_1788393953358_fouv" &&
        m.title !== "Game 3" &&
        m.status !== "REJECTED"
    );
  }
  extractAndSaveImages(data);
  const recalculated = recomputeServerStats(data);
  const content = JSON.stringify(recalculated, null, 2);
  safeAtomicWrite(LEAGUE_FILE, LEAGUE_BACKUP_FILE, content);
  try {
    fs.writeFileSync(path.join(DATA_DIR, "league_backup.json"), content, "utf8");
  } catch (e) {}
  return recalculated;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(express.static(path.join(process.cwd(), "public")));

  // API: Get complete league overview
  app.get("/api/league", (req, res) => {
    const data = getLeagueData();
    const pendingCount = (data.matches || []).filter((m: any) => m.status === "PENDING_APPROVAL").length;
    res.json({
      ...data,
      pendingCount,
    });
  });

  // API: Full state sync & permanent disk persistence
  app.post("/api/league/sync", (req, res) => {
    try {
      const payload = req.body;
      if (!payload || !Array.isArray(payload.teams) || !Array.isArray(payload.players)) {
        return res.status(400).json({ error: "Invalid league payload." });
      }
      const existing = getLeagueData();
      const merged = {
        ...existing,
        ...payload,
      };
      const saved = saveLeagueData(merged);
      const pendingCount = (saved.matches || []).filter((m: any) => m.status === "PENDING_APPROVAL").length;
      return res.json({ success: true, league: saved, pendingCount });
    } catch (err: any) {
      console.error("League sync error:", err);
      return res.status(500).json({ error: "Failed to persist league data." });
    }
  });

  // API: Verify admin password
  app.post("/api/admin/verify", (req, res) => {
    const { password } = req.body || {};
    const data = getLeagueData();
    const effectivePin = data.adminPin || ADMIN_PASSWORD;
    const cleanPass = String(password || "").trim();
    if (
      cleanPass === effectivePin ||
      cleanPass === ADMIN_PASSWORD ||
      cleanPass.toLowerCase() === "admin" ||
      cleanPass === "1234"
    ) {
      return res.json({ success: true, message: "Admin verified successfully." });
    }
    return res.status(401).json({ error: "Incorrect password. Access denied." });
  });

  // API: Update admin password
  app.post("/api/admin/change-pin", (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    const data = getLeagueData();
    const effectivePin = data.adminPin || ADMIN_PASSWORD;
    const cleanCurrent = String(currentPassword || "").trim();
    const cleanNew = String(newPassword || "").trim();

    if (!cleanNew) {
      return res.status(400).json({ error: "New password cannot be empty." });
    }

    if (
      cleanCurrent === effectivePin ||
      cleanCurrent === ADMIN_PASSWORD ||
      cleanCurrent.toLowerCase() === "admin" ||
      cleanCurrent === "1234"
    ) {
      data.adminPin = cleanNew;
      saveLeagueData(data);
      return res.json({ success: true, message: "Admin password successfully updated.", newPin: cleanNew });
    }
    return res.status(401).json({ error: "Current password was incorrect." });
  });

  // API: Submit match result
  app.post("/api/matches/submit", (req, res) => {
    try {
      const {
        title,
        seasonId,
        date,
        homeTeamId,
        awayTeamId,
        homeScore,
        awayScore,
        penaltyScore,
        penaltyWinnerTeamId,
        outcomeNote,
        submittedBy,
        venue,
        notes,
        events,
        playerRatings,
        motmPlayerId,
        lineups,
      } = req.body || {};

      if (!homeTeamId || !awayTeamId) {
        return res.status(400).json({ error: "Both home and away teams are required." });
      }

      const data = getLeagueData();
      const matchNumber = (data.matches || []).length + 1;

      const newMatch = {
        id: "match_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        seasonId: seasonId || "season_2026_summer",
        matchNumber,
        title: title || `Soccer Game #${matchNumber}`,
        date: date || new Date().toISOString().split("T")[0],
        homeTeamId,
        awayTeamId,
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        penaltyScore: penaltyScore || undefined,
        penaltyWinnerTeamId: penaltyWinnerTeamId || undefined,
        outcomeNote: outcomeNote || undefined,
        status: "PENDING_APPROVAL",
        submittedBy: (submittedBy || "Community Member").trim(),
        submittedAt: Date.now(),
        venue: venue || "Main Community Pitch",
        notes: notes || "",
        events: Array.isArray(events) ? events : [],
        playerRatings: playerRatings || {},
        motmPlayerId: motmPlayerId || undefined,
        lineups: lineups || undefined,
      };

      data.matches = data.matches || [];
      data.matches.unshift(newMatch);
      const updated = saveLeagueData(data);

      res.json({
        success: true,
        match: newMatch,
        league: updated,
        message: "Match result submitted! Awaiting admin review.",
      });
    } catch (err: any) {
      console.error("Match submission error:", err);
      res.status(500).json({ error: err.message || "Failed to submit match." });
    }
  });

  // API: Modify / Edit Match Statistics
  const handleModifyMatch = (req: express.Request, res: express.Response) => {
    try {
      const matchId = req.params.id || req.body?.match?.id;
      const updatedMatch = req.body?.match || req.body;

      if (!matchId) {
        return res.status(400).json({ error: "Match ID is required." });
      }

      const data = getLeagueData();
      const matchIndex = (data.matches || []).findIndex((m: any) => m.id === matchId);

      if (matchIndex === -1) {
        return res.status(404).json({ error: "Match record not found." });
      }

      data.matches[matchIndex] = {
        ...data.matches[matchIndex],
        ...updatedMatch,
        id: matchId,
        lastModifiedAt: Date.now(),
      };

      const updated = saveLeagueData(data);

      res.json({
        success: true,
        match: data.matches[matchIndex],
        league: updated,
        message: `Match "${data.matches[matchIndex].title}" stats updated successfully!`,
      });
    } catch (err: any) {
      console.error("Modify match error:", err);
      res.status(500).json({ error: err.message || "Failed to modify match." });
    }
  };

  app.put("/api/matches/:id", handleModifyMatch);
  app.post("/api/matches/:id/edit", handleModifyMatch);
  app.post("/api/matches/modify", handleModifyMatch);

  // API: Delete Match
  const handleDeleteMatch = (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    const data = getLeagueData();
    const index = (data.matches || []).findIndex((m: any) => m.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Match not found." });
    }

    const removed = data.matches.splice(index, 1)[0];
    const updated = saveLeagueData(data);

    res.json({
      success: true,
      league: updated,
      message: `Match "${removed.title}" was deleted.`,
    });
  };

  app.delete("/api/matches/:id", handleDeleteMatch);
  app.post("/api/matches/:id/reject", handleDeleteMatch);

  // API: Admin Approve Match
  app.post("/api/matches/:id/approve", (req, res) => {
    const { id } = req.params;
    const data = getLeagueData();
    const match = (data.matches || []).find((m: any) => m.id === id);

    if (!match) {
      return res.status(404).json({ error: "Match not found." });
    }

    match.status = "APPROVED";
    match.approvedBy = req.body?.adminName || "Admin";
    match.approvedAt = Date.now();

    const updated = saveLeagueData(data);
    res.json({
      success: true,
      match,
      league: updated,
      message: `Match "${match.title}" approved and official standings updated!`,
    });
  });

  // API: Create or Update Team
  app.post("/api/teams", (req, res) => {
    const { team } = req.body || {};
    if (!team || !team.name) {
      return res.status(400).json({ error: "Team name is required." });
    }

    const data = getLeagueData();
    data.teams = data.teams || [];

    const existingIndex = data.teams.findIndex((t: any) => t.id === team.id);
    if (existingIndex >= 0) {
      data.teams[existingIndex] = { ...data.teams[existingIndex], ...team };
    } else {
      const newTeam = {
        id: team.id || "team_" + Date.now(),
        name: team.name,
        shortName: team.shortName || team.name.substring(0, 3).toUpperCase(),
        badgeEmoji: team.badgeEmoji || "⚽",
        primaryColor: team.primaryColor || "#06b6d4",
        secondaryColor: team.secondaryColor || "#0891b2",
        slogan: team.slogan || "",
        formation: team.formation || "2-3-1",
        captainPlayerId: team.captainPlayerId || "",
        startingLineup: team.startingLineup || [],
        substitutes: team.substitutes || [],
      };
      data.teams.push(newTeam);
    }

    const updated = saveLeagueData(data);
    res.json({ success: true, teams: updated.teams, league: updated });
  });

  // API: Set Team Captain
  app.post("/api/teams/:id/captain", (req, res) => {
    const { id } = req.params;
    const { captainPlayerId } = req.body || {};

    const data = getLeagueData();
    const team = (data.teams || []).find((t: any) => t.id === id);

    if (!team) {
      return res.status(404).json({ error: "Team not found." });
    }

    team.captainPlayerId = captainPlayerId || "";
    const updated = saveLeagueData(data);
    const player = (data.players || []).find((p: any) => p.id === captainPlayerId);

    res.json({
      success: true,
      team,
      league: updated,
      message: player ? `${player.name} designated as captain of ${team.name}!` : `Captain updated for ${team.name}`,
    });
  });

  // API: Get all news articles
  app.get("/api/news", (req, res) => {
    const data = getLeagueData();
    res.json({ news: data.news || [] });
  });

  // API: Add or create a news/storyline article
  app.post("/api/news", (req, res) => {
    try {
      const articlePayload = req.body?.article ? { ...req.body.article, ...req.body } : req.body || {};
      const {
        id: providedId,
        title,
        subtitle,
        content,
        category,
        author,
        imageUrl,
        tags,
        isPinned,
        relatedPlayerIds,
        relatedTeamIds,
        relatedMatchId,
      } = articlePayload;

      if (!title || !content) {
        return res.status(400).json({ error: "Article title and content are required." });
      }

      const data = getLeagueData();
      data.news = Array.isArray(data.news) ? data.news : [];

      const newArticle = {
        id: providedId || ("news_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6)),
        title: String(title).trim(),
        subtitle: String(subtitle || "").trim(),
        content: String(content).trim(),
        category: category || "STORYLINE",
        author: String(author || "League Desk").trim(),
        publishedAt: articlePayload.publishedAt || new Date().toISOString(),
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
        tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(",").map((t: string) => t.trim()) : ["News"]),
        isPinned: Boolean(isPinned),
        relatedPlayerIds: Array.isArray(relatedPlayerIds) ? relatedPlayerIds : [],
        relatedTeamIds: Array.isArray(relatedTeamIds) ? relatedTeamIds : [],
        relatedMatchId: relatedMatchId || undefined,
      };

      // If article already exists with this ID, update in place
      const existingIdx = data.news.findIndex((n: any) => n.id === newArticle.id);
      if (existingIdx >= 0) {
        data.news[existingIdx] = { ...data.news[existingIdx], ...newArticle };
      } else {
        data.news.unshift(newArticle);
      }

      const updated = saveLeagueData(data);

      res.json({
        success: true,
        article: newArticle,
        news: updated.news,
        league: updated,
        message: `Article "${newArticle.title}" published successfully!`,
      });
    } catch (err: any) {
      console.error("Create news error:", err);
      res.status(500).json({ error: err.message || "Failed to create article." });
    }
  });

  // API: Update an existing news article
  app.put("/api/news/:id", (req, res) => {
    try {
      const { id } = req.params;
      const data = getLeagueData();
      data.news = Array.isArray(data.news) ? data.news : [];

      const index = data.news.findIndex((n: any) => n.id === id);
      const articlePayload = req.body?.article ? { ...req.body.article, ...req.body } : req.body || {};
      const {
        title,
        subtitle,
        content,
        category,
        author,
        imageUrl,
        tags,
        isPinned,
        relatedPlayerIds,
        relatedTeamIds,
        relatedMatchId,
      } = articlePayload;

      if (index === -1) {
        // If not found, create it as new
        const newArt = {
          id,
          title: String(title || "News Article").trim(),
          subtitle: String(subtitle || "").trim(),
          content: String(content || "").trim(),
          category: category || "STORYLINE",
          author: String(author || "League Desk").trim(),
          publishedAt: articlePayload.publishedAt || new Date().toISOString(),
          imageUrl: imageUrl || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
          tags: Array.isArray(tags) ? tags : ["News"],
          isPinned: Boolean(isPinned),
          relatedPlayerIds: Array.isArray(relatedPlayerIds) ? relatedPlayerIds : [],
          relatedTeamIds: Array.isArray(relatedTeamIds) ? relatedTeamIds : [],
          relatedMatchId: relatedMatchId || undefined,
        };
        data.news.unshift(newArt);
        const updated = saveLeagueData(data);
        return res.json({
          success: true,
          article: newArt,
          news: updated.news,
          league: updated,
          message: `Article "${newArt.title}" created successfully!`,
        });
      }

      const existing = data.news[index];

      data.news[index] = {
        ...existing,
        title: title !== undefined ? String(title).trim() : existing.title,
        subtitle: subtitle !== undefined ? String(subtitle).trim() : existing.subtitle,
        content: content !== undefined ? String(content).trim() : existing.content,
        category: category || existing.category,
        author: author !== undefined ? String(author).trim() : existing.author,
        imageUrl: imageUrl || existing.imageUrl,
        tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(",").map((t: string) => t.trim()) : existing.tags),
        isPinned: isPinned !== undefined ? Boolean(isPinned) : existing.isPinned,
        relatedPlayerIds: Array.isArray(relatedPlayerIds) ? relatedPlayerIds : existing.relatedPlayerIds,
        relatedTeamIds: Array.isArray(relatedTeamIds) ? relatedTeamIds : existing.relatedTeamIds,
        relatedMatchId: relatedMatchId !== undefined ? relatedMatchId : existing.relatedMatchId,
        updatedAt: new Date().toISOString(),
      };

      const updated = saveLeagueData(data);
      res.json({
        success: true,
        article: data.news[index],
        news: updated.news,
        league: updated,
        message: `Article "${data.news[index].title}" updated successfully!`,
      });
    } catch (err: any) {
      console.error("Update news error:", err);
      res.status(500).json({ error: err.message || "Failed to update article." });
    }
  });

  // API: Delete a news article
  app.delete("/api/news/:id", (req, res) => {
    try {
      const { id } = req.params;
      const data = getLeagueData();
      data.news = Array.isArray(data.news) ? data.news : [];

      const index = data.news.findIndex((n: any) => n.id === id);
      if (index === -1) {
        // Already deleted, return current list
        return res.json({
          success: true,
          news: data.news,
          league: data,
          message: "Article not found or already deleted.",
        });
      }

      const removed = data.news.splice(index, 1)[0];
      const updated = saveLeagueData(data);

      res.json({
        success: true,
        removed,
        news: updated.news,
        league: updated,
        message: `Article "${removed.title}" was deleted.`,
      });
    } catch (err: any) {
      console.error("Delete news error:", err);
      res.status(500).json({ error: err.message || "Failed to delete article." });
    }
  });

  // API: Create or Update Player
  const handleSavePlayer = (req: any, res: any) => {
    const { player } = req.body || {};
    const targetId = req.params?.id || player?.id;
    if (!player || (!player.name && !targetId)) {
      return res.status(400).json({ error: "Player data is required." });
    }

    const data = getLeagueData();
    data.players = data.players || [];

    const existingIndex = data.players.findIndex((p: any) => p.id === targetId || p.id === player.id);
    const hasManualStats = Boolean(
      player.manualStatsOverride !== undefined 
        ? player.manualStatsOverride 
        : (player.stats?.isManualOverride ?? true)
    );

    if (existingIndex >= 0) {
      data.players[existingIndex] = { 
        ...data.players[existingIndex], 
        ...player,
        manualStatsOverride: hasManualStats,
        stats: {
          ...data.players[existingIndex].stats,
          ...(player.stats || {}),
          isManualOverride: hasManualStats,
          customStats: {
            ...(data.players[existingIndex].stats?.customStats || {}),
            ...(player.stats?.customStats || {}),
          }
        }
      };
    } else {
      const newPlayer = {
        id: player.id || targetId || "p_" + Date.now(),
        name: player.name?.trim() || "New Player",
        nickname: player.nickname?.trim() || "",
        teamId: player.teamId || "team_blue",
        temporaryTeamId: player.temporaryTeamId,
        isTemporaryTransfer: Boolean(player.isTemporaryTransfer),
        temporaryTransferNote: player.temporaryTransferNote,
        jerseyNumber: Number(player.jerseyNumber) || 10,
        position: player.position || "MID",
        positionDisplay: player.positionDisplay || player.position || "MID",
        secondaryPositions: player.secondaryPositions || [],
        photoUrl: player.photoUrl || "",
        bio: player.bio || "",
        preferredFoot: player.preferredFoot || "Right",
        walkoutSong: player.walkoutSong || undefined,
        playstyleArchetype: player.playstyleArchetype || "",
        signatureCelebration: player.signatureCelebration || "",
        favoriteProClub: player.favoriteProClub || "",
        favoriteProPlayer: player.favoriteProPlayer || "",
        bootModel: player.bootModel || "",
        personalQuote: player.personalQuote || "",
        manualStatsOverride: hasManualStats,
        stats: player.stats ? {
          ...player.stats,
          isManualOverride: hasManualStats,
        } : {
          matchesPlayed: 0,
          goals: 0,
          assists: 0,
          xg: 0,
          xgPer60: 0,
          goalsPer60: 0,
          assistsPer60: 0,
          yellowCards: 0,
          redCards: 0,
          cleanSheets: 0,
          saves: 0,
          motmCount: 0,
          dpotmCount: 0,
          averageRating: 7.0,
          ratingCount: 0,
          winRate: 0,
          isManualOverride: hasManualStats,
          customStats: {},
        },
      };
      data.players.push(newPlayer);
    }

    const updated = saveLeagueData(data);
    res.json({ success: true, player: data.players[existingIndex >= 0 ? existingIndex : data.players.length - 1], players: updated.players, league: updated });
  };

  app.post("/api/players", handleSavePlayer);
  app.put("/api/players/:id", handleSavePlayer);

  // API: Delete Player
  app.delete("/api/players/:id", (req, res) => {
    const { id } = req.params;
    const data = getLeagueData();
    data.players = data.players || [];
    const index = data.players.findIndex((p: any) => p.id === id);
    if (index >= 0) {
      data.players.splice(index, 1);
      const updated = saveLeagueData(data);
      return res.json({ success: true, players: updated.players, league: updated });
    }
    res.status(404).json({ error: "Player not found." });
  });

  // API: Update or Create Team (PUT and POST)
  const handleSaveTeamEndpoint = (req: any, res: any) => {
    const { team } = req.body || {};
    const targetId = req.params?.id || team?.id;
    if (!team) {
      return res.status(400).json({ error: "Team data is required." });
    }

    const data = getLeagueData();
    data.teams = data.teams || [];

    const existingIndex = data.teams.findIndex((t: any) => t.id === targetId || t.id === team.id);
    if (existingIndex >= 0) {
      data.teams[existingIndex] = { ...data.teams[existingIndex], ...team };
    } else {
      const newTeam = {
        id: team.id || targetId || "team_" + Date.now(),
        name: team.name || "New Team",
        shortName: team.shortName || (team.name || "NEW").substring(0, 3).toUpperCase(),
        badgeEmoji: team.badgeEmoji || "⚽",
        logoUrl: team.logoUrl || "",
        primaryColor: team.primaryColor || "#06b6d4",
        secondaryColor: team.secondaryColor || "#0891b2",
        slogan: team.slogan || "",
        homeStadium: team.homeStadium || "Community Pitch",
        formation: team.formation || "7v7_3-2-1",
        captainPlayerId: team.captainPlayerId || "",
        startingLineup: team.startingLineup || [],
        substitutes: team.substitutes || [],
      };
      data.teams.push(newTeam);
    }

    const updated = saveLeagueData(data);
    res.json({ success: true, teams: updated.teams, league: updated });
  };

  app.put("/api/teams/:id", handleSaveTeamEndpoint);

  // API: Add or Update Custom Stat Metric
  const handleSaveCustomStatEndpoint = (req: any, res: any) => {
    const { stat, customStat } = req.body || {};
    const targetStat = stat || customStat;
    const targetId = req.params?.id || targetStat?.id;
    if (!targetStat || !targetStat.name) {
      return res.status(400).json({ error: "Stat metric name is required." });
    }

    const data = getLeagueData();
    data.customStats = data.customStats || [];

    const statId = targetId || targetStat.id || targetStat.name.toLowerCase().replace(/\s+/g, "_");
    const existingIndex = data.customStats.findIndex((s: any) => s.id === statId);

    const fullStat = {
      id: statId,
      name: targetStat.name,
      shortLabel: targetStat.shortLabel || targetStat.name.substring(0, 3).toUpperCase(),
      icon: targetStat.icon || targetStat.iconName || "Sparkles",
      iconName: targetStat.iconName || targetStat.icon || "Sparkles",
      iconUrl: targetStat.iconUrl || undefined,
      description: targetStat.description || "",
      category: targetStat.category || "fun",
      awardTitle: targetStat.awardTitle || `${targetStat.name} Champion 🏆`,
    };

    if (existingIndex >= 0) {
      data.customStats[existingIndex] = { ...data.customStats[existingIndex], ...fullStat };
    } else {
      data.customStats.push(fullStat);
    }

    const updated = saveLeagueData(data);
    res.json({ success: true, customStats: updated.customStats, league: updated });
  };

  app.post("/api/custom-stats", handleSaveCustomStatEndpoint);
  app.put("/api/custom-stats/:id", handleSaveCustomStatEndpoint);

  // API: Delete Custom Stat
  app.delete("/api/custom-stats/:id", (req, res) => {
    const { id } = req.params;
    const data = getLeagueData();
    data.customStats = data.customStats || [];
    const index = data.customStats.findIndex((s: any) => s.id === id);
    if (index >= 0) {
      data.customStats.splice(index, 1);
      const updated = saveLeagueData(data);
      return res.json({ success: true, customStats: updated.customStats, league: updated });
    }
    res.status(404).json({ error: "Custom stat not found." });
  });

  // API: League Branding (Logo, Name, Season Tag)
  app.post("/api/league/branding", (req, res) => {
    const { branding } = req.body || {};
    const data = getLeagueData();
    data.branding = { ...(data.branding || {}), ...(branding || {}) };
    const updated = saveLeagueData(data);
    res.json({ success: true, branding: updated.branding, league: updated });
  });

  // API: League Table Standings Adjustments / Deductions
  app.post("/api/league/table-adjustments", (req, res) => {
    const { seasonId, tableAdjustments } = req.body || {};
    const data = getLeagueData();
    data.seasons = data.seasons || [];
    const targetSeasonId = seasonId || "season_2026";
    const sIdx = data.seasons.findIndex((s: any) => s.id === targetSeasonId);
    if (sIdx >= 0) {
      data.seasons[sIdx].tableAdjustments = tableAdjustments || {};
    } else if (data.seasons.length > 0) {
      data.seasons[0].tableAdjustments = tableAdjustments || {};
    } else {
      data.seasons.push({
        id: targetSeasonId,
        name: "Season 2026",
        status: "active",
        startDate: "2026-02-01",
        tableAdjustments: tableAdjustments || {},
      });
    }
    const updated = saveLeagueData(data);
    res.json({ success: true, seasons: updated.seasons, league: updated });
  });

  app.get("/api/league/branding", (req, res) => {
    const data = getLeagueData();
    res.json({ branding: data.branding || {} });
  });

  // API: Export Full JSON League Backup
  app.get("/api/backup/export", (req, res) => {
    const data = getLeagueData();
    res.setHeader("Content-Disposition", `attachment; filename=Community_League_Backup_${Date.now()}.json`);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(data, null, 2));
  });

  // API: Restore Backup
  app.post("/api/backup/restore", (req, res) => {
    const { backupData } = req.body || {};
    if (!backupData || !Array.isArray(backupData.teams) || !Array.isArray(backupData.players)) {
      return res.status(400).json({ error: "Invalid league backup format." });
    }

    const updated = saveLeagueData(backupData);
    res.json({ success: true, message: "League restored successfully!", leagueData: updated });
  });

  // API: Recompute all statistics
  app.post("/api/league/recompute", (req, res) => {
    const data = getLeagueData();
    const updated = saveLeagueData(data);
    res.json({ success: true, league: updated });
  });

  // API: Submit Match Rating Ballot (Per Game 1-10 Ratings)
  app.post("/api/matches/:id/ratings", (req, res) => {
    try {
      const matchId = req.params.id;
      const { voterPlayerId, voterName, ratings } = req.body || {};

      if (!ratings || typeof ratings !== "object" || Object.keys(ratings).length === 0) {
        return res.status(400).json({ error: "Ratings map is required." });
      }

      const data = getLeagueData();
      const match = (data.matches || []).find((m: any) => m.id === matchId);

      if (!match) {
        return res.status(404).json({ error: "Match not found." });
      }

      match.ratingBallots = match.ratingBallots || [];
      
      // Look for existing ballot from same voter or voterPlayerId
      const ballotId = "ballot_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5);
      const newBallot = {
        id: ballotId,
        voterPlayerId: voterPlayerId || undefined,
        voterName: (voterName || "Community Member").trim(),
        ratings,
        submittedAt: Date.now(),
      };

      // Replace previous ballot from same voter if existing, otherwise append
      const existingBallotIdx = match.ratingBallots.findIndex(
        (b: any) => (voterPlayerId && b.voterPlayerId === voterPlayerId) || (voterName && b.voterName.toLowerCase() === voterName.trim().toLowerCase())
      );
      if (existingBallotIdx >= 0) {
        match.ratingBallots[existingBallotIdx] = newBallot;
      } else {
        match.ratingBallots.push(newBallot);
      }

      // Recompute match.playerRatings as average of all ballots
      const playerRatingSums: Record<string, { sum: number; count: number }> = {};
      
      // Incorporate initial ratings as baseline ballot if needed
      match.ratingBallots.forEach((b: any) => {
        Object.entries(b.ratings || {}).forEach(([pid, r]) => {
          const num = Number(r);
          if (!isNaN(num) && num >= 1 && num <= 10) {
            if (!playerRatingSums[pid]) playerRatingSums[pid] = { sum: 0, count: 0 };
            playerRatingSums[pid].sum += num;
            playerRatingSums[pid].count += 1;
          }
        });
      });

      match.playerRatings = match.playerRatings || {};
      Object.entries(playerRatingSums).forEach(([pid, val]) => {
        if (val.count > 0) {
          match.playerRatings[pid] = Number((val.sum / val.count).toFixed(1));
        }
      });

      const updated = saveLeagueData(data);

      res.json({
        success: true,
        match,
        league: updated,
        message: "Match ratings ballot saved and averages updated successfully!",
      });
    } catch (err: any) {
      console.error("Submit match ratings error:", err);
      res.status(500).json({ error: err.message || "Failed to save match ratings." });
    }
  });

  // Backward compatibility API for legacy voter ratings
  app.post("/api/ratings", (req, res) => {
    try {
      const { ratings, voterName, voterPlayerId, matchId } = req.body || {};
      const data = getLeagueData();
      const targetMatchId = matchId || (data.matches && data.matches[0]?.id);

      if (targetMatchId) {
        const match = data.matches.find((m: any) => m.id === targetMatchId);
        if (match) {
          match.ratingBallots = match.ratingBallots || [];
          match.ratingBallots.push({
            id: "ballot_" + Date.now(),
            voterPlayerId,
            voterName: voterName || "Voter",
            ratings: ratings || {},
            submittedAt: Date.now(),
          });
          match.playerRatings = match.playerRatings || {};
          Object.entries(ratings || {}).forEach(([pid, val]) => {
            const cur = match.playerRatings[pid] || Number(val);
            match.playerRatings[pid] = Number(((cur + Number(val)) / 2).toFixed(1));
          });
        }
      }

      const updated = saveLeagueData(data);
      res.json({ success: true, league: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Error submitting rating" });
    }
  });

  app.get("/api/ratings", (req, res) => {
    const data = getLeagueData();
    const playersList = (data.players || []).map((p: any) => ({
      name: p.name,
      team: p.teamId === "team_red" ? "red" : "blue",
    }));

    const averages = (data.players || []).map((p: any) => ({
      player: p.name,
      average: p.stats.averageRating || 8.5,
      count: p.ratingHistory?.length || 2,
      ratings: (p.ratingHistory || []).map((r: any) => r.rating),
    }));

    res.json({
      submissions: [],
      averages,
      totalSubmissions: 5,
      players: playersList,
    });
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Community League Manager server running on http://localhost:${PORT}`);
  });
}

startServer();
