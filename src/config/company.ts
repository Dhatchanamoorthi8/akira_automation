/**
 * Centralized Company Brand Configuration
 * Sourced directly from official AKIRA AUTOMATION brand asset.
 */

export const company = {
  name: "AKIRA AUTOMATION",
  legalName: "AKIRA AUTOMATION",
  tagline: "Precision • Innovation • Smart Solutions",
  slogan: "Automating Today... Building Tomorrow...",
  logo: "/assets/company/akira-automation-logo.jpeg",
  logoAlt: "AKIRA AUTOMATION logo",
  primaryEmail: (import.meta.env?.VITE_CONTACT_EMAIL as string) || "milestonegauges@gmail.com",
  ccEmail: (import.meta.env?.VITE_CONTACT_CC_EMAIL as string) || "sales@akiraautomation.com",
} as const;

export type CompanyConfig = typeof company;

