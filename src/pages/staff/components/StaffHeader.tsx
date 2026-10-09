import React from "react";
import { AdminHeader, AdminHeaderProps } from "../../../components/admin/AdminHeader";
import { WorkspaceTab } from "../types";

export interface StaffHeaderProps extends Partial<AdminHeaderProps> {
  onToggleMobileSidebar: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
  activeTab?: WorkspaceTab;
  userName?: string | null;
  userEmail?: string | null;
  role?: string | null;
  isAdmin?: boolean;
  onSignOut?: () => void;
}

export const StaffHeader: React.FC<StaffHeaderProps> = (props) => {
  return <AdminHeader portal="staff" {...props} />;
};

export default StaffHeader;
