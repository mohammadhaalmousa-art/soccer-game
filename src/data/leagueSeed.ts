import { Team, PlayerProfile, CustomStatDefinition, LeagueSeason, Match, NewsArticle, LeagueBranding, HistoricalGameArchive } from "../types";

export const PREVIOUS_GAMES_ARCHIVE: HistoricalGameArchive[] = [];

export const DEFAULT_CUSTOM_STATS: CustomStatDefinition[] = [
  {
    "id": "nutmegs",
    "name": "Nutmegs (Pannas)",
    "shortLabel": "NUT",
    "icon": "Sparkles",
    "description": "Sliding the ball through opponent's legs",
    "category": "fun",
    "awardTitle": "Panna King 🪄"
  },
  {
    "id": "key_saves",
    "name": "Crucial Saves",
    "shortLabel": "SAV",
    "icon": "ShieldAlert",
    "description": "Game-saving stops and fingertip deflections",
    "category": "defending",
    "awardTitle": "Wall of Steel 🧤"
  },
  {
    "id": "woodwork_hits",
    "name": "Woodwork Hits",
    "shortLabel": "WDW",
    "icon": "Crosshair",
    "description": "Shots rattling off post or crossbar",
    "category": "attacking",
    "awardTitle": "Crossbar Specialist 🎯"
  },
  {
    "id": "tackles_won",
    "name": "Key Tackles",
    "shortLabel": "TCK",
    "icon": "Shield",
    "description": "Last-ditch sliding or standing tackles",
    "category": "defending",
    "awardTitle": "Defensive Anchor 🛡️"
  },
  {
    "id": "big_chances_created",
    "name": "Big Chances Created",
    "shortLabel": "BCC",
    "icon": "Zap",
    "description": "Pinpoint through balls setting up 1-on-1s",
    "category": "playmaking",
    "awardTitle": "Playmaker Maestro 🎩"
  }
];

export const DEFAULT_TEAMS: Team[] = [
  {
    "id": "team_red",
    "name": "Red Team",
    "shortName": "RED",
    "badgeEmoji": "🔴",
    "primaryColor": "#ef4444",
    "secondaryColor": "#991b1b",
    "slogan": "Relentless Heart, Defense & Firepower",
    "formation": "5v5_1-2-1",
    "captainPlayerId": "p_mohammed",
    "startingLineup": [
      "p_mohammed",
      "p_noah",
      "p_samuel",
      "p_alki",
      "p_marios",
      "p_adchayan",
      "p_ramim"
    ],
    "substitutes": [
      "p_alki",
      "p_elliot"
    ],
    "logoUrl": "/team_logos/team_red.png",
    "homeStadium": "Community Pitch"
  },
  {
    "id": "team_blue",
    "name": "Blue Team",
    "shortName": "BLU",
    "badgeEmoji": "🔵",
    "primaryColor": "#06b6d4",
    "secondaryColor": "#0369a1",
    "slogan": "Precision, Pace & Tactical Power",
    "formation": "5v5_1-2-1",
    "captainPlayerId": "p_seto",
    "startingLineup": [
      "p_albert",
      "p_alend",
      "p_nicholas",
      "p_seto",
      "p_maxim",
      "p_maxim",
      "p_maxim"
    ],
    "substitutes": [
      "p_jathanan",
      "p_hamza"
    ],
    "logoUrl": "/team_logos/team_blue.png",
    "homeStadium": "Community Pitch"
  }
];

