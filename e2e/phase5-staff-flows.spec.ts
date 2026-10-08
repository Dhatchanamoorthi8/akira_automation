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

test.describe('AKIRA AUTOMATION — Phase 5: Staff & Follow-up Workflows', () => {
  const testRunId = Date.now();

  test('1. Public Enquiry Form Dispatches to Supabase Without Client FormSubmit AJAX', async ({ page }) => {
    let formsubmitRequested = false;
    page.on('request', (request) => {
      if (request.url().includes('formsubmit.co')) {
        formsubmitRequested = true;
      }
    });

    await page.goto('/contact');
    await expect(page).toHaveTitle(/Contact Us/);

    const testEnquiry = {
      name: `Automated QA Lead ${testRunId}`,
      company: 'TVS Sundaram Fasteners Quality Division',
      email: `tvs.lead.${testRunId}@sundaram.example.com`,
      phone: '+91 98401 23456',
      message: 'Automated test enquiry verifying direct Supabase persistence and FormSubmit decommissioning.',
    };

    await page.fill('input[name="name"]', testEnquiry.name);
    await page.fill('input[name="companyName"]', testEnquiry.company);
    await page.fill('input[name="email"]', testEnquiry.email);
    await page.fill('input[name="phone"]', testEnquiry.phone);
    await page.fill('textarea[name="message"]', testEnquiry.message);

    const submitBtn = page.locator('button[type="submit"]', { hasText: /Submit Technical Enquiry/ });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Verify successful submission confirmation
    await expect(
      page.getByText('Thank you. Your enquiry has been received.')
    ).toBeVisible({ timeout: 15000 });

    // Assert that client-side FormSubmit AJAX was NOT invoked
    expect(formsubmitRequested).toBe(false);
  });

  test('2. Admin Personnel Management (/admin/users) & Staff Directory', async ({ page }) => {
    await loginAsAdmin(page);

    // Navigate to Staff & Users directory
    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { name: /Staff & User Management/i })).toBeVisible({ timeout: 10000 });

    // Verify search and filter controls
    const searchInput = page.getByPlaceholder(/Search staff by name or email/i);
    await expect(searchInput).toBeVisible();

    // Verify Create Staff User button
    const createStaffBtn = page.getByRole('button', { name: /Create Staff User/i });
    await expect(createStaffBtn).toBeVisible();

    // Click Create Staff User to open modal
    await createStaffBtn.click();
    await expect(page.getByRole('heading', { name: /Create Assigned Staff User/i })).toBeVisible();
    await expect(page.getByText('Full Name', { exact: true })).toBeVisible();
    await expect(page.getByText('Business Email', { exact: true })).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
  });

  test('3. CRM Follow-up Management Filters & Dossier View (/admin/followups)', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/followups');
    await expect(page.getByRole('heading', { name: /CRM Follow-ups/i })).toBeVisible({ timeout: 10000 });

    // Verify Priority filter exists
    const prioritySelect = page.locator('select', { hasText: /All Priorities/i });
    await expect(prioritySelect).toBeVisible();

    // Verify Staff filter exists
    const staffSelect = page.locator('select', { hasText: /All Staff/i });
    await expect(staffSelect).toBeVisible();

    // Check for follow-up details navigation if records exist
    const detailsLink = page.locator('a[href*="/admin/followups/"]:visible').first();
    if (await detailsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await detailsLink.click();
      await expect(page).toHaveURL(/\/admin\/followups\/[0-9a-f-]+/, { timeout: 10000 });
      await expect(page.getByText('Follow-up Information')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Customer & Company')).toBeVisible();
      await expect(page.getByText('Status & Lifecycle History')).toBeVisible();
    }
  });

  test('4. Staff Workspace Authentication & Route Protection Guard', async ({ page }) => {
    // Attempt login with staff credentials if configured
    await page.goto('/admin/login');
    await expect(page.getByText('Administrative Sign In')).toBeVisible({ timeout: 10000 });

    await page.fill('input[type="email"]', STAFF_EMAIL);
    await page.fill('input[type="password"]', STAFF_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for response or navigation
    const redirectedToStaff = await page
      .waitForURL(/\/staff/, { timeout: 8000 })
      .then(() => true)
      .catch(() => false);

    if (redirectedToStaff) {
      // Verified staff login success!
      await expect(page.getByText('Staff Workspace')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('My New RFQs')).toBeVisible();
      await expect(page.getByText('Due Today')).toBeVisible();
      await expect(page.getByText('Overdue')).toBeVisible();
      await expect(page.getByText('Upcoming')).toBeVisible();
      await expect(page.getByText('Completed')).toBeVisible();

      // Test Security Boundary: Try navigating to /admin/products
      await page.goto('/admin/products');
      await expect(page.getByText(/Administrative Access Restricted/i)).toBeVisible({ timeout: 10000 });
      const returnToStaffBtn = page.getByRole('link', { name: /Go to Staff Workspace/i });
      await expect(returnToStaffBtn).toBeVisible();
      await returnToStaffBtn.click();
      await expect(page).toHaveURL(/\/staff/);

      // Test Security Boundary: Try navigating to /admin/users
      await page.goto('/admin/users');
      await expect(page.getByText(/Administrative Access Restricted/i)).toBeVisible({ timeout: 10000 });

      // Test Security Boundary: Try navigating to /admin/dashboard
      await page.goto('/admin/dashboard');
      await expect(page.getByText(/Administrative Access Restricted/i)).toBeVisible({ timeout: 10000 });
    } else {
      // If test staff credentials aren't seeded in remote DB yet, test unauthenticated guard
      await page.goto('/admin/products');
      await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });
    }
  });

  test('5. Staff Workspace Modal Data Entry — Inputs keep modal open on click and typing', async ({ page }) => {
    await loginAsAdmin(page);

    // Navigate to /staff
    await page.goto('/staff');
    await expect(page.getByText('Staff Portal')).toBeVisible({ timeout: 15000 });

    // Open Schedule New Follow-up modal
    const followUpBtn = page.getByRole('button', { name: /^Follow-up$/i });
    await expect(followUpBtn).toBeVisible({ timeout: 10000 });
    await followUpBtn.click();

    // Verify modal is visible
    const modalHeading = page.getByRole('heading', { name: 'Schedule New Follow-up' });
    await expect(modalHeading).toBeVisible();

    // Click into Task Title input box
    const titleInput = page.getByPlaceholder(/e\.g\. Call client regarding quotation feedback/i);
    await expect(titleInput).toBeVisible();
    await titleInput.click();

    // Verify modal is STILL open! (Does NOT auto-close)
    await expect(modalHeading).toBeVisible();

    // Type inside the input
    await titleInput.fill('Verify air ring gauge calibration tolerances');
    await expect(modalHeading).toBeVisible();
    await expect(titleInput).toHaveValue('Verify air ring gauge calibration tolerances');

    // Click into Internal Notes textarea
    const notesInput = page.getByPlaceholder(/Specific points to discuss or client requests\.\.\./i);
    await expect(notesInput).toBeVisible();
    await notesInput.click();
    await notesInput.fill('Need dual jet sensor configuration ±0.001mm');

    // Verify modal is STILL open!
    await expect(modalHeading).toBeVisible();
    await expect(notesInput).toHaveValue('Need dual jet sensor configuration ±0.001mm');

    // Close the modal cleanly via Cancel button
    const cancelBtn = page.getByRole('button', { name: 'Cancel' });
    await cancelBtn.click();
    await expect(modalHeading).not.toBeVisible();

    // Next: Test Schedule Site Visit modal
    const scheduleVisitBtn = page.getByRole('button', { name: 'Schedule Visit' });
    await expect(scheduleVisitBtn).toBeVisible();
    await scheduleVisitBtn.click();

    const visitHeading = page.getByRole('heading', { name: 'Schedule Client Site Visit' });
    await expect(visitHeading).toBeVisible();

    // Click and fill Visit Title input
    const visitTitleInput = page.getByPlaceholder(/e\.g\. On-site Calibration & Dimension Verification/i);
    await visitTitleInput.click();
    await expect(visitHeading).toBeVisible();
    await visitTitleInput.fill('On-site Metrology Audit');
    await expect(visitHeading).toBeVisible();

    // Cancel visit modal
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(visitHeading).not.toBeVisible();

    // Next: Test Create Invoice modal
    const createInvoiceBtn = page.getByRole('button', { name: 'Create Invoice' });
    await expect(createInvoiceBtn).toBeVisible();
    await createInvoiceBtn.click();

    const invoiceHeading = page.getByRole('heading', { name: 'Create Formal Quotation / Tax Invoice' });
    await expect(invoiceHeading).toBeVisible();

    // Click and fill Customer Name input
    const customerNameInput = page.getByPlaceholder('Type name, company, or email to search past records...');
    await customerNameInput.click();
    await expect(invoiceHeading).toBeVisible();
    await customerNameInput.fill('Tata Motors Testing');
    await expect(invoiceHeading).toBeVisible();

    // Cancel invoice modal
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(invoiceHeading).not.toBeVisible();
  });
});
