import React from "react";
import type { ActiveTab } from "../../types";

const DEFAULT_DOCUMENTATION_URL =
  "https://drive.google.com/file/d/1mDOBTRnunu0Q9GQsRVdyhlxzHnuuvUrS/view?usp=drive_link";

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  apiOnline?: boolean;
  documentationUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  documentationUrl =
    import.meta.env.VITE_DOCUMENTATION_URL || DEFAULT_DOCUMENTATION_URL,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-800/90 bg-[#09090b]/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-[1440px] flex-wrap items-center justify-between gap-2 px-3 py-2 sm:flex-nowrap sm:gap-4 sm:px-6 sm:py-0">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5 lg:gap-8">
          <button
            type="button"
            onClick={() => onTabChange("movies")}
            className="flex min-w-0 items-center gap-2 text-left focus:outline-none sm:gap-2.5"
          >
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded bg-red-600 text-xs font-black tracking-tighter text-white shadow-sm shadow-red-600/40">
              DR
            </span>
            <span className="truncate text-xs font-extrabold tracking-[0.12em] text-white uppercase sm:text-sm sm:tracking-[0.18em]">
              DOOMSDAY READY
            </span>
            <span className="hidden shrink-0 rounded border border-red-500/30 bg-red-950/50 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-red-400 uppercase sm:inline-block">
              VAULT OS
            </span>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {(
              [
                { id: "movies", label: "Movies" },
                { id: "rewatch", label: "Rewatch Plan" },
                { id: "booking", label: "Booking" },
              ] as const
            ).map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide transition lg:px-3.5 ${
                    isActive
                      ? "bg-red-600/15 text-red-400 ring-1 ring-red-500/40"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a
            href={documentationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-500/35 bg-red-950/30 px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap text-red-300 transition hover:border-red-400/60 hover:bg-red-950/55 hover:text-white sm:gap-2 sm:px-3.5 sm:text-[11px]"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
            <span>Documentation</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      {/* Mobile navigation tabs */}
      <div className="flex w-full border-t border-zinc-800/80 bg-[#0d0d10] md:hidden">
        {(
          [
            { id: "movies", label: "Movies" },
            { id: "rewatch", label: "Rewatch Plan" },
            { id: "booking", label: "Booking" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={`min-w-0 flex-1 truncate px-2 py-2.5 text-xs font-semibold transition ${
              activeTab === item.id
                ? "border-b-2 border-red-500 bg-red-950/20 text-red-400"
                : "text-zinc-400"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};