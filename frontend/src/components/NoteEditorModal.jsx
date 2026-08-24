import { useState, useEffect } from "react";
import {
  X,
  Loader2,
  AlertCircle,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

const escapeHtml = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const formatContentForEditor = (rawContent) => {
  if (!rawContent) return "";
  if (/^\s*<[a-z][\s\S]*>/i.test(rawContent)) {
    return rawContent;
  }
  return rawContent
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
};

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-outline/30 bg-surface-bright rounded-t-md">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-md hover:bg-outline/20 transition-colors ${editor.isActive("bold") ? "bg-primary/10 text-primary" : "text-primary/70"}`}
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-md hover:bg-outline/20 transition-colors ${editor.isActive("italic") ? "bg-primary/10 text-primary" : "text-primary/70"}`}
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded-md hover:bg-outline/20 transition-colors ${editor.isActive("strike") ? "bg-primary/10 text-primary" : "text-primary/70"}`}
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-outline/30 mx-1 my-auto" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-md hover:bg-outline/20 transition-colors ${editor.isActive("bulletList") ? "bg-primary/10 text-primary" : "text-primary/70"}`}
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-md hover:bg-outline/20 transition-colors ${editor.isActive("orderedList") ? "bg-primary/10 text-primary" : "text-primary/70"}`}
      >
        <ListOrdered className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function NoteEditorModal({
  onClose,
  onSave,
  initialData,
  isSaving,
  error,
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write your note here...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: formatContentForEditor(initialData?.content),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm prose-primary focus:outline-none p-3 min-h-[200px] h-full",
      },
    },
  });

  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title: formData.title,
      content: editor ? editor.getHTML() : "",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-surface rounded-xl border border-outline/20 p-6 shadow-xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <button
          onClick={onClose}
          disabled={isSaving}
          aria-label="Close modal"
          className="absolute top-5 right-5 text-outline hover:text-primary transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-headline text-2xl font-bold text-primary mb-4 shrink-0">
          {initialData ? "Edit Note" : "Create New Note"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/20 text-error text-xs rounded font-body flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar pb-2">
            <div>
              <label
                htmlFor="note-title"
                className="block text-xs font-semibold text-primary/80 mb-1"
              >
                Title
              </label>
              <input
                id="note-title"
                type="text"
                placeholder="Note title..."
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                disabled={isSaving}
                className="w-full bg-transparent border-0 border-b border-outline text-primary focus:outline-none focus:border-secondary focus:ring-0 text-base py-1 transition-colors"
              />
            </div>

            <div className="flex flex-col h-72">
              <label className="block text-xs font-semibold text-primary/80 mb-1">
                Content
              </label>
              <div className="flex-1 border border-outline/30 rounded-md overflow-hidden bg-surface flex flex-col focus-within:border-secondary transition-colors">
                <MenuBar editor={editor} />
                <div
                  className="flex-1 overflow-y-auto cursor-text bg-transparent"
                  onClick={() => editor && editor.commands.focus()}
                >
                  <EditorContent editor={editor} className="h-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 shrink-0 border-t border-outline/10 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-semibold text-primary/70 hover:text-primary transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-secondary text-surface font-semibold text-sm rounded-md hover:bg-secondary/90 transition-all shadow-sm active:scale-95 flex items-center gap-2 disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : initialData ? (
                "Save Changes"
              ) : (
                "Create Note"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
