import {
  NewEnquiryEmailData,
  EnquiryAssignedEmailData,
  FollowupAssignedEmailData,
  FollowupReminderEmailData,
} from '../types/email';

const DEFAULT_PORTAL_URL = 'https://akiraautomation.com';

function wrapHtmlTemplate(title: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased; }
    .wrapper { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background-color: #0f172a; padding: 24px 32px; border-bottom: 3px solid #2563eb; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em; }
    .header p { margin: 4px 0 0 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
    .content { padding: 32px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 16px; }
    .badge-blue { background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .badge-amber { background-color: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
    .badge-emerald { background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
    .badge-rose { background-color: #fff1f2; color: #be123c; border: 1px solid #fecdd3; }
    h2 { margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #0f172a; }
    p { margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #475569; }
    .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .field-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .field-row:last-child { border-bottom: none; }
    .field-label { font-weight: 600; color: #64748b; }
    .field-value { font-weight: 500; color: #0f172a; text-align: right; }
    .message-box { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin-top: 12px; font-size: 13px; color: #334155; font-style: italic; white-space: pre-wrap; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; text-align: center; margin: 20px 0 12px 0; }
    .btn:hover { background-color: #1d4ed8; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; font-size: 12px; color: #64748b; text-align: center; }
    .footer p { margin: 4px 0; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>AKIRA AUTOMATION</h1>
      <p>Precision Gauging & Industrial Metrology Solutions</p>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p><strong>AKIRA AUTOMATION PRIVATE LIMITED</strong></p>
      <p>Specialists in Multi-Jet Air Gauging, Electronic Gauging Systems, & Precision Metrology</p>
      <p>This is an automated operational notification. Please do not reply directly to this email.</p>
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
    <p>A new engineering RFQ has been submitted via the AKIRA AUTOMATION web portal and requires initial technical qualification.</p>

    <div class="card">
      <div class="field-row">
        <span class="field-label">Customer Name</span>
        <span class="field-value">${data.name}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Company / OEM</span>
        <span class="field-value">${data.company || 'Not Specified'}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Business Email</span>
        <span class="field-value"><a href="mailto:${data.email}">${data.email}</a></span>
      </div>
      <div class="field-row">
        <span class="field-label">Phone</span>
        <span class="field-value">${data.phone || 'Not Provided'}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Sector</span>
        <span class="field-value">${data.industry || 'Precision Engineering'}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Product Category</span>
        <span class="field-value">${data.productCategory || 'Custom Solution'}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Specific Gauge / Model</span>
        <span class="field-value"><strong>${data.specificProduct || 'Standard Inspection'}</strong></span>
      </div>
      <div style="margin-top: 12px; font-weight: 600; font-size: 13px; color: #64748b;">
        Technical Requirement / Notes:
      </div>
      <div class="message-box">
        ${data.message}
      </div>
    </div>

    <center>
      <a href="${enquiryUrl}" class="btn">View Enquiry Dossier in Admin Portal</a>
    </center>
    `
  );

  const text = `
NEW TECHNICAL RFQ RECEIVED — AKIRA AUTOMATION
=============================================
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
  const subject = `Acknowledgement: AKIRA AUTOMATION Enquiry Received (${data.specificProduct || data.productCategory || 'Precision Gauging'})`;

  const html = wrapHtmlTemplate(
    'Enquiry Received',
    `
    <span class="badge badge-emerald">Requirement Acknowledged</span>
    <h2>Thank You for Your Technical Enquiry</h2>
    <p>Dear ${data.name},</p>
    <p>We have successfully received your inquiry regarding <strong>${data.specificProduct || data.productCategory || 'our precision metrology systems'}</strong>. Our applications engineering team is reviewing your requirements and tolerance parameters.</p>

    <div class="card">
      <div class="field-row">
        <span class="field-label">Reference Enquiry ID</span>
        <span class="field-value">${data.enquiryId.slice(0, 8)}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Product Area</span>
        <span class="field-value">${data.productCategory || 'Custom Metrology'}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Target Solution</span>
        <span class="field-value">${data.specificProduct || 'Engineering Requirement'}</span>
      </div>
      <div style="margin-top: 12px; font-weight: 600; font-size: 13px; color: #64748b;">
        Submitted Specification:
      </div>
      <div class="message-box">
        ${data.message}
      </div>
    </div>

    <p>A technical sales representative will contact you with feasibility notes and proposal details shortly.</p>
    `
  );

  const text = `
ENQUIRY ACKNOWLEDGEMENT — AKIRA AUTOMATION
=========================================
Dear ${data.name},

Thank you for reaching out to AKIRA AUTOMATION. We have received your technical requirement:
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

  const subject = `New Enquiry Task Assigned - AKIRA AUTOMATION`;

  const html = wrapHtmlTemplate(
    'New Enquiry Task Assigned',
    `
    <span class="badge badge-blue">New Task Assignment</span>
    <h2>New Enquiry Task Assigned</h2>
    <p>Hello ${data.assignedStaffName},</p>
    <p>You have received a new enquiry task.</p>

    <div class="card">
      <div class="field-row">
        <span class="field-label">Customer</span>
        <span class="field-value">${data.customerName}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Company</span>
        <span class="field-value">${customerCompany}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Subject</span>
        <span class="field-value"><strong>${enquirySubject}</strong></span>
      </div>
      <div class="field-row">
        <span class="field-label">Assigned By</span>
        <span class="field-value">${assignedBy}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Assigned Date</span>
        <span class="field-value">${assignedDateStr}</span>
      </div>
      <div style="margin-top: 12px; font-weight: 600; font-size: 13px; color: #64748b;">
        Customer Requirement / Message:
      </div>
      <div class="message-box">
        ${data.messageSnippet}
      </div>
    </div>

    <p style="margin-top: 20px;">Please log in to review and handle this enquiry.</p>

    <center>
      <a href="${enquiryUrl}" class="btn" style="color: #ffffff !important;">View Enquiry</a>
    </center>

    <p style="font-size: 12px; color: #64748b; margin-top: 16px;">
      <strong>Login:</strong> <a href="${loginUrl}" style="color: #2563eb;">${loginUrl}</a>
    </p>

    <p style="margin-top: 24px; font-size: 13px; color: #475569;">
      Regards,<br />
      <strong>AKIRA AUTOMATION</strong>
    </p>
    `
  );

  const text = `
New Enquiry Task Assigned - AKIRA AUTOMATION
=============================================

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
AKIRA AUTOMATION
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
    <p>A follow-up milestone has been scheduled and assigned to you:</p>

    <div class="card">
      <div class="field-row">
        <span class="field-label">Customer</span>
        <span class="field-value">${data.customerName} (${data.customerCompany || 'N/A'})</span>
      </div>
      <div class="field-row">
        <span class="field-label">Task Type</span>
        <span class="field-value"><strong>${data.type.toUpperCase()}</strong></span>
      </div>
      <div class="field-row">
        <span class="field-label">Scheduled Date/Time</span>
        <span class="field-value">${new Date(data.scheduledAt).toLocaleString()}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Priority</span>
        <span class="field-value">${data.priority || 'Normal'}</span>
      </div>
      ${data.notes ? `
      <div style="margin-top: 12px; font-weight: 600; font-size: 13px; color: #64748b;">
        Briefing Notes:
      </div>
      <div class="message-box">${data.notes}</div>
      ` : ''}
    </div>

    <center>
      <a href="${followupUrl}" class="btn">View Follow-up Tasks</a>
    </center>
    `
  );

  const text = `
FOLLOW-UP ASSIGNED — AKIRA AUTOMATION
====================================
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

    <div class="card">
      <div class="field-row">
        <span class="field-label">Customer</span>
        <span class="field-value">${data.customerName} (${data.customerCompany || 'N/A'})</span>
      </div>
      <div class="field-row">
        <span class="field-label">Activity Type</span>
        <span class="field-value"><strong>${data.type.toUpperCase()}</strong></span>
      </div>
      <div class="field-row">
        <span class="field-label">Scheduled Date</span>
        <span class="field-value">${new Date(data.scheduledAt).toLocaleString()}</span>
      </div>
      ${data.notes ? `
      <div style="margin-top: 12px; font-weight: 600; font-size: 13px; color: #64748b;">
        Notes:
      </div>
      <div class="message-box">${data.notes}</div>
      ` : ''}
    </div>

    <center>
      <a href="${followupUrl}" class="btn">Complete Follow-up in Portal</a>
    </center>
    `
  );

  const text = `
${badgeText} — AKIRA AUTOMATION
==============================
Hello ${data.assignedStaffName},

Follow-up for ${data.customerName}:
Type: ${data.type.toUpperCase()}
Scheduled: ${new Date(data.scheduledAt).toLocaleString()}

Resolve Task: ${followupUrl}
`.trim();

  return { subject, html, text };
}
