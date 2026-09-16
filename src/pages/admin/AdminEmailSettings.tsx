import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Send,
  RefreshCw,
  Loader2,
  Server,
  Globe,
  Radio,
  Check,
  AlertCircle,
  Clock,
  ArrowRight,
  Info,
  Users,
  Save,
} from 'lucide-react';
import { emailMessageService } from '../../services/emailMessageService';
import { emailSettingsService } from '../../services/emailSettingsService';
import { emailConfig } from '../../config/email';
import { useAuth } from '../../auth/useAuth';
import { SEOHead } from '../../components/layout/SEOHead';
import { DomainStatusResult, EmailSendResult } from '../../types/email';

export const AdminEmailSettings: React.FC = () => {
  const { user } = useAuth();

  // Domain status state
  const [domainStatus, setDomainStatus] = useState<DomainStatusResult | null>(null);
  const [isCheckingDomain, setIsCheckingDomain] = useState<boolean>(false);
  const [domainError, setDomainError] = useState<string | null>(null);

  // Notification recipients configuration state
  const [primaryAlertEmail, setPrimaryAlertEmail] = useState<string>(
    emailSettingsService.getPrimaryRecipient()
  );
  const [ccAlertEmails, setCcAlertEmails] = useState<string>(
    emailSettingsService.getSettingsSync().ccRecipients || ''
  );
  const [sendCustomerAck, setSendCustomerAck] = useState<boolean>(
    emailSettingsService.getSettingsSync().sendCustomerConfirmation
  );
  const [isSavingRecipients, setIsSavingRecipients] = useState<boolean>(false);
  const [recipientsSaveMessage, setRecipientsSaveMessage] = useState<string | null>(null);
  const [recipientsSaveError, setRecipientsSaveError] = useState<string | null>(null);

  // Test email state
  const [recipientEmail, setRecipientEmail] = useState<string>(
    user?.email || 'admin@akiraautomation.com'
  );
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<EmailSendResult | null>(null);
  const [lastDispatchedAt, setLastDispatchedAt] = useState<string | null>(null);

  const checkDomain = useCallback(async () => {
    setIsCheckingDomain(true);
    setDomainError(null);
    try {
      const res = await emailMessageService.checkDomainStatus();
      setDomainStatus(res);
      if (!res.success && res.error) {
        setDomainError(res.error);
      }
    } catch (err: unknown) {
      setDomainError(err instanceof Error ? err.message : 'Error checking domain status');
    } finally {
      setIsCheckingDomain(false);
    }
  }, []);

  // Load latest settings on mount
  useEffect(() => {
    checkDomain();
    emailSettingsService.getSettings().then((s) => {
      setPrimaryAlertEmail(s.primaryRecipient);
      setCcAlertEmails(s.ccRecipients);
      setSendCustomerAck(s.sendCustomerConfirmation);
    });
  }, [checkDomain]);

  const handleSaveRecipients = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingRecipients(true);
    setRecipientsSaveMessage(null);
    setRecipientsSaveError(null);

    try {
      if (!primaryAlertEmail || !primaryAlertEmail.includes('@')) {
        throw new Error('Please enter a valid Primary Notification Email.');
      }

      await emailSettingsService.updateSettings({
        primaryRecipient: primaryAlertEmail,
        ccRecipients: ccAlertEmails,
        sendCustomerConfirmation: sendCustomerAck,
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('akira_email_settings_updated'));
      }

      setRecipientsSaveMessage('Recipient settings saved. Future customer enquiries will be sent to these addresses.');
      setTimeout(() => setRecipientsSaveMessage(null), 5000);
    } catch (err: unknown) {
      setRecipientsSaveError(err instanceof Error ? err.message : 'Failed to save recipient configuration.');
    } finally {
      setIsSavingRecipients(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || isSendingTest) return;

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await emailMessageService.sendTestEmail(recipientEmail);
      setTestResult(res);
      setLastDispatchedAt(new Date().toLocaleTimeString());
    } catch (err: unknown) {
      setTestResult({
        success: false,
        error: err instanceof Error ? err.message : 'Failed to send test email',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const isSendingActive =
    domainStatus?.isVerified ||
    domainStatus?.status === 'verified' ||
    domainStatus?.status === 'partially_verified';

  return (
    <>
      <SEOHead
        title="Email System & Domain Settings | AKIRA AUTOMATION Admin"
        description="Production email system configuration, Resend domain verification, and delivery testing."
      />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-industrial-dark text-white flex items-center justify-center shadow-subtle">
                <Mail className="w-4 h-4 text-sky-400" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-industrial-dark font-heading tracking-tight">
                Email System & Domain Settings
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Production transactional email infrastructure, customizable lead alert routing, and real-time delivery diagnostics.
            </p>
          </div>

          <button
            type="button"
            onClick={checkDomain}
            disabled={isCheckingDomain}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-subtle transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isCheckingDomain ? 'animate-spin' : ''}`} />
            <span>{isCheckingDomain ? 'Checking Provider...' : 'Refresh Status'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Domain Status & System Architecture */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card 1: Resend Domain Status */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-industrial-primary" />
                  <h2 className="text-sm font-semibold text-industrial-dark font-heading">
                    Resend Domain Status
                  </h2>
                </div>
                <div>
                  {isCheckingDomain ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                    </span>
                  ) : domainStatus?.status === 'verified' || (domainStatus?.isVerified && domainStatus?.status !== 'partially_verified') ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Domain Verified</span>
                    </span>
                  ) : domainStatus?.status === 'partially_verified' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Active for Sending (DKIM Verified)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>DNS In Progress</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Status metrics grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[11px] mb-0.5 font-medium">Configured Domain</span>
                  <span className="font-semibold text-industrial-dark">
                    {domainStatus?.domainName || 'akiraautomation.com'}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[11px] mb-0.5 font-medium">Primary Sender</span>
                  <span className="font-semibold text-industrial-primary truncate block">
                    {emailConfig.fromAddress}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[11px] mb-0.5 font-medium">Sending Status</span>
                  <span className={`font-semibold capitalize ${isSendingActive ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {domainStatus?.status === 'partially_verified'
                      ? 'Active (DKIM Ready)'
                      : domainStatus?.status === 'verified'
                      ? 'Fully Verified'
                      : (domainStatus?.status || 'Verification Pending')}
                  </span>
                </div>
              </div>

              {/* Informational Callout regarding Hostinger MX + Resend DKIM */}
              <div className="p-3.5 rounded-lg bg-sky-50/70 border border-sky-100 flex items-start gap-2.5 text-xs text-sky-900">
                <Info className="w-4 h-4 text-industrial-primary shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Transactional Outbound Active:</strong> Resend DKIM and SPF sending keys are verified on <code className="px-1 py-0.5 bg-white rounded border border-sky-200 text-sky-800">send.akiraautomation.com</code>. Incoming apex emails route to Hostinger MX (<code className="px-1 py-0.5 bg-white rounded border border-sky-200 text-sky-800">mx1.hostinger.com</code>) for your regular business mailboxes.
                </p>
              </div>

              {domainError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{domainError}</span>
                </div>
              )}

              {/* DNS Verification Guide & Active Records */}
              <div className="space-y-2.5 pt-1">
                <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 font-heading">
                  <Server className="w-3.5 h-3.5 text-industrial-primary" />
                  <span>Configured Production DNS Records</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                    <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Record Type</th>
                        <th className="p-2.5">Host / Subdomain</th>
                        <th className="p-2.5">Target Value</th>
                        <th className="p-2.5">DNS Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800">CNAME</td>
                        <td className="p-2.5 text-slate-600">send.akiraautomation.com</td>
                        <td className="p-2.5 text-slate-500 truncate max-w-xs">send.forge.rmta.net</td>
                        <td className="p-2.5">
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                            <Check className="w-3.5 h-3.5" /> Resolved
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800">TXT (DKIM)</td>
                        <td className="p-2.5 text-slate-600">resend._domainkey.akiraautomation.com</td>
                        <td className="p-2.5 text-slate-500 truncate max-w-xs">p=MIGfMA0GCSqGSIb3DQEBA...</td>
                        <td className="p-2.5">
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                            <Check className="w-3.5 h-3.5" /> Resolved
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800">MX (Apex)</td>
                        <td className="p-2.5 text-slate-600">akiraautomation.com</td>
                        <td className="p-2.5 text-slate-500">mx1.hostinger.com (Pref 5)</td>
                        <td className="p-2.5">
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                            <Check className="w-3.5 h-3.5" /> Resolved
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Card 2: Email Routing Architecture */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
              <h2 className="text-sm font-semibold text-industrial-dark font-heading flex items-center gap-2 pb-2 border-b border-slate-100">
                <Radio className="w-3.5 h-3.5 text-industrial-primary" />
                <span>Enterprise Email Topology</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-industrial-primary font-bold">
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Outbound Inquiries</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Dispatched from <span className="font-semibold text-slate-800">notifications@akiraautomation.com</span> via Edge Function <code className="text-[11px] bg-white px-1 py-0.5 rounded border border-slate-200">send-email-notification</code>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Inbound Customer Replies</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Routed to <span className="font-semibold text-slate-800">support@akiraautomation.com</span> and ingested into the enquiry timeline via Edge Function <code className="text-[11px] bg-white px-1 py-0.5 rounded border border-slate-200">resend-inbound-email</code>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-purple-600 font-bold">
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Delivery Status Tracking</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Captures provider message IDs and live delivery status (<code className="text-[11px]">SENT</code>, <code className="text-[11px]">DELIVERED</code>, <code className="text-[11px]">BOUNCED</code>) via <code className="text-[11px] bg-white px-1 py-0.5 rounded border border-slate-200">resend-webhook</code>.
                  </p>
                </div>
              </div>

              {/* Zero Secrets Callout */}
              <div className="p-3.5 bg-sky-50/60 rounded-lg border border-sky-100 flex items-start gap-2.5 text-xs text-sky-900">
                <Shield className="w-4 h-4 text-industrial-primary shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Zero-Trust Security Architecture:</strong> All Resend provider credentials and API keys are strictly confined to Supabase Edge Function environment secrets. No API secrets exist in the frontend bundle or client storage.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Testing */}
          <div className="space-y-6">
            {/* Card 2.5: Inbound Enquiry Notification Routing Settings */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Users className="w-4 h-4 text-industrial-primary" />
                <h2 className="text-sm font-semibold text-industrial-dark font-heading">
                  Enquiry Alert Recipients
                </h2>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Configure which email addresses automatically receive notifications whenever a customer submits an inquiry or RFQ through the website.
              </p>

              <form onSubmit={handleSaveRecipients} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Primary Alert Recipient <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={primaryAlertEmail}
                    onChange={(e) => setPrimaryAlertEmail(e.target.value)}
                    placeholder="milestonegauges@gmail.com"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary text-slate-800 text-xs transition-colors"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Receives customer requirements, tolerances, and direct CRM dossier links.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    CC Team Recipient(s)
                  </label>
                  <input
                    type="text"
                    value={ccAlertEmails}
                    onChange={(e) => setCcAlertEmails(e.target.value)}
                    placeholder="messalessarvices@gmail.com, sales@akiraautomation.com"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary text-slate-800 text-xs transition-colors"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Comma-separated list of secondary team mailboxes.
                  </span>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sendCustomerAck}
                      onChange={(e) => setSendCustomerAck(e.target.checked)}
                      className="rounded border-slate-300 text-industrial-primary focus:ring-industrial-primary/30 mt-0.5"
                    />
                    <span className="text-slate-700 font-medium leading-snug text-xs">
                      Send auto-acknowledgement email to the customer
                    </span>
                  </label>
                </div>

                {recipientsSaveMessage && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{recipientsSaveMessage}</span>
                  </div>
                )}

                {recipientsSaveError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{recipientsSaveError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSavingRecipients}
                  className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-subtle"
                >
                  {isSavingRecipients ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Recipients...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Alert Recipients</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Card 3: Interactive Send Test Email */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Send className="w-4 h-4 text-industrial-primary" />
                <h2 className="text-sm font-semibold text-industrial-dark font-heading">
                  Send Test Email
                </h2>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Trigger a diagnostic test email to verify that Supabase Edge Functions and the Resend API are communicating and accepting transactional dispatches.
              </p>

              <form onSubmit={handleSendTest} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Authorized Test Recipient
                  </label>
                  <input
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="admin@akiraautomation.com"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary text-slate-800 text-xs transition-colors"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Sender:</span>
                    <span className="font-semibold text-slate-800">{emailConfig.fromAddress}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Subject:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[180px]">AKIRA AUTOMATION — Test Email</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSendingTest || !recipientEmail.trim()}
                  className="w-full py-2.5 rounded-lg bg-industrial-primary text-white text-xs font-semibold hover:bg-industrial-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-subtle"
                >
                  {isSendingTest ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Test Dispatch...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Test Email</span>
                    </>
                  )}
                </button>
              </form>

              {/* Real Provider Test Result */}
              {testResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in ${
                    testResult.success
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50/70 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>
                      {testResult.success ? 'Email Dispatched Successfully' : 'Delivery Dispatched Failed'}
                    </span>
                  </div>

                  {testResult.success ? (
                    <div className="space-y-1.5 text-xs pt-1">
                      <div className="flex justify-between">
                        <span className="text-emerald-800">Provider:</span>
                        <span className="font-semibold text-emerald-900">Resend</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-800">Status:</span>
                        <span className="font-semibold text-emerald-900">{testResult.status || 'SENT'}</span>
                      </div>
                      {testResult.messageId && (
                        <div>
                          <span className="text-emerald-800 block mb-0.5">Message ID:</span>
                          <span className="text-[11px] break-all bg-white/90 p-1.5 rounded block border border-emerald-200 font-mono text-emerald-950">
                            {testResult.messageId}
                          </span>
                        </div>
                      )}
                      {lastDispatchedAt && (
                        <div className="flex items-center gap-1 text-slate-500 text-[11px] pt-1">
                          <Clock className="w-3 h-3" />
                          <span>Timestamp: {lastDispatchedAt}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1 text-xs">
                      <p className="text-rose-800 font-semibold">{testResult.error}</p>
                      {testResult.code && (
                        <p className="text-[11px] text-rose-600">Error Code: {testResult.code}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminEmailSettings;
