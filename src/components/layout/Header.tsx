import React from "react";
import { Menu, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout, role } = useAuth();

  const isSuperAdmin = role === "SUPER_ADMIN";
  const badgeVariant = isSuperAdmin ? "gold" : "blue";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-aviation-800 bg-aviation-900/90 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-400 hover:bg-aviation-800 hover:text-white lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="text-aviation-gold font-semibold">OPS-DESK</span>
          <span>/</span>
          <span>PORTAL ACTIVE</span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Operator Profile */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-aviation-800 border border-aviation-700 text-aviation-gold font-bold text-xs">
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-white leading-tight">
              {user?.fullName || user?.email?.split("@")[0] || "Operator"}
            </div>
            <div className="text-[10px] text-slate-400 font-mono leading-tight">
              {user?.email}
            </div>
          </div>
        </div>

        {/* Role Badge */}
        <Badge variant={badgeVariant} size="sm">
          {role || "ADMIN"}
        </Badge>

        {/* Logout Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => logout()}
          leftIcon={<LogOut className="h-3.5 w-3.5" />}
          className="text-xs text-slate-300 hover:text-rose-400 hover:border-rose-800"
        >
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
};
