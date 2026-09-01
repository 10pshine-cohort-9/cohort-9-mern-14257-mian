import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setError("");

    const trimmedEmail = formData.email.trim();

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, email: trimmedEmail }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to log in");
      }

      navigate("/dashboard");
    } catch (err) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError(
          "Network error: Please check your connection or ensure the server is running.",
        );
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="w-full max-w-175 bg-surface rounded-xl p-6 border border-outline/20 shadow-[inset_0_0_40px_rgba(0,0,0,0.02),0_4px_20px_rgba(0,0,0,0.05)]">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-body font-semibold text-secondary hover:text-secondary/80 transition-colors mb-4 md:mb-6 -ml-2 p-2 rounded-md hover:bg-secondary/5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
          <div className="w-full md:w-5/12 text-center md:text-left md:-mt-12">
            <h1 className="font-headline text-3xl text-primary tracking-tight mb-2 font-bold leading-tight">
              Welcome Back
            </h1>
            <p className="font-body text-sm text-primary/80">
              Log in to your NoteVault account
            </p>
          </div>

          <div className="w-full md:w-7/12">
            {error && (
              <div className="mb-4 p-3 bg-error/10 border border-error/20 text-error text-sm rounded-md font-body">
                {error}
              </div>
            )}

            <form className="space-y-3" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block font-body font-semibold text-sm text-primary/80 mb-0.5 text-left"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  className="w-full bg-transparent border-0 border-b border-outline text-primary focus:ring-0 focus:border-b-2 focus:border-secondary font-body px-0 py-1.5 transition-all focus:outline-none placeholder:text-outline/60"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  className="block font-body font-semibold text-sm text-primary/80 mb-0.5 text-left"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-transparent border-0 border-b border-outline text-primary focus:ring-0 focus:border-b-2 focus:border-secondary font-body px-0 py-1.5 transition-all focus:outline-none placeholder:text-outline/60 pr-8"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-primary/50 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-secondary rounded"
                    onClick={togglePasswordVisibility}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                className="w-full bg-secondary hover:bg-secondary/90 text-surface font-body font-semibold py-2.5 rounded-lg transition-colors shadow-sm active:scale-95 mt-4 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Logging In...
                  </>
                ) : (
                  "Log In"
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="font-body text-sm text-primary/80">
                Don't have an account?
                <Link
                  to="/signup"
                  className="text-secondary font-bold hover:text-secondary/80 ml-2 transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
