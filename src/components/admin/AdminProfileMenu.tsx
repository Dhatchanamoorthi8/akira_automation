import React from "react";
import { useAuth } from "../../auth/useAuth";
import {
  LogOut,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dropdown, Button, Label, Separator, Chip } from "@heroui/react";
import { PersonAvatar } from "@/utils/avatarHelper";

export const AdminProfileMenu: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName =
    profile?.full_name || user?.email?.split("@")[0] || "Administrator";
  const displayEmail = user?.email || "admin@akiraautomation.com";
  const roleLabel =
    profile?.role === "admin" ? "Administrator" : profile?.role || "Staff";

  return (
    <Dropdown>
      <Button
        variant="ghost"
        aria-label="Admin Profile Menu"
        className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100/80 transition-colors focus:outline-none min-h-[40px] cursor-pointer"
      >
        {/* <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200/70 shrink-0">
          {initials || <User className="w-4 h-4" />}
        </div> */}
         <PersonAvatar
            name={displayName}
            size="sm"
            className="ring-2 ring-white shadow-md"
          />
        <div className="hidden sm:block text-left">
          <div className="text-xs font-semibold text-slate-800 leading-tight flex items-center gap-1">
            <span className="truncate max-w-[120px] uppercase">{displayName}</span>
          </div>
         
          <span className="text-[10px] text-slate-400 capitalize">
            {roleLabel}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block" />
      </Button>

      <Dropdown.Popover
        placement="bottom end"
        className="w-64 rounded-2xl bg-white border border-slate-200/80 shadow-xl py-2 z-50 font-sans"
      >
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-xs font-bold text-slate-900 truncate">
            {displayName}
          </p>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {displayEmail}
          </p>
          <Chip
            variant="soft"
            color="accent"
            size="sm"
            className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>{roleLabel} Access</span>
          </Chip>
        </div>

        <Dropdown.Menu
          aria-label="User account actions"
          onAction={async (key) => {
            if (key === "public-site") {
              navigate("/");
            } else if (key === "sign-out") {
              await signOut();
              navigate("/admin/login");
            }
          }}
          className="p-1"
        >
          <Dropdown.Item
            id="public-site"
            textValue="Return to Public Website"
            className="rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-50"
          >
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <Label>Return to Public Website</Label>
            </div>
          </Dropdown.Item>

          <Separator className="my-1 border-slate-100" />

          <Dropdown.Item
            id="sign-out"
            variant="danger"
            textValue="Sign Out"
            className="rounded-lg px-3 py-2 cursor-pointer text-rose-600 hover:bg-rose-50"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600">
              <LogOut className="w-4 h-4 text-rose-500" />
              <Label>Sign Out</Label>
            </div>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};
