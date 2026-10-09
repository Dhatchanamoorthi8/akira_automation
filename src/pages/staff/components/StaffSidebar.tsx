import React from "react";
import { Link } from "react-router-dom";
import { Drawer, Button, Chip, Card } from "@heroui/react";
import {
  Clock,
  Megaphone,
  LocationArrow,
  Receipt,
  Plus,
  Pin,
  FileText,
  PersonPlus,
  Calendar,
  ShieldCheck,
  Magnifier,
  Xmark,
  Power,
  House,
} from "@gravity-ui/icons";
import { PersonAvatar } from "../../../utils/avatarHelper";
import { WorkspaceTab, StaffStats } from "../types";
import { StaffAttendance } from "../../../types/database";

interface StaffSidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  stats: StaffStats;
  followupTotal: number;
  enquiryTotal: number;
  visitTotal: number;
  invoiceTotal: number;
  userName?: string | null;
  userEmail?: string | null;
  role?: string | null;
  isAdmin?: boolean;
  onSignOut: () => void;
  onOpenFollowupModal: () => void;
  onOpenVisitModal: () => void;
  onOpenInvoiceModal: () => void;
  onOpenAddLeadModal: () => void;
  todayAttendance: StaffAttendance | null;
  isClocking: boolean;
}

export const StaffSidebar: React.FC<StaffSidebarProps> = ({
  isMobileOpen,
  onCloseMobile,
  isCollapsed = false,
  activeTab,
  onTabChange,
  stats,
  followupTotal,
  enquiryTotal,
  visitTotal,
  invoiceTotal,
  userName,
  userEmail,
  role,
  isAdmin,
  onSignOut,
  onOpenFollowupModal,
  onOpenVisitModal,
  onOpenInvoiceModal,
  onOpenAddLeadModal,
  todayAttendance,
}) => {
  const navItems = [
    {
      id: "overview" as WorkspaceTab,
      label: "Overview",
      icon: House,
      count: followupTotal + enquiryTotal + visitTotal + invoiceTotal,
    },
    {
      id: "followups" as WorkspaceTab,
      label: "Follow-ups",
      icon: Clock,
      count: followupTotal,
      alert: stats.overdue > 0,
      alertCount: stats.overdue,
    },
    {
      id: "enquiries" as WorkspaceTab,
      label: "My Inquiries",
      icon: Megaphone,
      count: enquiryTotal,
    },
    {
      id: "visits" as WorkspaceTab,
      label: "Field Visits",
      icon: LocationArrow,
      count: visitTotal,
    },
    {
      id: "invoices" as WorkspaceTab,
      label: "Invoices & Quotes",
      icon: Receipt,
      count: invoiceTotal,
    },
  ];

  const renderNavContent = (isMobile = false) => {
    const collapsed = !isMobile && isCollapsed;

    return (
      <div className="flex flex-col h-full bg-white border-r border-slate-200/70 select-none">
        {/* Top Workspace Header (Matches AdminSidebar style) */}
        <div
          className={`p-3 border-b border-slate-100 flex items-center shrink-0 ${
            collapsed ? "flex-col justify-center gap-2" : "justify-between gap-2"
          }`}
        >
          {!collapsed ? (
            <>
              <Link
                to="/staff"
                onClick={onCloseMobile}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors flex-1 min-w-0"
              >
                <div className="w-8 h-8 rounded-xl bg-[#FDE8EC] border border-[#FECDD3] flex items-center justify-center text-[#FB7185] shrink-0 font-bold text-xs shadow-2xs">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-semibold text-slate-900 block leading-tight truncate">
                    AkiRa Staff
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block truncate">
                    Field CRM Console
                  </span>
                </div>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
                aria-label="Quick Search"
              >
                <Magnifier className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-[#FDE8EC] border border-[#FECDD3] flex items-center justify-center text-[#FB7185] shrink-0 font-bold text-xs shadow-2xs mx-auto">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          )}

          {/* Mobile close trigger in drawer */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              onPress={onCloseMobile}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
              aria-label="Close navigation sidebar"
            >
              <Xmark className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Navigation Sections */}
        <div
          className={`flex-1 overflow-y-auto ${
            collapsed ? "px-2 py-3 space-y-3" : "px-3 py-3 space-y-4"
          }`}
        >
          {/* Section 1: Modules */}
          <div className="space-y-1">
            {!collapsed && (
              <div className="px-3 pt-2 pb-1">
                <span className="text-xs font-semibold text-slate-400 block tracking-normal">
                  CRM Modules
                </span>
              </div>
            )}

            {collapsed && (
              <div className="w-6 mx-auto border-t border-slate-100 my-1.5" />
            )}

            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;

                if (collapsed) {
                  return (
                    <Link
                      key={item.id}
                      to={`/staff/${item.id}`}
                      onClick={() => {
                        onTabChange(item.id);
                        if (isMobile) onCloseMobile();
                      }}
                      title={item.label}
                      className={`flex items-center justify-center w-10 h-10 mx-auto rounded-2xl text-xs font-semibold transition-all relative ${
                        active
                          ? "bg-[#FDE8EC] text-[#FB7185] shadow-2xs"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/70"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${active ? "text-[#FB7185]" : "text-slate-500"}`}
                      />
                      {item.alert && item.alertCount ? (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                      ) : null}
                      <span className="sr-only">{item.label}</span>
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    to={`/staff/${item.id}`}
                    onClick={() => {
                      onTabChange(item.id);
                      if (isMobile) onCloseMobile();
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-2xl text-sm transition-colors no-underline ${
                      active
                        ? "bg-[#FDE8EC] text-slate-900 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          active ? "text-[#FB7185]" : "text-slate-500"
                        } transition-colors`}
                      />
                      <span className="text-sm truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {item.alert && item.alertCount ? (
                        <Chip
                          size="sm"
                          color="danger"
                          variant="soft"
                          className="text-[10px] font-bold px-1 py-0 h-4 min-w-[18px]"
                        >
                          {item.alertCount}
                        </Chip>
                      ) : null}
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          active
                            ? "bg-rose-100/80 text-rose-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.count}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Section 2: Quick Operations */}
          {!collapsed && (
            <div className="space-y-1.5 pt-2">
              <div className="px-3 pb-1">
                <span className="text-xs font-semibold text-slate-400 block tracking-normal">
                  Quick Actions
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 px-1">
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => {
                    onOpenFollowupModal();
                    if (isMobile) onCloseMobile();
                  }}
                  className="gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer h-8 rounded-xl justify-start px-2.5"
                  aria-label="Create New Task"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">+ New Task</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    onOpenVisitModal();
                    if (isMobile) onCloseMobile();
                  }}
                  className="gap-1.5 text-xs font-semibold border-slate-200/80 text-slate-700 hover:bg-slate-50 cursor-pointer h-8 rounded-xl justify-start px-2.5"
                  aria-label="Book Field Inspection"
                >
                  <Pin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">Book Visit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    onOpenInvoiceModal();
                    if (isMobile) onCloseMobile();
                  }}
                  className="gap-1.5 text-xs font-semibold border-slate-200/80 text-slate-700 hover:bg-slate-50 cursor-pointer h-8 rounded-xl justify-start px-2.5"
                  aria-label="Generate Quotation Document"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">New Quote</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    onOpenAddLeadModal();
                    if (isMobile) onCloseMobile();
                  }}
                  className="gap-1.5 text-xs font-semibold border-slate-200/80 text-slate-700 hover:bg-slate-50 cursor-pointer h-8 rounded-xl justify-start px-2.5"
                  aria-label="Register Client Lead"
                >
                  <PersonPlus className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="truncate">Add Lead</span>
                </Button>
              </div>
            </div>
          )}

          {/* Section 3: Attendance Status Card */}
          {!collapsed && (
            <div className="space-y-1.5 pt-2">
              <div className="px-3 pb-1">
                <span className="text-xs font-semibold text-slate-400 block tracking-normal">
                  Daily Status
                </span>
              </div>

              <div className="px-1">
                <Card className="p-3 bg-slate-50/70 border border-slate-200/70 rounded-2xl text-xs space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Calendar className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span className="font-semibold text-xs text-slate-800 truncate">
                        Attendance
                      </span>
                    </div>
                    {todayAttendance ? (
                      todayAttendance.clock_out_at ? (
                        <Chip size="sm" color="default" variant="soft" className="text-[9px] font-bold h-4">
                          Departed
                        </Chip>
                      ) : todayAttendance.status === "on_field" ? (
                        <Chip size="sm" color="warning" variant="soft" className="text-[9px] font-bold h-4">
                          On-Site
                        </Chip>
                      ) : (
                        <Chip size="sm" color="success" variant="soft" className="text-[9px] font-bold h-4">
                          In-Office
                        </Chip>
                      )
                    ) : (
                      <Chip size="sm" color="danger" variant="soft" className="text-[9px] font-bold h-4">
                        Pending
                      </Chip>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {todayAttendance?.clock_in_at ? (
                      <>Punch: {new Date(todayAttendance.clock_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                    ) : (
                      <>Punch in on workspace banner</>
                    )}
                  </p>
                </Card>
              </div>
            </div>
          )}

          {/* Section 4: Supervisory Link (If Admin) */}
          {isAdmin && !collapsed && (
            <div className="pt-2 px-1">
              <div className="px-2 pb-1">
                <span className="text-xs font-semibold text-slate-400 block tracking-normal">
                  Supervisory Access
                </span>
              </div>
              <Link
                to="/admin/dashboard"
                className="w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-800 transition-colors border border-dashed border-rose-200/80"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-500" />
                  <span>Admin Master Console</span>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Footer User Profile Card (Matches AdminSidebar Jordan Ellis style) */}
        <div
          className={`border-t border-slate-100 bg-white shrink-0 ${
            collapsed ? "p-2 flex flex-col items-center gap-2" : "p-3 flex items-center justify-between gap-2"
          }`}
        >
          {!collapsed ? (
            <>
              <div
                className="flex items-center gap-2.5 min-w-0 flex-1"
                title={userName ? `${userName} (${role || "Staff"})` : undefined}
              >
                <PersonAvatar
                  name={userName || userEmail || "Staff User"}
                  size="lg"
                  className="ring-2 ring-white shadow-md shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {role
                      ? `${role.charAt(0).toUpperCase() + role.slice(1)} Session`
                      : "Staff Session"}
                  </p>
                  <p className="text-xs text-slate-400 truncate font-mono">
                    {userEmail || "staff@akira.com"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  onPress={onSignOut}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer min-h-[30px] min-w-[30px]"
                  aria-label="Sign Out of Portal"
                >
                  <Power className="w-3.5 h-3.5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <PersonAvatar
                name={userName || userEmail || "Staff User"}
                size="lg"
                className="ring-2 ring-white shadow-md"
              />
              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                onPress={onSignOut}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer min-h-[28px] min-w-[28px]"
                aria-label="Sign Out of Portal"
              >
                <Power className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 shrink-0 z-20 transition-all duration-200 ease-in-out ${
          isCollapsed ? "w-16" : "w-60"
        }`}
      >
        {renderNavContent(false)}
      </aside>

      {/* Mobile Drawer (Slide-in) using HeroUI v3 Drawer */}
      <Drawer.Backdrop
        isOpen={isMobileOpen}
        onOpenChange={(open) => {
          if (!open) onCloseMobile();
        }}
        className="lg:hidden"
      >
        <Drawer.Content
          placement="left"
          className="max-w-xs w-full p-0 bg-transparent shadow-none border-none"
        >
          <Drawer.Dialog
            className="h-full w-full p-0 bg-white shadow-2xl flex flex-col"
            aria-label="Staff Navigation Menu"
          >
            {renderNavContent(true)}
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </>
  );
};