export const DEFAULT_PLAYERS: PlayerProfile[] = [
  {
    "id": "p_samuel",
    "name": "Samuel",
    "teamId": "team_red",
    "jerseyNumber": 19,
    "position": "FWD / MID",
    "photoUrl": "/player_photos/p_samuel.png",
    "bio": "Red Team Captain. Lethal finisher with clinical movement. Scored 4 goals in Game #1 and 2 in Game #2.",
    "preferredFoot": "Right",
    "stats": {
      "matchesPlayed": 2,
      "goals": 9,
      "assists": 5,
      "yellowCards": 0,
      "redCards": 0,
      "cleanSheets": 0,
      "saves": 0,
      "motmCount": 2,
      "averageRating": 9.55,
      "ratingCount": 2,
      "customStats": {
        "nutmegs": 0,
        "key_saves": 0,
        "woodwork_hits": 0,
        "tackles_won": 0,
        "big_chances_created": 0
      },
      "xg": 5.85,
      "xgPer60": 2.92,
      "goalsPer60": 4.5,
      "assistsPer60": 2.5,
      "winRate": 50
    },
    "ratingHistory": [
      {
        "matchId": "m_game1",
        "matchTitle": "Soccer Game #1",
        "rating": 9.5,
        "date": "2026-08-22"
      },
      {
        "matchId": "m_game2",
        "matchTitle": "Soccer Game #2",
        "rating": 9.61,
        "date": "2026-08-29"
      }
    ],
    "positionDisplay": "FWD / MID",
    "isTemporaryTransfer": false
  },
  {
    "id": "p_mohammed",
    "name": "Mohammed",
    "teamId": "team_red",
    "jerseyNumber": 1,
    "position": "GK",
    "photoUrl": "/player_photos/p_mohammed.png",
    "bio": "Solid goalkeeper with quick reflexes and commanding distribution from the box.",
    "preferredFoot": "Right",
    "stats": {
      "matchesPlayed": 2,
      "goals": 0,
      "assists": 1,
      "yellowCards": 0,
      "redCards": 0,
      "cleanSheets": 0,
      "saves": 14,
      "motmCount": 0,
      "averageRating": 8.71,
      "ratingCount": 2,
      "customStats": {
        "nutmegs": 0,
        "key_saves": 0,
        "woodwork_hits": 0,
        "tackles_won": 0,
        "big_chances_created": 0
      },
      "xg": 0,
      "xgPer60": 0,
      "goalsPer60": 0,
      "assistsPer60": 0.5,
      "winRate": 50
    },
    "ratingHistory": [
      {
        "matchId": "m_game1",
        "matchTitle": "Soccer Game #1",
        "rating": 8.8,
        "date": "2026-08-22"
      },
      {
        "matchId": "m_game2",
        "matchTitle": "Soccer Game #2",
        "rating": 8.61,
        "date": "2026-08-29"
      }
    ],
    "positionDisplay": "GK",
    "isTemporaryTransfer": false
  },
  {
    "id": "p_marios",
    "name": "Marios",
    "teamId": "team_red",
    "jerseyNumber": 11,
    "position": "FWD",
    "photoUrl": "/player_photos/p_marios.png",
    "bio": "Clinical attacker with physical presence and direct runs into dangerous areas.",
    "preferredFoot": "Right",
    "stats": {
      "matchesPlayed": 2,
      "goals": 5,
      "assists": 4,
      "yellowCards": 0,
      "redCards": 0,
      "cleanSheets": 0,
      "saves": 0,
      "motmCount": 0,
      "averageRating": 8.68,
      "ratingCount": 2,
      "customStats": {
        "nutmegs": 0,
        "key_saves": 0,
        "woodwork_hits": 0,
        "tackles_won": 0,
        "big_chances_created": 0
      },
      "xg": 3.25,
      "xgPer60": 1.63,
      "goalsPer60": 2.5,
      "assistsPer60": 2,
      "winRate": 50
    },
    "ratingHistory": [
      {
        "matchId": "m_game1",
        "matchTitle": "Soccer Game #1",
        "rating": 9.1,
        "date": "2026-08-22"
      },
      {
        "matchId": "m_game2",
        "matchTitle": "Soccer Game #2",
        "rating": 8.27,
        "date": "2026-08-29"
      }
    ],
    "positionDisplay": "FWD",
    "isTemporaryTransfer": false
  },
  {
    "id": "p_ramim",
    "name": "Ramim",
    "teamId": "team_red",
    "jerseyNumber": 4,
    "position": "DEF",
    "photoUrl": "/player_photos/p_ramim.png",
    "bio": "Disciplined defender with excellent positional awareness, marking, and ball clearances.",
    "preferredFoot": "Right",
    "stats": {
      "matchesPlayed": 2,
      "goals": 0,
      "assists": 1,
      "yellowCards": 0,
      "redCards": 0,
      "cleanSheets": 0,
      "saves": 0,
      "motmCount": 0,
      "averageRating": 7.96,
      "ratingCount": 2,
      "customStats": {
        "nutmegs": 0,
        "key_saves": 0,
        "woodwork_hits": 0,
        "tackles_won": 0,
        "big_chances_created": 0
      },
      "xg": 0,
      "xgPer60": 0,
      "goalsPer60": 0,
      "assistsPer60": 0.5,
      "winRate": 50
    },
    "ratingHistory": [
      {
        "matchId": "m_game1",
        "matchTitle": "Soccer Game #1",
        "rating": 8.6,
        "date": "2026-08-22"
      },
      {
        "matchId": "m_game2",
        "matchTitle": "Soccer Game #2",
        "rating": 7.32,
        "date": "2026-08-29"
      }
    ],
    "positionDisplay": "DEF",
    "isTemporaryTransfer": false
  },
  {
    "id": "p_noah",
    "name": "Noah",
    "teamId": "team_red",
    "jerseyNumber": 6,
    "position": "DEF / MID",
    "photoUrl": "/player_photos/p_noah.png",
    "bio": "Versatile hybrid player adept at defensive interceptions and initiating counter-attacks.",
    "preferredFoot": "Right",
    "stats": {
      "matchesPlayed": 1,
      "goals": 1,
      "assists": 0,
      "yellowCards": 0,
      "redCards": 0,
      "cleanSheets": 0,
      "saves": 0,
      "motmCount": 0,
      "averageRating": 8.39,
      "ratingCount": 1,
      "customStats": {
        "nutmegs": 0,
        "key_saves": 0,
        "woodwork_hits": 0,
        "tackles_won": 0,
        "big_chances_created": 0
      },
      "xg": 0.65,
      "xgPer60": 0.65,
      "goalsPer60": 1,
      "assistsPer60": 0,
      "winRate": 0
    },
    "ratingHistory": [
      {
        "matchId": "m_game2",
        "matchTitle": "Soccer Game #2",
        "rating": 8.39,
        "date": "2026-08-29"
      }
    ],
    "positionDisplay": "DEF / MID",
    "isTemporaryTransfer": false
  },
  {
    "id": "p_adchayan",
    "name": "Adchayan",
    "teamId": "team_red",
    "jerseyNumber": 5,
    "position": "DEF / MID",
    "photoUrl": "/player_photos/p_adchayan.png",
    "bio": "Combative defender and midfielder with strong recovery runs and physical duel success.",
    "preferredFoot": "Right",
    "stats": {
      "matchesPlayed": 1,
      "goals": 0,
      "assists": 0,
      "yellowCards": 0,
      "redCards": 0,
      "cleanSheets": 0,
      "saves": 0,
      "motmCount": 0,
      "averageRating": 7.03,
      "ratingCount": 1,
      "customStats": {
        "nutmegs": 0,
        "key_saves": 0,
        "woodwork_hits": 0,
        "tackles_won": 0,
        "big_chances_created": 0
      },
      "xg": 0,
      "xgPer60": 0,
      "goalsPer60": 0,
      "assistsPer60": 0,
      "winRate": 0,
      "isManualOverride": false
    },
    "ratingHistory": [
      {
        "matchId": "m_game2",
        "matchTitle": "Soccer Game #2",
        "rating": 7.03,
        "date": "2026-08-29"
      }
    ],
    "positionDisplay": "DEF / MID",
    "isTemporaryTransfer": false,
    "manualStatsOverride": false
  },
  {
    "id": "p_mabishan",
    "name": "Mabishan",
    "teamId": "team_red",
    "jerseyNumber": 14,
    "position": "FWD / DEF",
    "photoUrl": "https://i.pinimg.com/736x/13/c6/38/13c63868e45b5f5dc61bd0a6ef8f6029.jpg",
    "bio": "Energetic player capable of stretching backlines up front or locking down defensive wide areas.",
    "preferredFoot": "Right",
    "stats": {
      "matchesPlayed": 1,
      "goals": 0,
      "assists": 1,
      "yellowCards": 0,
      "redCards": 0,
      "cleanSheets": 0,
      "saves": 0,
      "motmCount": 0,
      "averageRating": 6.77,
      "ratingCount": 1,
      "customStats": {
        "nutmegs": 0,
        "key_saves": 0,
        "woodwork_hits": 0,
        "tackles_won": 0,
        "big_chances_created": 0
      },
      "xg": 0,
      "xgPer60": 0,
      "goalsPer60": 0,
      "assistsPer60": 1,
      "winRate": 0
    },
    "ratingHistory": [
      {
        "matchId": "m_game2",
        "matchTitle": "Soccer Game #2",
        "rating": 6.77,
        "date": "2026-08-29"
      }
    ],
    "positionDisplay": "FWD / DEF",
    "isTemporaryTransfer": false
  },
  {
    "id": "p_alki",
    "name": "Alki",
    "teamId": "team_red",
    "jerseyNumber": 8,
    "position": "GK / MID",
    "photoUrl": "/player_photos/p_alki.png",
    "bio": "Multi-role talent with excellent vision in midfield and reliable shot-stopping between the posts.",
    "preferredFoot": "Left",
    "stats": {
      "matchesPlayed": 1,
      "goals": 0,
      "assists": 2,
      "yellowCards": 0,
      "redCards": 0,
      "cleanSheets": 0,
      "saves": 3,
      "motmCount": 0,
      "averageRating": 9.3,
      "ratingCount": 1,
      "customStats": {
        "nutmegs": 0,
        "key_saves": 0,
        "woodwork_hits": 0,
        "tackles_won": 0,
        "big_chances_created": 0
      },
      "xg": 0,
      "xgPer60": 0,
      "goalsPer60": 0,
      "assistsPer60": 2,
      "winRate": 100
    },
    "ratingHistory": [
      {
        "matchId": "m_game1",
        "matchTitle": "Soccer Game #1",
        "rating": 9.3,
        "date": "2026-08-22"
      }
    ],
    "positionDisplay": "GK / MID",
    "isTemporaryTransfer": false
  },
  {
    "id": "p_elliot",
    "name": "Elliot",
    "teamId": "team_red",
    "jerseyNumber": 3,
    "position": "DEF",
    "photoUrl": "/player_photos/p_elliot.png",
    "bio": "Tenacious tackler with commanding presence on the back line and tactical discipline.",
    "preferredFoot": "Right",
    "stats": {
      "matchesPlayed": 1,
      "goals": 0,
      "assists": 1,
      "yellowCards": 0,
      "redCards": 0,
      "cleanSheets": 0,
      "saves": 0,
      "motmCount": 0,
      "averageRating": 5.6,
      "ratingCount": 1,
      "customStats": {
        "nutmegs": 0,
        "key_saves": 0,
        "woodwork_hits": 0,
        "tackles_won": 0,
        "big_chances_created": 0
      },
      "xg": 0,
      "xgPer60": 0,
      "goalsPer60": 0,
      "assistsPer60": 1,
      "winRate": 100
    },
    "ratingHistory": [
      {
        "matchId": "m_game1",
        "matchTitle": "Soccer Game #1",
        "rating": 5.6,
        "date": "2026-08-22"
      }
    ],
    "positionDisplay": "DEF",
    "isTemporaryTransfer": false
  },
  {
    "id": "p_nicholas",
    "name": "Nicholas",
    "teamId": "team_blue",
    "jerseyNumber": 7,
    "position": "MID / FWD",
    "photoUrl": "/player_photos/p_nicholas.png",
    "bio": "Blue Team Captain. Dynamic playmaker and lethal dribbler with explosive acceleration.",
    "preferredFoot": "Right",
    "stats": {
      "matchesPlayed": 1,
      "goals": 0,
      "assists": 0,
      "yellowCards": 0,
      "redCards": 0,
      "cleanSheets": 0,
      "saves": 0,
      "motmCount": 0,
      "averageRating": 8.22,
      "ratingCount": 1,
      "customStats": {
        "nutmegs": 0,
        "key_saves": 0,
        "woodwork_hits": 0,
        "tackles_won": 0,
        "big_chances_created": 0
      },
      "xg": 0,
      "xgPer60": 0,
      "goalsPer60": 0,
      "assistsPer60": 0,
      "winRate": 100
    },
    "ratingHistory": [
      {
        "matchId": "m_game2",
        "matchTitle": "Soccer Game #2",
        "rating": 8.22,
        "date": "2026-08-29"
      }
    ],
    "positionDisplay": "MID / FWD",
    "isTemporaryTransfer": false
  },
  {
    "id": "p_maxim",
    "name": "Maxim",
    "teamId": "team_blue",
    "jerseyNumber": 10,
    "position": "FWD",
    "photoUrl": "/player_photos/p_maxim.png",
    "bio": "Speedy striker with sharp instincts in front of goal and rapid off-the-ball acceleration.",
    "preferredFoot": "Right",
    "stats": {
      "matchesPlayed": 2,
      "goals": 7,
      "assists": 4,
      "yellowCards": 0,
      "redCards": 0,
      "cleanSheets": 0,
      "saves": 0,
      "motmCount": 0,
      "averageRating": 8.72,
      "ratingCount": 2,
      "customStats": {
        "nutmegs": 0,
        "key_saves": 0,
        "woodwork_hits": 0,
        "tackles_won": 0,
        "big_chances_created": 0
      },
      "xg": 4.55,
      "xgPer60": 2.27,
      "goalsPer60": 3.5,
      "assistsPer60": 2,
      "winRate": 50
    },
    "ratingHistory": [
      {
        "matchId": "m_game1",
        "matchTitle": "Soccer Game #1",
        "rating": 8.9,
        "date": "2026-08-22"
      },
      {
        "matchId": "m_game2",
        "matchTitle": "Soccer Game #2",
        "rating": 8.54,
        "date": "2026-08-29"
      }
    ],
    "positionDisplay": "FWD",
    "isTemporaryTransfer": false
  },
  {
    "id": "p_alend",
    "name": "Alend",
    "teamId": "team_blue",
    "jerseyNumber": 8,
    "position": "MID",
    "photoUrl": "/player_photos/p_alend.png",
    "bio": "Creative engine orchestrating transition play and linking midfield to attacking lines.",
    "preferredFoot": "Right",
    "stats": {
      "matchesPlayed": 2,
      "goals": 4,
      "assists": 1,
      "yellowCards": 0,
      "redCards": 0,
      "cleanSheets": 0,
      "saves": 0,
      "motmCount": 0,
      "averageRating": 8.52,
      "ratingCount": 2,
      "customStats": {
        "nutmegs": 0,
        "key_saves": 0,
        "woodwork_hits": 0,
        "tackles_won": 0,
        "big_chances_created": 0
      },
      "xg": 2.6,
      "xgPer60": 1.3,
      "goalsPer60": 2,
      "assistsPer60": 0.5,
      "winRate": 50
    },
    "ratingHistory": [
      {
        "matchId": "m_game1",
        "matchTitle": "Soccer Game #1",
        "rating": 8.9,
        "date": "2026-08-22"
      },
      {
        "matchId": "m_game2",
        "matchTitle": "Soccer Game #2",
        "rating": 8.14,
        "date": "2026-08-29"
      }
    ],
    "positionDisplay": "MID",
    "isTemporaryTransfer": false
  },
  {
    "id": "p_albert",
    "name": "Albert",
    "teamId": "team_blue",
    "jerseyNumber": 2,
    "position": "DEF / GK",
    "photoUrl": "https://i.pinimg.com/1200x/d3/7e/84/d37e843d31252c02e0b6119d126d6014.jpg",
    "bio": "Steady, reliable defender with excellent aerial clearance and emergency goalkeeper capability.",
    "preferredFoot": "Right",
    "stats": {
      "matchesPlayed": 1,
      "goals": 0,
      "assists": 0,
      "yellowCards": 0,
      "redCards": 0,
      "cleanSheets": 0,
      "saves": 2,
      "motmCount": 0,
      "averageRating": 7.7,
      "ratingCount": 1,
      "customStats": {
        "nutmegs": 0,
        "key_saves": 0,
        "woodwork_hits": 0,
        "tackles_won": 0,
        "big_chances_created": 0
      },
      "xg": 0,
      "xgPer60": 0,
      "goalsPer60": 0,
      "assistsPer60": 0,
      "winRate": 100
    },
    "ratingHistory": [
      {
        "matchId": "m_game2",
        "matchTitle": "Soccer Game #2",
        "rating": 7.7,
        "date": "2026-08-29"
      }
    ],
    "positionDisplay": "DEF / GK",
    "isTemporaryTransfer": false
  },
  {
    "id": "p_miguel",
    "name": "Miguel",
    "teamId": "team_blue",
    "jerseyNumber": 12,
    "position": "MID / GK",
    "photoUrl": "/player_photos/p_miguel.png",
    "bio": "Versatile all-rounder who can anchor midfield possession or step in as goalkeeper with agility.",
    "preferredFoot": "Right",
    "stats": {
      "matchesPlayed": 1,
      "goals": 0,
      "assists": 1,
      "yellowCards": 0,
      "redCards": 0,
      "cleanSheets": 0,
      "saves": 3,
      "motmCount": 0,
      "averageRating": 8.66,
      "ratingCount": 1,
      "customStats": {
        "nutmegs": 0,
        "key_saves": 0,
        "woodwork_hits": 0,
        "tackles_won": 0,
        "big_chances_created": 0
      },
      "xg": 0,
      "xgPer60": 0,
      "goalsPer60": 0,
      "assistsPer60": 1,
      "winRate": 100
    },
    "ratingHistory": [
      {
        "matchId": "m_game2",
        "matchTitle": "Soccer Game #2",
        "rating": 8.66,
        "date": "2026-08-29"
      }
    ],
    "positionDisplay": "MID / GK/ DEF",
    "isTemporaryTransfer": false
  },
  {
    "id": "p_seto",
    "name": "Seto",
    "teamId": "team_blue",
    "jerseyNumber": 13,
    "position": "FWD / MID",
    "photoUrl": "/player_photos/p_seto.png",
    "bio": "Nimble forward and midfielder with sharp ball control and high pressing work-rate.",
    "preferredFoot": "Left",
    "stats": {
      "matchesPlayed": 1,
      "goals": 3,
      "assists": 1,
      "yellowCards": 0,
      "redCards": 0,
      "cleanSheets": 0,
      "saves": 0,
      "motmCount": 0,
      "averageRating": 8.84,
      "ratingCount": 1,
      "customStats": {
        "nutmegs": 0,
        "key_saves": 0,
        "woodwork_hits": 0,
        "tackles_won": 0,
        "big_chances_created": 0
      },
      "xg": 1.95,
      "xgPer60": 1.95,
      "goalsPer60": 3,
      "assistsPer60": 1,
      "winRate": 100
    },
    "ratingHistory": [
      {
        "matchId": "m_game2",
        "matchTitle": "Soccer Game #2",
        "rating": 8.84,
        "date": "2026-08-29"
      }
    ],
    "positionDisplay": "FWD / MID",
    "isTemporaryTransfer": false
  },
  {
    "id": "p_jathanan",
    "name": "Jathanan",
    "teamId": "team_blue",
    "jerseyNumber": 15,
    "position": "DEF",
    "photoUrl": "/player_photos/p_jathanan.png",
    "bio": "Blue Team squad defender. Calm under pressure with resolute tackling and defensive organization.",
    "preferredFoot": "Right",
    "stats": {
      "matchesPlayed": 0,
      "goals": 0,
      "assists": 0,
      "yellowCards": 0,
      "redCards": 0,
      "cleanSheets": 0,
      "saves": 0,
      "motmCount": 0,
      "averageRating": 0,
      "ratingCount": 0,
      "customStats": {
        "nutmegs": 0,
        "key_saves": 0,
        "woodwork_hits": 0,
        "tackles_won": 0,
        "big_chances_created": 0
      },
      "xg": 0,
      "xgPer60": 0,
      "goalsPer60": 0,
      "assistsPer60": 0,
      "winRate": 0
    },
    "ratingHistory": [],
    "positionDisplay": "DEF",
    "isTemporaryTransfer": false
  },
  {
    "id": "p_hamza",
    "name": "Hamza",
    "teamId": "team_blue",
    "jerseyNumber": 16,
    "position": "DEF",
    "photoUrl": "/player_photos/p_hamza.png",
    "bio": "Blue Team squad defender. Focused backline stopper with sturdy physical presence.",
    "preferredFoot": "Right",
    "stats": {
      "matchesPlayed": 0,
      "goals": 0,
      "assists": 0,
      "yellowCards": 0,
      "redCards": 0,
      "cleanSheets": 0,
      "saves": 0,
      "motmCount": 0,
      "averageRating": 0,
      "ratingCount": 0,
      "customStats": {
        "nutmegs": 0,
        "key_saves": 0,
        "woodwork_hits": 0,
        "tackles_won": 0,
        "big_chances_created": 0
      },
      "xg": 0,
      "xgPer60": 0,
      "goalsPer60": 0,
      "assistsPer60": 0,
      "winRate": 0
    },
    "ratingHistory": [],
    "positionDisplay": "DEF",
    "isTemporaryTransfer": false
  }
];

