import {
  NewEnquiryEmailData,
  EnquiryAssignedEmailData,
  FollowupAssignedEmailData,
  FollowupReminderEmailData,
  AdminReplyEmailData,
  TestEmailData,
} from '../types/email';

const DEFAULT_PORTAL_URL = 'https://akiraautomation.com';

/**
 * Universal executive HTML email wrapper.
 * Features:
 * - High-end industrial engineering aesthetic (Obsidian Navy #0A192F, Cyan / Sky Blue accents)
 * - 100% table-based layout for bulletproof rendering across Gmail, Outlook, Apple Mail, Android
 * - Mobile responsive media queries with stacked cards and full-width buttons
 * - Refined typography hierarchy, glowing gradients, subtle borders, and executive brand lockup
 */
function wrapHtmlTemplate(title: string, contentHtml: string): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${title}</title>
  <style type="text/css">
    /* Reset & Base Styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #F1F5F9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #0F172A;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    /* Layout Containers */
    .wrapper {
      max-width: 600px;
      margin: 28px auto;
      background: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #E2E8F0;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04);
    }
    .header {
      background-color: #0A192F;
      padding: 28px 36px 24px 36px;
      text-align: left;
      border-bottom: 1px solid #1E293B;
      position: relative;
    }
    .header h1 {
      margin: 0;
      font-size: 21px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    }
    .header p {
      margin: 6px 0 0 0;
      font-size: 10px;
      color: #38BDF8;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-weight: 700;
    }
    .accent-bar {
      height: 4px;
      background: linear-gradient(90deg, #0284C7 0%, #00D4B8 50%, #38BDF8 100%);
      width: 100%;
    }
    .content {
      padding: 36px;
      background-color: #FFFFFF;
    }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 18px;
    }
    .badge-blue {
      background-color: #EFF6FF;
      color: #0284C7;
      border: 1px solid #BAE6FD;
    }
    .badge-amber {
      background-color: #FFFBEB;
      color: #D97706;
      border: 1px solid #FDE68A;
    }
    .badge-emerald {
      background-color: #ECFDF5;
      color: #059669;
      border: 1px solid #A7F3D0;
    }
    .badge-rose {
      background-color: #FFF1F2;
      color: #E11D48;
      border: 1px solid #FECDD3;
    }

    /* Headings & Text */
    h2 {
      margin: 0 0 14px 0;
      font-size: 20px;
      font-weight: 700;
      color: #0F172A;
      line-height: 1.35;
      letter-spacing: -0.02em;
    }
    p {
      margin: 0 0 16px 0;
      font-size: 14px;
      line-height: 1.65;
      color: #475569;
    }

    /* Technical Card & Specs Table */
    .card {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-left: 4px solid #0284C7;
      border-radius: 10px;
      padding: 18px 20px;
      margin: 22px 0;
    }
    .spec-table {
      width: 100%;
      border-collapse: collapse;
    }
    .field-row {
      border-bottom: 1px solid #EDF2F7;
    }
    .field-row:last-child {
      border-bottom: none;
    }
    .field-label {
      padding: 8px 10px 8px 0;
      font-size: 11.5px;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      vertical-align: top;
      width: 36%;
    }
    .field-value {
      padding: 8px 0 8px 10px;
      font-size: 13.5px;
      font-weight: 500;
      color: #0F172A;
      text-align: right;
      vertical-align: top;
    }
    .field-value a {
      color: #0284C7;
      text-decoration: none;
      font-weight: 600;
    }
    .field-value a:hover {
      text-decoration: underline;
    }

    /* Message Callout */
    .message-box {
      background-color: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      padding: 14px 16px;
      margin-top: 10px;
      font-size: 13px;
      color: #1E293B;
      line-height: 1.65;
      white-space: pre-wrap;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03);
    }

    /* CTA Button */
    .btn-container {
      margin: 28px 0 16px 0;
      text-align: center;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #0284C7 0%, #0369A1 100%);
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 13px 30px;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 700;
      letter-spacing: 0.02em;
      text-align: center;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.28);
    }
    .btn:hover {
      background: #0284C7;
      box-shadow: 0 6px 16px rgba(2, 132, 199, 0.35);
    }

    /* Footer */
    .footer {
      background-color: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      padding: 24px 36px;
      font-size: 12px;
      color: #64748B;
      text-align: center;
      line-height: 1.6;
    }
    .footer strong {
      color: #1E293B;
      font-size: 12.5px;
    }
    .footer p {
      margin: 4px 0;
      font-size: 11.5px;
      color: #64748B;
    }
    .footer-slogan {
      font-size: 11px !important;
      color: #94A3B8 !important;
      font-style: italic;
      margin-top: 10px !important;
    }

    /* Mobile Responsiveness */
    @media only screen and (max-width: 620px) {
      .wrapper {
        width: 100% !important;
        margin: 0 !important;
        border-radius: 0 !important;
        border-left: none !important;
        border-right: none !important;
      }
      .header {
        padding: 22px 20px !important;
      }
      .content {
        padding: 24px 20px !important;
      }
      .footer {
        padding: 22px 20px !important;
      }
      .card {
        padding: 14px 16px !important;
      }
      .field-label {
        display: block !important;
        width: 100% !important;
        padding-bottom: 2px !important;
      }
      .field-value {
        display: block !important;
        width: 100% !important;
        text-align: left !important;
        padding-top: 0 !important;
        padding-left: 0 !important;
        margin-bottom: 8px !important;
      }
      .btn {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
        padding: 14px 20px !important;
      }
    }
  </style>
