export interface ProductCategory {
  slug: string;
  name: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ComparisonTable {
  caption?: string;
  headers: string[];
  rows: string[][];
}

export interface ProductSummary {
  id: string;
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  tagline: string;
  image: string;
  description: string;
  metaDescription?: string;
  aiOverviewPassage?: string;
  tldr?: string;
  highlights: string[];
  isFeatured?: boolean;
}

export interface CaseStudy {
  title: string;
  industry: string;
  challenge: string;
  solution: string;
  result: string;
  metrics: string[];
}

export interface Product extends ProductSummary {
  secondaryImages?: string[];
  specsImage?: string;
  cadImage?: string;
  specifications: Record<string, string>;
  features: string[];
  applications: string[];
  relatedProductSlugs?: string[];
  standardsCompliance?: string[];
  caseStudies?: CaseStudy[];
  faqs?: FAQItem[];
}

export interface Solution {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  aiOverviewPassage?: string;
  tldr?: string;
  iconName: string;
  image: string;
  features: string[];
  supportedProducts?: string[];
  applications: string[];
  faqs?: FAQItem[];
  comparisonTable?: ComparisonTable;
  caseStudies?: CaseStudy[];
  standardsCompliance?: string[];
}

export interface Industry {
  id: string;
  slug: string;
  name: string;
  description: string;
  image?: string;
  iconName: string;
  keyApplications: string[];
  gaugingRelevance: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  details: string[];
}

export interface ContactInformation {
  companyName: string;
  tagline: string;
  establishedYear: number;
  motto: string;
  coreValues: string[];
  address: {
    street: string;
    village: string;
    city: string;
    district?: string;
    state: string;
    pin: string;
    country: string;
    fullAddress: string;
  };
  emails: string[];
  phones: string[];
  businessHours: string;
}

export interface EnquiryFormData {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  industry: string;
  productCategory: string;
  specificProduct?: string;
  requirement: string;
  message: string;
}
