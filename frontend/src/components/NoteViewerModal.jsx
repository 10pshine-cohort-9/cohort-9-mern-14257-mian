import { X, Edit3, Trash2 } from "lucide-react";

export default function NoteViewerModal({ note, onClose, onEdit, onDelete }) {
  if (!note) return null;

  const noteDate =
    note.created_at || note.updated_at || note.createdAt || note.updatedAt;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-surface rounded-xl border border-outline/20 p-6 shadow-xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between mb-4 shrink-0 border-b border-outline/10 pb-4">
          <div className="pr-8">
            <h2 className="font-headline text-3xl font-bold text-primary leading-tight mb-2">
              {note.title}
            </h2>
            {noteDate && (
              <span className="text-xs font-semibold text-outline bg-primary/5 px-2 py-1 rounded inline-block">
                {new Date(noteDate).toLocaleString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-outline hover:text-primary transition-colors bg-surface/80 rounded p-1 mt-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 mb-4">
          <div
            className="prose prose-sm prose-primary max-w-none text-primary/90 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 shrink-0 border-t border-outline/10 mt-2">
          <button
            onClick={() => onDelete(note.id || note._id)}
            className="px-4 py-2 text-sm font-semibold text-error hover:bg-error/10 rounded-md transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button
            onClick={() => onEdit(note)}
            className="px-5 py-2 bg-secondary text-surface font-semibold text-sm rounded-md hover:bg-secondary/90 transition-all shadow-sm active:scale-95 flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Edit Note
          </button>
        </div>
      </div>
    </div>
  );
}
