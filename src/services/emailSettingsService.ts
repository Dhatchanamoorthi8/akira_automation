import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { company } from '../config/company';

export interface EmailNotificationSettings {
  primaryRecipient: string;
  ccRecipients: string;
  sendCustomerConfirmation: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

const STORAGE_KEY = 'akira_email_settings';

const DEFAULT_SETTINGS: EmailNotificationSettings = {
  primaryRecipient: company.primaryEmail || 'milestonegauges@gmail.com',
  ccRecipients: company.ccEmail || 'messalessarvices@gmail.com',
  sendCustomerConfirmation: true,
};

/**
 * Service to manage configurable email notification recipients.
 * Admins can customize who receives new enquiry alerts (Primary & CC) directly from the UI.
 * Persists to Supabase `app_settings` with instantaneous localStorage caching.
 */
class EmailSettingsService {
  private cachedSettings: EmailNotificationSettings | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): EmailNotificationSettings {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const loaded: EmailNotificationSettings = {
            ...DEFAULT_SETTINGS,
            ...parsed,
          };
          this.cachedSettings = loaded;
          return loaded;
        }
      } catch {
        // Fallback to default
      }
    }
    const fallback: EmailNotificationSettings = { ...DEFAULT_SETTINGS };
    this.cachedSettings = fallback;
    return fallback;
  }

  private saveToStorage(settings: EmailNotificationSettings): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch {
        // Storage failure fallback
      }
    }
    this.cachedSettings = settings;
  }

  /**
   * Synchronous accessor for fast client-side dispatch.
   */
  getSettingsSync(): EmailNotificationSettings {
    if (!this.cachedSettings) {
      return this.loadFromStorage();
    }
    return this.cachedSettings;
  }

  /**
   * Fetch latest settings from Supabase `app_settings` (falls back to localStorage/defaults).
   */
  async getSettings(): Promise<EmailNotificationSettings> {
    const local = this.getSettingsSync();

    if (!isSupabaseConfigured()) {
      return local;
    }

    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value, updated_at')
        .eq('key', 'notification_recipients')
        .maybeSingle();

      if (!error && data?.value) {
        const remoteSettings: EmailNotificationSettings = {
          primaryRecipient: data.value.primaryRecipient || local.primaryRecipient,
          ccRecipients: data.value.ccRecipients !== undefined ? data.value.ccRecipients : local.ccRecipients,
          sendCustomerConfirmation: data.value.sendCustomerConfirmation !== undefined ? data.value.sendCustomerConfirmation : local.sendCustomerConfirmation,
          updatedAt: data.updated_at,
        };
        this.saveToStorage(remoteSettings);
        return remoteSettings;
      }
    } catch {
      // Return cached settings if remote table query fails
    }

    return local;
  }

  /**
   * Save updated recipient configuration.
   */
  async updateSettings(
    newSettings: Partial<EmailNotificationSettings>
  ): Promise<{ success: boolean; settings: EmailNotificationSettings; error?: string }> {
    const current = this.getSettingsSync();
    const updated: EmailNotificationSettings = {
      ...current,
      ...newSettings,
      primaryRecipient: (newSettings.primaryRecipient ?? current.primaryRecipient).trim(),
      ccRecipients: (newSettings.ccRecipients ?? current.ccRecipients).trim(),
      sendCustomerConfirmation: newSettings.sendCustomerConfirmation ?? current.sendCustomerConfirmation,
      updatedAt: new Date().toISOString(),
    };

    // Save locally immediately
    this.saveToStorage(updated);

    // Save to Supabase if connected
    if (isSupabaseConfigured()) {
      try {
        const user = (await supabase.auth.getUser()).data?.user;
        const { error } = await supabase
          .from('app_settings')
          .upsert({
            key: 'notification_recipients',
            value: {
              primaryRecipient: updated.primaryRecipient,
              ccRecipients: updated.ccRecipients,
              sendCustomerConfirmation: updated.sendCustomerConfirmation,
            },
            updated_at: new Date().toISOString(),
            updated_by: user?.id || null,
          });

        if (error) {
          console.warn('[EmailSettingsService] Notice: could not persist to remote app_settings:', error.message);
          // Return success anyway since localStorage has it active
        }
      } catch (err: unknown) {
        console.warn('[EmailSettingsService] Exception during remote sync:', err);
      }
    }

    return { success: true, settings: updated };
  }

  getPrimaryRecipient(): string {
    return this.getSettingsSync().primaryRecipient || DEFAULT_SETTINGS.primaryRecipient;
  }

  getCcRecipients(): string[] | undefined {
    const cc = this.getSettingsSync().ccRecipients;
    if (!cc || !cc.trim()) return undefined;
    return cc
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0 && e.includes('@'));
  }
}

export const emailSettingsService = new EmailSettingsService();
export default emailSettingsService;
