import React, { useState } from "react";
import { Team } from "../types";
import { X, PlusCircle, Users2, Check } from "lucide-react";
import { FORMATION_PRESETS } from "../utils/leagueCalculations";

interface CreateTeamModalProps {
  onClose: () => void;
  onSaveTeam: (team: Team) => Promise<void>;
}

const EMOJI_OPTIONS = ["⚡", "🛡️", "🔥", "🦅", "🦁", "🐉", "🐺", "🏆", "🌟", "⚔️", "🌪️", "💎"];
const COLOR_OPTIONS = [
  "#2563eb", // Blue
  "#ea580c", // Orange
  "#16a34a", // Green
  "#dc2626", // Red
  "#9333ea", // Purple
  "#0891b2", // Cyan
  "#ca8a04", // Gold
  "#475569", // Slate
];

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ onClose, onSaveTeam }) => {
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [slogan, setSlogan] = useState("");
  const [badgeEmoji, setBadgeEmoji] = useState("⚡");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [formation, setFormation] = useState("7v7_3-2-1");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const id = "team_" + name.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now().toString().slice(-4);
      const newTeam: Team = {
        id,
        name: name.trim(),
        shortName: (shortName || name.substring(0, 3)).toUpperCase(),
        badgeEmoji,
        primaryColor,
        secondaryColor: "#ffffff",
        slogan: slogan.trim() || "Community Squad",
        formation,
        startingLineup: [],
        bench: [],
      };

      await onSaveTeam(newTeam);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#090e18] border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col my-auto">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-chakra font-black text-white text-base sm:text-lg flex items-center gap-2">
            <Users2 className="w-5 h-5 text-emerald-400" />
            CREATE NEW SQUAD
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Squad Name *</label>
            <input
              type="text"
              placeholder="e.g. Thunder FC, Royal Blues"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!shortName) setShortName(e.target.value.substring(0, 3).toUpperCase());
              }}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Short Code (3-4 chars)</label>
              <input
                type="text"
                placeholder="THU"
                maxLength={4}
                value={shortName}
                onChange={(e) => setShortName(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-chakra font-bold outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Default Formation</label>
              <select
                value={formation}
                onChange={(e) => setFormation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-chakra font-bold outline-none"
              >
                {FORMATION_PRESETS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Badge Emoji */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Squad Badge Emoji</label>
            <div className="flex items-center gap-2 flex-wrap">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setBadgeEmoji(em)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all ${
                    badgeEmoji === em
                      ? "bg-emerald-500/20 border-emerald-400 scale-110"
                      : "bg-slate-950 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Color */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kit Color</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setPrimaryColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    primaryColor === c ? "border-white scale-110 shadow-lg" : "border-transparent opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Squad Motto / Slogan</label>
            <input
              type="text"
              placeholder="e.g. Relentless attack, solid defense"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-chakra font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            {isSaving ? "Creating..." : "Create Squad"}
          </button>
        </form>
      </div>
    </div>
  );
};
