import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  Table,
  Chip,
  Button,
  Input,
  Select,
  ListBox,
  DatePicker,
  DateField,
  Calendar as HeroCalendar,
} from '@heroui/react';
import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Search,
  ExternalLink,
  Users,
  Navigation,
  ShieldCheck,
} from 'lucide-react';
import {
  Circle,
  CircleCheck,
  CircleDashed,
  CircleExclamation,
  LocationArrow,
} from '@gravity-ui/icons';
import { attendanceService, StaffWithAttendanceStatus } from '../../services/attendanceService';
import { StaffAttendance } from '../../types/database';
import { SEOHead } from '../../components/layout/SEOHead';

const STATUS_OPTIONS = [
  { id: 'all', label: 'All Working Statuses', Icon: CircleDashed, iconClass: 'text-slate-500' },
  { id: 'present', label: 'Present', Icon: CircleCheck, iconClass: 'text-emerald-600' },
  { id: 'on_field', label: 'On Field', Icon: LocationArrow, iconClass: 'text-amber-600' },
  { id: 'clocked_out', label: 'Clocked Out', Icon: Circle, iconClass: 'text-slate-500' },
  { id: 'not_reported', label: 'Not Reported', Icon: CircleExclamation, iconClass: 'text-rose-600' },
] as const;

