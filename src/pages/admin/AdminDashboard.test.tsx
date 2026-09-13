import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminDashboard } from './AdminDashboard';
import { analyticsService } from '../../services/analyticsService';
import { dashboardService } from '../../services/dashboardService';

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('11. displays loading skeleton while fetching data', () => {
    vi.spyOn(analyticsService, 'getOverviewStats').mockImplementation(() => new Promise(() => {}));
    vi.spyOn(analyticsService, 'getEnquiryTrend').mockImplementation(() => new Promise(() => {}));
    vi.spyOn(analyticsService, 'getEnquiryStatusSummary').mockImplementation(() => new Promise(() => {}));
    vi.spyOn(analyticsService, 'getStaffWorkload').mockImplementation(() => new Promise(() => {}));
    vi.spyOn(dashboardService, 'getRecentEnquiries').mockImplementation(() => new Promise(() => {}));
    vi.spyOn(dashboardService, 'getUpcomingFollowups').mockImplementation(() => new Promise(() => {}));
    vi.spyOn(dashboardService, 'getRecentActivity').mockImplementation(() => new Promise(() => {}));

    const { container } = render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // Pulse skeletons must be rendered
    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });

  it('12. handles database query error and displays error banner', async () => {
    vi.spyOn(analyticsService, 'getOverviewStats').mockResolvedValue({
      stats: null,
      error: 'Connection failed',
    });
    vi.spyOn(analyticsService, 'getEnquiryTrend').mockResolvedValue({ trend: [], error: null });
    vi.spyOn(analyticsService, 'getEnquiryStatusSummary').mockResolvedValue({ distribution: [], error: null });
    vi.spyOn(analyticsService, 'getStaffWorkload').mockResolvedValue({ workload: [], error: null });
    vi.spyOn(dashboardService, 'getRecentEnquiries').mockResolvedValue([]);
    vi.spyOn(dashboardService, 'getUpcomingFollowups').mockResolvedValue([]);
    vi.spyOn(dashboardService, 'getRecentActivity').mockResolvedValue([]);

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Database Connection Issue/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry Query/i })).toBeInTheDocument();
    });
  });

  it('13. displays friendly empty states when database contains zero records', async () => {
    vi.spyOn(analyticsService, 'getOverviewStats').mockResolvedValue({
      stats: {
        totalEnquiries: 0,
        newEnquiries: 0,
        activeEnquiries: 0,
        convertedEnquiries: 0,
        closedEnquiries: 0,
        totalFollowups: 0,
        completedFollowups: 0,
        cancelledFollowups: 0,
        overdueFollowups: 0,
        dueTodayFollowups: 0,
        upcomingFollowups: 0,
        enquiryConversionRate: 0,
        followupCompletionRate: 0,
        allTimeEnquiries: 0,
        allTimeFollowups: 0,
        activeProducts: 0,
      },
      error: null,
    });
    vi.spyOn(analyticsService, 'getEnquiryTrend').mockResolvedValue({
      trend: [{ date: '2026-09-12', label: 'Sat', count: 0, converted: 0 }],
      error: null,
    });
    vi.spyOn(analyticsService, 'getEnquiryStatusSummary').mockResolvedValue({ distribution: [], error: null });
    vi.spyOn(analyticsService, 'getStaffWorkload').mockResolvedValue({ workload: [], error: null });
    vi.spyOn(dashboardService, 'getRecentEnquiries').mockResolvedValue([]);
    vi.spyOn(dashboardService, 'getUpcomingFollowups').mockResolvedValue([]);
    vi.spyOn(dashboardService, 'getRecentActivity').mockResolvedValue([]);

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No Enquiries Yet/i)).toBeInTheDocument();
      expect(screen.getByText(/No upcoming follow-ups\./i)).toBeInTheDocument();
      expect(screen.getByText(/No recent activity\./i)).toBeInTheDocument();
      expect(screen.getByText(/No Staff Members Found/i)).toBeInTheDocument();
    });
  });

  it('14–17. renders real KPI metrics, recent enquiries, follow-ups, and activity logs', async () => {
    const overviewSpy = vi.spyOn(analyticsService, 'getOverviewStats').mockResolvedValue({
      stats: {
        totalEnquiries: 42,
        newEnquiries: 5,
        activeEnquiries: 12,
        convertedEnquiries: 8,
        closedEnquiries: 17,
        totalFollowups: 15,
        completedFollowups: 12,
        cancelledFollowups: 1,
        overdueFollowups: 1,
        dueTodayFollowups: 1,
        upcomingFollowups: 1,
        enquiryConversionRate: 19,
        followupCompletionRate: 80,
        allTimeEnquiries: 120,
        allTimeFollowups: 45,
        activeProducts: 16,
      },
      error: null,
    });

    vi.spyOn(analyticsService, 'getEnquiryTrend').mockResolvedValue({
      trend: [{ date: '2026-09-12', label: 'Sat', count: 4, converted: 1 }],
      error: null,
    });

    vi.spyOn(analyticsService, 'getEnquiryStatusSummary').mockResolvedValue({
      distribution: [
        { status: 'new', label: 'New', count: 5, percentage: 12, color: '#3B82F6', colorClass: 'bg-blue-500' },
      ],
      error: null,
    });

    vi.spyOn(analyticsService, 'getStaffWorkload').mockResolvedValue({
      workload: [
        {
          staffId: 'staff-1',
          fullName: 'Arun Kumar',
          email: 'staff@akiraautomation.com',
          role: 'staff',
          assignedEnquiries: 8,
          assignedFollowups: 5,
          completedFollowups: 4,
          overdueFollowups: 0,
          completionRate: 80,
        },
      ],
      error: null,
    });

    vi.spyOn(dashboardService, 'getRecentEnquiries').mockResolvedValue([
      {
        id: 'e-1',
        name: 'Rajesh Sharma',
        company: 'Tata Motors',
        email: 'rajesh@tatamotors.com',
        phone: '+91 9876543210',
        subject: 'Air Electronic Gauge Unit Inquiry',
        message: 'Need high-precision multi-channel gauging unit for engine block inspection.',
        industry: 'Automotive',
        product_category: 'Air Electronic Gauging Units',
        specific_product: 'Multi-Channel Display',
        requirement: '4-channel simultaneous reading',
        status: 'new',
        source: 'contact_page',
        assigned_to: null,
        created_at: '2026-09-12T10:00:00Z',
        updated_at: '2026-09-12T10:00:00Z',
      },
    ]);

    vi.spyOn(dashboardService, 'getUpcomingFollowups').mockResolvedValue([
      {
        id: 'f-1',
        enquiry_id: 'e-1',
        scheduled_at: '2026-09-15T10:00:00Z',
        completed_at: null,
        type: 'call',
        status: 'upcoming',
        notes: 'Review technical CAD drawings with customer lead',
        outcome: null,
        next_followup_at: null,
        created_by: null,
        created_at: '2026-09-12T10:00:00Z',
        updated_at: '2026-09-12T10:00:00Z',
      },
    ]);

    vi.spyOn(dashboardService, 'getRecentActivity').mockResolvedValue([
      {
        id: 'act-1',
        entity_type: 'enquiry',
        entity_id: 'e-1',
        action: 'STATUS_UPDATED',
        old_value: { status: 'new' },
        new_value: { status: 'contacted' },
        description: 'Enquiry status transitioned to Contacted',
        performed_by: 'u-1',
        created_at: '2026-09-12T11:00:00Z',
      },
    ]);

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(overviewSpy).toHaveBeenCalled();
      // Metric cards
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getAllByText('Rajesh Sharma').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Tata Motors').length).toBeGreaterThan(0);
      expect(screen.getByText(/Review technical CAD drawings with customer lead/i)).toBeInTheDocument();
      expect(screen.getByText(/Enquiry status transitioned to Contacted/i)).toBeInTheDocument();
      expect(screen.getByText('Arun Kumar')).toBeInTheDocument();
      expect(screen.getAllByText('80%').length).toBeGreaterThan(0);
    });
  });
});