</head>
<body>
  <div style="background-color: #F1F5F9; padding: 12px 0;">
    <div class="wrapper">
      <div class="accent-bar"></div>
      <div class="header">
        <h1>AKIRA PRECISION AUTOMATION LLP</h1>
        <p>PRECISION &bull; INNOVATION &bull; SMART SOLUTIONS</p>
      </div>
      <div class="content">
        ${contentHtml}
      </div>
      <div class="footer">
        <p><strong>Akira Precision Automation LLP</strong></p>
        <p>Precision Metrology, Multi-Jet Air Gauging & Electronic Inspection Systems</p>
        <p class="footer-slogan">Automating Today... Building Tomorrow...</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Template 1: New RFQ/Enquiry received notification for Admin & Sales team
 */
export function renderNewEnquiryAdminEmail(data: NewEnquiryEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const portalUrl = data.portalUrl || DEFAULT_PORTAL_URL;
  const enquiryUrl = `${portalUrl}/admin/enquiries/${data.enquiryId}`;
  const subject = `[New RFQ] Technical Enquiry from ${data.company || data.name} (${data.specificProduct || data.productCategory || 'General Gauging'})`;

  const html = wrapHtmlTemplate(
    'New Technical RFQ Received',
    `
    <span class="badge badge-blue">Inbound Technical RFQ</span>
    <h2>New Customer Enquiry Submitted</h2>
    <p>A new engineering RFQ has been submitted via the <strong>Akira Precision Automation LLP</strong> web portal and requires initial technical qualification.</p>

    <div class="card">
      <table class="spec-table" role="presentation" cellpadding="0" cellspacing="0">
        <tr class="field-row">
          <td class="field-label">Customer Name</td>
          <td class="field-value">${data.name}</td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Company / OEM</td>
          <td class="field-value">${data.company || 'Not Specified'}</td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Business Email</td>
          <td class="field-value"><a href="mailto:${data.email}">${data.email}</a></td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Phone</td>
          <td class="field-value">${data.phone || 'Not Provided'}</td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Sector</td>
          <td class="field-value">${data.industry || 'Precision Engineering'}</td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Product Category</td>
          <td class="field-value">${data.productCategory || 'Custom Solution'}</td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Specific Gauge / Model</td>
          <td class="field-value"><strong>${data.specificProduct || 'Standard Inspection'}</strong></td>
        </tr>
      </table>

      <div style="margin-top: 14px; font-weight: 700; font-size: 11.5px; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">
        Technical Requirement / Notes:
      </div>
      <div class="message-box">
${data.message}
      </div>
    </div>

    <div class="btn-container">
      <a href="${enquiryUrl}" class="btn">View Enquiry Dossier in Admin Portal &rarr;</a>
    </div>
    `
  );

  const text = `
NEW TECHNICAL RFQ RECEIVED — AKIRA PRECISION AUTOMATION LLP
===========================================================
A new customer enquiry has been registered:

Customer: ${data.name}
Company: ${data.company || 'Not Specified'}
Email: ${data.email}
Phone: ${data.phone || 'Not Provided'}
Product/Solution: ${data.specificProduct || data.productCategory || 'General Gauging'}
Requirement:
${data.message}

View Dossier: ${enquiryUrl}
`.trim();

  return { subject, html, text };
}

