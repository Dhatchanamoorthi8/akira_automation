import { useState, useEffect, useCallback } from 'react';
import { EnquiryFormData } from '../types';
import { emailService } from '../services/emailService';

const initialFormState: EnquiryFormData = {
  name: '',
  companyName: '',
  email: '',
  phone: '',
  industry: 'Automotive OEMs',
  productCategory: 'Air Gauging',
  specificProduct: '',
  requirement: '',
  message: '',
};

export interface UseEnquiryFormOptions {
  preselectedProduct?: string;
  onSuccess?: () => void;
}

export function useEnquiryForm(options: UseEnquiryFormOptions = {}) {
  const { preselectedProduct, onSuccess } = options;
  const [formData, setFormData] = useState<EnquiryFormData>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [mailtoFallbackUrl, setMailtoFallbackUrl] = useState<string>('');

  const recipientEmail = emailService.getRecipientEmail();
  const ccEmail = emailService.getCcEmail();

  useEffect(() => {
    if (preselectedProduct) {
      setFormData(prev => ({
        ...prev,
        specificProduct: preselectedProduct,
      }));
    }
  }, [preselectedProduct]);

  const handleChange = useCallback((field: keyof EnquiryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for that field when user types
    setErrors(prev => {
      if (prev[field]) {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      }
      return prev;
    });
  }, []);

  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
    }

    if (!formData.companyName.trim()) {
      errs.companyName = 'Company name is required';
    }

    if (!formData.email.trim()) {
      errs.email = 'Business email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone / Mobile number is required';
    } else if (formData.phone.replace(/\D/g, '').length < 8) {
      errs.phone = 'Please enter a valid contact number (min 8 digits)';
    }

    if (!formData.message.trim()) {
      errs.message = 'Please describe your gauging or fixture requirement';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setErrors({});
    setIsSuccess(false);
    setServerError(null);
    setMailtoFallbackUrl('');
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      await emailService.sendEnquiry(formData);
      setIsSuccess(true);
      // Pre-generate mailto link in case the client wants a direct sent copy
      setMailtoFallbackUrl(emailService.generateMailtoFallback(formData));
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      const fallbackUrl = emailService.generateMailtoFallback(formData);
      setMailtoFallbackUrl(fallbackUrl);
      const recipient = emailService.getRecipientEmail();
      const errorMsg = err instanceof Error ? err.message : 'Unable to transmit enquiry automatically.';
      setServerError(
        `${errorMsg} Please use the button below to email our engineering desk directly at ${recipient}.`
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, formData, onSuccess]);

  return {
    formData,
    errors,
    isSubmitting,
    isSuccess,
    serverError,
    mailtoFallbackUrl,
    recipientEmail,
    ccEmail,
    handleChange,
    handleSubmit,
    resetForm,
  };
}

