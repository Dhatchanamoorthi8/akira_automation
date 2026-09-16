import { describe, it, expect, beforeEach } from 'vitest';
import { emailSettingsService } from './emailSettingsService';

describe('EmailSettingsService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. returns default notification recipients if none configured', () => {
    const primary = emailSettingsService.getPrimaryRecipient();
    expect(primary).toBeTruthy();
    expect(primary).toContain('@');

    const settings = emailSettingsService.getSettingsSync();
    expect(settings.sendCustomerConfirmation).toBe(true);
  });

  it('2. updates and saves custom recipient settings', async () => {
    const updateResult = await emailSettingsService.updateSettings({
      primaryRecipient: 'calibmaster2025@gmail.com',
      ccRecipients: 'milestonegauges@gmail.com, sales@akiraautomation.com',
      sendCustomerConfirmation: false,
    });

    expect(updateResult.success).toBe(true);
    expect(emailSettingsService.getPrimaryRecipient()).toBe('calibmaster2025@gmail.com');

    const ccList = emailSettingsService.getCcRecipients();
    expect(ccList).toEqual(['milestonegauges@gmail.com', 'sales@akiraautomation.com']);
    expect(emailSettingsService.getSettingsSync().sendCustomerConfirmation).toBe(false);
  });

  it('3. handles empty or invalid CC strings gracefully', async () => {
    await emailSettingsService.updateSettings({
      primaryRecipient: 'sales@akiraautomation.com',
      ccRecipients: '   ',
    });

    expect(emailSettingsService.getCcRecipients()).toBeUndefined();
  });
});
