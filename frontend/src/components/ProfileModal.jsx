import { useState, useEffect } from "react";
import { X, Upload, Loader2, User } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ProfileModal({
  user,
  totalNotes,
  onClose,
  onProfileUpdate,
}) {
  const [prevUser, setPrevUser] = useState(user);
  const [name, setName] = useState(user?.name || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(
    user?.avatar_url ? `${API_URL}${user.avatar_url}` : null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Adjust state during render when the user prop changes
  if (user !== prevUser) {
    setPrevUser(user);
    setName(user?.name || "");
    setPreview(user?.avatar_url ? `${API_URL}${user.avatar_url}` : null);
    setFile(null);
    setError("");
  }

  // Revoke object URL on unmount or preview update to avoid memory leaks
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 2 * 1024 * 1024) {
        setError("Image must be smaller than 2MB");
        return;
      }
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    const formData = new FormData();
    formData.append("name", name);
    if (file) formData.append("avatar", file);

    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update profile");

      onProfileUpdate(data);
      if (onClose) onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="w-full max-w-sm bg-surface rounded-xl border border-outline/20 p-6 shadow-xl relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-outline hover:text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2
          id="profile-modal-title"
          className="font-headline text-xl font-bold text-primary mb-6"
        >
          Your Profile
        </h2>

        {error && (
          <p className="text-xs text-error bg-error/10 p-2 rounded mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <div className="relative mb-6 group cursor-pointer">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/5 border-2 border-outline/20 flex items-center justify-center">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-primary/40" />
              )}
            </div>
            <label
              htmlFor="profile-avatar-input"
              aria-label="Upload avatar"
              className="absolute inset-0 flex items-center justify-center bg-primary/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Upload className="w-6 h-6 text-surface" />
              <input
                id="profile-avatar-input"
                type="file"
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div className="w-full mb-4">
            <label
              htmlFor="profile-name-input"
              className="block text-xs font-semibold text-primary/80 mb-1"
            >
              Full Name
            </label>
            <input
              id="profile-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-transparent border-0 border-b border-outline text-primary focus:ring-0 focus:border-secondary py-1"
            />
          </div>

          <div className="w-full flex justify-between items-center bg-primary/5 p-3 rounded-lg mb-6 border border-outline/10">
            <span className="text-sm font-semibold text-primary/80">
              Total Notes
            </span>
            <span className="font-headline font-bold text-lg text-secondary">
              {totalNotes}
            </span>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-2 bg-secondary text-surface font-semibold rounded-md hover:bg-secondary/90 transition-all flex justify-center items-center"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Save Profile"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
