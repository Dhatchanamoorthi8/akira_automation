import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Search,
  ExternalLink,
  Users,
  Calendar,
  Navigation,
  ShieldCheck,
} from 'lucide-react';
import { attendanceService, StaffWithAttendanceStatus } from '../../services/attendanceService';
import { StaffAttendance } from '../../types/database';
import { SEOHead } from '../../components/layout/SEOHead';

export const AdminAttendance: React.FC = () => {
  const [staffData, setStaffData] = useState<StaffWithAttendanceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | 'present' | 'on_field' | 'clocked_out' | 'not_reported'
  >('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const isToday = selectedDate === new Date().toISOString().slice(0, 10);

  const fetchAttendanceData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isToday) {
        const liveStaff = await attendanceService.getActiveStaffWithAttendance();
        setStaffData(liveStaff);
      } else {
        const [history, liveStaff] = await Promise.all([
          attendanceService.getAttendanceHistory({ dateFrom: selectedDate, dateTo: selectedDate }),
          attendanceService.getActiveStaffWithAttendance(),
        ]);

        const historyMap = new Map<string, StaffAttendance>();
        history.forEach((h) => historyMap.set(h.staff_id, h));

        const mapped: StaffWithAttendanceStatus[] = liveStaff.map((staff) => {
          const record = historyMap.get(staff.id);
          let status: 'present' | 'on_field' | 'clocked_out' | 'not_reported' = 'not_reported';
          if (record) {
            if (record.clock_out_at) status = 'clocked_out';
            else if (record.status === 'on_field') status = 'on_field';
            else status = 'present';
          }
          return {
            ...staff,
            attendanceStatus: status,
            todayAttendance: record || null,
          };
        });
        setStaffData(mapped);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team attendance.');
    } finally {
      setIsLoading(false);
    }
  }, [isToday, selectedDate]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = staffData.length;
    const present = staffData.filter((s) => s.attendanceStatus === 'present').length;
    const onField = staffData.filter((s) => s.attendanceStatus === 'on_field').length;
    const clockedOut = staffData.filter((s) => s.attendanceStatus === 'clocked_out').length;
    const notReported = staffData.filter((s) => s.attendanceStatus === 'not_reported').length;
    return { total, present, onField, clockedOut, notReported };
  }, [staffData]);

  // Filtered rows
  const filteredStaff = useMemo(() => {
    return staffData.filter((s) => {
      const matchesSearch =
        !searchQuery ||
        s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.role.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === 'all' || s.attendanceStatus === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [staffData, searchQuery, selectedStatus]);

  // Calculate duration string
  const calculateDuration = (clockIn?: string | null, clockOut?: string | null) => {
    if (!clockIn) return '—';
    const start = new Date(clockIn).getTime();
    const end = clockOut ? new Date(clockOut).getTime() : Date.now();
    const diffMins = Math.floor((end - start) / (1000 * 60));
    if (diffMins < 0) return '—';
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m${!clockOut ? ' (In Progress)' : ''}`;
  };

  return (
    <>
      <SEOHead title="Staff Attendance & Field Tracking Audit | Akira Metrology Admin" description="Monitor real-time ERP staff punch-in, field visits, GPS lateral audit verification, and daily work durations." />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 flex items-center gap-2">
              <Clock className="w-6 h-6 text-sky-600" />
              Staff Attendance & Field Tracking
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live ERP presence roster, GPS lateral validation, field inspection tracking, and working durations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAttendanceData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Roster
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Staff</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900">{stats.total}</div>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Present</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-emerald-900">{stats.present}</div>
          </div>

          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">On Field</span>
              <Navigation className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-amber-900">{stats.onField}</div>
          </div>

          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Clocked Out</span>
              <CheckCircle2 className="w-4 h-4 text-slate-500" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-700">{stats.clockedOut}</div>
          </div>

          <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Not Reported</span>
              <AlertCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-rose-900">{stats.notReported}</div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Working Statuses</option>
              <option value="present">🟢 Present</option>
              <option value="on_field">🟡 On Field</option>
              <option value="clocked_out">⚪ Clocked Out</option>
              <option value="not_reported">🔴 Not Reported</option>
            </select>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date:
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
            {!isToday && (
              <button
                type="button"
                onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
                className="px-2 py-1 text-xs text-sky-600 hover:text-sky-700 font-semibold"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* Staff Attendance Roster Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-mono text-[10px] tracking-wider">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Clock In (GPS / Location)</th>
                  <th className="py-3 px-4">Clock Out (GPS / Location)</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-right">Audit Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No staff attendance records matched your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staff) => {
                    const att = staff.todayAttendance;
                    const statusConfig = {
                      present: {
                        label: 'Present',
                        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        dot: 'bg-emerald-500',
                      },
                      on_field: {
                        label: 'On Field',
                        bg: 'bg-amber-50 text-amber-700 border-amber-200',
                        dot: 'bg-amber-500',
                      },
                      clocked_out: {
                        label: 'Clocked Out',
                        bg: 'bg-slate-100 text-slate-700 border-slate-200',
                        dot: 'bg-slate-400',
                      },
                      not_reported: {
                        label: 'Not Reported',
                        bg: 'bg-rose-50 text-rose-700 border-rose-200',
                        dot: 'bg-rose-500',
                      },
                    }[staff.attendanceStatus];

                    return (
                      <tr key={staff.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Staff Details */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{staff.full_name || 'Staff Member'}</div>
                          <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
                            <span>{staff.email}</span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] uppercase font-mono text-slate-600">
                              {staff.role}
                            </span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${statusConfig.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                            {statusConfig.label}
                          </span>
                        </td>

                        {/* Clock In */}
                        <td className="py-3 px-4">
                          {att?.clock_in_at ? (
                            <div className="space-y-0.5">
                              <div className="font-mono font-semibold text-slate-800">
                                {new Date(att.clock_in_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                              {att.clock_in_lat && att.clock_in_lng ? (
                                <a
                                  href={`https://www.google.com/maps?q=${att.clock_in_lat},${att.clock_in_lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-sky-600 hover:text-sky-800 flex items-center gap-1 font-mono"
                                >
                                  <MapPin className="w-3 h-3 shrink-0 text-sky-500" />
                                  <span>
                                    {att.clock_in_lat.toFixed(4)}, {att.clock_in_lng.toFixed(4)}
                                  </span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ) : (
                                <span className="text-[11px] text-slate-400">Office / Web Portal</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Clock Out */}
                        <td className="py-3 px-4">
                          {att?.clock_out_at ? (
                            <div className="space-y-0.5">
                              <div className="font-mono font-semibold text-slate-800">
                                {new Date(att.clock_out_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                              {att.clock_out_lat && att.clock_out_lng ? (
                                <a
                                  href={`https://www.google.com/maps?q=${att.clock_out_lat},${att.clock_out_lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-sky-600 hover:text-sky-800 flex items-center gap-1 font-mono"
                                >
                                  <MapPin className="w-3 h-3 shrink-0 text-sky-500" />
                                  <span>
                                    {att.clock_out_lat.toFixed(4)}, {att.clock_out_lng.toFixed(4)}
                                  </span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ) : (
                                <span className="text-[11px] text-slate-400">Office / Web Portal</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">
                              {staff.attendanceStatus === 'not_reported' ? '—' : 'Active'}
                            </span>
                          )}
                        </td>

                        {/* Duration */}
                        <td className="py-3 px-4 font-mono font-medium text-slate-700">
                          {calculateDuration(att?.clock_in_at, att?.clock_out_at)}
                        </td>

                        {/* Audit Verification */}
                        <td className="py-3 px-4 text-right">
                          {att ? (
                            att.clock_in_lat && att.clock_in_lng ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                GPS Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                Web Portal
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400 text-[11px]">Unrecorded</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminAttendance;
