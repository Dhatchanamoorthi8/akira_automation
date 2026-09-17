import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCw,
  SlidersHorizontal,
  Mail,
  Calendar,
  X,
  Loader2,
  AlertCircle,
  Edit3,
  Trash2,
  UserCheck,
  UserX,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Profile, UserRole, UserFilters } from '../../types/database';
import { userService } from '../../services/userService';
import { formatDate } from '../../utils/date';
import { AdminTableSkeleton } from '../../components/admin/AdminSkeleton';
import { AdminErrorState } from '../../components/admin/AdminErrorState';
import { SEOHead } from '../../components/layout/SEOHead';
import { useAuth } from '../../auth/useAuth';

const ROLE_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  admin: { label: 'Administrator', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  staff: { label: 'Staff Member', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  manager: { label: 'Manager', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  sales: { label: 'Sales Engineer', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  editor: { label: 'Editor', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  viewer: { label: 'Viewer', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

export const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'staff' as UserRole,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState<{
    fullName: string;
    role: UserRole;
    active: boolean;
  }>({
    fullName: '',
    role: 'staff',
    active: true,
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Deactivate / Delete Modal State
  const [managingUser, setManagingUser] = useState<Profile | null>(null);
  const [userDeps, setUserDeps] = useState<{
    enquiriesCount: number;
    followupsCount: number;
    hasDependencies: boolean;
  } | null>(null);
  const [isCheckingDeps, setIsCheckingDeps] = useState(false);
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const [actionModalError, setActionModalError] = useState<string | null>(null);
  const [showHardDeleteConfirm, setShowHardDeleteConfirm] = useState(false);

  // Action status notification message
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const filters: UserFilters = {
      search: search || undefined,
      role: roleFilter !== 'all' ? roleFilter : undefined,
      active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      sortBy: 'created_at',
      sortOrder: 'desc',
    };

    const res = await userService.getUsers(filters);

    if (res.error) {
      setError(res.error);
    } else {
      setUsers(res.users);
      setTotal(res.total);
    }

    setIsLoading(false);
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Open Edit Modal
  const handleOpenEdit = (user: Profile) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.full_name || '',
      role: user.role,
      active: user.active,
    });
    setEditError(null);
  };

  // Submit Edit Form
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editForm.fullName.trim()) {
      setEditError('Full name cannot be blank.');
      return;
    }

    // Protection: Prevent logged-in user from demoting themselves or deactivating self
    const isSelf = currentUser?.id === editingUser.id;
    if (isSelf && editForm.role !== 'admin') {
      setEditError('You cannot revoke your own Administrator role.');
      return;
    }
    if (isSelf && !editForm.active) {
      setEditError('You cannot deactivate your own active session.');
      return;
    }

    setIsSavingEdit(true);
    setEditError(null);

    const res = await userService.updateUser(
      editingUser.id,
      {
        fullName: editForm.fullName.trim(),
        role: editForm.role,
        active: editForm.active,
      },
      editingUser
    );

    setIsSavingEdit(false);

    if (res.error) {
      setEditError('Unable to update user profile. Please verify network connectivity and valid permissions.');
    } else {
      setEditingUser(null);
      setActionSuccess(`User profile for ${editForm.fullName.trim() || editingUser.email} updated successfully.`);
      setTimeout(() => setActionSuccess(null), 3500);
      fetchUsers();
    }
  };

  // Open Deactivate / Delete Modal
  const handleOpenManage = async (user: Profile) => {
    setManagingUser(user);
    setUserDeps(null);
    setIsCheckingDeps(true);
    setActionModalError(null);
    setShowHardDeleteConfirm(false);

    const deps = await userService.getUserDependencies(user.id);
    setUserDeps(deps);
    setIsCheckingDeps(false);
  };

  // Execute Toggle Active Status
  const handleToggleActiveFromModal = async () => {
    if (!managingUser) return;

    if (currentUser?.id === managingUser.id && managingUser.active) {
      setActionModalError('You cannot deactivate your own active administrator account.');
      return;
    }

    setIsPerformingAction(true);
    setActionModalError(null);

    const res = await userService.toggleUserStatus(managingUser.id, !managingUser.active);
    setIsPerformingAction(false);

    if (res.error) {
      setActionModalError('Failed to change user account status.');
    } else {
      const newStatusText = managingUser.active ? 'deactivated' : 'activated';
      setActionSuccess(`Account for ${managingUser.full_name || managingUser.email} successfully ${newStatusText}.`);
      setTimeout(() => setActionSuccess(null), 3500);
      setManagingUser(null);
      fetchUsers();
    }
  };

  // Execute Permanent Delete (Allowed only if 0 dependencies)
  const handlePermanentDelete = async () => {
    if (!managingUser) return;

    if (currentUser?.id === managingUser.id) {
      setActionModalError('You cannot delete your own active administrator account.');
      return;
    }

    if (userDeps?.hasDependencies) {
      setActionModalError('Permanent deletion is blocked: historical CRM records reference this user.');
      return;
    }

    setIsPerformingAction(true);
    setActionModalError(null);

    const res = await userService.deleteUser(
      managingUser.id,
      managingUser.email,
      managingUser.full_name || undefined
    );

    setIsPerformingAction(false);

    if (res.error) {
      setActionModalError(res.error);
    } else {
      setActionSuccess(`User account ${managingUser.email} permanently removed.`);
      setTimeout(() => setActionSuccess(null), 3500);
      setManagingUser(null);
      fetchUsers();
    }
  };

  // Submit Create Staff User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.fullName.trim() || !createForm.email.trim()) {
      setCreateError('Full name and email are required.');
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    const res = await userService.createStaffUser({
      fullName: createForm.fullName.trim(),
      email: createForm.email.trim(),
      password: createForm.password.trim() || undefined,
      role: createForm.role,
    });

    setIsCreating(false);

    if (res.error) {
      setCreateError(res.error);
    } else {
      setShowCreateModal(false);
      setCreateForm({ fullName: '', email: '', password: '', role: 'staff' });
      setActionSuccess('New staff user created successfully.');
      setTimeout(() => setActionSuccess(null), 3000);
      fetchUsers();
    }
  };

  const activeCount = users.filter(u => u.active).length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const staffCount = users.filter(u => u.role === 'staff' || u.role === 'sales' || u.role === 'manager').length;

  return (
    <>
      <SEOHead
        title="User & Staff Management | Akira Precision Automation LLP"
        description="Administrative personnel management and role-based access control."
      />

      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
                <Users className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-industrial-dark font-heading">
                Staff & User Management
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Provision staff accounts, govern CRM role assignments, and manage account lifecycles.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchUsers()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
              title="Refresh users"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-industrial-dark text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5 text-sky-400" />
              Create Staff User
            </button>
          </div>
        </div>

        {/* Action success banner */}
        {actionSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Users</span>
            <p className="text-xl font-bold font-mono text-industrial-dark mt-0.5">{total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Active Staff</span>
            <p className="text-xl font-bold font-mono text-emerald-700 mt-0.5">{staffCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider">Administrators</span>
            <p className="text-xl font-bold font-mono text-sky-700 mt-0.5">{adminCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Accounts</span>
            <p className="text-xl font-bold font-mono text-industrial-dark mt-0.5">{activeCount}</p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search staff by name or email..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value as UserRole | 'all')}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="all">All Roles</option>
                <option value="staff">Staff Only</option>
                <option value="admin">Administrators Only</option>
                <option value="sales">Sales Only</option>
                <option value="manager">Managers Only</option>
                <option value="editor">Editors Only</option>
                <option value="viewer">Viewers Only</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Accounts</option>
                <option value="inactive">Inactive Accounts</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Content */}
        {isLoading ? (
          <AdminTableSkeleton />
        ) : error ? (
          <AdminErrorState
            title="Unable to Load Users"
            message={error}
            onRetry={fetchUsers}
          />
        ) : users.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 font-heading">No Users Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No staff or administrator profiles matched the active search and filter criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Access Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Registered</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {users.map(u => {
                    const roleStyle = ROLE_STYLES[u.role] || ROLE_STYLES.viewer;
                    const initials = (u.full_name || u.email)
                      .split(' ')
                      .map(p => p[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();
                    const isSelf = currentUser?.id === u.id;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-[11px]">
                              {initials}
                            </div>
                            <div>
                              <div className="font-semibold text-industrial-dark flex items-center gap-1.5">
                                <span>{u.full_name || 'Unnamed Staff'}</span>
                                {isSelf && (
                                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                ID: {u.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          {u.email}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                          >
                            {u.role === 'admin' ? (
                              <ShieldCheck className="w-3 h-3 text-sky-600" />
                            ) : (
                              <Shield className="w-3 h-3 text-slate-400" />
                            )}
                            {roleStyle.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                              u.active ? 'text-emerald-700' : 'text-slate-400'
                            }`}
                          >
                            {u.active ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            {u.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {formatDate(u.created_at)}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {formatDate(u.updated_at || u.created_at)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {/* Edit Action Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(u)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
                              title="Edit user details"
                            >
                              <Edit3 className="w-3 h-3 text-slate-500" />
                              <span>Edit</span>
                            </button>

                            {/* Deactivate / Delete Action Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenManage(u)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-colors shadow-2xs ${
                                u.active
                                  ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              }`}
                              title={u.active ? 'Deactivate or delete account' : 'Reactivate account'}
                            >
                              {u.active ? (
                                <>
                                  <UserX className="w-3 h-3 text-rose-500" />
                                  <span>Manage</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3 h-3 text-emerald-600" />
                                  <span>Manage</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Card Stack View */}
            <div className="lg:hidden space-y-3">
              {users.map(u => {
                const roleStyle = ROLE_STYLES[u.role] || ROLE_STYLES.viewer;
                const isSelf = currentUser?.id === u.id;

                return (
                  <div key={u.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-industrial-dark flex items-center gap-1.5">
                          <span>{u.full_name || 'Unnamed Staff'}</span>
                          {isSelf && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {u.email}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                      >
                        {roleStyle.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span>Registered {formatDate(u.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="px-2.5 py-1 text-[11px] font-medium rounded border border-slate-200 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenManage(u)}
                          className={`px-2.5 py-1 text-[11px] font-medium rounded border inline-flex items-center gap-1 ${
                            u.active
                              ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {u.active ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                          <span>Manage</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 1. Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
                    <Edit3 className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-industrial-dark font-heading">
                      Edit User Profile
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {editingUser.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {editError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={e => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter full display name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">Business Email</label>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-normal">
                      <Info className="w-3 h-3 text-slate-400" />
                      Read-only (Auth identity)
                    </span>
                  </div>
                  <input
                    type="email"
                    disabled
                    value={editingUser.email}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-mono cursor-not-allowed text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Email updates must be initiated via Supabase Authentication identity provider to prevent credential desync.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Access Role</label>
                  <select
                    value={editForm.role}
                    onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                    disabled={currentUser?.id === editingUser.id}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="staff">Staff Member (Restricted to Assigned Tasks)</option>
                    <option value="admin">Administrator (Full System & RBAC Governance)</option>
                    <option value="sales">Sales Engineer</option>
                    <option value="manager">Manager</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer (Read-only)</option>
                  </select>
                  {currentUser?.id === editingUser.id && (
                    <p className="text-[10px] text-amber-600 mt-1">
                      Self-demotion protection: Administrator role cannot be removed from active session.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Account Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={currentUser?.id === editingUser.id && !editForm.active}
                      onClick={() => setEditForm(prev => ({ ...prev, active: true }))}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        editForm.active
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-xs'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Active</span>
                    </button>
                    <button
                      type="button"
                      disabled={currentUser?.id === editingUser.id}
                      onClick={() => setEditForm(prev => ({ ...prev, active: false }))}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        !editForm.active
                          ? 'border-rose-300 bg-rose-50 text-rose-700 shadow-xs'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Inactive</span>
                    </button>
                  </div>
                  {currentUser?.id === editingUser.id && (
                    <p className="text-[10px] text-amber-600 mt-1">
                      You cannot deactivate your own current administrator account.
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-4 py-2 rounded-lg bg-industrial-dark text-white hover:bg-slate-800 font-semibold inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {isSavingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. Deactivate / Delete Confirmation Modal */}
        {managingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg ${managingUser.active ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {managingUser.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-industrial-dark font-heading">
                      {managingUser.active ? 'Deactivate or Delete User' : 'Reactivate User Account'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {managingUser.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setManagingUser(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {actionModalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{actionModalError}</span>
                </div>
              )}

              {/* User Identity Snapshot Card */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target User:</span>
                  <span className="font-semibold text-slate-800">{managingUser.full_name || 'Unnamed'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email Address:</span>
                  <span className="font-mono text-slate-700">{managingUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Role:</span>
                  <span className="font-semibold uppercase text-slate-700">{managingUser.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className={`font-semibold ${managingUser.active ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {managingUser.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Dependency Check Section */}
              {isCheckingDeps ? (
                <div className="p-4 text-center space-y-2">
                  <Loader2 className="w-5 h-5 text-sky-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">Inspecting database relationships & CRM assignments...</p>
                </div>
              ) : userDeps?.hasDependencies ? (
                /* Has historical assignments: Enforce deactivation to preserve foreign keys */
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
                  <div className="flex items-center gap-2 font-semibold text-amber-800">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Historical Activity Detected</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800/90">
                    This user is referenced by <strong>{userDeps.enquiriesCount}</strong> enquiry assignments and <strong>{userDeps.followupsCount}</strong> scheduled follow-up records.
                  </p>
                  <p className="text-[11px] leading-relaxed text-amber-800/90">
                    <strong>Recommended Approach:</strong> Deactivate the account to immediately block login access while keeping audit logs and customer history intact.
                  </p>
                </div>
              ) : (
                /* No historical records */
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Info className="w-3.5 h-3.5 text-sky-600" />
                    <span>No CRM Assignments Found</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    This user has 0 assigned enquiries and 0 follow-up tasks. You can safely deactivate or permanently delete this profile.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {/* Primary Action: Deactivate / Reactivate */}
                <button
                  type="button"
                  onClick={handleToggleActiveFromModal}
                  disabled={isPerformingAction || (currentUser?.id === managingUser.id && managingUser.active)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors shadow-xs ${
                    managingUser.active
                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  } disabled:opacity-50`}
                >
                  {isPerformingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {managingUser.active ? (
                    <>
                      <UserX className="w-4 h-4" />
                      <span>Deactivate User Account (Recommended)</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Reactivate User Account</span>
                    </>
                  )}
                </button>

                {/* Secondary Action: Permanent Delete */}
                {managingUser.active && !userDeps?.hasDependencies && (
                  <>
                    {!showHardDeleteConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowHardDeleteConfirm(true)}
                        disabled={isPerformingAction || currentUser?.id === managingUser.id}
                        className="w-full py-2 px-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-medium transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Permanent Delete Options...</span>
                      </button>
                    ) : (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                        <p className="text-[11px] font-semibold text-rose-900">
                          Confirm permanent deletion of {managingUser.email}? This cannot be undone.
                        </p>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowHardDeleteConfirm(false)}
                            className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white text-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handlePermanentDelete}
                            disabled={isPerformingAction}
                            className="px-3 py-1 text-xs font-semibold bg-rose-600 text-white rounded hover:bg-rose-700 inline-flex items-center gap-1 shadow-xs"
                          >
                            {isPerformingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            <span>Permanently Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Cancel button */}
                <button
                  type="button"
                  onClick={() => setManagingUser(null)}
                  className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors text-center"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Create Staff User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-sky-600" />
                  <h3 className="text-sm font-bold text-industrial-dark font-heading">
                    Create Assigned Staff User
                  </h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {createError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={createForm.fullName}
                    onChange={e => setCreateForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="e.g. Suresh Patel"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Business Email</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={e => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="suresh@akiraautomation.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Temporary Password <span className="text-slate-400 font-normal">(Optional, defaults to AkiraStaff@2026)</span>
                  </label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={e => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={createForm.role}
                    onChange={e => setCreateForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="staff">Staff Member (Restricted to Assigned Tasks)</option>
                    <option value="sales">Sales Engineer</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator (Full System Access)</option>
                  </select>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2 rounded-lg bg-industrial-dark text-white hover:bg-slate-800 font-semibold inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Create Staff Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
