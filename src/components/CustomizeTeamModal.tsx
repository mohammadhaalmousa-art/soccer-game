import React, { useState, useRef } from "react";
import { Team, PlayerProfile } from "../types";
import { FORMATION_PRESETS } from "../utils/leagueCalculations";
import { TeamBadge } from "./TeamBadge";
import { 
  Shield, 
  Upload, 
  Image as ImageIcon, 
  Palette, 
  MapPin, 
  Crown, 
  X, 
  Check, 
  Sparkles,
  RefreshCw,
  Trash2
} from "lucide-react";

interface CustomizeTeamModalProps {
  team: Team;
  allPlayers: PlayerProfile[];
  onSave: (updatedTeam: Team) => Promise<void>;
  onClose: () => void;
}

export const CustomizeTeamModal: React.FC<CustomizeTeamModalProps> = ({
  team,
  allPlayers,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(team.name || "");
  const [shortName, setShortName] = useState(team.shortName || "");
  const [slogan, setSlogan] = useState(team.slogan || "");
  const [badgeEmoji, setBadgeEmoji] = useState(team.badgeEmoji || "🔴");
  const [logoUrl, setLogoUrl] = useState(team.logoUrl || "");
  const [primaryColor, setPrimaryColor] = useState(team.primaryColor || "#ef4444");
  const [secondaryColor, setSecondaryColor] = useState(team.secondaryColor || "#b91c1c");
  const [homeStadium, setHomeStadium] = useState(team.homeStadium || "Community Pitch");
  const [formation, setFormation] = useState(team.formation || "7v7_3-2-1");
  const [captainPlayerId, setCaptainPlayerId] = useState(team.captainPlayerId || "");
  
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const teamPlayers = allPlayers.filter((p) => p.teamId === team.id);

  // Preset Color Palettes
  const presetPalettes = [
    { label: "Crimson Red", pri: "#ef4444", sec: "#991b1b" },
    { label: "Electric Blue", pri: "#06b6d4", sec: "#0369a1" },
    { label: "Midnight Navy", pri: "#3b82f6", sec: "#1e3a8a" },
    { label: "Emerald Pride", pri: "#10b981", sec: "#047857" },
    { label: "Solar Gold", pri: "#f59e0b", sec: "#b45309" },
    { label: "Royal Purple", pri: "#8b5cf6", sec: "#5b21b6" },
    { label: "Stealth Black", pri: "#475569", sec: "#0f172a" },
  ];

  // Preset Emoji Badges
  const presetEmojis = ["🔴", "🔵", "🦅", "🦁", "⚡", "🔥", "🛡️", "👑", "🐺", "🐅", "⚽", "⭐"];

  // Handle Logo File Upload (PNG, JPG, SVG, WebP) -> Convert to Base64 data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      setUploadError("Image file size must be less than 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setLogoUrl(event.target.result);
      }
    };
    reader.onerror = () => {
      setUploadError("Failed to read the uploaded image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated: Team = {
        ...team,
        name: name.trim() || team.name,
        shortName: (shortName.trim() || team.shortName).toUpperCase().slice(0, 4),
        slogan: slogan.trim(),
        badgeEmoji,
        logoUrl: logoUrl.trim() || undefined,
        primaryColor,
        secondaryColor,
        homeStadium: homeStadium.trim(),
        formation,
        captainPlayerId: captainPlayerId || undefined,
      };

      await onSave(updated);
      onClose();
    } catch (err) {
      setUploadError("Failed to save team updates.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#090e18] border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#090e18]/95 backdrop-blur-md border-b border-slate-800 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-slate-800 text-white">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-chakra font-bold text-emerald-400 uppercase tracking-widest block">
                Team Customization & Identity
              </span>
              <h3 className="font-chakra font-black text-white text-base sm:text-lg">
                Edit {team.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-6">
          {/* Logo & Badge Customization Section */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4">
            <h4 className="text-xs font-chakra font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              Official Team Logo & Emblem
            </h4>

            {/* Logo Preview & Upload Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
              {/* Badge Preview */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center border-2 p-2 shadow-lg transition-all"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    borderColor: primaryColor,
                    boxShadow: `0 0 20px ${primaryColor}30`,
                  }}
                >
                  <TeamBadge
                    badgeEmoji={badgeEmoji}
                    logoUrl={logoUrl}
                    teamId={team.id}
                    size="2xl"
                  />
                </div>
                <span className="text-[10px] font-chakra font-bold text-slate-400">
                  Live Preview
                </span>
              </div>

              {/* Upload & Options */}
              <div className="flex-1 space-y-3 w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-chakra font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo Image</span>
                  </button>

                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl("")}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 font-chakra font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Custom Logo</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-400">
                  Supported formats: PNG, JPG, SVG, WebP (Max 3MB). Logo will display on matchboards, lineups, standings, and charts.
                </p>

                {uploadError && (
                  <p className="text-xs text-rose-400 font-bold">{uploadError}</p>
                )}

                {/* Direct Image URL fallback */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Or Image URL / Web Link
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>

            {/* Quick Emoji Emblem Picker */}
            <div>
              <label className="block text-xs font-chakra font-bold text-slate-300 mb-1.5">
                Emoji Icon / Fallback Emblem
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {presetEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setBadgeEmoji(emoji)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer ${
                      badgeEmoji === emoji
                        ? "bg-slate-700 border-2 border-emerald-400 shadow-md scale-110"
                        : "bg-slate-950 border border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
                <input
                  type="text"
                  maxLength={4}
                  value={badgeEmoji}
                  onChange={(e) => setBadgeEmoji(e.target.value)}
                  className="w-16 text-center bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs font-bold text-white outline-none"
                  placeholder="Custom"
                />
              </div>
            </div>
          </div>

          {/* Team Name, Slogan & Identity */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4">
            <h4 className="text-xs font-chakra font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              Club Identity & Slogan
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400"
                  placeholder="e.g. Red Devils, Blue Titans..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Short Code (Abbr.)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-black text-emerald-400 outline-none focus:border-emerald-400 uppercase"
                  placeholder="RED"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Club Motto / Slogan
              </label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-400"
                placeholder="e.g. Relentless Passion & High-Octane Football"
              />
            </div>
          </div>

          {/* Color Palette Customization */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4">
            <h4 className="text-xs font-chakra font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-emerald-400" />
              Club Colors & Kit Theme
            </h4>

            {/* Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presetPalettes.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setPrimaryColor(p.pri);
                    setSecondaryColor(p.sec);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    primaryColor === p.pri
                      ? "bg-slate-800 border-emerald-400"
                      : "bg-slate-950 border-slate-800 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center -space-x-1 shrink-0">
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: p.pri }} />
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: p.sec }} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-300 truncate">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Primary Color (Hex)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-white uppercase outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Secondary Color (Hex)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-white uppercase outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stadium & Formation */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4">
            <h4 className="text-xs font-chakra font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Home Ground & Tactics
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Home Ground / Stadium
                </label>
                <input
                  type="text"
                  value={homeStadium}
                  onChange={(e) => setHomeStadium(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400"
                  placeholder="e.g. Metro Sports Arena"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Default Tactical Formation
                </label>
                <select
                  value={formation}
                  onChange={(e) => setFormation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none cursor-pointer"
                >
                  {FORMATION_PRESETS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Team Captain
              </label>
              <select
                value={captainPlayerId}
                onChange={(e) => setCaptainPlayerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none cursor-pointer"
              >
                <option value="">-- No Captain Assigned --</option>
                {teamPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.jerseyNumber} {p.name} ({p.position})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-chakra font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-chakra font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isSaving ? "Saving..." : "Save Customizations"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
