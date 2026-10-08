import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminAttendance } from './AdminAttendance';
import { attendanceService, StaffWithAttendanceStatus } from '../../services/attendanceService';

const mockStaffAttendance: StaffWithAttendanceStatus[] = [
  {
    id: 'staff-001',
    email: 'karan@akira.com',
    full_name: 'Karan Sharma',
    role: 'staff',
    attendanceStatus: 'present',
    todayAttendance: {
      id: 'att-1',
      staff_id: 'staff-001',
      work_date: '2026-09-26',
      clock_in_at: '2026-09-26T09:00:00Z',
      clock_out_at: null,
      clock_in_lat: 18.5204,
      clock_in_lng: 73.8567,
      clock_in_address: 'Pune Metrology Facility',
      clock_out_lat: null,
      clock_out_lng: null,
      clock_out_address: null,
      status: 'present',
      notes: null,
      created_at: '2026-09-26T09:00:00Z',
      updated_at: '2026-09-26T09:00:00Z',
    },
  },
  {
    id: 'staff-002',
    email: 'ananya@akira.com',
    full_name: 'Ananya Verma',
    role: 'sales',
    attendanceStatus: 'on_field',
    todayAttendance: {
      id: 'att-2',
      staff_id: 'staff-002',
      work_date: '2026-09-26',
      clock_in_at: '2026-09-26T09:30:00Z',
      clock_out_at: null,
      clock_in_lat: 18.6298,
      clock_in_lng: 73.7997,
      clock_in_address: 'Bhosari Industrial Estate',
      clock_out_lat: null,
      clock_out_lng: null,
      clock_out_address: null,
      status: 'on_field',
      notes: 'Customer air plug gauge calibration trial',
      created_at: '2026-09-26T09:30:00Z',
      updated_at: '2026-09-26T09:30:00Z',
    },
  },
];

describe('AdminAttendance Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders staff attendance roster and KPI cards with HeroUI components', async () => {
    vi.spyOn(attendanceService, 'getActiveStaffWithAttendance').mockResolvedValue(mockStaffAttendance);

    render(
      <MemoryRouter>
        <AdminAttendance />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Karan Sharma').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Ananya Verma').length).toBeGreaterThan(0);
      expect(screen.getAllByText('karan@akira.com').length).toBeGreaterThan(0);
      expect(screen.getAllByText('ananya@akira.com').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Present').length).toBeGreaterThan(0);
      expect(screen.getAllByText('On Field').length).toBeGreaterThan(0);
    });

    expect(screen.getByText('Total Staff')).toBeInTheDocument();
    expect(screen.getByText('Staff Attendance & Field Tracking')).toBeInTheDocument();
  });

  it('uses a HeroUI date picker and switches from the table to cards on small screens', async () => {
    vi.spyOn(attendanceService, 'getActiveStaffWithAttendance').mockResolvedValue(mockStaffAttendance);

    const { container } = render(
      <MemoryRouter>
        <AdminAttendance />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Karan Sharma').length).toBeGreaterThan(0);
    });

    const desktopTable = container.querySelector('.hidden.lg\\:block');
    const mobileCards = container.querySelector('.grid.gap-3.lg\\:hidden');
    const filters = container.querySelector('.attendance-filters');
    const searchInput = screen.getByPlaceholderText('Search staff name, email, or role...');
    const statusTrigger = screen.getByRole('button', { name: /Filter by Working Status/ });
    const selectedStatus = container.querySelector('.select__value');
    const dateInput = container.querySelector(
      '[role="group"][aria-label*="Attendance date"]',
    );

    expect(screen.getByRole('group', { name: /Attendance date/i })).toBeInTheDocument();
    expect(filters).toHaveClass('grid-cols-1', 'lg:grid-cols-[minmax(0,1fr)_auto]');
    expect(filters).toHaveTextContent('All Working Statuses');
    expect(searchInput).toHaveClass('h-9');
    expect(statusTrigger).toHaveClass('h-9', 'items-center');
    expect(selectedStatus).toHaveClass('flex', 'items-center');
    expect(dateInput).toHaveClass('date-input-group--secondary');
    expect(desktopTable).toBeInTheDocument();
    expect(desktopTable).toHaveClass('hidden', 'lg:block');
    expect(mobileCards).toBeInTheDocument();
    expect(mobileCards).toHaveClass('lg:hidden');
    expect(mobileCards).toHaveTextContent('GPS Verified');
  });

  it('renders empty message when no staff match filter criteria', async () => {
    vi.spyOn(attendanceService, 'getActiveStaffWithAttendance').mockResolvedValue([]);

    render(
      <MemoryRouter>
        <AdminAttendance />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/No staff attendance records matched your filter criteria/).length).toBeGreaterThan(0);
    });
  });
});
