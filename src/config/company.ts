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
  primaryEmail: "milestonegauges@gmail.com",
  ccEmail: "messalessarvices@gmail.com",
} as const;

export type CompanyConfig = typeof company;

