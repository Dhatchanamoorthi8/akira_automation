/**
 * Centralized Company Brand Configuration
 * Sourced directly from official AKIRA PRECISION AUTOMATION LLP brand asset.
 */

export const company = {
  name: "AKIRA PRECISION AUTOMATION LLP",
  legalName: "Akira Precision Automation LLP",
  tagline: "Precision • Innovation • Smart Solutions",
  slogan: "Automating Today... Building Tomorrow...",
  logo: "/assets/company/akira-automation-logo.jpeg",
  logoAlt: "AKIRA PRECISION AUTOMATION LLP logo",
  primaryEmail: "milestonegauges@gmail.com",
  ccEmail: "messalessarvices@gmail.com",
} as const;

export type CompanyConfig = typeof company;

