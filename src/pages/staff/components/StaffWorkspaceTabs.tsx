import React from "react";
import { House, Clock, Megaphone, LocationArrow, Receipt } from "@gravity-ui/icons";
import { Button } from "@heroui/react";
import { WorkspaceTab } from "../types";

interface StaffWorkspaceTabsProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  followupTotal: number;
  enquiryTotal: number;
  visitTotal: number;
  invoiceTotal: number;
}

export const StaffWorkspaceTabs: React.FC<StaffWorkspaceTabsProps> = ({
  activeTab,
  onTabChange,
  followupTotal,
  enquiryTotal,
  visitTotal,
  invoiceTotal,
}) => {
  const tabs = [
    {
      id: "overview" as WorkspaceTab,
      label: "Overview",
      fullName: "Overview",
      icon: House,
      count: 0,
    },
    {
      id: "followups" as WorkspaceTab,
      label: "Follow-ups",
      fullName: `Follow-ups (${followupTotal})`,
      icon: Clock,
      count: followupTotal,
    },
    {
      id: "enquiries" as WorkspaceTab,
      label: "My Inquiries",
      fullName: `My Inquiries (${enquiryTotal})`,
      icon: Megaphone,
      count: enquiryTotal,
    },
    {
      id: "visits" as WorkspaceTab,
      label: "Field Visits",
      fullName: `Field Visits (${visitTotal})`,
      icon: LocationArrow,
      count: visitTotal,
    },
    {
      id: "invoices" as WorkspaceTab,
      label: "Invoices & Quotes",
      fullName: `Invoices & Quotes (${invoiceTotal})`,
      icon: Receipt,
      count: invoiceTotal,
    },
  ];

  return (
    <div className="w-full border-b border-slate-200/70 pb-2">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              variant={isActive ? "primary" : "outline"}
              size="sm"
              onPress={() => onTabChange(tab.id)}
              className={`gap-2 text-xs font-semibold shrink-0 cursor-pointer h-9 px-3.5 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "bg-slate-900 text-white shadow-2xs border-slate-900 hover:bg-slate-800"
                  : "bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
              }`}
              aria-label={tab.fullName}
            >
              <Icon
                className={`w-3.5 h-3.5 shrink-0 ${
                  isActive ? "text-rose-400" : "text-slate-400"
                }`}
              />
              <span className="truncate">{tab.fullName}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
