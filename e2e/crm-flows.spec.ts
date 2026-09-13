import { test, expect, Page } from '@playwright/test';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@akiraautomation.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'Admin@123';

async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login');
  await expect(page.getByText('Administrative Sign In')).toBeVisible({ timeout: 10000 });
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });
}

test.describe('AKIRA AUTOMATION — CRM & Admin E2E Verification', () => {
  const testId = Date.now();
  const testCustomer = {
    name: `QA Auto Test ${testId}`,
    company: 'Bharat Heavy Dynamics Ltd',
    email: `qa.test.${testId}@bharat-dynamics.example.com`,
    phone: '+91 98765 01234',
    message: 'Testing automated enquiry submission to Supabase backend and CRM flow verification.',
  };

  test('1. Public Enquiry Submission (Direct Supabase Insertion)', async ({ page }) => {
    // Navigate to public contact page
    await page.goto('/contact');
    await expect(page).toHaveTitle(/Contact Us/);

    // Fill form
    await page.fill('input[name="name"]', testCustomer.name);
    await page.fill('input[name="companyName"]', testCustomer.company);
    await page.fill('input[name="email"]', testCustomer.email);
    await page.fill('input[name="phone"]', testCustomer.phone);
    await page.fill('textarea[name="message"]', testCustomer.message);

    // Submit form
    const submitBtn = page.locator('button[type="submit"]', { hasText: /Submit Technical Enquiry/ });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Verify Step 24 confirmation message
    await expect(
      page.getByText('Thank you. Your enquiry has been received.')
    ).toBeVisible({ timeout: 15000 });
  });

  test('2. Admin Authentication & Dashboard Navigation', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByText('Operations Overview')).toBeVisible();
    await expect(page.getByText('Total Products')).toBeVisible();
  });

  test('3. Enquiries Management, Customer Dossier & Follow-up Lifecycle', async ({ page }) => {
    await loginAsAdmin(page);

    // Navigate to Enquiries
    await page.goto('/admin/enquiries');
    await expect(page.getByText('Customer Enquiries & RFQs')).toBeVisible({ timeout: 10000 });

    // Locate the customer entry or click first available enquiry (responsive table or card)
    const enquiryItem = page.locator('a[href*="/admin/enquiries/"]:visible').first();
    await expect(enquiryItem).toBeVisible({ timeout: 10000 });
    await enquiryItem.click();

    // Verify customer dossier loaded
    await expect(page).toHaveURL(/\/admin\/enquiries\/[0-9a-f-]+/, { timeout: 10000 });
    await expect(page.getByText('Customer Contact Information')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Technical Requirements & Specifications')).toBeVisible();
    await expect(page.getByText('Lifecycle Status Progression')).toBeVisible();
    await expect(page.getByText('Scheduled Follow-ups')).toBeVisible();

    // Test Status Transition: Click "Contacted"
    const contactedBtn = page.getByRole('button', { name: 'Contacted' });
    if (await contactedBtn.isVisible()) {
      await contactedBtn.click();
      await page.waitForTimeout(1000);
    }

    // Schedule a Follow-up
    const scheduleBtn = page.getByRole('button', { name: 'Schedule' }).first();
    if (await scheduleBtn.isVisible()) {
      await scheduleBtn.click();

      // Schedule modal
      const modalHeading = page.getByRole('heading', { name: /Schedule CRM Follow-up/i });
      if (await modalHeading.isVisible({ timeout: 3000 }).catch(() => false)) {
        const dateInput = page.locator('input[type="datetime-local"]');
        if (await dateInput.isVisible()) {
          const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
          await dateInput.fill(tomorrow);
        }

        const notesText = page.locator('textarea').last();
        if (await notesText.isVisible()) {
          await notesText.fill('Automated test: Follow-up scheduled for technical review.');
        }

        const confirmBtn = page.getByRole('button', { name: /Confirm Schedule|Save/i });
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
          await page.waitForTimeout(1500);
        }
      }
    }
  });

  test('4. Dedicated Follow-ups CRM Workspace', async ({ page }) => {
    await loginAsAdmin(page);

    // Navigate to Follow-ups
    await page.goto('/admin/followups');
    await expect(page.getByText('CRM Follow-ups')).toBeVisible({ timeout: 10000 });

    // Check timeframe tabs
    await expect(page.getByText('All Scheduled')).toBeVisible();
    await expect(page.getByText('Overdue')).toBeVisible();
    await expect(page.getByText('Due Today')).toBeVisible();
    await expect(page.getByText('Upcoming')).toBeVisible();
    await expect(page.getByText('Completed')).toBeVisible();

    // Click tabs to verify reactivity
    await page.getByText('Upcoming').click();
    await page.waitForTimeout(300);
    await page.getByText('All Scheduled').click();
    await page.waitForTimeout(300);
  });

  test('5. System Activity Logs Audit Trail', async ({ page }) => {
    await loginAsAdmin(page);

    // Navigate to Activity
    await page.goto('/admin/activity');
    await expect(page.getByText('System Activity Logs')).toBeVisible({ timeout: 10000 });

    // Verify filter dropdowns
    const actionSelect = page.locator('select').first();
    await expect(actionSelect).toBeVisible();
  });

  test('6. Admin Logout & Protected Route Guard', async ({ page }) => {
    await loginAsAdmin(page);

    // Trigger logout: click visible sign out or open profile menu
    const visibleLogout = page.locator('button:has-text("Sign Out"):visible').first();
    if (await visibleLogout.isVisible().catch(() => false)) {
      await visibleLogout.click();
    } else {
      const profileBtn = page.locator('button[aria-label*="Profile" i]').first();
      await profileBtn.click();
      const menuLogout = page.locator('button:has-text("Sign Out"):visible').first();
      await menuLogout.click();
    }

    // Wait for redirect to login
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });

    // Verify ProtectedRoute prevents accessing dashboard when logged out
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });
  });
});
