import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  FileText,
  Loader2,
  AlertCircle,
  LogOut,
  ArrowUpDown,
  Lock,
  Unlock,
} from "lucide-react";
import NoteEditorModal from "../components/NoteEditorModal";
import NoteViewerModal from "../components/NoteViewerModal";

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const highlightTextNode = (text, query) => {
  if (!query.trim()) return text;
  const escapedQuery = escapeRegExp(query);
  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));

  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={i}
        className="bg-secondary/40 text-primary rounded px-0.5 font-medium"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
};

const highlightHTML = (html, query) => {
  if (!query.trim()) return html;
  const escapedQuery = escapeRegExp(query);
  const regex = new RegExp(`(?![^<]*>)(${escapedQuery})`, "gi");
  return html.replace(
    regex,
    '<mark class="bg-secondary/40 text-primary rounded px-0.5 font-medium">$1</mark>',
  );
};

const getSnippet = (html, query) => {
  const plainText = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!query.trim()) return null;

  const lowerText = plainText.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return null;

  const start = Math.max(0, index - 50);
  const end = Math.min(plainText.length, index + query.length + 50);

  let snippet = plainText.substring(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < plainText.length) snippet = snippet + "...";

  return snippet;
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const [viewingNote, setViewingNote] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadNotes() {
      try {
        const response = await fetch(`${API_URL}/api/notes`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch notes");
        }

        if (isMounted) {
          setNotes(Array.isArray(data) ? data : data.data || []);
          setIsLoading(false);
        }
      } catch (err) {
        if (err.name !== "AbortError" && isMounted) {
          setError(
            err.name === "TypeError" && err.message.includes("fetch")
              ? "Network error: Could not connect to the server."
              : err.message || "Failed to load notes.",
          );
          setIsLoading(false);
        }
      }
    }

    loadNotes();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [API_URL]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Logout failed");
      }
      navigate("/login");
    } catch (err) {
      setError(
        err.name === "TypeError" && err.message.includes("fetch")
          ? "Network error: Could not connect to the server."
          : err.message || "Could not log out. Please try again.",
      );
      setIsLoggingOut(false);
    }
  };

  const handleSaveNote = async (payload) => {
    if (isSaving) return;

    const plainTextContent = payload.content.replace(/<[^>]+>/g, "").trim();
    if (!payload.title || !plainTextContent) {
      setModalError("Title and content are required.");
      return;
    }

    setIsSaving(true);
    setModalError("");

    try {
      const endpoint = editingNote
        ? `${API_URL}/api/notes/${editingNote.id || editingNote._id}`
        : `${API_URL}/api/notes`;
      const method = editingNote ? "PUT" : "POST";

      const payloadData = {
        title: payload.title.trim(),
        content: payload.content,
      };

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadData),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save note");
      }

      const savedNote = data.data || data;

      setNotes((prev) =>
        editingNote
          ? prev.map((n) =>
              (n.id || n._id) === (editingNote.id || editingNote._id)
                ? savedNote
                : n,
            )
          : [savedNote, ...prev],
      );

      setIsEditorOpen(false);
      setEditingNote(null);

      if (
        viewingNote &&
        (viewingNote.id || viewingNote._id) === (savedNote.id || savedNote._id)
      ) {
        setViewingNote(savedNote);
      }
    } catch (err) {
      setModalError(
        err.name === "TypeError" && err.message.includes("fetch")
          ? "Network error: Please verify your server is running."
          : err.message || "An unexpected error occurred.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      const response = await fetch(`${API_URL}/api/notes/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete note");
      }

      setNotes((prev) => prev.filter((n) => (n.id || n._id) !== id));

      if (viewingNote && (viewingNote.id || viewingNote._id) === id) {
        setViewingNote(null);
      }
    } catch (err) {
      setError(
        err.name === "TypeError" && err.message.includes("fetch")
          ? "Network error: Could not delete note."
          : err.message || "Failed to delete note.",
      );
    }
  };

  const processedNotes = useMemo(() => {
    const sorted = [...notes].sort((a, b) => {
      const aTime =
        a.created_at || a.updated_at || a.createdAt || a.updatedAt || 0;
      const bTime =
        b.created_at || b.updated_at || b.createdAt || b.updatedAt || 0;
      const dateA = new Date(aTime).getTime();
      const dateB = new Date(bTime).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    if (!searchQuery) return sorted;

    const term = searchQuery.toLowerCase();
    return sorted.filter((note) => {
      const plainText = note.content?.replace(/<[^>]+>/g, "") || "";
      return (
        note.title?.toLowerCase().includes(term) ||
        plainText.toLowerCase().includes(term)
      );
    });
  }, [notes, sortOrder, searchQuery]);

  let mainContent;

  if (isLoading) {
    mainContent = (
      <div className="w-full flex flex-col items-center justify-center py-24 text-primary/60">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-secondary" />
        <p className="text-sm font-semibold">Loading your vault...</p>
      </div>
    );
  } else if (error && notes.length === 0) {
    mainContent = null;
  } else if (notes.length === 0 && !error) {
    mainContent = (
      <div className="w-full flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4 text-primary/40">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="font-headline text-2xl text-primary font-semibold mb-1">
          Your vault is empty
        </h2>
        <p className="text-sm text-primary/70 max-w-sm mb-6">
          You have no notes saved. Click below to start recording your thoughts.
        </p>
        <button
          onClick={() => {
            setEditingNote(null);
            setIsEditorOpen(true);
          }}
          className="px-5 py-2.5 bg-secondary text-surface font-semibold text-sm rounded-md hover:bg-secondary/90 transition-all flex items-center gap-2 shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create First Note
        </button>
      </div>
    );
  } else {
    mainContent = (
      <>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-outline/10">
          <p className="text-primary/70 text-sm font-semibold">
            {processedNotes.length}{" "}
            {processedNotes.length === 1 ? "Note" : "Notes"}
          </p>

          <div className="flex items-center gap-5">
            <button
              onClick={() => setIsPrivacyMode(!isPrivacyMode)}
              className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                isPrivacyMode
                  ? "text-secondary"
                  : "text-primary/70 hover:text-primary"
              }`}
            >
              {isPrivacyMode ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
              {isPrivacyMode ? "Hidden" : "Unhidden"}
            </button>

            <div className="w-px h-4 bg-outline/20 hidden sm:block"></div>

            <div className="flex items-center gap-2 text-primary/70 focus-within:text-primary transition-colors">
              <ArrowUpDown className="w-4 h-4" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-transparent border-none text-sm p-0 focus:ring-0 cursor-pointer outline-none font-semibold"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedNotes.map((note) => {
            const noteDate =
              note.created_at ||
              note.updated_at ||
              note.createdAt ||
              note.updatedAt;
            const noteId = note.id || note._id;

            const noteContent = note.content || "";
            const noteTitle = note.title || "";

            const searchSnippet = searchQuery
              ? getSnippet(noteContent, searchQuery)
              : null;
            const highlightedContent = highlightHTML(
              DOMPurify.sanitize(noteContent),
              searchQuery,
            );

            return (
              <article
                key={noteId}
                className="bg-surface border border-outline/20 rounded-xl hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative flex flex-col h-72 focus-within:ring-2 focus-within:ring-secondary focus-within:border-transparent"
              >
                <div className="absolute top-4 right-4 flex gap-1.5 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingNote(note);
                      setIsEditorOpen(true);
                    }}
                    className="text-outline hover:text-secondary p-1.5 rounded-md hover:bg-primary/5 transition-colors bg-surface-bright border border-outline/10 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(noteId, e);
                    }}
                    className="text-outline hover:text-error p-1.5 rounded-md hover:bg-primary/5 transition-colors bg-surface-bright border border-outline/10 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-error"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setViewingNote(note)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setViewingNote(note);
                    }
                  }}
                  className="flex-1 p-6 flex flex-col cursor-pointer outline-none rounded-xl overflow-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary"
                >
                  <div className="mb-4 border-b border-outline/10 pb-4 pr-16 shrink-0">
                    <h3 className="font-headline text-lg font-bold text-primary mb-2 line-clamp-1">
                      {highlightTextNode(noteTitle, searchQuery)}
                    </h3>
                    {noteDate && (
                      <p className="text-xs font-semibold text-outline inline-block">
                        {new Date(noteDate).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>

                  <div className="flex-1 overflow-hidden">
                    {searchSnippet ? (
                      <div
                        className={`text-sm text-primary/80 leading-relaxed whitespace-pre-wrap line-clamp-6 transition-all duration-500 ${isPrivacyMode ? "blur-sm opacity-65 select-none pointer-events-none" : ""}`}
                      >
                        {highlightTextNode(searchSnippet, searchQuery)}
                      </div>
                    ) : (
                      <div
                        className={`text-sm text-primary/80 leading-relaxed whitespace-pre-wrap line-clamp-6 prose prose-sm prose-primary transition-all duration-500 ${
                          isPrivacyMode
                            ? "blur-sm opacity-65 select-none pointer-events-none"
                            : ""
                        }`}
                        dangerouslySetInnerHTML={{
                          __html: highlightedContent,
                        }}
                      />
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          {processedNotes.length === 0 && notes.length > 0 && (
            <div className="col-span-full py-16 text-center text-primary/60 text-sm">
              No notes found matching "{searchQuery}"
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-body text-primary">
      <header className="sticky top-0 z-30 h-16 bg-surface/90 backdrop-blur-md border-b border-outline/20 px-6 md:px-12 flex items-center justify-between gap-4">
        <div className="font-headline text-2xl font-bold text-primary tracking-tight shrink-0">
          NoteVault
        </div>

        <div className="flex-1 max-w-2xl mx-4 flex items-center">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-transparent border-0 border-b border-outline text-primary focus:outline-none focus:border-secondary focus:ring-0 text-sm placeholder:text-outline/70 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setEditingNote(null);
              setIsEditorOpen(true);
            }}
            className="px-4 py-2 bg-secondary text-surface font-semibold text-sm rounded-md hover:bg-secondary/90 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Note</span>
          </button>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-primary/70 hover:text-secondary transition-colors p-2 rounded-md hover:bg-primary/5 active:scale-95 disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogOut className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-12">
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-md flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {mainContent}
      </main>

      {viewingNote && (
        <NoteViewerModal
          note={viewingNote}
          onClose={() => setViewingNote(null)}
          onEdit={(note) => {
            setViewingNote(null);
            setEditingNote(note);
            setIsEditorOpen(true);
          }}
          onDelete={(id) => handleDeleteNote(id)}
        />
      )}

      {isEditorOpen && (
        <NoteEditorModal
          onClose={() => {
            setIsEditorOpen(false);
            setEditingNote(null);
            setModalError("");
          }}
          onSave={handleSaveNote}
          initialData={editingNote}
          isSaving={isSaving}
          error={modalError}
        />
      )}
    </div>
  );
}