/**
 * Template 2: Enquiry acknowledgement sent to prospective customer
 */
export function renderNewEnquiryCustomerEmail(data: NewEnquiryEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Acknowledgement: Akira Precision Automation LLP Enquiry Received (${data.specificProduct || data.productCategory || 'Precision Gauging'})`;

  const html = wrapHtmlTemplate(
    'Enquiry Received',
    `
    <span class="badge badge-emerald">Requirement Acknowledged</span>
    <h2>Thank You for Your Technical Enquiry</h2>
    <p>Dear ${data.name},</p>
    <p>We have successfully received your inquiry regarding <strong>${data.specificProduct || data.productCategory || 'our precision metrology systems'}</strong>. Our applications engineering team is reviewing your requirements and tolerance parameters.</p>

    <div class="card">
      <table class="spec-table" role="presentation" cellpadding="0" cellspacing="0">
        <tr class="field-row">
          <td class="field-label">Reference Enquiry ID</td>
          <td class="field-value"><strong style="font-family: monospace; letter-spacing: 0.05em; color: #0284C7;">#${data.enquiryId.slice(0, 8).toUpperCase()}</strong></td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Product Area</td>
          <td class="field-value">${data.productCategory || 'Custom Metrology'}</td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Target Solution</td>
          <td class="field-value"><strong>${data.specificProduct || 'Engineering Requirement'}</strong></td>
        </tr>
      </table>

      <div style="margin-top: 14px; font-weight: 700; font-size: 11.5px; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">
        Submitted Specification:
      </div>
      <div class="message-box">
${data.message}
      </div>
    </div>

    <p style="margin-top: 20px; font-size: 13.5px; color: #475569;">
      A dedicated technical sales engineer will contact you with initial feasibility notes, dimensional layouts, and proposal details shortly.
    </p>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #EDF2F7; font-size: 13px; color: #475569;">
      Best Regards,<br />
      <strong>Technical Applications Engineering Team</strong><br />
      <span style="color: #0284C7; font-weight: 600;">Akira Precision Automation LLP</span>
    </div>
    `
  );

  const text = `
ENQUIRY ACKNOWLEDGEMENT — AKIRA PRECISION AUTOMATION LLP
========================================================
Dear ${data.name},

Thank you for reaching out to Akira Precision Automation LLP. We have received your technical requirement:
Reference ID: ${data.enquiryId.slice(0, 8)}
Product: ${data.specificProduct || data.productCategory || 'Precision Metrology'}

Our application engineering team will review your specifications and contact you shortly.
`.trim();

  return { subject, html, text };
}

/**
 * Template 3: Staff Assignment notification
 */
export function renderEnquiryAssignedEmail(data: EnquiryAssignedEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const portalUrl = data.portalUrl || DEFAULT_PORTAL_URL;
  const enquiryUrl = `${portalUrl}/admin/login?redirect=/admin/enquiries/${data.enquiryId}`;
  const loginUrl = data.loginUrl || `${portalUrl}/admin/login?redirect=/staff`;
  const assignedDateStr = data.assignedDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const enquirySubject = data.enquirySubject || data.productOrCategory || 'Technical Metrology RFQ';
  const assignedBy = data.assignedBy || 'AKIRA Operations Admin';
  const customerCompany = data.customerCompany || 'Direct Client';

  const subject = `New Enquiry Task Assigned - Akira Precision Automation LLP`;

  const html = wrapHtmlTemplate(
    'New Enquiry Task Assigned',
    `
    <span class="badge badge-blue">New Task Assignment</span>
    <h2>New Enquiry Task Assigned</h2>
    <p>Hello ${data.assignedStaffName},</p>
    <p>You have received a new enquiry task that has been assigned to you for customer engagement and technical qualification.</p>

    <div class="card">
      <table class="spec-table" role="presentation" cellpadding="0" cellspacing="0">
        <tr class="field-row">
          <td class="field-label">Customer</td>
          <td class="field-value"><strong>${data.customerName}</strong></td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Company</td>
          <td class="field-value">${customerCompany}</td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Subject</td>
          <td class="field-value"><strong>${enquirySubject}</strong></td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Assigned By</td>
          <td class="field-value">${assignedBy}</td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Assigned Date</td>
          <td class="field-value">${assignedDateStr}</td>
        </tr>
      </table>

      <div style="margin-top: 14px; font-weight: 700; font-size: 11.5px; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">
        Customer Requirement / Message:
      </div>
      <div class="message-box">
${data.messageSnippet}
      </div>
    </div>

    <p style="margin-top: 20px; font-size: 13.5px;">Please log in to review and handle this enquiry.</p>

    <div class="btn-container">
      <a href="${enquiryUrl}" class="btn" style="color: #ffffff !important;">View Enquiry &rarr;</a>
    </div>

    <p style="font-size: 12px; color: #64748B; margin-top: 18px; text-align: center;">
      <strong>Login:</strong> <a href="${loginUrl}" style="color: #0284C7; text-decoration: underline;">${loginUrl}</a>
    </p>

    <p style="margin-top: 24px; font-size: 13px; color: #475569;">
      Regards,<br />
      <strong>Akira Precision Automation LLP</strong>
    </p>
    `
  );

  const text = `
New Enquiry Task Assigned - Akira Precision Automation LLP
==========================================================

Hello ${data.assignedStaffName},

You have received a new enquiry task.

Customer:
${data.customerName}

Company:
${customerCompany}

Subject:
${enquirySubject}

Assigned By:
${assignedBy}

Assigned Date:
${assignedDateStr}

Please log in to review and handle this enquiry.

[View Enquiry]: ${enquiryUrl}

Login:
${loginUrl}

Regards,
Akira Precision Automation LLP
`.trim();

  return { subject, html, text };
}

/**
 * Template 4: Follow-up Assigned notification
 */
export function renderFollowupAssignedEmail(data: FollowupAssignedEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const portalUrl = data.portalUrl || DEFAULT_PORTAL_URL;
  const followupUrl = `${portalUrl}/staff/followups`;
  const subject = `[Task Assigned] ${data.type.toUpperCase()} Follow-up with ${data.customerCompany || data.customerName}`;

  const html = wrapHtmlTemplate(
    'Follow-up Task Assigned',
    `
    <span class="badge badge-amber">Action Item</span>
    <h2>New Follow-up Task Assigned</h2>
    <p>Hello ${data.assignedStaffName},</p>
    <p>A follow-up milestone has been scheduled and assigned to you for engineering coordination:</p>

    <div class="card">
      <table class="spec-table" role="presentation" cellpadding="0" cellspacing="0">
        <tr class="field-row">
          <td class="field-label">Customer</td>
          <td class="field-value">${data.customerName} (${data.customerCompany || 'N/A'})</td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Task Type</td>
          <td class="field-value"><strong style="color: #0284C7; letter-spacing: 0.05em;">${data.type.toUpperCase()}</strong></td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Scheduled Date/Time</td>
          <td class="field-value">${new Date(data.scheduledAt).toLocaleString()}</td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Priority</td>
          <td class="field-value"><span style="text-transform: capitalize; font-weight: 600;">${data.priority || 'Normal'}</span></td>
        </tr>
      </table>

      ${data.notes ? `
      <div style="margin-top: 14px; font-weight: 700; font-size: 11.5px; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">
        Briefing Notes:
      </div>
      <div class="message-box">${data.notes}</div>
      ` : ''}
    </div>

    <div class="btn-container">
      <a href="${followupUrl}" class="btn">View Follow-up Tasks &rarr;</a>
    </div>
    `
  );

  const text = `
FOLLOW-UP ASSIGNED — AKIRA PRECISION AUTOMATION LLP
===================================================
Hello ${data.assignedStaffName},

Follow-up scheduled for ${data.customerName}:
Type: ${data.type.toUpperCase()}
Scheduled At: ${new Date(data.scheduledAt).toLocaleString()}
Priority: ${data.priority || 'Normal'}

Manage Tasks: ${followupUrl}
`.trim();

  return { subject, html, text };
}

/**
 * Template 5: Follow-up Reminder / Overdue Alert
 */
export function renderFollowupReminderEmail(data: FollowupReminderEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const portalUrl = data.portalUrl || DEFAULT_PORTAL_URL;
  const followupUrl = `${portalUrl}/staff/followups`;
  const badgeClass = data.isOverdue ? 'badge-rose' : 'badge-amber';
  const badgeText = data.isOverdue ? 'OVERDUE TASK ALERT' : 'TASK DUE TODAY';
  const subject = `[${data.isOverdue ? 'OVERDUE' : 'REMINDER'}] ${data.type.toUpperCase()} Follow-up for ${data.customerCompany || data.customerName}`;

  const html = wrapHtmlTemplate(
    'Follow-up Reminder',
    `
    <span class="badge ${badgeClass}">${badgeText}</span>
    <h2>${data.isOverdue ? 'Attention Required: Overdue Follow-up' : 'Follow-up Scheduled for Today'}</h2>
    <p>Hello ${data.assignedStaffName},</p>
    <p>${data.isOverdue ? 'The following scheduled customer follow-up has passed its due window and requires immediate resolution.' : 'You have a scheduled customer follow-up milestone due today.'}</p>

    <div class="card" style="border-left-color: ${data.isOverdue ? '#E11D48' : '#D97706'};">
      <table class="spec-table" role="presentation" cellpadding="0" cellspacing="0">
        <tr class="field-row">
          <td class="field-label">Customer</td>
          <td class="field-value">${data.customerName} (${data.customerCompany || 'N/A'})</td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Activity Type</td>
          <td class="field-value"><strong>${data.type.toUpperCase()}</strong></td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Scheduled Date</td>
          <td class="field-value">${new Date(data.scheduledAt).toLocaleString()}</td>
        </tr>
      </table>

      ${data.notes ? `
      <div style="margin-top: 14px; font-weight: 700; font-size: 11.5px; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">
        Notes:
      </div>
      <div class="message-box">${data.notes}</div>
      ` : ''}
    </div>

    <div class="btn-container">
      <a href="${followupUrl}" class="btn" style="background: ${data.isOverdue ? 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)' : 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)'};">Complete Follow-up in Portal &rarr;</a>
    </div>
    `
  );

  const text = `
${badgeText} — AKIRA PRECISION AUTOMATION LLP
=============================================
Hello ${data.assignedStaffName},

Follow-up for ${data.customerName}:
Type: ${data.type.toUpperCase()}
Scheduled: ${new Date(data.scheduledAt).toLocaleString()}

Resolve Task: ${followupUrl}
`.trim();

  return { subject, html, text };
}

/**
 * Template 6: Admin direct reply to customer from Enquiry Details screen
 */
export function renderAdminReplyEmail(data: AdminReplyEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const portalUrl = data.portalUrl || DEFAULT_PORTAL_URL;
  const replySubject = data.subject.startsWith('Re:')
    ? data.subject
    : `Re: ${data.subject || 'Akira Precision Automation LLP Enquiry'}`;

  const html = wrapHtmlTemplate(
    replySubject,
    `
    <span class="badge badge-blue">Customer Support / Technical Advisory</span>
    <h2>Technical Response from Akira Precision Automation LLP</h2>
    <p>Dear ${data.customerName},</p>
    <p>Thank you for reaching out to Akira Precision Automation LLP. Our engineering and applications team has reviewed your enquiry.</p>

    <div class="card">
      <table class="spec-table" role="presentation" cellpadding="0" cellspacing="0">
        <tr class="field-row">
          <td class="field-label">Enquiry Reference</td>
          <td class="field-value"><strong style="font-family: monospace; letter-spacing: 0.05em; color: #0284C7;">#${data.enquiryId.slice(0, 8).toUpperCase()}</strong></td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Representative</td>
          <td class="field-value">${data.senderName} (${data.senderRole || 'Applications Engineer'})</td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Subject</td>
          <td class="field-value"><strong>${data.subject}</strong></td>
        </tr>
      </table>

      <div style="margin-top: 14px; font-weight: 700; font-size: 11.5px; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">
        Technical Message:
      </div>
      <div class="message-box" style="font-style: normal; font-size: 14px; color: #1E293B;">
${data.message}
      </div>
    </div>

    <p style="font-size: 13.5px; color: #64748B;">
      You may reply directly to this email to continue the technical discussion, or contact our operations desk at
      <a href="mailto:support@akiraautomation.com" style="color: #0284C7; font-weight: 600; text-decoration: underline;">support@akiraautomation.com</a>.
    </p>

    <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid #EDF2F7; font-size: 13px; color: #475569;">
      <strong style="color: #0F172A; font-size: 14px;">${data.senderName}</strong><br />
      <span style="color: #64748B;">${data.senderRole || 'Technical Applications Team'}</span><br />
      <strong style="color: #0284C7;">Akira Precision Automation LLP</strong><br />
      <span style="font-size: 12px; color: #94A3B8;">Web: <a href="${portalUrl}" style="color: #0284C7; text-decoration: none;">akiraautomation.com</a></span>
    </div>
    `
  );

  const text = `
AKIRA PRECISION AUTOMATION LLP — TECHNICAL RESPONSE
===================================================
Dear ${data.customerName},

Enquiry Reference: #${data.enquiryId.slice(0, 8).toUpperCase()}
Representative: ${data.senderName} (${data.senderRole || 'Applications Engineer'})
Subject: ${data.subject}

${data.message}

--------------------------------------
You may reply directly to this email or reach us at support@akiraautomation.com.

Regards,
${data.senderName}
Akira Precision Automation LLP
Precision Metrology & Industrial Inspection Systems
https://akiraautomation.com
`.trim();

  return { subject: replySubject, html, text };
}

/**
 * Template 7: System diagnostic test email for Admin Settings
 */
export function renderTestEmail(data: TestEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = 'Akira Precision Automation LLP — Test Email';
  const timestamp = data.timestamp || new Date().toISOString();

  const html = wrapHtmlTemplate(
    subject,
    `
    <span class="badge badge-emerald">Operational Diagnostic Test</span>
    <h2>AKIRA Email Delivery Test</h2>
    <p>This is a test email dispatched from the <strong>Akira Precision Automation LLP</strong> email delivery engine to confirm live provider acceptance and end-to-end routing.</p>

    <div class="card" style="border-left-color: #059669;">
      <table class="spec-table" role="presentation" cellpadding="0" cellspacing="0">
        <tr class="field-row">
          <td class="field-label">Status</td>
          <td class="field-value" style="color: #059669; font-weight: 700;">OK / Accepted</td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Triggered By</td>
          <td class="field-value">${data.triggeredBy}</td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Target Recipient</td>
          <td class="field-value"><strong style="color: #0284C7;">${data.recipientEmail}</strong></td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Environment</td>
          <td class="field-value">${data.environment}</td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Edge Function</td>
          <td class="field-value"><code style="background: #E2E8F0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #0F172A;">send-email-notification</code></td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Provider</td>
          <td class="field-value"><strong>Resend (api.resend.com)</strong></td>
        </tr>
        <tr class="field-row">
          <td class="field-label">Timestamp</td>
          <td class="field-value" style="font-family: monospace; font-size: 12px; color: #64748B;">${timestamp}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #475569;">
      If you received this message, the transactional email pipeline from Supabase Edge Functions through Resend is operational and routing to verified recipient mailboxes.
    </p>
    `
  );

  const text = `
AKIRA PRECISION AUTOMATION LLP — Test Email
===========================================
This is a test email from the Akira Precision Automation LLP email system.

Recipient: ${data.recipientEmail}
Triggered By: ${data.triggeredBy}
Environment: ${data.environment}
Timestamp: ${timestamp}
Edge Function: send-email-notification
Provider: Resend (api.resend.com)

If you received this message, transactional email dispatch is operational.
`.trim();

  return { subject, html, text };
}
