import { useState, useEffect } from 'react';
import { companyData } from '../data/company';

/**
 * Reactive hook to get the latest company contact emails.
 * Automatically triggers component re-render whenever an administrator updates
 * email notification recipients in the Admin Settings panel.
 */
export function useCompanyEmails(): string[] {
  const [emails, setEmails] = useState<string[]>(() => companyData.emails);

  useEffect(() => {
    const handleUpdate = () => {
      setEmails([...companyData.emails]);
    };

    window.addEventListener('akira_email_settings_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('akira_email_settings_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return emails;
}

export default useCompanyEmails;