export const DEFAULT_SEASONS: LeagueSeason[] = [
  {
    "id": "season_2026_summer",
    "name": "Season 1 — 2026 Championship",
    "year": "2026",
    "status": "active",
    "description": "Official community league tournament between Red Team and Blue Team featuring 60-minute matches (2x30min halves), custom stats, xG tracking, and awards.",
    "awards": {
      "mvpPlayerId": "p_samuel",
      "goldenBootPlayerId": "p_samuel",
      "playmakerPlayerId": "p_mohammed",
      "goldenGlovePlayerId": "p_mohammed",
      "customAwards": [
        {
          "title": "Panna King 🪄",
          "playerId": "p_mohammed",
          "metricName": "Nutmegs",
          "count": 4
        },
        {
          "title": "Wall of Steel 🧤",
          "playerId": "p_mohammed",
          "metricName": "Key Saves",
          "count": 14
        }
      ]
    },
    "tableAdjustments": {
      "team_blue": {
        "teamId": "team_blue",
        "pointsAdjustment": 0,
        "overrideEnabled": true,
        "notes": "",
        "playedOverride": 2,
        "wonOverride": 0,
        "penaltyWonOverride": 1,
        "drawnOverride": 0,
        "penaltyLostOverride": 1,
        "lostOverride": 0,
        "goalsForOverride": 13,
        "goalsAgainstOverride": 16,
        "updatedAt": 1788396560189
      },
      "team_red": {
        "teamId": "team_red",
        "pointsAdjustment": 0,
        "overrideEnabled": true,
        "notes": "",
        "playedOverride": 2,
        "wonOverride": 1,
        "penaltyWonOverride": 0,
        "drawnOverride": 0,
        "penaltyLostOverride": 1,
        "lostOverride": 0,
        "goalsForOverride": 16,
        "goalsAgainstOverride": 13,
        "updatedAt": 1788396548354
      }
    }
  }
];

