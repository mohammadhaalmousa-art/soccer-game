import React, { useState } from "react";
import { NewsArticle, Team, PlayerProfile, Match } from "../types";
import { 
  Newspaper, 
  Plus, 
  Pin, 
  Search, 
  Calendar, 
  User, 
  Tag, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Flame,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  X
} from "lucide-react";

interface NewsViewProps {
  news: NewsArticle[];
  teams: Team[];
  players: PlayerProfile[];
  matches: Match[];
  isAdminUnlocked: boolean;
  onSaveArticle: (article: NewsArticle) => Promise<void>;
  onDeleteArticle: (articleId: string) => Promise<void>;
  onOpenMatchDetails?: (match: Match) => void;
}

export const NewsView: React.FC<NewsViewProps> = ({
  news,
  teams,
  players,
  matches,
  isAdminUnlocked,
  onSaveArticle,
  onDeleteArticle,
  onOpenMatchDetails,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  
  // Editor modal state
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingArticle, setEditingArticle] = useState<Partial<NewsArticle> | null>(null);
  const [editorTags, setEditorTags] = useState<string>("");

  const handleRequestDeleteArticle = (article: NewsArticle, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm(`Are you sure you want to delete the article "${article.title}"? This cannot be undone.`)) {
      onDeleteArticle(article.id);
      if (selectedArticle?.id === article.id) {
        setSelectedArticle(null);
      }
      if (editingArticle?.id === article.id) {
        setIsEditorOpen(false);
        setEditingArticle(null);
      }
    }
  };

  const categories = [
    { id: "ALL", label: "All News & Stories" },
    { id: "STORYLINE", label: "Storylines & Rivalries" },
    { id: "MATCH_REPORT", label: "Match Reports" },
    { id: "TRANSFER", label: "Transfers & Squads" },
    { id: "NOTICE", label: "Official Notices" },
  ];

  const safeNews = news || [];

  const filteredArticles = safeNews.filter((item) => {
    if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (item.title || "").toLowerCase().includes(q);
      const matchSubtitle = (item.subtitle || "").toLowerCase().includes(q);
      const matchContent = (item.content || "").toLowerCase().includes(q);
      const matchTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchSubtitle && !matchContent && !matchTags) return false;
    }
    return true;
  });

  const pinnedArticles = filteredArticles.filter((a) => a.isPinned);
  const regularArticles = filteredArticles.filter((a) => !a.isPinned);

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "STORYLINE":
        return "bg-zinc-800 text-white border-zinc-700";
      case "MATCH_REPORT":
        return "bg-white text-black border-white font-black";
      case "TRANSFER":
        return "bg-zinc-900 text-zinc-300 border-zinc-700";
      case "NOTICE":
        return "bg-zinc-800 text-zinc-200 border-zinc-600";
      default:
        return "bg-zinc-900 text-zinc-400 border-zinc-800";
    }
  };

  const handleOpenCreateModal = () => {
    setEditingArticle({
      id: "news_" + Date.now(),
      title: "",
      subtitle: "",
      content: "",
      category: "STORYLINE",
      author: "League Admin",
      publishedAt: new Date().toISOString(),
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
      tags: ["League", "Update"],
      isPinned: false,
    });
    setEditorTags("League, Update");
    setIsEditorOpen(true);
  };

  const handleOpenEditModal = (article: NewsArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingArticle({ ...article });
    setEditorTags((article.tags || []).join(", "));
    setIsEditorOpen(true);
  };

  const handleSaveEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle || !editingArticle.title || !editingArticle.content) return;

    const tagsArray = editorTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const fullArticle: NewsArticle = {
      id: editingArticle.id || "news_" + Date.now(),
      title: editingArticle.title.trim(),
      subtitle: (editingArticle.subtitle || "").trim(),
      content: editingArticle.content.trim(),
      category: editingArticle.category || "STORYLINE",
      author: (editingArticle.author || "League Desk").trim(),
      publishedAt: editingArticle.publishedAt || new Date().toISOString(),
      imageUrl: editingArticle.imageUrl || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
      tags: tagsArray.length > 0 ? tagsArray : ["News"],
      isPinned: Boolean(editingArticle.isPinned),
      relatedPlayerIds: editingArticle.relatedPlayerIds || [],
      relatedTeamIds: editingArticle.relatedTeamIds || [],
      relatedMatchId: editingArticle.relatedMatchId || undefined,
    };

    await onSaveArticle(fullArticle);
    setIsEditorOpen(false);
    setEditingArticle(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-[#121215] p-5 rounded-3xl border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white text-black font-chakra font-black">
              <Newspaper className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-black font-chakra text-white tracking-wide">
              LEAGUE NEWS & STORYLINES
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Match coverage, rivalries, transfers, Golden Boot battles & administrative bulletins
          </p>
        </div>

        {isAdminUnlocked && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-chakra font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-black stroke-[3]" />
            <span>Write Story</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-chakra font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-white text-black shadow-sm"
                    : "bg-zinc-900/90 text-zinc-400 border border-zinc-800 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories, tags, players..."
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
        </div>
      </div>

      {/* Pinned Featured Stories */}
      {pinnedArticles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-chakra font-black text-zinc-400 uppercase tracking-wider">
            <Pin className="w-3.5 h-3.5 text-white" />
            <span>Pinned Headlines</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pinnedArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="group relative bg-[#121215] hover:bg-[#18181b] rounded-3xl border border-zinc-700/80 hover:border-white p-5 cursor-pointer shadow-xl transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Image & Content */}
                <div>
                  {article.imageUrl && (
                    <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-4 border border-zinc-800">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-white text-black font-chakra font-black text-[10px] uppercase flex items-center gap-1">
                          <Pin className="w-2.5 h-2.5" /> PINNED
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-chakra font-bold uppercase border ${getCategoryBadgeClass(article.category)}`}>
                          {article.category.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  )}

                  <h3 className="font-chakra font-black text-white text-base sm:text-lg leading-snug group-hover:text-zinc-200">
                    {article.title}
                  </h3>
                  {article.subtitle && (
                    <p className="text-xs text-zinc-400 font-semibold mt-1 line-clamp-2">
                      {article.subtitle}
                    </p>
                  )}
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                    {article.content}
                  </p>
                </div>

                {/* Footer Info */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <div className="flex items-center gap-2">
                    <span>{article.author}</span>
                    <span>&bull;</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isAdminUnlocked && (
                      <button
                        onClick={(e) => handleOpenEditModal(article, e)}
                        className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                        title="Edit Article"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleRequestDeleteArticle(article, e)}
                      className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-red-400 border border-zinc-800"
                      title="Delete Article"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Articles Feed */}
      <div className="space-y-3">
        {pinnedArticles.length > 0 && regularArticles.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-chakra font-black text-zinc-400 uppercase tracking-wider pt-2">
            <Flame className="w-3.5 h-3.5 text-white" />
            <span>Latest Feed</span>
          </div>
        )}

        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-[#121215] rounded-3xl border border-zinc-800">
            <Newspaper className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-400">No stories match your criteria.</p>
            {isAdminUnlocked && (
              <button
                onClick={handleOpenCreateModal}
                className="mt-3 px-4 py-2 rounded-xl bg-white text-black font-chakra font-black text-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Publish First Story
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="group bg-[#121215] hover:bg-[#18181b] rounded-3xl border border-zinc-800 hover:border-zinc-600 p-5 cursor-pointer shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {article.imageUrl && (
                    <div className="w-full h-36 rounded-2xl overflow-hidden mb-3 border border-zinc-800">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 mb-2">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-chakra font-bold uppercase border ${getCategoryBadgeClass(article.category)}`}>
                      {article.category.replace("_", " ")}
                    </span>
                    {article.tags && article.tags.slice(0, 2).map((t, idx) => (
                      <span key={idx} className="text-[10px] text-zinc-500 font-mono">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <h3 className="font-chakra font-bold text-white text-sm sm:text-base leading-snug group-hover:text-zinc-200">
                    {article.title}
                  </h3>
                  {article.subtitle && (
                    <p className="text-[11px] text-zinc-400 font-semibold mt-1 line-clamp-1">
                      {article.subtitle}
                    </p>
                  )}
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                    {article.content}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>

                  <div className="flex items-center gap-1.5">
                    {isAdminUnlocked && (
                      <button
                        onClick={(e) => handleOpenEditModal(article, e)}
                        className="p-1 rounded-md bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                        title="Edit Article"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleRequestDeleteArticle(article, e)}
                      className="p-1 rounded-md bg-zinc-900 text-zinc-400 hover:text-red-400 border border-zinc-800"
                      title="Delete Article"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="flex items-center gap-1 text-zinc-400 font-chakra font-bold text-[11px] group-hover:text-white pl-1">
                      <span>Read</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#121215] border border-zinc-700 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-chakra font-black uppercase border ${getCategoryBadgeClass(selectedArticle.category)}`}>
                  {selectedArticle.category.replace("_", " ")}
                </span>
                <h2 className="text-lg sm:text-2xl font-black font-chakra text-white leading-tight">
                  {selectedArticle.title}
                </h2>
                {selectedArticle.subtitle && (
                  <p className="text-xs sm:text-sm text-zinc-400 font-medium">
                    {selectedArticle.subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Author & Timestamp & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 font-mono border-y border-zinc-800 py-2.5">
              <div className="flex items-center gap-2">
                <span>By <strong>{selectedArticle.author}</strong></span>
                <span>&bull;</span>
                <span>{new Date(selectedArticle.publishedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                {isAdminUnlocked && (
                  <button
                    onClick={(e) => {
                      const art = selectedArticle;
                      setSelectedArticle(null);
                      handleOpenEditModal(art, e);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white font-chakra font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}
                <button
                  onClick={(e) => handleRequestDeleteArticle(selectedArticle, e)}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-chakra font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                  title="Delete this article permanently"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Story</span>
                </button>
              </div>
            </div>

            {/* Cover Image */}
            {selectedArticle.imageUrl && (
              <div className="w-full h-56 sm:h-72 rounded-2xl overflow-hidden border border-zinc-800">
                <img
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans whitespace-pre-line space-y-3">
              {selectedArticle.content}
            </div>

            {/* Tags */}
            {selectedArticle.tags && selectedArticle.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-2">
                <Tag className="w-3.5 h-3.5 text-zinc-500" />
                {selectedArticle.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800 text-[11px] font-mono"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Related Match Shortcut */}
            {selectedArticle.relatedMatchId && (
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-chakra">Connected Match Fixture</span>
                <button
                  onClick={() => {
                    const m = matches.find((item) => item.id === selectedArticle.relatedMatchId);
                    if (m && onOpenMatchDetails) {
                      setSelectedArticle(null);
                      onOpenMatchDetails(m);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white text-black font-chakra font-bold text-xs inline-flex items-center gap-1"
                >
                  <span>View Match Scoreboard</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Editor Modal */}
      {isEditorOpen && editingArticle && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveEditor}
            className="bg-[#121215] border border-zinc-700 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-chakra font-black text-white text-base sm:text-lg flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-white" />
                {editingArticle.id ? "Edit News / Storyline" : "Write New Story"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsEditorOpen(false);
                  setEditingArticle(null);
                }}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-chakra">
              <div>
                <label className="block text-zinc-400 font-bold mb-1">Headline / Title *</label>
                <input
                  type="text"
                  required
                  value={editingArticle.title || ""}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  placeholder="e.g. 60-Minute Match Standard Approved"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Subtitle / Summary</label>
                <input
                  type="text"
                  value={editingArticle.subtitle || ""}
                  onChange={(e) => setEditingArticle({ ...editingArticle, subtitle: e.target.value })}
                  placeholder="e.g. Official regulations codified for summer season"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Category</label>
                  <select
                    value={editingArticle.category || "STORYLINE"}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value as any })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="STORYLINE">Storyline</option>
                    <option value="MATCH_REPORT">Match Report</option>
                    <option value="TRANSFER">Transfer / Squad</option>
                    <option value="NOTICE">Official Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Author Name</label>
                  <input
                    type="text"
                    value={editingArticle.author || ""}
                    onChange={(e) => setEditingArticle({ ...editingArticle, author: e.target.value })}
                    placeholder="League Admin"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={editingArticle.imageUrl || ""}
                  onChange={(e) => setEditingArticle({ ...editingArticle, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Article Body / Story Content *</label>
                <textarea
                  required
                  rows={5}
                  value={editingArticle.content || ""}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  placeholder="Write the full match report, tactical storyline, player quotes, transfer details..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white font-sans text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={editorTags}
                  onChange={(e) => setEditorTags(e.target.value)}
                  placeholder="Red Team, Golden Boot, 60 Min"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pin-check"
                  checked={Boolean(editingArticle.isPinned)}
                  onChange={(e) => setEditingArticle({ ...editingArticle, isPinned: e.target.checked })}
                  className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 accent-white cursor-pointer"
                />
                <label htmlFor="pin-check" className="text-white font-bold cursor-pointer">
                  Pin to Top of News Page
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-4 border-t border-zinc-800">
              {editingArticle.id && news.some((n) => n.id === editingArticle.id) ? (
                <button
                  type="button"
                  onClick={() => {
                    const art = news.find((n) => n.id === editingArticle.id);
                    if (art) handleRequestDeleteArticle(art);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-chakra font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Article</span>
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditorOpen(false);
                    setEditingArticle(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white font-chakra font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white text-black font-chakra font-black text-xs uppercase tracking-wider cursor-pointer shadow-md hover:bg-zinc-200 transition-colors"
                >
                  Publish Article
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
