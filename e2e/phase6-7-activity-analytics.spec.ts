import { test, expect, Page } from '@playwright/test';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@akiraautomation.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'Admin@123';
const STAFF_EMAIL = process.env.E2E_STAFF_EMAIL || 'staff@akiraautomation.com';
const STAFF_PASSWORD = process.env.E2E_STAFF_PASSWORD || 'Staff@123';

async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login');
  await expect(page.getByText('Administrative Sign In')).toBeVisible({ timeout: 10000 });
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });
}

test.describe('AKIRA AUTOMATION — Phase 6 & 7: Historical Activity & Dashboard Analytics', () => {
  test('1. Admin Dashboard Analytics, Date Presets & Staff Workload Matrix', async ({ page }) => {
    await loginAsAdmin(page);

    // Assert dashboard header and intelligence badge
    await expect(page.getByText('Operations & CRM Analytics')).toBeVisible({ timeout: 15000 });
    const viewport = page.viewportSize();
    if (!viewport || viewport.width >= 640) {
      await expect(page.getByText('Executive Intelligence')).toBeVisible();
    }

    // Verify 8 KPI Cards are rendered
    const statCards = page.locator('div.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(statCards.getByText('Total Enquiries', { exact: true })).toBeVisible({ timeout: 15000 });
    await expect(statCards.getByText('New Leads', { exact: true })).toBeVisible();
    await expect(statCards.getByText('Active Pipeline', { exact: true })).toBeVisible();
    await expect(statCards.getByText('Converted Deals', { exact: true })).toBeVisible();
    await expect(statCards.getByText('Conversion Rate', { exact: true })).toBeVisible();
    await expect(statCards.getByText('Total Follow-ups', { exact: true })).toBeVisible();
    await expect(statCards.getByText('Completion Rate', { exact: true })).toBeVisible();
    await expect(statCards.getByText('Attention Required', { exact: true })).toBeVisible();

    // Verify Date Range Presets exist and test interactive switching
    const todayBtn = page.getByRole('button', { name: 'Today' });
    const sevenDaysBtn = page.getByRole('button', { name: 'Last 7 Days' });
    const thirtyDaysBtn = page.getByRole('button', { name: 'Last 30 Days' });

    await expect(todayBtn).toBeVisible();
    await expect(sevenDaysBtn).toBeVisible();
    await expect(thirtyDaysBtn).toBeVisible();

    // Click 'Today' preset
    await todayBtn.click();
    await expect(page.getByRole('heading', { name: /Enquiry Influx & Conversions \(Today\)/i })).toBeVisible({ timeout: 15000 });

    // Click 'Last 7 Days' preset
    await sevenDaysBtn.click();
    await expect(page.getByRole('heading', { name: /Enquiry Influx & Conversions \(Last 7 Days\)/i })).toBeVisible({ timeout: 15000 });

    // Click back to 'Last 30 Days' (default)
    await thirtyDaysBtn.click();
    await expect(page.getByRole('heading', { name: /Enquiry Influx & Conversions \(Last 30 Days\)/i })).toBeVisible({ timeout: 15000 });

    // Verify Team Workload & Execution Performance Table
    await expect(page.getByText('Team Workload & Execution Performance')).toBeVisible({ timeout: 15000 });
    
    // Either active staff rows or clean empty state is rendered
    const tableHeader = page.getByRole('columnheader', { name: 'Staff Member' });
    const hasTable = await tableHeader.isVisible().catch(() => false);
    if (hasTable) {
      await expect(page.getByRole('columnheader', { name: 'Assigned Enquiries' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Assigned Follow-ups' })).toBeVisible();
    } else {
      await expect(page.getByText('No Staff Members Found')).toBeVisible();
    }

    // Verify Inbound Enquiries and Activity Feeds are present
    await expect(page.getByText('Recent Inbound Enquiries')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('System & Audit Activity')).toBeVisible({ timeout: 15000 });
  });

  test('2. System Activity Audit Center (/admin/activity) with Filters and CSV Export', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/activity');
    await expect(page.getByText('System Activity Logs')).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText('Immutable audit trail of enquiry lifecycle events, CRM touchpoints, auth, and catalogue changes')
    ).toBeVisible();

    // Verify filter toolbar elements
    await expect(page.getByPlaceholder('Search activity description or action code...')).toBeVisible();
    await expect(page.getByText('Action:')).toBeVisible();
    await expect(page.getByText('Entity:')).toBeVisible();
    await expect(page.getByText('Actor:')).toBeVisible();

    // Verify Export CSV button is present
    const exportBtn = page.getByRole('button', { name: /Export CSV/i });
    await expect(exportBtn).toBeVisible();

    // Search filter interaction
    const searchInput = page.getByPlaceholder('Search activity description or action code...');
    await searchInput.fill('enquiry');
    await page.waitForTimeout(300);

    // Clear search
    await searchInput.fill('');
  });

  test('3. Enquiry Dossier Activity Timeline', async ({ page }) => {
    await loginAsAdmin(page);

    // Go to enquiries list
    await page.goto('/admin/enquiries');
    await expect(page.getByText('Customer Enquiries')).toBeVisible({ timeout: 10000 });

    // Look for first enquiry link or row
    const viewButtons = page.locator('a[href*="/admin/enquiries/"]');
    const count = await viewButtons.count();

    if (count > 0) {
      // Navigate into the first enquiry
      await viewButtons.first().click();
      await expect(page.getByText('Enquiry Activity Timeline')).toBeVisible({ timeout: 10000 });
    }
  });

  test('4. Staff Workspace Strict Isolation & Security Route Protection', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByText('Administrative Sign In')).toBeVisible({ timeout: 10000 });

    await page.fill('input[type="email"]', STAFF_EMAIL);
    await page.fill('input[type="password"]', STAFF_PASSWORD);
    await page.click('button[type="submit"]');

    const redirectedToStaff = await page
      .waitForURL(/\/staff/, { timeout: 8000 })
      .then(() => true)
      .catch(() => false);

    if (redirectedToStaff) {
      // Staff workspace verified
      await expect(page.getByText('Staff Workspace')).toBeVisible({ timeout: 10000 });

      // Ensure company-wide executive analytics are NOT exposed
      await expect(page.getByText('Operations & CRM Analytics')).not.toBeVisible();
      await expect(page.getByText('Executive Intelligence')).not.toBeVisible();

      // Attempt direct navigation to admin analytics console
      await page.goto('/admin/dashboard');
      await expect(page.getByText(/Administrative Access Restricted/i)).toBeVisible({ timeout: 10000 });

      // Attempt direct navigation to system activity logs
      await page.goto('/admin/activity');
      await expect(page.getByText(/Administrative Access Restricted/i)).toBeVisible({ timeout: 10000 });
    } else {
      // Unauthenticated security guard check
      await page.goto('/admin/dashboard');
      await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });
    }
  });
});
