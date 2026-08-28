import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, LogOut, Search, Bell } from "lucide-react";
import { useAuth } from "../../auth/useAuth";

interface HeaderProps {
  onMenuClick: () => void;
}

const SECTION_TITLES: Record<string, string> = {
  "/": "Overview",
  "/bookings/bin": "Recycle Bin",
  "/bookings": "Bookings",
  "/charter": "Charter Desk",
  "/operations": "Operations",
  "/payments": "Payments",
  "/team": "Team & Roles",
};

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const section =
    Object.entries(SECTION_TITLES).find(([path]) =>
      path === "/" ? location.pathname === "/" : location.pathname.startsWith(path)
    )?.[1] || "Operations";

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between gap-4 border-b border-aviation-800 bg-aviation-950/95 px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded p-2 text-slate-400 hover:bg-aviation-800 hover:text-white lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="truncate text-sm font-semibold text-white">{section}</h1>
      </div>

      <form
        className="hidden md:flex items-center gap-2 rounded-md border border-aviation-800 bg-aviation-900 px-2.5 py-1.5 flex-1 max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          const q = query.trim();
          navigate(q ? `/bookings?q=${encodeURIComponent(q)}` : "/bookings");
        }}
      >
        <Search className="h-3.5 w-3.5 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bookings"
          className="w-full bg-transparent text-[12px] text-white placeholder-slate-500 outline-none"
        />
      </form>

      <div className="flex items-center gap-3">
        <span className="hidden sm:inline-flex text-slate-500" title="Notifications">
          <Bell className="h-4 w-4" />
        </span>
        <div className="hidden sm:block text-right">
          <div className="text-[12px] font-medium text-white leading-tight">
            {user?.fullName || user?.email?.split("@")[0] || "Operator"}
          </div>
          <div className="text-[10px] text-slate-500 leading-tight">{role || "ADMIN"}</div>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="inline-flex items-center gap-1.5 rounded-md border border-aviation-800 px-2.5 py-1.5 text-[11px] text-slate-300 hover:border-rose-800 hover:text-rose-300"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
