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
import { Button, Card, Chip, Table, Modal, Select, ListBox, Input, Label } from '@heroui/react';

const ROLE_STYLES: Record<string, { label: string; color: "accent" | "success" | "warning" | "danger" | "default"; bg: string; text: string; border: string }> = {
  admin: { label: 'Administrator', color: 'accent', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  staff: { label: 'Staff Member', color: 'success', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  manager: { label: 'Manager', color: 'accent', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  sales: { label: 'Sales Engineer', color: 'warning', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  editor: { label: 'Editor', color: 'accent', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  viewer: { label: 'Viewer', color: 'default', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
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
        title="User & Staff Management | Akira Precision Automation"
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
            <Button
              variant="outline"
              size="sm"
              onPress={() => fetchUsers()}
              onClick={() => fetchUsers()}
              isDisabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              aria-label="Refresh users"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onPress={() => setShowCreateModal(true)}
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-industrial-dark text-white hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-sky-400" />
              <span>Create Staff User</span>
            </Button>
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
          <Card className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Users</span>
            <p className="text-xl font-bold font-mono text-industrial-dark mt-0.5">{total}</p>
          </Card>
          <Card className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Active Staff</span>
            <p className="text-xl font-bold font-mono text-emerald-700 mt-0.5">{staffCount}</p>
          </Card>
          <Card className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider">Administrators</span>
            <p className="text-xl font-bold font-mono text-sky-700 mt-0.5">{adminCount}</p>
          </Card>
          <Card className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Accounts</span>
            <p className="text-xl font-bold font-mono text-industrial-dark mt-0.5">{activeCount}</p>
          </Card>
        </div>

        {/* Search & Filter Toolbar */}
        <Card className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none z-10" />
              <Input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search staff by name or email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-sans"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-1.5 min-w-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <Select
                value={roleFilter}
                onChange={val => setRoleFilter((val as UserRole | 'all') || 'all')}
                className="w-full"
                aria-label="Filter by role"
              >
                <Select.Trigger className="w-full h-8 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-colors cursor-pointer">
                  <Select.Value className="text-xs font-medium text-slate-700 truncate" />
                  <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                </Select.Trigger>
                <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[170px]">
                  <ListBox className="outline-none space-y-0.5">
                    {[
                      { id: 'all', label: 'All Roles' },
                      { id: 'staff', label: 'Staff Only' },
                      { id: 'admin', label: 'Administrators Only' },
                      { id: 'sales', label: 'Sales Only' },
                      { id: 'manager', label: 'Managers Only' },
                      { id: 'editor', label: 'Editors Only' },
                      { id: 'viewer', label: 'Viewers Only' },
                    ].map(r => (
                      <ListBox.Item
                        key={r.id}
                        id={r.id}
                        textValue={r.label}
                        className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                      >
                        {r.label}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="min-w-0">
              <Select
                value={statusFilter}
                onChange={val => setStatusFilter((val as 'all' | 'active' | 'inactive') || 'all')}
                className="w-full"
                aria-label="Filter by account status"
              >
                <Select.Trigger className="w-full h-8 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-colors cursor-pointer">
                  <Select.Value className="text-xs font-medium text-slate-700 truncate" />
                  <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                </Select.Trigger>
                <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[170px]">
                  <ListBox className="outline-none space-y-0.5">
                    {[
                      { id: 'all', label: 'All Statuses' },
                      { id: 'active', label: 'Active Accounts' },
                      { id: 'inactive', label: 'Inactive Accounts' },
                    ].map(s => (
                      <ListBox.Item
                        key={s.id}
                        id={s.id}
                        textValue={s.label}
                        className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                      >
                        {s.label}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
          </div>
        </Card>

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

              <Table className="w-full">
                <Table.ScrollContainer>
                  <Table.Content aria-label="Staff and User Accounts Table" >
                    <Table.Header >
                      <Table.Column isRowHeader className="py-3 px-4">Staff Member</Table.Column>
                      <Table.Column className="py-3 px-4">Email Address</Table.Column>
                      <Table.Column className="py-3 px-4">Access Role</Table.Column>
                      <Table.Column className="py-3 px-4">Account Status</Table.Column>
                      <Table.Column className="py-3 px-4">Registered</Table.Column>
                      <Table.Column className="py-3 px-4">Last Activity</Table.Column>
                      <Table.Column className="py-3 px-4 text-right">Actions</Table.Column>
                    </Table.Header>
                    <Table.Body >
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
                          <Table.Row key={u.id} className="hover:bg-slate-50/50 transition-colors">
                            <Table.Cell className="py-3 px-4">
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
                            </Table.Cell>
                            <Table.Cell className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                              {u.email}
                            </Table.Cell>
                            <Table.Cell className="py-3 px-4">
                              <Chip
                                variant="soft"
                                color={roleStyle.color}
                                size="sm"
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                              >
                                {u.role === 'admin' ? (
                                  <ShieldCheck className="w-3 h-3 text-sky-600" />
                                ) : (
                                  <Shield className="w-3 h-3 text-slate-400" />
                                )}
                                <Chip.Label>{roleStyle.label}</Chip.Label>
                              </Chip>
                            </Table.Cell>
                            <Table.Cell className="py-3 px-4">
                              <Chip
                                variant="soft"
                                color={u.active ? 'success' : 'default'}
                                size="sm"
                                className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                                  u.active ? 'text-emerald-700' : 'text-slate-400'
                                }`}
                              >
                                {u.active ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5 text-slate-400" />
                                )}
                                <Chip.Label>{u.active ? 'Active' : 'Inactive'}</Chip.Label>
                              </Chip>
                            </Table.Cell>
                            <Table.Cell className="py-3 px-4 text-slate-500 text-[11px]">
                              {formatDate(u.created_at)}
                            </Table.Cell>
                            <Table.Cell className="py-3 px-4 text-slate-400 text-[11px]">
                              {formatDate(u.updated_at || u.created_at)}
                            </Table.Cell>
                            <Table.Cell className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onPress={() => handleOpenEdit(u)}
                                  onClick={() => handleOpenEdit(u)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
                                  aria-label="Edit user details"
                                >
                                  <Edit3 className="w-3 h-3 text-slate-500" />
                                  <span>Edit</span>
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onPress={() => handleOpenManage(u)}
                                  onClick={() => handleOpenManage(u)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-colors shadow-2xs cursor-pointer ${
                                    u.active
                                      ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                                      : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                  }`}
                                  aria-label={u.active ? 'Manage active account' : 'Manage inactive account'}
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
                                </Button>
                              </div>
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                    </Table.Body>
                  </Table.Content>
                </Table.ScrollContainer>
              </Table>
           

            {/* Mobile / Tablet Card Stack View */}
            <div className="lg:hidden space-y-3">
              {users.map(u => {
                const roleStyle = ROLE_STYLES[u.role] || ROLE_STYLES.viewer;
                const isSelf = currentUser?.id === u.id;

                return (
                  <Card key={u.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
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
                      <Chip
                        variant="soft"
                        color={roleStyle.color}
                        size="sm"
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                      >
                        <Chip.Label>{roleStyle.label}</Chip.Label>
                      </Chip>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span>Registered {formatDate(u.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onPress={() => handleOpenEdit(u)}
                          onClick={() => handleOpenEdit(u)}
                          className="px-2.5 py-1 text-[11px] font-medium rounded border border-slate-200 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onPress={() => handleOpenManage(u)}
                          onClick={() => handleOpenManage(u)}
                          className={`px-2.5 py-1 text-[11px] font-medium rounded border inline-flex items-center gap-1 cursor-pointer ${
                            u.active
                              ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {u.active ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                          <span>Manage</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* 1. Edit User Modal */}
        {editingUser && (
          <Modal.Backdrop isOpen={!!editingUser} onOpenChange={(open) => { if (!open) setEditingUser(null); }}>
            <Modal.Container>
            <Card className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
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
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  onPress={() => setEditingUser(null)}
                  onClick={() => setEditingUser(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  aria-label="Close edit modal"
                >
                  <X className="w-4 h-4" />
                </Button>
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
                  <Input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={e => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter full display name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium text-slate-800 text-xs font-sans"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="block font-semibold text-slate-700 text-xs">Business Email</Label>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-normal">
                      <Info className="w-3 h-3 text-slate-400" />
                      Read-only (Auth identity)
                    </span>
                  </div>
                  <Input
                    type="email"
                    disabled
                    value={editingUser.email}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 font-mono cursor-not-allowed text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Email updates must be initiated via Supabase Authentication identity provider to prevent credential desync.
                  </p>
                </div>

                <div>
                  <Label className="block font-semibold text-slate-700 mb-1 text-xs">Assigned Access Role</Label>
                  <Select
                    value={editForm.role}
                    onChange={val => setEditForm(prev => ({ ...prev, role: (val as UserRole) || 'staff' }))}
                    isDisabled={currentUser?.id === editingUser.id}
                    className="w-full"
                    aria-label="Assigned Access Role"
                  >
                    <Select.Trigger className="w-full h-9 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:bg-slate-50 disabled:text-slate-400 transition-colors cursor-pointer">
                      <Select.Value className="text-xs font-medium text-slate-700 truncate" />
                      <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                    </Select.Trigger>
                    <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[280px]">
                      <ListBox className="outline-none space-y-0.5">
                        {[
                          { id: 'staff', label: 'Staff Member (Restricted to Assigned Tasks)' },
                          { id: 'admin', label: 'Administrator (Full System & RBAC Governance)' },
                          { id: 'sales', label: 'Sales Engineer' },
                          { id: 'manager', label: 'Manager' },
                          { id: 'editor', label: 'Editor' },
                          { id: 'viewer', label: 'Viewer (Read-only)' },
                        ].map(r => (
                          <ListBox.Item
                            key={r.id}
                            id={r.id}
                            textValue={r.label}
                            className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                          >
                            {r.label}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  {currentUser?.id === editingUser.id && (
                    <p className="text-[10px] text-amber-600 mt-1">
                      Self-demotion protection: Administrator role cannot be removed from active session.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Account Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={editForm.active ? 'primary' : 'outline'}
                      size="sm"
                      isDisabled={currentUser?.id === editingUser.id && !editForm.active}
                      onPress={() => setEditForm(prev => ({ ...prev, active: true }))}
                      onClick={() => setEditForm(prev => ({ ...prev, active: true }))}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        editForm.active
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-xs'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Active</span>
                    </Button>
                    <Button
                      variant={!editForm.active ? 'danger' : 'outline'}
                      size="sm"
                      isDisabled={currentUser?.id === editingUser.id}
                      onPress={() => setEditForm(prev => ({ ...prev, active: false }))}
                      onClick={() => setEditForm(prev => ({ ...prev, active: false }))}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        !editForm.active
                          ? 'border-rose-300 bg-rose-50 text-rose-700 shadow-xs'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Inactive</span>
                    </Button>
                  </div>
                  {currentUser?.id === editingUser.id && (
                    <p className="text-[10px] text-amber-600 mt-1">
                      You cannot deactivate your own current administrator account.
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setEditingUser(null)}
                    onClick={() => setEditingUser(null)}
                    className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    isDisabled={isSavingEdit}
                    className="px-4 py-2 rounded-lg bg-industrial-dark text-white hover:bg-slate-800 font-semibold inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Changes</span>
                  </Button>
                </div>
              </form>
            </Card>
          </Modal.Container>
        </Modal.Backdrop>
        )}

        {/* 2. Deactivate / Delete Confirmation Modal */}
        {managingUser && (
          <Modal.Backdrop isOpen={!!managingUser} onOpenChange={(open) => { if (!open) setManagingUser(null); }}>
            <Modal.Container>
              <Card className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
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
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  onPress={() => setManagingUser(null)}
                  onClick={() => setManagingUser(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  aria-label="Close manage modal"
                >
                  <X className="w-4 h-4" />
                </Button>
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
                <Button
                  variant={managingUser.active ? 'danger' : 'primary'}
                  size="md"
                  onPress={handleToggleActiveFromModal}
                  onClick={handleToggleActiveFromModal}
                  isDisabled={isPerformingAction || (currentUser?.id === managingUser.id && managingUser.active)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer ${
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
                </Button>

                {/* Secondary Action: Permanent Delete */}
                {managingUser.active && !userDeps?.hasDependencies && (
                  <>
                    {!showHardDeleteConfirm ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onPress={() => setShowHardDeleteConfirm(true)}
                        onClick={() => setShowHardDeleteConfirm(true)}
                        isDisabled={isPerformingAction || currentUser?.id === managingUser.id}
                        className="w-full py-2 px-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-medium transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Permanent Delete Options...</span>
                      </Button>
                    ) : (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                        <p className="text-[11px] font-semibold text-rose-900">
                          Confirm permanent deletion of {managingUser.email}? This cannot be undone.
                        </p>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onPress={() => setShowHardDeleteConfirm(false)}
                            onClick={() => setShowHardDeleteConfirm(false)}
                            className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white text-slate-700 cursor-pointer"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onPress={handlePermanentDelete}
                            onClick={handlePermanentDelete}
                            isDisabled={isPerformingAction}
                            className="px-3 py-1 text-xs font-semibold bg-rose-600 text-white rounded hover:bg-rose-700 inline-flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            {isPerformingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            <span>Permanently Delete</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Cancel button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => setManagingUser(null)}
                  onClick={() => setManagingUser(null)}
                  className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors text-center cursor-pointer"
                >
                  Dismiss
                </Button>
              </div>
            </Card>
          </Modal.Container>
        </Modal.Backdrop>
        )}

        {/* 3. Create Staff User Modal */}
        <Modal.Backdrop isOpen={showCreateModal} onOpenChange={setShowCreateModal}>
          <Modal.Container>
            <Card className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-sky-600" />
                  <h3 className="text-sm font-bold text-industrial-dark font-heading">
                    Create Assigned Staff User
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  onPress={() => setShowCreateModal(false)}
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  aria-label="Close create staff modal"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {createError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
                <div>
                  <Label className="block font-semibold text-slate-700 mb-1 text-xs">Full Name</Label>
                  <Input
                    type="text"
                    required
                    value={createForm.fullName}
                    onChange={e => setCreateForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="e.g. Suresh Patel"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs font-sans"
                  />
                </div>

                <div>
                  <Label className="block font-semibold text-slate-700 mb-1 text-xs">Business Email</Label>
                  <Input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={e => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="suresh@akiraautomation.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs font-sans"
                  />
                </div>

                <div>
                  <Label className="block font-semibold text-slate-700 mb-1 text-xs">
                    Temporary Password <span className="text-slate-400 font-normal">(Optional, defaults to AkiraStaff@2026)</span>
                  </Label>
                  <Input
                    type="password"
                    value={createForm.password}
                    onChange={e => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <Label className="block font-semibold text-slate-700 mb-1 text-xs">Assigned Role</Label>
                  <Select
                    value={createForm.role}
                    onChange={val => setCreateForm(prev => ({ ...prev, role: (val as UserRole) || 'staff' }))}
                    className="w-full"
                    aria-label="Assigned Role"
                  >
                    <Select.Trigger className="w-full h-9 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-colors cursor-pointer">
                      <Select.Value className="text-xs font-medium text-slate-700 truncate" />
                      <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                    </Select.Trigger>
                    <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[280px]">
                      <ListBox className="outline-none space-y-0.5">
                        {[
                          { id: 'staff', label: 'Staff Member (Restricted to Assigned Tasks)' },
                          { id: 'sales', label: 'Sales Engineer' },
                          { id: 'manager', label: 'Manager' },
                          { id: 'admin', label: 'Administrator (Full System Access)' },
                        ].map(r => (
                          <ListBox.Item
                            key={r.id}
                            id={r.id}
                            textValue={r.label}
                            className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                          >
                            {r.label}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setShowCreateModal(false)}
                    onClick={() => setShowCreateModal(false)}
                    className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    isDisabled={isCreating}
                    className="px-4 py-2 rounded-lg bg-industrial-dark text-white hover:bg-slate-800 font-semibold inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Create Staff Member</span>
                  </Button>
                </div>
              </form>
            </Card>
          </Modal.Container>
        </Modal.Backdrop>
      </div>
    </>
  );
};
