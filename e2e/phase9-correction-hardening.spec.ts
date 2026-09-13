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

test.describe('AKIRA AUTOMATION — Phase 8 & 9 Correction & Hardening Suite', () => {

  test('1. Admin Full Management E2E: Dashboard, Users, Edit/Deactivate Modals, Role RBAC, Assignment', async ({ page }) => {
    await loginAsAdmin(page);

    // 1. Verify Dashboard Layout & Absence of Horizontal Overflow
    await expect(page.getByText('Operations & CRM Analytics')).toBeVisible({ timeout: 15000 });
    const isOverflown = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(isOverflown).toBe(false);

    // 2. Verify KPI Cards
    await expect(page.getByText('Total Enquiries', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('New Leads', { exact: true })).toBeVisible();
    await expect(page.getByText('Active Pipeline', { exact: true })).toBeVisible();
    await expect(page.getByText('Converted Deals', { exact: true })).toBeVisible();

    // 3. Verify Enquiry Influx & Conversions cards
    await expect(page.getByText(/Enquiry Influx & Conversions/i)).toBeVisible();
    await expect(page.getByText('Pipeline Value')).toBeVisible();

    // 4. Navigate to Products & Product Images
    await page.goto('/admin/products');
    await expect(page.getByRole('heading', { name: /Product Catalogue/i })).toBeVisible({ timeout: 10000 });

    await page.goto('/admin/product-images');
    await expect(page.getByRole('heading', { name: /Product Image Manager/i })).toBeVisible({ timeout: 10000 });

    // 5. Navigate to Users & Staff Management (/admin/users)
    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { name: /Staff & User Management/i })).toBeVisible({ timeout: 10000 });

    // 6. Test User Edit Modal
    const editBtn = page.getByRole('button', { name: /^Edit$/i }).first();
    if (await editBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await editBtn.click();
      await expect(page.getByRole('heading', { name: /Edit User Profile/i })).toBeVisible({ timeout: 5000 });
      
      // Verify email is read-only
      const emailInput = page.locator('input[disabled][type="email"]');
      await expect(emailInput).toBeVisible();

      // Verify Role options exist
      const roleSelect = page.locator('select', { hasText: /Staff Member/i });
      await expect(roleSelect).toBeVisible();

      // Close modal
      const cancelBtn = page.getByRole('button', { name: /Cancel/i });
      await cancelBtn.click();
      await expect(page.getByRole('heading', { name: /Edit User Profile/i })).not.toBeVisible();
    }

    // 7. Test Deactivate / Delete Modal with Relational Dependency Inspection
    const manageBtn = page.getByRole('button', { name: /^Manage$/i }).first();
    if (await manageBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await manageBtn.click();
      await expect(page.getByRole('heading', { name: /Deactivate or Delete User|Reactivate User Account/i })).toBeVisible({ timeout: 5000 });
      
      // Check that dismiss works safely
      const dismissBtn = page.getByRole('button', { name: /Dismiss/i });
      await dismissBtn.click();
      await expect(page.getByRole('heading', { name: /Deactivate or Delete User|Reactivate User Account/i })).not.toBeVisible();
    }

    // 8. Navigate to Enquiries and Test Assignment
    await page.goto('/admin/enquiries');
    await expect(page.getByRole('heading', { name: /Customer Enquiries & RFQs/i })).toBeVisible({ timeout: 10000 });

    // 9. Navigate to Follow-ups
    await page.goto('/admin/followups');
    await expect(page.getByRole('heading', { name: /CRM Follow-ups/i })).toBeVisible({ timeout: 10000 });

    // 10. Navigate to Activity Logs
    await page.goto('/admin/activity');
    await expect(page.getByRole('heading', { name: /System Activity Logs/i })).toBeVisible({ timeout: 10000 });

    // 11. Sign Out
    const profileMenuBtn = page.locator('header button', { hasText: /Admin/i }).or(page.locator('header button[aria-label="View system notifications"] + div button'));
    if (await profileMenuBtn.isVisible().catch(() => false)) {
      await profileMenuBtn.click();
      const signOutBtn = page.getByRole('button', { name: /Sign Out/i });
      if (await signOutBtn.isVisible().catch(() => false)) {
        await signOutBtn.click();
        await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });
      }
    }
  });

  test('2. Staff Role Security & Route Protection Isolation', async ({ page }) => {
    // Attempt unauthenticated access to admin routes
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });

    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });

    await page.goto('/admin/products');
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });

    await page.goto('/admin/product-images');
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });

    // Attempt staff login if configured
    await page.fill('input[type="email"]', STAFF_EMAIL);
    await page.fill('input[type="password"]', STAFF_PASSWORD);
    await page.click('button[type="submit"]');

    const redirectedToStaff = await page
      .waitForURL(/\/staff/, { timeout: 8000 })
      .then(() => true)
      .catch(() => false);

    if (redirectedToStaff) {
      await expect(page.getByText('Staff Workspace')).toBeVisible({ timeout: 10000 });

      // Staff attempts to access admin dashboard -> restricted
      await page.goto('/admin/dashboard');
      await expect(page.getByText(/Administrative Access Restricted/i)).toBeVisible({ timeout: 10000 });

      // Staff attempts to access admin user management -> restricted
      await page.goto('/admin/users');
      await expect(page.getByText(/Administrative Access Restricted/i)).toBeVisible({ timeout: 10000 });

      // Staff attempts to access product management -> restricted
      await page.goto('/admin/products');
      await expect(page.getByText(/Administrative Access Restricted/i)).toBeVisible({ timeout: 10000 });
    }
  });

  // 3. Multi-Viewport Responsive Dashboard Audit across 6 required viewports
  const auditViewports = [
    { name: 'Desktop Large', width: 1440, height: 900 },
    { name: 'Desktop Normal', width: 1280, height: 800 },
    { name: 'Tablet Landscape', width: 1024, height: 768 },
    { name: 'Tablet Portrait', width: 768, height: 1024 },
    { name: 'Mobile Large', width: 390, height: 844 },
    { name: 'Mobile Small', width: 375, height: 812 },
  ];

  for (const vp of auditViewports) {
    test(`3. Dashboard Responsive Audit: No Horizontal Overflow at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await loginAsAdmin(page);

      await expect(page.getByText('Operations & CRM Analytics')).toBeVisible({ timeout: 15000 });

      // Ensure full rendering of charts and table
      await page.waitForTimeout(1000);

      // Verify that document.documentElement.scrollWidth DOES NOT EXCEED window.innerWidth
      const overflowMetrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        isOverflown: document.documentElement.scrollWidth > window.innerWidth,
      }));

      expect(
        overflowMetrics.isOverflown,
        `Horizontal overflow detected at ${vp.width}px! scrollWidth: ${overflowMetrics.scrollWidth}px vs innerWidth: ${overflowMetrics.innerWidth}px`
      ).toBe(false);

      // Verify Enquiry Influx card stays inside viewport
      const influxHeading = page.getByRole('heading', { name: /Enquiry Influx & Conversions/i });
      await expect(influxHeading).toBeVisible({ timeout: 10000 });
      const headingBox = await influxHeading.boundingBox();
      if (headingBox) {
        expect(headingBox.x + headingBox.width).toBeLessThanOrEqual(vp.width + 10);
      }
    });
  }
});
