/**
 * AKIRA AUTOMATION — Supabase Database Type Definitions
 * Strict TypeScript interfaces representing the PostgreSQL schema,
 * Row/Insert/Update types for Supabase JS client, and service-level DTOs.
 */

export type UserRole = 'admin' | 'staff' | 'sales' | 'manager' | 'editor' | 'viewer';
export const USER_ROLES: readonly UserRole[] = ['admin', 'staff', 'sales', 'manager', 'editor', 'viewer'] as const;

export type FollowupPriority = 'low' | 'medium' | 'high' | 'urgent';

export type EnquiryStatus =
  | 'new'
  | 'contacted'
  | 'quotation_sent'
  | 'follow_up'
  | 'converted'
  | 'closed';

export type FollowupType =
  | 'call'
  | 'email'
  | 'meeting'
  | 'demo'
  | 'quotation'
  | 'other';

export type FollowupStatus =
  | 'upcoming'
  | 'due_today'
  | 'overdue'
  | 'completed'
  | 'cancelled';

export interface Profile {
  id: string; // references auth.users(id)
  email: string;
  full_name: string | null;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbProduct {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  category_slug: string | null;
  tagline: string | null;
  short_description: string | null;
  description: string | null;
  highlights: string[];
  specifications: Record<string, string>;
  features: string[];
  applications: string[];
  related_product_slugs: string[];
  specs_image: string | null;
  cad_image: string | null;
  featured: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductWithImages extends DbProduct {
  product_images?: ProductImage[];
}

export interface CreateProductInput {
  name: string;
  slug?: string;
  category?: string;
  category_slug?: string;
  tagline?: string;
  short_description?: string;
  description?: string;
  highlights?: string[];
  specifications?: Record<string, string>;
  features?: string[];
  applications?: string[];
  related_product_slugs?: string[];
  specs_image?: string;
  cad_image?: string;
  featured?: boolean;
  active?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  slug?: string;
  category?: string;
  category_slug?: string;
  tagline?: string;
  short_description?: string;
  description?: string;
  highlights?: string[];
  specifications?: Record<string, string>;
  features?: string[];
  applications?: string[];
  related_product_slugs?: string[];
  specs_image?: string;
  cad_image?: string;
  featured?: boolean;
  active?: boolean;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  active?: boolean;
  featured?: boolean;
  sortBy?: 'name' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface Enquiry {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  industry: string | null;
  product_category: string | null;
  specific_product: string | null;
  requirement: string | null;
  status: EnquiryStatus;
  source: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
}

export type FollowupTimeframe = 'all' | 'overdue' | 'today' | 'upcoming' | 'completed' | 'cancelled';

export interface Followup {
  id: string;
  enquiry_id: string;
  scheduled_at: string;
  completed_at: string | null;
  type: FollowupType;
  status: FollowupStatus;
  notes: string | null;
  outcome: string | null;
  next_followup_at: string | null;
  created_by: string | null;
  assigned_to?: string | null;
  title?: string | null;
  description?: string | null;
  due_date?: string | null;
  due_time?: string | null;
  priority?: FollowupPriority;
  completed_by?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export type EntityType = 'enquiry' | 'followup' | 'product' | 'product_image' | 'profile' | 'auth' | 'system';

export type ActivityAction =
  | 'ENQUIRY_CREATED'
  | 'ENQUIRY_UPDATED'
  | 'ENQUIRY_STATUS_CHANGED'
  | 'ENQUIRY_ASSIGNED'
  | 'ENQUIRY_REASSIGNED'
  | 'ENQUIRY_DELETED'
  | 'FOLLOWUP_CREATED'
  | 'FOLLOWUP_UPDATED'
  | 'FOLLOWUP_COMPLETED'
  | 'FOLLOWUP_CANCELLED'
  | 'FOLLOWUP_RESCHEDULED'
  | 'FOLLOWUP_ASSIGNED'
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_DELETED'
  | 'PRODUCT_ACTIVATED'
  | 'PRODUCT_DEACTIVATED'
  | 'PRODUCT_FEATURED'
  | 'PRODUCT_UNFEATURED'
  | 'PRODUCT_IMAGE_UPLOADED'
  | 'PRODUCT_IMAGE_DELETED'
  | 'PRODUCT_PRIMARY_IMAGE_SET'
  | 'USER_CREATED'
  | 'USER_ROLE_CHANGED'
  | 'USER_ACTIVATED'
  | 'USER_DEACTIVATED'
  | 'AUTH_LOGIN'
  | 'AUTH_LOGOUT'
  | string;

export interface ActivityLog {
  id: string;
  entity_type: string;
  entity_id: string | null;
  action: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  description: string | null;
  performed_by: string | null;
  created_at: string;
}

export interface EnquiryWithDetails extends Enquiry {
  assigned_profile?: StaffProfile | null;
  followups?: Followup[];
  activity_logs?: ActivityLog[];
  email_messages?: import('./email').EmailMessage[];
}

export interface FollowupWithEnquiry extends Followup {
  enquiry?: {
    id: string;
    name: string;
    company: string | null;
    email: string;
    phone: string | null;
  } | null;
  creator_profile?: StaffProfile | null;
  assigned_profile?: StaffProfile | null;
}

export interface ActivityLogWithActor extends ActivityLog {
  actor_profile?: StaffProfile | null;
}

export interface EnquiryFilters {
  search?: string;
  status?: EnquiryStatus | 'all';
  source?: string;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'created_at' | 'updated_at' | 'name' | 'company';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface FollowupFilters {
  enquiryId?: string;
  assignedTo?: string;
  status?: FollowupStatus | 'all';
  type?: FollowupType | 'all';
  priority?: FollowupPriority | 'all';
  timeframe?: FollowupTimeframe;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: 'scheduled_at' | 'created_at' | 'due_date' | 'priority';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface UserFilters {
  search?: string;
  role?: UserRole | 'all';
  active?: boolean | 'all';
  sortBy?: 'full_name' | 'email' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateStaffUserInput {
  email: string;
  fullName: string;
  password?: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  fullName?: string;
  role?: UserRole;
  active?: boolean;
}

export interface ActivityFilters {
  entityType?: string;
  entityId?: string;
  action?: string;
  performedBy?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export type DateRangePreset = 'today' | '7d' | '30d' | '90d' | 'year' | 'custom';

export interface DateRangeFilter {
  preset: DateRangePreset;
  startDate: string; // ISO string
  endDate: string; // ISO string
}

export interface AnalyticsOverviewStats {
  totalEnquiries: number;
  newEnquiries: number;
  activeEnquiries: number;
  convertedEnquiries: number;
  closedEnquiries: number;
  totalFollowups: number;
  completedFollowups: number;
  cancelledFollowups: number;
  overdueFollowups: number;
  dueTodayFollowups: number;
  upcomingFollowups: number;
  enquiryConversionRate: number; // percentage 0-100
  followupCompletionRate: number; // percentage 0-100
  allTimeEnquiries: number;
  allTimeFollowups: number;
  activeProducts: number;
}

export interface EnquiryTrendPoint {
  date: string; // YYYY-MM-DD
  label: string; // e.g. "Sep 05"
  count: number;
  converted: number;
}

export interface EnquiryStatusDistribution {
  status: EnquiryStatus;
  label: string;
  count: number;
  percentage: number;
  color?: string;
  colorClass: string;
}

export interface StaffWorkloadStat {
  staffId: string;
  fullName: string;
  email: string;
  role: UserRole;
  assignedEnquiries: number;
  assignedFollowups: number;
  completedFollowups: number;
  overdueFollowups: number;
  completionRate: number;
}

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  totalEnquiries: number;
  newEnquiries: number;
  openFollowups: number;
  overdueFollowups: number;
  completedFollowups: number;
  convertedEnquiries: number;
}

/**
 * Supabase Database Schema mapping for typed SupabaseClient
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          active?: boolean;
          updated_at?: string;
        };
      };
      products: {
        Row: DbProduct;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category?: string | null;
          category_slug?: string | null;
          tagline?: string | null;
          short_description?: string | null;
          description?: string | null;
          highlights?: string[];
          specifications?: Record<string, string>;
          features?: string[];
          applications?: string[];
          related_product_slugs?: string[];
          specs_image?: string | null;
          cad_image?: string | null;
          featured?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          category?: string | null;
          category_slug?: string | null;
          tagline?: string | null;
          short_description?: string | null;
          description?: string | null;
          highlights?: string[];
          specifications?: Record<string, string>;
          features?: string[];
          applications?: string[];
          related_product_slugs?: string[];
          specs_image?: string | null;
          cad_image?: string | null;
          featured?: boolean;
          active?: boolean;
          updated_at?: string;
        };
      };
      product_images: {
        Row: ProductImage;
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          image_url: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          product_id?: string;
          storage_path?: string;
          image_url?: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
          updated_at?: string;
        };
      };
      enquiries: {
        Row: Enquiry;
        Insert: {
          id?: string;
          name: string;
          company?: string | null;
          email: string;
          phone?: string | null;
          subject?: string | null;
          message: string;
          industry?: string | null;
          product_category?: string | null;
          specific_product?: string | null;
          requirement?: string | null;
          status?: EnquiryStatus;
          source?: string;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          company?: string | null;
          email?: string;
          phone?: string | null;
          subject?: string | null;
          message?: string;
          industry?: string | null;
          product_category?: string | null;
          specific_product?: string | null;
          requirement?: string | null;
          status?: EnquiryStatus;
          source?: string;
          assigned_to?: string | null;
          updated_at?: string;
        };
      };
      followups: {
        Row: Followup;
        Insert: {
          id?: string;
          enquiry_id: string;
          scheduled_at: string;
          completed_at?: string | null;
          type?: FollowupType;
          status?: FollowupStatus;
          notes?: string | null;
          outcome?: string | null;
          next_followup_at?: string | null;
          created_by?: string | null;
          assigned_to?: string | null;
          title?: string | null;
          description?: string | null;
          due_date?: string | null;
          due_time?: string | null;
          priority?: FollowupPriority;
          completed_by?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          scheduled_at?: string;
          completed_at?: string | null;
          type?: FollowupType;
          status?: FollowupStatus;
          notes?: string | null;
          outcome?: string | null;
          next_followup_at?: string | null;
          created_by?: string | null;
          assigned_to?: string | null;
          title?: string | null;
          description?: string | null;
          due_date?: string | null;
          due_time?: string | null;
          priority?: FollowupPriority;
          completed_by?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          updated_at?: string;
        };
      };
      activity_logs: {
        Row: ActivityLog;
        Insert: {
          id?: string;
          entity_type: string;
          entity_id?: string | null;
          action: string;
          old_value?: Record<string, unknown> | null;
          new_value?: Record<string, unknown> | null;
          metadata?: Record<string, unknown> | null;
          description?: string | null;
          performed_by?: string | null;
          created_at?: string;
        };
        Update: never;
      };
    };
  };
}
