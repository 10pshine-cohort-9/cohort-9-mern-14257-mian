import { Link } from "react-router-dom";
import { LogIn, UserPlus, Edit3, Lock, Zap } from "lucide-react";
import VaultGraphic from "../components/VaultGraphic";

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center">
      <section className="min-h-[calc(100vh-4rem)] w-full max-w-7xl flex flex-col md:flex-row justify-start md:justify-center items-center pt-12 pb-16 px-6 md:p-12 gap-4 md:gap-8">
        <div className="flex-1 flex flex-col items-start text-left animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-primary mb-5 font-bold tracking-tight leading-tight">
            Your thoughts, <br />
            <span className="text-secondary text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
              safely vaulted.
            </span>
          </h1>
          <p className="font-body text-base sm:text-lg md:text-xl text-primary/80 mb-8 max-w-md">
            A secure, distraction-free workspace for your notes, documents, and
            ideas. Write clearly, organize effortlessly, and keep your data
            private.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              to="/signup"
              className="w-full sm:w-auto bg-secondary text-surface px-8 py-3.5 rounded-md font-semibold active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-inner hover:bg-secondary/90"
            >
              <UserPlus className="w-5 h-5" />
              Create Account
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto border border-outline text-primary px-8 py-3.5 rounded-md font-semibold active:scale-95 transition-transform flex items-center justify-center gap-2 hover:bg-surface-dim/50"
            >
              <LogIn className="w-5 h-5" />
              Log In
            </Link>
          </div>
        </div>

        <div className="flex-1 w-full flex justify-center items-center animate-in fade-in duration-1000 delay-200 mt-4 md:mt-0">
          <div className="w-full max-w-70 sm:max-w-sm md:max-w-md">
            <VaultGraphic />
          </div>
        </div>
      </section>

      <section className="min-h-[calc(100vh-4rem)] w-full flex flex-col justify-center items-center p-6 md:p-12">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-headline text-3xl md:text-4xl text-primary font-bold">
              Why Choose NoteVault?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-surface p-8 rounded-xl shadow-sm border border-outline/20 flex flex-col items-start transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-6 text-primary">
                <Edit3 className="w-6 h-6" />
              </div>
              <h3 className="font-headline text-2xl text-secondary mb-3 font-semibold">
                Rich Text Editor
              </h3>
              <p className="font-body text-primary/80">
                Format your notes easily with our clean, intuitive editor. Focus
                on writing without dealing with cluttered menus.
              </p>
            </div>

            <div className="bg-surface p-8 rounded-xl shadow-sm border border-outline/20 flex flex-col items-start transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-6 text-primary">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-headline text-2xl text-secondary mb-3 font-semibold">
                Secure Storage
              </h3>
              <p className="font-body text-primary/80">
                Your notes are encrypted and securely stored. You have complete
                control and privacy over your personal data.
              </p>
            </div>

            <div className="bg-surface p-8 rounded-xl shadow-sm border border-outline/20 flex flex-col items-start transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-6 text-primary">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-headline text-2xl text-secondary mb-3 font-semibold">
                Lightning Fast
              </h3>
              <p className="font-body text-primary/80">
                Instantly search, find, and organize your notes. Our optimized
                database ensures you never lose track of a thought.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
