import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Plane, CreditCard, Radio, Trash2, Coins, X } from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import { isAdminRole, isStaffOrAdminRole } from "../../auth/roles";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  backendLive?: boolean | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, backendLive }) => {
  const location = useLocation();
  const { role } = useAuth();
  const admin = isAdminRole(role);
  const staff = isStaffOrAdminRole(role);
  const canManageBin = role === "ADMIN" || role === "SUPER_ADMIN";

  const navigationItems = [
    ...(admin ? [{ name: "Operations Overview", path: "/", icon: LayoutDashboard }] : []),
    ...(admin ? [{ name: "Bookings", path: "/bookings", icon: ClipboardList }] : []),
    ...(canManageBin ? [{ name: "Recycle Bin", path: "/bookings/bin", icon: Trash2 }] : []),
    ...(admin ? [{ name: "Charter Desk", path: "/charter", icon: Plane }] : []),
    ...(staff ? [{ name: "Operations", path: "/operations", icon: Radio }] : []),
    ...(admin ? [{ name: "Services & Pricing", path: "/pricing", icon: Coins }] : []),
    ...(admin ? [{ name: "Payments", path: "/payments", icon: CreditCard }] : []),
  ];

  const liveLabel = backendLive === false ? "Offline" : "Live";
  const liveColor = backendLive === false ? "text-rose-500" : "text-emerald-600";
  const liveDot = backendLive === false ? "bg-rose-500" : "bg-emerald-500";

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-[248px] flex-col border-r border-slate-200 bg-white shadow-sm transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-5">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
              Shafsky
            </div>
            <div className="text-sm font-semibold text-slate-800 leading-tight">
              Aviation Operations
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isBookingsRoot =
              item.path === "/bookings" &&
              location.pathname.startsWith("/bookings") &&
              !location.pathname.startsWith("/bookings/bin");
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/" || item.path === "/bookings"}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                    isActive || isBookingsRoot
                      ? "bg-lime-50 text-lime-700 border-l-[3px] border-lime-600 font-semibold"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 px-4 py-3 text-[11px]">
          <div className="flex items-center justify-between text-slate-400">
            <span>Environment</span>
            <span className="text-slate-600 font-medium">
              {import.meta.env.DEV ? "Development" : "Production"}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-slate-400">Status</span>
            <span className={`inline-flex items-center gap-1.5 font-medium ${liveColor}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${liveDot}`} />
              {liveLabel}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