export const DEFAULT_MATCHES: Match[] = [
  {
    "id": "match_scheduled_1788394091191",
    "seasonId": "season_2026",
    "matchNumber": 4,
    "title": "Matchday 3",
    "date": "2026-09-05T14:30:00Z",
    "homeTeamId": "team_blue",
    "awayTeamId": "team_red",
    "homeScore": 0,
    "awayScore": 0,
    "status": "SCHEDULED",
    "submittedBy": "League Administrator",
    "submittedAt": 1788394091191,
    "venue": "Parc Sablon",
    "notes": "",
    "events": [],
    "playerRatings": {},
    "ratingBallots": [],
    "homeXg": 4.9,
    "awayXg": 4.6
  },
  {
    "id": "m_game1",
    "title": "Soccer Game #1",
    "matchDate": "2026-08-15",
    "matchTime": "18:00",
    "location": "Pitch 1",
    "durationMinutes": 60,
    "status": "APPROVED",
    "homeTeamId": "team_red",
    "awayTeamId": "team_blue",
    "homeScore": 11,
    "awayScore": 8,
    "homeXg": 9.8,
    "awayXg": 7.4,
    "motmPlayerId": "p_samuel",
    "highlights": "End-to-end 60-minute goalfest! Samuel put on a finishing clinic with 4 goals, Alki scored 3 and dished 2 assists, while Maxim notched 3 for Blue Team.",
    "notes": "Official 60-minute full match completed. Red Team took early lead.",
    "events": [
      {
        "id": "e1",
        "type": "GOAL",
        "minute": 3,
        "teamId": "team_red",
        "playerId": "p_samuel",
        "assistPlayerId": "p_marios"
      },
      {
        "id": "e2",
        "type": "GOAL",
        "minute": 5,
        "teamId": "team_blue",
        "playerId": "p_maxim",
        "assistPlayerId": "p_alend"
      },
      {
        "id": "e3",
        "type": "GOAL",
        "minute": 7,
        "teamId": "team_blue",
        "playerId": "p_alend",
        "assistPlayerId": "p_maxim"
      },
      {
        "id": "e4",
        "type": "GOAL",
        "minute": 10,
        "teamId": "team_blue",
        "playerId": "p_maxim"
      },
      {
        "id": "e5",
        "type": "GOAL",
        "minute": 12,
        "teamId": "team_red",
        "playerId": "p_marios",
        "assistPlayerId": "p_samuel"
      },
      {
        "id": "e6",
        "type": "GOAL",
        "minute": 13,
        "teamId": "team_red",
        "playerId": "p_samuel",
        "assistPlayerId": "p_mohammed"
      },
      {
        "id": "e7",
        "type": "GOAL",
        "minute": 20,
        "teamId": "team_red",
        "playerId": "p_marios",
        "assistPlayerId": "p_samuel"
      },
      {
        "id": "e8",
        "type": "GOAL",
        "minute": 23,
        "teamId": "team_red",
        "playerId": "p_samuel",
        "assistPlayerId": "p_marios"
      },
      {
        "id": "e9",
        "type": "GOAL",
        "minute": 25,
        "teamId": "team_blue",
        "playerId": "p_maxim",
        "assistPlayerId": "p_alki"
      },
      {
        "id": "e10",
        "type": "GOAL",
        "minute": 28,
        "teamId": "team_red",
        "playerId": "p_samuel"
      },
      {
        "id": "e11",
        "type": "GOAL",
        "minute": 31,
        "teamId": "team_red",
        "playerId": "p_samuel",
        "assistPlayerId": "p_marios"
      },
      {
        "id": "e12",
        "type": "GOAL",
        "minute": 32,
        "teamId": "team_blue",
        "playerId": "p_maxim",
        "assistPlayerId": "p_alki"
      },
      {
        "id": "e13",
        "type": "GOAL",
        "minute": 40,
        "teamId": "team_blue",
        "playerId": "p_alend",
        "assistPlayerId": "p_maxim"
      },
      {
        "id": "e14",
        "type": "GOAL",
        "minute": 42,
        "teamId": "team_red",
        "playerId": "p_marios",
        "assistPlayerId": "p_samuel"
      },
      {
        "id": "e15",
        "type": "GOAL",
        "minute": 59,
        "teamId": "team_blue",
        "playerId": "p_maxim"
      },
      {
        "id": "evt_1788397667706_7lmk",
        "minute": 45,
        "type": "GOAL",
        "playerId": "p_maxim",
        "teamId": "team_blue",
        "assistPlayerId": "p_elliot"
      },
      {
        "id": "evt_1788397667970_j5jr",
        "minute": 52,
        "type": "GOAL",
        "playerId": "p_alend",
        "teamId": "team_blue"
      },
      {
        "id": "evt_1788397668186_whp2",
        "minute": 55,
        "type": "GOAL",
        "playerId": "p_marios",
        "teamId": "team_red",
        "assistPlayerId": "p_samuel"
      },
      {
        "id": "evt_1788397668761_cjew",
        "minute": 58,
        "type": "GOAL",
        "playerId": "p_samuel",
        "teamId": "team_red",
        "assistPlayerId": "p_ramim"
      }
    ],
    "playerRatings": {
      "p_samuel": 9.5,
      "p_alki": 9.3,
      "p_mohammed": 8.8,
      "p_marios": 9.1,
      "p_ramim": 8.6,
      "p_elliot": 5.6,
      "p_maxim": 8.9,
      "p_alend": 8.9
    },
    "lineups": {
      "home": {
        "formation": "4v4_1-2-1",
        "starters": [
          "p_mohammed",
          "p_ramim",
          "p_marios",
          "p_samuel"
        ],
        "subs": []
      },
      "away": {
        "formation": "4v4_1-2-1",
        "starters": [
          "p_maxim",
          "p_alend",
          "p_alki",
          "p_elliot"
        ],
        "subs": []
      }
    },
    "date": "2026-08-22",
    "venue": "Parc Sablon",
    "stadiumPitchType": "Grass",
    "outcomeNote": "Red Team won 11-8 in full time",
    "dpotmPlayerId": "p_ramim",
    "loanedPlayers": [
      {
        "playerId": "p_alki",
        "loanedToTeamId": "team_blue",
        "note": "Loaned for this match fixture"
      },
      {
        "playerId": "p_elliot",
        "loanedToTeamId": "team_blue",
        "note": "Loaned for this match fixture"
      }
    ],
    "lastModifiedAt": 1788454654651,
    "playedPlayerIds": [
      "p_mohammed",
      "p_ramim",
      "p_marios",
      "p_samuel",
      "p_maxim",
      "p_alend",
      "p_alki",
      "p_elliot"
    ]
  },
  {
    "id": "m_game2",
    "title": "Soccer Game #2",
    "matchDate": "2026-08-22",
    "matchTime": "18:30",
    "location": "Pitch 2",
    "durationMinutes": 60,
    "status": "APPROVED",
    "homeTeamId": "team_red",
    "awayTeamId": "team_blue",
    "homeScore": 5,
    "awayScore": 5,
    "homeXg": 4.9,
    "awayXg": 4.6,
    "penaltyScore": {
      "home": 2,
      "away": 3
    },
    "penaltyWinnerTeamId": "team_blue",
    "outcomeNote": "Blue Team won 4-3 on penalties (5-5 FT)",
    "motmPlayerId": "p_samuel",
    "highlights": "Thriller 5-5 draw in regulation (4-3 penalties for Blue Team). Nicholas delivered a masterclass with 3 goals, while Samuel scored 2 for Red Team.",
    "notes": "Draw after 60 minutes. Blue Team won 4-3 on penalty shootout.",
    "events": [
      {
        "id": "e201",
        "type": "GOAL",
        "minute": 5,
        "teamId": "team_red",
        "playerId": "p_samuel",
        "assistPlayerId": "p_marios"
      },
      {
        "id": "e202",
        "type": "GOAL",
        "minute": 7,
        "teamId": "team_blue",
        "playerId": "p_seto",
        "assistPlayerId": "p_miguel"
      },
      {
        "id": "e203",
        "type": "GOAL",
        "minute": 13,
        "teamId": "team_blue",
        "playerId": "p_maxim",
        "assistPlayerId": "p_seto"
      },
      {
        "id": "e204",
        "type": "GOAL",
        "minute": 22,
        "teamId": "team_red",
        "playerId": "p_noah"
      },
      {
        "id": "e205",
        "type": "GOAL",
        "minute": 32,
        "teamId": "team_blue",
        "playerId": "p_seto",
        "assistPlayerId": "p_maxim"
      },
      {
        "id": "e206",
        "type": "GOAL",
        "minute": 34,
        "teamId": "team_red",
        "playerId": "p_samuel",
        "assistPlayerId": "p_mabishan"
      },
      {
        "id": "e207",
        "type": "GOAL",
        "minute": 35,
        "teamId": "team_red",
        "playerId": "p_samuel"
      },
      {
        "id": "e208",
        "type": "GOAL",
        "minute": 42,
        "teamId": "team_blue",
        "playerId": "p_alend",
        "assistPlayerId": "p_maxim"
      },
      {
        "id": "e209",
        "type": "GOAL",
        "minute": 52,
        "teamId": "team_blue",
        "playerId": "p_seto"
      },
      {
        "id": "e210",
        "type": "GOAL",
        "minute": 57,
        "teamId": "team_red",
        "playerId": "p_marios",
        "assistPlayerId": "p_samuel"
      }
    ],
    "playerRatings": {
      "p_nicholas": 8.22,
      "p_samuel": 9.61,
      "p_mohammed": 8.61,
      "p_marios": 8.27,
      "p_ramim": 7.32,
      "p_noah": 8.39,
      "p_adchayan": 7.03,
      "p_mabishan": 6.77,
      "p_maxim": 8.54,
      "p_alend": 8.14,
      "p_albert": 7.7,
      "p_miguel": 8.66,
      "p_seto": 8.84
    },
    "lineups": {
      "home": {
        "formation": "6v6_2-2-1",
        "starters": [
          "p_mohammed",
          "p_ramim",
          "p_noah",
          "p_marios",
          "p_mabishan",
          "p_samuel"
        ],
        "subs": []
      },
      "away": {
        "formation": "6v6_2-1-2",
        "starters": [
          "p_miguel",
          "p_albert",
          "p_maxim",
          "p_alend",
          "p_seto",
          "p_nicholas"
        ],
        "subs": [
          "p_adchayan"
        ]
      }
    },
    "date": "2026-08-29",
    "venue": "Parc Sablon",
    "stadiumPitchType": "Grass",
    "penaltyShootout": {
      "homeScore": 2,
      "awayScore": 3,
      "winnerTeamId": "team_blue",
      "shots": [
        {
          "id": "shot_1788396604560_u5r",
          "round": 1,
          "teamId": "team_red",
          "playerId": "p_samuel",
          "playerName": "Samuel",
          "scored": true,
          "goalkeeperName": "Miguel",
          "note": ""
        },
        {
          "id": "shot_1788396625486_hgs",
          "round": 1,
          "teamId": "team_blue",
          "playerId": "p_nicholas",
          "playerName": "Nicholas",
          "scored": false,
          "goalkeeperName": "Mohammed",
          "note": ""
        },
        {
          "id": "shot_1788396632907_wq4",
          "round": 2,
          "teamId": "team_red",
          "playerId": "p_marios",
          "playerName": "Marios",
          "scored": true,
          "goalkeeperName": "Miguel",
          "note": ""
        },
        {
          "id": "shot_1788396644350_pga",
          "round": 2,
          "teamId": "team_blue",
          "playerId": "p_nicholas",
          "playerName": "Nicholas",
          "scored": false,
          "goalkeeperName": "Mohammed",
          "note": ""
        },
        {
          "id": "shot_1788396658088_ba4",
          "round": 3,
          "teamId": "team_red",
          "playerId": "p_noah",
          "playerName": "Noah",
          "scored": false,
          "goalkeeperName": "Miguel",
          "note": ""
        },
        {
          "id": "shot_1788396669962_gnb",
          "round": 3,
          "teamId": "team_blue",
          "playerId": "p_maxim",
          "playerName": "Maxim",
          "scored": true,
          "goalkeeperName": "Mohammed",
          "note": ""
        },
        {
          "id": "shot_1788396682645_g56",
          "round": 4,
          "teamId": "team_red",
          "playerId": "p_ramim",
          "playerName": "Ramim",
          "scored": false,
          "goalkeeperName": "Miguel",
          "note": ""
        },
        {
          "id": "shot_1788396704027_cse",
          "round": 4,
          "teamId": "team_blue",
          "playerId": "p_alend",
          "playerName": "Alend",
          "scored": true,
          "goalkeeperName": "Mohammed",
          "note": ""
        },
        {
          "id": "shot_1788396719285_47o",
          "round": 5,
          "teamId": "team_red",
          "playerId": "p_mabishan",
          "playerName": "Mabishan",
          "scored": false,
          "goalkeeperName": "Miguel",
          "note": ""
        },
        {
          "id": "shot_1788396742051_yth",
          "round": 5,
          "teamId": "team_blue",
          "playerId": "p_seto",
          "playerName": "Seto",
          "scored": true,
          "goalkeeperName": "Mohammed",
          "note": ""
        },
        {
          "id": "shot_1788396757236_g25",
          "round": 6,
          "teamId": "team_red",
          "playerId": "p_mohammed",
          "playerName": "Mohammed",
          "scored": false,
          "goalkeeperName": "Miguel",
          "note": ""
        }
      ]
    },
    "loanedPlayers": [
      {
        "playerId": "p_adchayan",
        "loanedToTeamId": "team_blue",
        "note": "Loaned for this match fixture"
      }
    ],
    "lastModifiedAt": 1788397558152,
    "dpotmPlayerId": "p_miguel",
    "playedPlayerIds": [
      "p_mohammed",
      "p_ramim",
      "p_noah",
      "p_marios",
      "p_mabishan",
      "p_samuel",
      "p_miguel",
      "p_albert",
      "p_maxim",
      "p_alend",
      "p_seto",
      "p_nicholas",
      "p_adchayan"
    ]
  }
];

