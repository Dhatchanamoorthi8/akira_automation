import React from 'react';
import { Send, CheckCircle2, AlertCircle, Mail, ExternalLink } from 'lucide-react';
import { useEnquiryForm } from '../../hooks/useEnquiryForm';
import { productCategories } from '../../data/productSummaries';
import { industries } from '../../data/industries';

interface EnquiryFormProps {
  variant?: 'modal' | 'inline';
  idPrefix?: string;
  preselectedProduct?: string;
  onCancel?: () => void;
  onSubmitted?: () => void;
}

export const EnquiryForm: React.FC<EnquiryFormProps> = ({
  variant = 'inline',
  idPrefix = 'enquiry-',
  preselectedProduct = '',
  onCancel,
  onSubmitted,
}) => {
  const {
    formData,
    errors,
    isSubmitting,
    isSuccess,
    serverError,
    mailtoFallbackUrl,
    recipientEmail,
    handleChange,
    handleSubmit,
    resetForm,
  } = useEnquiryForm({
    preselectedProduct,
    onSuccess: onSubmitted,
  });

  const categories = productCategories.filter(c => c.slug !== 'all');

  if (isSuccess) {
    return (
      <div 
        className="p-8 text-center space-y-4 bg-emerald-50/70 border border-emerald-200 rounded-xl animate-in fade-in duration-300"
        role="status"
        aria-live="polite"
      >
        <div className="w-14 h-14 bg-emerald-100 text-tolerance-green rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-industrial-dark font-heading">
            Thank you. Your enquiry has been submitted successfully.
          </h3>
          <span className="sr-only">Technical Inquiry Dispatched</span>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
            Thank you, <strong className="text-industrial-dark">{formData.name}</strong>. Your requirement for{' '}
            <strong className="text-industrial-dark">
              {formData.specificProduct || formData.productCategory}
            </strong>{' '}
            has been received by our engineering team. We will review your specifications and contact you shortly.
          </p>
        </div>

        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-industrial-dark hover:bg-slate-50 transition-colors shadow-sm"
          >
            Send Another Inquiry
          </button>
          {mailtoFallbackUrl && (
            <a
              href={mailtoFallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              title="Open email in your desktop or mobile email app"
            >
              <Mail className="w-3.5 h-3.5 text-industrial-primary" />
              <span>Send Direct Copy via Email Client</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 rounded-lg bg-industrial-primary text-white text-xs font-semibold hover:bg-industrial-hover transition-colors shadow-sm"
            >
              Close Window
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label="Technical Sales & Engineering Enquiry Form">
      {serverError && (
        <div 
          className="p-4 rounded-lg bg-red-50 border border-red-200 text-tolerance-red text-xs space-y-2"
          role="alert"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{serverError}</span>
          </div>
          {mailtoFallbackUrl && (
            <div className="pt-1 pl-6">
              <a
                href={mailtoFallbackUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-tolerance-red text-white text-[11px] font-semibold hover:bg-red-700 transition-colors shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Open Pre-filled Email to {recipientEmail}</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Row 1: Name & Company */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${idPrefix}name`} className="block text-xs font-semibold text-industrial-dark mb-1.5">
            Full Name <span className="text-tolerance-red" aria-hidden="true">*</span>
          </label>
          <input
            id={`${idPrefix}name`}
            name="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Ramesh Kumar"
            className={`w-full px-3.5 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
              errors.name 
                ? 'border-tolerance-red focus:ring-tolerance-red/30' 
                : 'border-slate-300 focus:ring-industrial-primary focus:border-transparent'
            }`}
            aria-required="true"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${idPrefix}name-error` : undefined}
          />
          {errors.name && (
            <p id={`${idPrefix}name-error`} className="text-[11px] text-tolerance-red mt-1">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${idPrefix}company`} className="block text-xs font-semibold text-industrial-dark mb-1.5">
            Company / Organization <span className="text-tolerance-red" aria-hidden="true">*</span>
          </label>
          <input
            id={`${idPrefix}company`}
            name="companyName"
            type="text"
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            placeholder="e.g. Precision Auto Components Ltd"
            className={`w-full px-3.5 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
              errors.companyName 
                ? 'border-tolerance-red focus:ring-tolerance-red/30' 
                : 'border-slate-300 focus:ring-industrial-primary focus:border-transparent'
            }`}
            aria-required="true"
            aria-invalid={!!errors.companyName}
            aria-describedby={errors.companyName ? `${idPrefix}company-error` : undefined}
          />
          {errors.companyName && (
            <p id={`${idPrefix}company-error`} className="text-[11px] text-tolerance-red mt-1">
              {errors.companyName}
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Email & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${idPrefix}email`} className="block text-xs font-semibold text-industrial-dark mb-1.5">
            Business Email <span className="text-tolerance-red" aria-hidden="true">*</span>
          </label>
          <input
            id={`${idPrefix}email`}
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="quality@company.com"
            className={`w-full px-3.5 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
              errors.email 
                ? 'border-tolerance-red focus:ring-tolerance-red/30' 
                : 'border-slate-300 focus:ring-industrial-primary focus:border-transparent'
            }`}
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${idPrefix}email-error` : undefined}
          />
          {errors.email && (
            <p id={`${idPrefix}email-error`} className="text-[11px] text-tolerance-red mt-1">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${idPrefix}phone`} className="block text-xs font-semibold text-industrial-dark mb-1.5">
            Contact Number / Mobile <span className="text-tolerance-red" aria-hidden="true">*</span>
          </label>
          <input
            id={`${idPrefix}phone`}
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+91 98765 43210"
            className={`w-full px-3.5 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors font-mono ${
              errors.phone 
                ? 'border-tolerance-red focus:ring-tolerance-red/30' 
                : 'border-slate-300 focus:ring-industrial-primary focus:border-transparent'
            }`}
            aria-required="true"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? `${idPrefix}phone-error` : undefined}
          />
          {errors.phone && (
            <p id={`${idPrefix}phone-error`} className="text-[11px] text-tolerance-red mt-1">
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      {/* Row 3: Industry & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${idPrefix}industry`} className="block text-xs font-semibold text-industrial-dark mb-1.5">
            Manufacturing Sector
          </label>
          <select
            id={`${idPrefix}industry`}
            value={formData.industry}
            onChange={(e) => handleChange('industry', e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-industrial-primary focus:border-transparent bg-white"
          >
            {industries.map((ind) => (
              <option key={ind.id} value={ind.name}>
                {ind.name}
              </option>
            ))}
            <option value="Other Industry">Other Manufacturing Sector</option>
          </select>
        </div>

        <div>
          <label htmlFor={`${idPrefix}category`} className="block text-xs font-semibold text-industrial-dark mb-1.5">
            Product / Solution Category
          </label>
          <select
            id={`${idPrefix}category`}
            value={formData.productCategory}
            onChange={(e) => handleChange('productCategory', e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-industrial-primary focus:border-transparent bg-white"
          >
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.name}>
                {cat.name}
              </option>
            ))}
            <option value="Custom Fixture / Special Solution">Custom Fixture / Special Solution</option>
          </select>
        </div>
      </div>

      {/* Specific Product if known */}
      <div>
        <label htmlFor={`${idPrefix}specific`} className="block text-xs font-semibold text-industrial-dark mb-1.5">
          Specific Gauge Model / Drawing Ref <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <input
          id={`${idPrefix}specific`}
          name="specificProduct"
          type="text"
          value={formData.specificProduct || ''}
          onChange={(e) => handleChange('specificProduct', e.target.value)}
          placeholder="e.g. Air Plug Gauge Ø45mm or Camshaft Multigauging Station"
          className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-industrial-primary focus:border-transparent bg-white"
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor={`${idPrefix}message`} className="block text-xs font-semibold text-industrial-dark mb-1.5">
          Technical Requirement / Tolerance Specifications <span className="text-tolerance-red" aria-hidden="true">*</span>
        </label>
        <textarea
          id={`${idPrefix}message`}
          name="message"
          rows={variant === 'modal' ? 3 : 4}
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          placeholder="Please share details such as diameter range, tolerance limits, component type, checking parameters, or quantity required..."
          className={`w-full px-3.5 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
            errors.message 
              ? 'border-tolerance-red focus:ring-tolerance-red/30' 
              : 'border-slate-300 focus:ring-industrial-primary focus:border-transparent'
          }`}
          aria-required="true"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? `${idPrefix}message-error` : undefined}
        />
        {errors.message && (
          <p id={`${idPrefix}message-error`} className="text-[11px] text-tolerance-red mt-1">
            {errors.message}
          </p>
        )}
      </div>

      {/* Submit / Actions Bar */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-[11px] text-slate-500 order-2 sm:order-1 leading-tight text-center sm:text-left">
          <div>
            Delivered to <strong className="font-mono text-industrial-dark">{recipientEmail}</strong>
          </div>
          <div className="text-slate-400 text-[10px] mt-0.5">
            ISO calibration & engineering support
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2 shrink-0">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 sm:flex-none h-10 px-4 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-industrial-dark active:translate-y-0.5 text-xs font-semibold transition-all inline-flex items-center justify-center whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-industrial-primary focus:ring-offset-2"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:flex-none h-10 px-5 rounded-lg bg-industrial-primary text-white text-xs font-semibold shadow-sm hover:bg-industrial-hover hover:shadow-md active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-industrial-primary focus:ring-offset-2 transition-all duration-200 disabled:opacity-60 inline-flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Sending to Engineering Desk...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 shrink-0" />
                <span>Submit Technical Enquiry</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
