import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);
  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="antialiased relative min-h-screen flex flex-col">
      <header className="bg-surface border-b border-outline/20 fixed top-0 w-full z-50 h-16 flex justify-between items-center px-6 md:px-12">
        <Link
          to="/"
          className="font-headline text-2xl font-bold text-primary tracking-tight hover:opacity-80 transition-opacity"
          onClick={closeMenu}
        >
          NoteVault
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/login"
            className="text-primary font-semibold hover:text-secondary transition-colors duration-200 px-4 py-2"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="bg-secondary text-surface px-5 py-2 rounded-md font-semibold hover:bg-secondary/90 transition-colors duration-200 shadow-sm"
          >
            Sign Up
          </Link>
        </div>

        <button
          className="md:hidden text-primary p-2 hover:bg-primary/5 rounded-md transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-surface flex flex-col items-center pt-12 gap-6 md:hidden border-b border-outline/20 shadow-xl animate-in slide-in-from-top-2">
          <Link
            to="/login"
            className="text-primary font-headline text-2xl font-semibold px-8 py-4 w-full text-center hover:bg-primary/5"
            onClick={closeMenu}
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="bg-secondary text-surface px-8 py-4 mx-6 rounded-md font-headline text-2xl font-semibold shadow-sm text-center"
            onClick={closeMenu}
          >
            Create Account
          </Link>
        </div>
      )}

      <main className="w-full grow pt-16 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