export const DEFAULT_NEWS_ARTICLES: NewsArticle[] = [
  {
    "id": "news_1",
    "title": "Season Opener Epic: Red Team Edges Blue 11-8 in 19-Goal Thriller",
    "subtitle": "Samuel dazzles with 4 goals and 1 assist in a relentless 60-minute offensive masterclass",
    "content": "The community pitch erupted in standard-setting fashion on Matchday #1 as Red Team defeated Blue Team 11-8. Samuel was unplayable in the final third, finding the bottom corners with pinpoint precision.",
    "category": "MATCH_REPORT",
    "author": "Match Desk Analyst",
    "publishedAt": "2026-08-16T10:00:00.000Z",
    "imageUrl": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    "tags": [
      "Match Report",
      "Game 1",
      "Samuel MVP",
      "Red Team"
    ],
    "isPinned": true,
    "relatedPlayerIds": [
      "p_samuel",
      "p_alki",
      "p_maxim"
    ],
    "relatedTeamIds": [
      "team_red",
      "team_blue"
    ],
    "relatedMatchId": "m_game1"
  },
  {
    "id": "news_2",
    "title": "Shootout Thriller: Nicholas Drives Blue Team to 4-3 Penalty Victory in Game #2",
    "subtitle": "A 5-5 regulation spectacle settled from the penalty spot in historic fashion",
    "content": "Soccer Game #2 lived up to every ounce of anticipation as Red and Blue battled to an electrifying 5-5 draw across 60 grueling minutes. Blue Team captain Nicholas scored a hat-trick and led his squad to a 4-3 penalty victory.",
    "category": "MATCH_REPORT",
    "author": "Match Desk",
    "publishedAt": "2026-08-23T18:00:00.000Z",
    "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=80",
    "tags": [
      "Match Report",
      "Game 2",
      "Penalties",
      "Nicholas MVP"
    ],
    "isPinned": true,
    "relatedPlayerIds": [
      "p_nicholas",
      "p_samuel",
      "p_maxim"
    ],
    "relatedTeamIds": [
      "team_blue",
      "team_red"
    ],
    "relatedMatchId": "m_game2"
  }
];

export const DEFAULT_BRANDING: LeagueBranding = {
  "leagueName": "COMMUNITY LEAGUE",
  "seasonTag": "SEASON 2026",
  "leagueEmoji": "🏆"
};
