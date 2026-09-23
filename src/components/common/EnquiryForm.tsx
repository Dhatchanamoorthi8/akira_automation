import React from 'react';
import {
  Form,
  TextField,
  Label,
  Input,
  TextArea,
  Description,
  FieldError,
  Button,
  Select,
  ListBox,
} from '@heroui/react';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Mail,
  ExternalLink,
  User,
  Building2,
  Phone,
  Factory,
  Package,
  FileText,
  Sliders,
  RotateCcw,
  Check,
} from 'lucide-react';
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

  const categories = productCategories.filter((c) => c.slug !== 'all');

  if (isSuccess) {
    return (
      <div
        className="p-6 sm:p-8 text-center space-y-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl animate-in fade-in duration-300 shadow-sm"
        role="status"
        aria-live="polite"
      >
        <div className="w-14 h-14 bg-emerald-100 text-tolerance-green rounded-full flex items-center justify-center mx-auto shadow-sm ring-4 ring-emerald-50">
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
          <Button
            type="button"
            variant="secondary"
            onPress={resetForm}
            className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-industrial-dark hover:bg-slate-50 transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Send Another Inquiry</span>
          </Button>

          {mailtoFallbackUrl && (
            <a
              href={mailtoFallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              title="Open email in your desktop or mobile email app"
            >
              <Mail className="w-3.5 h-3.5 text-industrial-primary" />
              <span>Send Direct Copy via Email Client</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}

          {onCancel && (
            <Button
              type="button"
              variant="primary"
              onPress={onCancel}
              className="px-5 py-2 rounded-lg bg-industrial-primary text-white text-xs font-semibold hover:bg-industrial-hover transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Close Window</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Form
      onSubmit={handleSubmit}
      validationBehavior="aria"
      className="space-y-4"
      aria-label="Technical Sales & Engineering Enquiry Form"
    >
      {serverError && (
        <div
          className="p-4 rounded-xl bg-red-50/90 border border-red-200 text-tolerance-red text-xs space-y-2 animate-in fade-in duration-200 shadow-xs"
          role="alert"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{serverError}</span>
          </div>
          {mailtoFallbackUrl && (
            <div className="pt-1 pl-6">
              <a
                href={mailtoFallbackUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tolerance-red text-white text-xs font-semibold hover:bg-red-700 transition-colors shadow-xs"
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
        <TextField
          isRequired
          isInvalid={!!errors.name}
          validationBehavior="aria"
          className="flex flex-col gap-1.5"
        >
          <Label
            htmlFor={`${idPrefix}name`}
            className="text-xs font-semibold text-industrial-dark inline-flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5 text-industrial-primary shrink-0" />
            <span>Full Name</span>
            <span className="text-tolerance-red" aria-hidden="true">*</span>
          </Label>
          <Input
            id={`${idPrefix}name`}
            name="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Ramesh Kumar"
            className={`w-full px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors shadow-xs ${
              errors.name
                ? 'border-tolerance-red focus:ring-tolerance-red/30'
                : 'border-slate-300 focus:ring-industrial-primary focus:border-transparent'
            }`}
            aria-required="true"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${idPrefix}name-error` : undefined}
          />
          {errors.name ? (
            <FieldError
              id={`${idPrefix}name-error`}
              className="text-xs text-tolerance-red mt-0.5 inline-flex items-center gap-1 font-medium"
            >
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.name}</span>
            </FieldError>
          ) : (
            <Description className="text-xs text-slate-500">
              Technical contact person name
            </Description>
          )}
        </TextField>

        <TextField
          isRequired
          isInvalid={!!errors.companyName}
          validationBehavior="aria"
          className="flex flex-col gap-1.5"
        >
          <Label
            htmlFor={`${idPrefix}company`}
            className="text-xs font-semibold text-industrial-dark inline-flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-industrial-primary shrink-0" />
            <span>Company / Organization</span>
            <span className="text-tolerance-red" aria-hidden="true">*</span>
          </Label>
          <Input
            id={`${idPrefix}company`}
            name="companyName"
            type="text"
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            placeholder="e.g. Precision Auto Components Ltd"
            className={`w-full px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors shadow-xs ${
              errors.companyName
                ? 'border-tolerance-red focus:ring-tolerance-red/30'
                : 'border-slate-300 focus:ring-industrial-primary focus:border-transparent'
            }`}
            aria-required="true"
            aria-invalid={!!errors.companyName}
            aria-describedby={errors.companyName ? `${idPrefix}company-error` : undefined}
          />
          {errors.companyName ? (
            <FieldError
              id={`${idPrefix}company-error`}
              className="text-xs text-tolerance-red mt-0.5 inline-flex items-center gap-1 font-medium"
            >
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.companyName}</span>
            </FieldError>
          ) : (
            <Description className="text-xs text-slate-500">
              Manufacturing plant or enterprise entity
            </Description>
          )}
        </TextField>
      </div>

      {/* Row 2: Email & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          isRequired
          isInvalid={!!errors.email}
          validationBehavior="aria"
          className="flex flex-col gap-1.5"
        >
          <Label
            htmlFor={`${idPrefix}email`}
            className="text-xs font-semibold text-industrial-dark inline-flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5 text-industrial-primary shrink-0" />
            <span>Business Email</span>
            <span className="text-tolerance-red" aria-hidden="true">*</span>
          </Label>
          <Input
            id={`${idPrefix}email`}
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="quality@company.com"
            className={`w-full px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors shadow-xs ${
              errors.email
                ? 'border-tolerance-red focus:ring-tolerance-red/30'
                : 'border-slate-300 focus:ring-industrial-primary focus:border-transparent'
            }`}
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${idPrefix}email-error` : undefined}
          />
          {errors.email ? (
            <FieldError
              id={`${idPrefix}email-error`}
              className="text-xs text-tolerance-red mt-0.5 inline-flex items-center gap-1 font-medium"
            >
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.email}</span>
            </FieldError>
          ) : (
            <Description className="text-xs text-slate-500">
              For official quote dispatch & CAD specs
            </Description>
          )}
        </TextField>

        <TextField
          isRequired
          isInvalid={!!errors.phone}
          validationBehavior="aria"
          className="flex flex-col gap-1.5"
        >
          <Label
            htmlFor={`${idPrefix}phone`}
            className="text-xs font-semibold text-industrial-dark inline-flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5 text-industrial-primary shrink-0" />
            <span>Contact Number / Mobile</span>
            <span className="text-tolerance-red" aria-hidden="true">*</span>
          </Label>
          <Input
            id={`${idPrefix}phone`}
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+91 98765 43210"
            className={`w-full px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors font-sans tabular-nums shadow-xs ${
              errors.phone
                ? 'border-tolerance-red focus:ring-tolerance-red/30'
                : 'border-slate-300 focus:ring-industrial-primary focus:border-transparent'
            }`}
            aria-required="true"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? `${idPrefix}phone-error` : undefined}
          />
          {errors.phone ? (
            <FieldError
              id={`${idPrefix}phone-error`}
              className="text-xs text-tolerance-red mt-0.5 inline-flex items-center gap-1 font-medium"
            >
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.phone}</span>
            </FieldError>
          ) : (
            <Description className="text-xs text-slate-500">
              Direct line for engineering clarifications
            </Description>
          )}
        </TextField>
      </div>

      {/* Row 3: Industry & Category - HeroUI Select & ListBox */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          id={`${idPrefix}industry`}
          name="industry"
          selectedKey={formData.industry}
          onSelectionChange={(key) => handleChange('industry', String(key))}
          className="flex flex-col gap-1.5"
          fullWidth
        >
          <Label
            className="text-xs font-semibold text-industrial-dark inline-flex items-center gap-1.5"
          >
            <Factory className="w-3.5 h-3.5 text-industrial-primary shrink-0" />
            <span>Manufacturing Sector</span>
          </Label>
          <Select.Trigger
            className="w-full min-h-[44px] h-11 px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white flex items-center justify-between shadow-xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-industrial-primary transition-colors cursor-pointer"
          >
            <Select.Value className="text-xs sm:text-sm font-medium text-slate-800 truncate" />
            <Select.Indicator className="text-slate-400" />
          </Select.Trigger>
          <Description className="text-xs text-slate-500">
            Sector-specific tolerance & compliance context
          </Description>
          <Select.Popover className="bg-white rounded-xl shadow-elevated border border-slate-200/90 p-1.5 z-50 min-w-[240px]">
            <ListBox className="outline-none space-y-0.5 max-h-60 overflow-y-auto">
              {industries.map((ind) => (
                <ListBox.Item
                  key={ind.id}
                  id={ind.name}
                  textValue={ind.name}
                  className="px-3 py-2 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-industrial-dark data-[selected=true]:bg-sky-50 data-[selected=true]:text-industrial-primary data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                >
                  {ind.name}
                </ListBox.Item>
              ))}
              <ListBox.Item
                id="Other Industry"
                textValue="Other Manufacturing Sector"
                className="px-3 py-2 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-industrial-dark data-[selected=true]:bg-sky-50 data-[selected=true]:text-industrial-primary data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors border-t border-slate-100 mt-1"
              >
                Other Manufacturing Sector
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>

        <Select
          id={`${idPrefix}category`}
          name="productCategory"
          selectedKey={formData.productCategory}
          onSelectionChange={(key) => handleChange('productCategory', String(key))}
          className="flex flex-col gap-1.5"
          fullWidth
        >
          <Label
            className="text-xs font-semibold text-industrial-dark inline-flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5 text-industrial-primary shrink-0" />
            <span>Product / Solution Category</span>
          </Label>
          <Select.Trigger
            className="w-full min-h-[44px] h-11 px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white flex items-center justify-between shadow-xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-industrial-primary transition-colors cursor-pointer"
          >
            <Select.Value className="text-xs sm:text-sm font-medium text-slate-800 truncate" />
            <Select.Indicator className="text-slate-400" />
          </Select.Trigger>
          <Description className="text-xs text-slate-500">
            Air gauging, electronic display, or custom station
          </Description>
          <Select.Popover className="bg-white rounded-xl shadow-elevated border border-slate-200/90 p-1.5 z-50 min-w-[240px]">
            <ListBox className="outline-none space-y-0.5 max-h-60 overflow-y-auto">
              {categories.map((cat) => (
                <ListBox.Item
                  key={cat.slug}
                  id={cat.name}
                  textValue={cat.name}
                  className="px-3 py-2 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-industrial-dark data-[selected=true]:bg-sky-50 data-[selected=true]:text-industrial-primary data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                >
                  {cat.name}
                </ListBox.Item>
              ))}
              <ListBox.Item
                id="Custom Fixture / Special Solution"
                textValue="Custom Fixture / Special Solution"
                className="px-3 py-2 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-industrial-dark data-[selected=true]:bg-sky-50 data-[selected=true]:text-industrial-primary data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors border-t border-slate-100 mt-1"
              >
                Custom Fixture / Special Solution
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      {/* Specific Product if known */}
      <TextField className="flex flex-col gap-1.5">
        <Label
          htmlFor={`${idPrefix}specific`}
          className="text-xs font-semibold text-industrial-dark inline-flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-industrial-primary shrink-0" />
          <span>Specific Gauge Model / Drawing Ref</span>
          <span className="text-slate-400 font-normal text-xs">(Optional)</span>
        </Label>
        <Input
          id={`${idPrefix}specific`}
          name="specificProduct"
          type="text"
          value={formData.specificProduct || ''}
          onChange={(e) => handleChange('specificProduct', e.target.value)}
          placeholder="e.g. Air Plug Gauge Ø45mm or Camshaft Multigauging Station"
          className="w-full px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-industrial-primary focus:border-transparent bg-white shadow-xs"
        />
        <Description className="text-xs text-slate-500">
          Component drawing number, bore size, or model code if known
        </Description>
      </TextField>

      {/* Message */}
      <TextField
        isRequired
        isInvalid={!!errors.message}
        validationBehavior="aria"
        className="flex flex-col gap-1.5"
      >
        <div className="flex items-center justify-between">
          <Label
            htmlFor={`${idPrefix}message`}
            className="text-xs font-semibold text-industrial-dark inline-flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-industrial-primary shrink-0" />
            <span>Technical Requirement / Tolerance Specifications</span>
            <span className="text-tolerance-red" aria-hidden="true">*</span>
          </Label>
          <span className="text-xs text-slate-400 font-normal tabular-nums font-mono">
            {formData.message.length} / 1000
          </span>
        </div>
        <TextArea
          id={`${idPrefix}message`}
          name="message"
          rows={variant === 'modal' ? 3 : 4}
          maxLength={1000}
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          placeholder="Please share details such as diameter range, tolerance limits, component type, checking parameters, or quantity required..."
          className={`w-full px-3.5 py-2.5 min-h-[100px] text-xs sm:text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors shadow-xs ${
            errors.message
              ? 'border-tolerance-red focus:ring-tolerance-red/30'
              : 'border-slate-300 focus:ring-industrial-primary focus:border-transparent'
          }`}
          aria-required="true"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? `${idPrefix}message-error` : undefined}
        />
        {errors.message ? (
          <FieldError
            id={`${idPrefix}message-error`}
            className="text-xs text-tolerance-red mt-0.5 inline-flex items-center gap-1 font-medium"
          >
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{errors.message}</span>
          </FieldError>
        ) : (
          <Description className="text-xs text-slate-500">
            Specify tolerance bands (e.g. ±0.005mm), cycle time, or pneumatic supply specs
          </Description>
        )}
      </TextField>

      {/* Submit / Actions Bar */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500 order-2 sm:order-1 leading-tight text-center sm:text-left">
          <div>
            Delivered to <strong className="font-mono text-industrial-dark">{recipientEmail}</strong>
          </div>
          <div className="text-slate-500 text-xs mt-0.5">
            ISO calibration & engineering support
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2 shrink-0">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onPress={onCancel}
              className="flex-1 sm:flex-none min-h-[44px] h-11 px-5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-industrial-dark text-xs sm:text-sm font-semibold transition-all inline-flex items-center justify-center whitespace-nowrap cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-industrial-primary focus-visible:outline-none"
            >
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            isDisabled={isSubmitting}
            variant="primary"
            className="flex-1 sm:flex-none min-h-[44px] h-11 px-6 rounded-lg bg-industrial-primary text-white text-xs sm:text-sm font-semibold shadow-sm hover:bg-industrial-hover hover:shadow-md transition-all duration-200 disabled:opacity-60 inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-industrial-primary focus-visible:outline-none"
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
          </Button>
        </div>
      </div>
    </Form>
  );
};