const ATTENDANCE_STATUS_CONFIG = {
  present: {
    label: 'Present',
    color: 'success' as const,
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  on_field: {
    label: 'On Field',
    color: 'warning' as const,
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  clocked_out: {
    label: 'Clocked Out',
    color: 'default' as const,
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  },
  not_reported: {
    label: 'Not Reported',
    color: 'danger' as const,
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
};

export const AdminAttendance: React.FC = () => {
  const [staffData, setStaffData] = useState<StaffWithAttendanceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | 'present' | 'on_field' | 'clocked_out' | 'not_reported'
  >('all');
  const [selectedDate, setSelectedDate] = useState(() =>
    today(getLocalTimeZone()).toString(),
  );
  const isToday = selectedDate === today(getLocalTimeZone()).toString();

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
            <Button
              variant="outline"
              size="sm"
              onPress={fetchAttendanceData}
              onClick={fetchAttendanceData}
              isDisabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              aria-label="Refresh attendance roster"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Roster</span>
            </Button>
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
          <Card className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Staff</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900">{stats.total}</div>
          </Card>

          <Card className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Present</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-emerald-900">{stats.present}</div>
          </Card>

          <Card className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">On Field</span>
              <Navigation className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-amber-900">{stats.onField}</div>
          </Card>

          <Card className="bg-slate-100 p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Clocked Out</span>
              <CheckCircle2 className="w-4 h-4 text-slate-500" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-700">{stats.clockedOut}</div>
          </Card>

          <Card className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Not Reported</span>
              <AlertCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-rose-900">{stats.notReported}</div>
          </Card>
        </div>

        {/* Filters Bar */}
        <Card className="attendance-filters grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs sm:p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="grid min-w-0 grid-cols-1 items-end gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(240px,288px)]">
            {/* Search Input */}
            <div className="relative flex min-w-0 items-center">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Search staff name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="secondary"
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/60 py-1.5 pl-8 pr-3 font-sans text-xs focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            {/* Status Filter */}
            <div className="min-w-0">
              <Select
                value={selectedStatus}
                onChange={(val) =>
                  setSelectedStatus(
                    (STATUS_OPTIONS.some((option) => option.id === val)
                      ? val
                      : 'all') as typeof selectedStatus,
                  )
                }
                className="w-full"
                aria-label="Filter by Working Status"
              >
                <Select.Trigger className="flex h-9 w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
                  <Select.Value className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-xs font-medium text-slate-700 [&>span]:min-w-0 [&>span]:truncate" />
                  <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                </Select.Trigger>
                <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[180px]">
                  <ListBox className="outline-none space-y-0.5">
                    {STATUS_OPTIONS.map(({ id, label, Icon, iconClass }) => (
                      <ListBox.Item
                        key={id}
                        id={id}
                        textValue={label}
                        className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${iconClass}`} />
                        <span className="flex-1">{label}</span>
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
          </div>

          {/* Date Selector */}
          <div className="flex min-w-0 flex-col gap-2 lg:w-auto lg:flex-row lg:items-end">
            <DatePicker
              className="w-full min-w-0 lg:w-72"
              value={parseDate(selectedDate)}
              onChange={(value) => {
                if (value) setSelectedDate(value.toString());
              }}
              aria-label="Attendance date"
            >
              {/* <Label className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                <Calendar className="h-3.5 w-3.5" /> Date
              </Label> */}
              <DateField.Group fullWidth variant="secondary">
                <DateField.Input>
                  {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Input>
                <DateField.Suffix>
                  <DatePicker.Trigger>
                    <DatePicker.TriggerIndicator />
                  </DatePicker.Trigger>
                </DateField.Suffix>
              </DateField.Group>
              <DatePicker.Popover>
                <HeroCalendar aria-label="Choose attendance date">
                  <HeroCalendar.Header>
                    <HeroCalendar.YearPickerTrigger>
                      <HeroCalendar.YearPickerTriggerHeading />
                      <HeroCalendar.YearPickerTriggerIndicator />
                    </HeroCalendar.YearPickerTrigger>
                    <HeroCalendar.NavButton slot="previous" />
                    <HeroCalendar.NavButton slot="next" />
                  </HeroCalendar.Header>
                  <HeroCalendar.Grid>
                    <HeroCalendar.GridHeader>
                      {(day) => <HeroCalendar.HeaderCell>{day}</HeroCalendar.HeaderCell>}
                    </HeroCalendar.GridHeader>
                    <HeroCalendar.GridBody>
                      {(date) => <HeroCalendar.Cell date={date} />}
                    </HeroCalendar.GridBody>
                  </HeroCalendar.Grid>
                  <HeroCalendar.YearPickerGrid>
                    <HeroCalendar.YearPickerGridBody>
                      {({ year }) => <HeroCalendar.YearPickerCell year={year} />}
                    </HeroCalendar.YearPickerGridBody>
                  </HeroCalendar.YearPickerGrid>
                </HeroCalendar>
              </DatePicker.Popover>
            </DatePicker>
            {!isToday && (
              <Button
                variant="ghost"
                size="sm"
                onPress={() => setSelectedDate(today(getLocalTimeZone()).toString())}
                onClick={() => setSelectedDate(today(getLocalTimeZone()).toString())}
                className="mb-0.5 px-2 py-1 text-xs text-sky-600 hover:text-sky-700 font-semibold cursor-pointer h-auto min-w-0"
              >
                Today
              </Button>
            )}
          </div>
        </Card>

        {/* Staff Attendance Roster Table */}
        <div className="hidden lg:block">
          <Table className="w-full">
            <Table.ScrollContainer >
              <Table.Content aria-label="Staff Attendance Roster" >
                <Table.Header >
                  <Table.Column isRowHeader className="py-3 px-4">Staff Member</Table.Column>
                  <Table.Column className="min-w-[132px] whitespace-nowrap py-3 px-4">Status</Table.Column>
                  <Table.Column className="py-3 px-4">Clock In (GPS / Location)</Table.Column>
                  <Table.Column className="py-3 px-4">Clock Out (GPS / Location)</Table.Column>
                  <Table.Column className="py-3 px-4">Duration</Table.Column>
                  <Table.Column className="py-3 px-4 text-right">Audit Verification</Table.Column>
                </Table.Header>
                <Table.Body >
                  {filteredStaff.length === 0 ? (
                    <Table.Row>
                      <Table.Cell  colSpan={6}>
                        No staff attendance records matched your filter criteria.
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    filteredStaff.map((staff) => {
                      const att = staff.todayAttendance;
                      const statusConfig = ATTENDANCE_STATUS_CONFIG[staff.attendanceStatus];

                      return (
                        <Table.Row key={staff.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Staff Details */}
                          <Table.Cell className="whitespace-nowrap py-3 px-4">
                            <div className="font-semibold text-slate-900">{staff.full_name || 'Staff Member'}</div>
                            <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
                              <span>{staff.email}</span>
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] uppercase font-mono text-slate-600">
                                {staff.role}
                              </span>
                            </div>
                          </Table.Cell>

                          {/* Status Badge */}
                          <Table.Cell className="py-3 px-4">
                            <Chip
                              size="sm"
                              variant="soft"
                              color={statusConfig.color}
                              className={`inline-flex max-w-full shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${statusConfig.bg}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                              <span>{statusConfig.label}</span>
                            </Chip>
                          </Table.Cell>

                          {/* Clock In */}
                          <Table.Cell className="py-3 px-4">
                            {att?.clock_in_at ? (
                              <div className="space-y-0.5">
                                <div className="font-mono font-semibold text-slate-800">
                                  {new Date(att.clock_in_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                                {att.clock_in_lat && att.clock_in_lng ? (
                                  <div>
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
                                    {att.clock_in_address && (
                                      <p className="text-[10px] text-slate-500 truncate max-w-[200px]" title={att.clock_in_address}>
                                        {att.clock_in_address}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400">Office / Web Portal</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </Table.Cell>

                          {/* Clock Out */}
                          <Table.Cell className="py-3 px-4">
                            {att?.clock_out_at ? (
                              <div className="space-y-0.5">
                                <div className="font-mono font-semibold text-slate-800">
                                  {new Date(att.clock_out_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                                {att.clock_out_lat && att.clock_out_lng ? (
                                  <div>
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
                                    {att.clock_out_address && (
                                      <p className="text-[10px] text-slate-500 truncate max-w-[200px]" title={att.clock_out_address}>
                                        {att.clock_out_address}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400">Office / Web Portal</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">
                                {staff.attendanceStatus === 'not_reported' ? '—' : 'Active'}
                              </span>
                            )}
                          </Table.Cell>

                          {/* Duration */}
                          <Table.Cell className="py-3 px-4 font-mono font-medium text-slate-700">
                            {calculateDuration(att?.clock_in_at, att?.clock_out_at)}
                          </Table.Cell>

                          {/* Audit Verification */}
                          <Table.Cell className="py-3 px-4 text-right">
                            {att ? (
                              att.clock_in_lat && att.clock_in_lng ? (
                                <Chip
                                  size="sm"
                                  variant="soft"
                                  color="success"
                                  className="inline-flex max-w-full shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                                >
                                  <ShieldCheck className="w-3 h-3 text-emerald-600 inline mr-1" />
                                  GPS Verified
                                </Chip>
                              ) : (
                                <Chip
                                  size="sm"
                                  variant="soft"
                                  color="default"
                                  className="inline-flex max-w-full shrink-0 items-center gap-1 whitespace-nowrap text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
                                >
                                  Web Portal
                                </Chip>
                              )
                            ) : (
                              <span className="text-slate-400 text-[11px]">Unrecorded</span>
                            )}
                          </Table.Cell>
                        </Table.Row>
                      );
                    })
                  )}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </div>

        {/* Mobile and tablet attendance cards */}
        <div className="grid gap-3 lg:hidden">
          {filteredStaff.length === 0 ? (
            <Card className="p-6 text-center text-sm text-slate-500">
              No staff attendance records matched your filter criteria.
            </Card>
          ) : (
            filteredStaff.map((staff) => {
              const att = staff.todayAttendance;
              const statusConfig = ATTENDANCE_STATUS_CONFIG[staff.attendanceStatus];

              return (
                <Card
                  key={staff.id}
                  className="min-w-0 space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {staff.full_name || 'Staff Member'}
                      </p>
                      <p className="break-all text-xs text-slate-500">{staff.email}</p>
                      <span className="mt-1 inline-flex rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase text-slate-600">
                        {staff.role}
                      </span>
                    </div>
                    <Chip
                      size="sm"
                      variant="soft"
                      color={statusConfig.color}
                      className={`inline-flex max-w-[45%] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusConfig.bg}`}
                    >
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusConfig.dot}`} />
                      <span>{statusConfig.label}</span>
                    </Chip>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Clock In</p>
                      {att?.clock_in_at ? (
                        <>
                          <p className="mt-1 font-mono font-semibold text-slate-800">
                            {new Date(att.clock_in_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {att.clock_in_lat != null && att.clock_in_lng != null ? (
                            <div>
                              <a
                                href={`https://www.google.com/maps?q=${att.clock_in_lat},${att.clock_in_lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-flex max-w-full items-center gap-1 text-[10px] text-sky-600"
                              >
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">
                                  {att.clock_in_lat.toFixed(4)}, {att.clock_in_lng.toFixed(4)}
                                </span>
                                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                              </a>
                              {att.clock_in_address && (
                                <p className="text-[10px] text-slate-500 truncate" title={att.clock_in_address}>
                                  {att.clock_in_address}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="mt-1 text-[10px] text-slate-400">Office / Web Portal</p>
                          )}
                        </>
                      ) : (
                        <p className="mt-1 text-slate-400">—</p>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Clock Out</p>
                      {att?.clock_out_at ? (
                        <>
                          <p className="mt-1 font-mono font-semibold text-slate-800">
                            {new Date(att.clock_out_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {att.clock_out_lat != null && att.clock_out_lng != null ? (
                            <div>
                              <a
                                href={`https://www.google.com/maps?q=${att.clock_out_lat},${att.clock_out_lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-flex max-w-full items-center gap-1 text-[10px] text-sky-600"
                              >
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">
                                  {att.clock_out_lat.toFixed(4)}, {att.clock_out_lng.toFixed(4)}
                                </span>
                                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                              </a>
                              {att.clock_out_address && (
                                <p className="text-[10px] text-slate-500 truncate" title={att.clock_out_address}>
                                  {att.clock_out_address}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="mt-1 text-[10px] text-slate-400">Office / Web Portal</p>
                          )}
                        </>
                      ) : (
                        <p className="mt-1 text-slate-400">
                          {staff.attendanceStatus === 'not_reported' ? '—' : 'Active'}
                        </p>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Duration</p>
                      <p className="mt-1 font-mono font-medium text-slate-700">
                        {calculateDuration(att?.clock_in_at, att?.clock_out_at)}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Audit Verification</p>
                      <p className="mt-1 inline-flex max-w-full items-center gap-1 text-xs text-slate-600">
                        {att ? (
                          att.clock_in_lat != null && att.clock_in_lng != null ? (
                            <>
                              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                              <span className="truncate">GPS Verified</span>
                            </>
                          ) : (
                            'Web Portal'
                          )
                        ) : (
                          'Unrecorded'
                        )}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default AdminAttendance;
