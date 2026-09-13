import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyticsService } from './analyticsService';
import { supabase } from '../lib/supabase';
import * as supabaseLib from '../lib/supabase';

describe('AnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getDateRange', () => {
    it('calculates 7-day date range correctly', () => {
      const { startDate, endDate } = analyticsService.getDateRange('7d');
      const start = new Date(startDate);
      const end = new Date(endDate);

      expect(end.getTime()).toBeGreaterThan(start.getTime());
      const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(7);
    });

    it('calculates 30-day date range correctly', () => {
      const { startDate, endDate } = analyticsService.getDateRange('30d');
      const start = new Date(startDate);
      const end = new Date(endDate);

      const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(30);
    });

    it('handles custom date range correctly', () => {
      const customStart = '2026-08-01';
      const customEnd = '2026-08-15';
      const { startDate, endDate } = analyticsService.getDateRange('custom', customStart, customEnd);

      expect(startDate).toContain('2026-08-01');
      expect(endDate).toContain('2026-08-15');
    });
  });

  describe('getOverviewStats', () => {
    it('computes aggregated KPIs correctly via fallback queries', async () => {
      vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);

      // Force RPC to fail so fallback queries are executed
      vi.spyOn(supabase, 'rpc').mockResolvedValue({ data: null, error: { message: 'function not found' } } as any);

      const mockEnquiries = [
        { id: '1', status: 'new', created_at: '2026-09-01T10:00:00Z' },
        { id: '2', status: 'contacted', created_at: '2026-09-02T10:00:00Z' },
        { id: '3', status: 'converted', created_at: '2026-09-03T10:00:00Z' },
        { id: '4', status: 'converted', created_at: '2026-09-04T10:00:00Z' },
      ];

      const mockFollowups = [
        { id: 'f-1', status: 'completed', due_date: '2026-09-02', scheduled_at: '2026-09-02T10:00:00Z', created_at: '2026-09-01T10:00:00Z' },
        { id: 'f-2', status: 'completed', due_date: '2026-09-03', scheduled_at: '2026-09-03T10:00:00Z', created_at: '2026-09-02T10:00:00Z' },
        { id: 'f-3', status: 'upcoming', due_date: '2026-09-20', scheduled_at: '2026-09-20T10:00:00Z', created_at: '2026-09-03T10:00:00Z' },
      ];

      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'enquiries') {
          return {
            select: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                lte: vi.fn().mockResolvedValue({ data: mockEnquiries, error: null }),
              }),
              head: true,
              count: 'exact',
            }),
          } as any;
        }
        if (table === 'followups') {
          return {
            select: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                lte: vi.fn().mockResolvedValue({ data: mockFollowups, error: null }),
              }),
              head: true,
              count: 'exact',
            }),
          } as any;
        }
        if (table === 'products') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ count: 16, error: null }),
            }),
          } as any;
        }
        return {} as any;
      });

      const { startDate, endDate } = analyticsService.getDateRange('30d');
      const res = await analyticsService.getOverviewStats(startDate, endDate);

      expect(res.error).toBeNull();
      expect(res.stats).not.toBeNull();
      if (res.stats) {
        expect(res.stats.totalEnquiries).toBe(4);
        expect(res.stats.newEnquiries).toBe(1);
        expect(res.stats.activeEnquiries).toBe(1);
        expect(res.stats.convertedEnquiries).toBe(2);
        // Conversion rate: 2 / 4 = 50%
        expect(res.stats.enquiryConversionRate).toBe(50);
        expect(res.stats.totalFollowups).toBe(3);
        expect(res.stats.completedFollowups).toBe(2);
      }
    });
  });

  describe('getEnquiryTrend', () => {
    it('generates a continuous daily trend without gaps', async () => {
      vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);

      const mockData = [
        { id: '1', created_at: '2026-09-10T12:00:00Z', status: 'new' },
        { id: '2', created_at: '2026-09-10T15:00:00Z', status: 'converted' },
        { id: '3', created_at: '2026-09-12T09:00:00Z', status: 'new' },
      ];

      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            lte: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
            }),
          }),
        }),
      } as any);

      const startDate = '2026-09-10T00:00:00.000Z';
      const endDate = '2026-09-12T23:59:59.999Z';

      const res = await analyticsService.getEnquiryTrend(startDate, endDate);
      expect(res.error).toBeNull();
      expect(res.trend).toHaveLength(3); // Sept 10, Sept 11 (0), Sept 12
      expect(res.trend[0].count).toBe(2);
      expect(res.trend[0].converted).toBe(1);
      expect(res.trend[1].count).toBe(0); // continuous zero gap
      expect(res.trend[2].count).toBe(1);
    });
  });

  describe('getEnquiryStatusSummary', () => {
    it('calculates lifecycle distribution percentages correctly', async () => {
      vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);

      const mockData = [
        { status: 'new' },
        { status: 'new' },
        { status: 'contacted' },
        { status: 'converted' },
      ];

      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            lte: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      } as any);

      const startDate = '2026-09-01T00:00:00.000Z';
      const endDate = '2026-09-13T23:59:59.999Z';

      const res = await analyticsService.getEnquiryStatusSummary(startDate, endDate);
      expect(res.error).toBeNull();
      expect(res.distribution).toHaveLength(6);

      const newEntry = res.distribution.find((d) => d.status === 'new');
      expect(newEntry?.count).toBe(2);
      expect(newEntry?.percentage).toBe(50); // 2 of 4 = 50%
      expect(newEntry?.colorClass).toBe('bg-blue-500');
    });
  });
});
