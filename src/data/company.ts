import { ContactInformation } from '../types';
import { company } from '../config/company';
import { emailSettingsService } from '../services/emailSettingsService';

export const companyData: ContactInformation = {
  companyName: company.name,
  tagline: company.tagline,
  establishedYear: 2021, // Flagged for confirmation
  motto: "Keeping Customers First",
  coreValues: [
    "Technical Support",
    "Quality Service",
    "Team Spirit"
  ],
  address: {
    street: "No.18 2nd Street, Thamarai Street",
    village: "Gerugambakkam",
    city: "Chennai",
    state: "Tamil Nadu",
    pin: "600 122",
    country: "India",
    fullAddress: "No.18 2nd Street, Thamarai Street, Gerugambakkam, Chennai, Tamil Nadu - 600 122, India."
  },
  get emails(): string[] {
    const primary = emailSettingsService.getPrimaryRecipient() || company.primaryEmail;
    const cc = emailSettingsService.getSettingsSync().ccRecipients || company.ccEmail;
    if (cc && cc.trim() && cc.trim() !== primary) {
      return [primary, cc.trim()];
    }
    return [primary];
  },
  phones: [
    "+91 94457 30673", // Flagged for confirmation
    "+91 82203 97439"  // Flagged for confirmation
  ],
  businessHours: "Monday – Saturday: 9:00 AM – 6:30 PM IST"
};

export const companyIntro = {
  tagline: company.tagline,
  summary: `${company.name} focuses on high quality products and innovative solutions that help customers increase productivity and profitability.`,
  aboutUsText: `${company.name} is a growing solution provider in precision instruments and automated multi gauging systems. We support OEMs, automation integrators, and engineering industries with customized gauging solutions focused on accuracy, productivity, and reliability.`,
  motto: "Keeping Customers First",
  mottoDescription: `${company.name} has abided by having a Motto 'Keeping Customers First'. We strive to give Quality Solutions and Quality Service to customers.`,
  coreValues: [
    {
      title: "Technical Support",
      description: "Dedicated domain engineering support assisting clients from fixture conceptualization to production floor deployment."
    },
    {
      title: "Quality Service",
      description: "Rapid response times, expert calibration, and long-term service commitment that goes far beyond sales."
    },
    {
      title: "Team Spirit",
      description: "Collaborative engineering synergy focused on solving complex dimensional inspection challenges."
    }
  ],
  visionAndStrengths: [
    "Provide leading-edge gauging and automation solutions",
    "Customized solutions to improve productivity & profitability",
    "Traceable measurements to international standards",
    "Strong technical support and after-sales service"
  ],
  commitments: [
    {
      title: "Precision Focus",
      description: "Our dedication to precision ensures that all products meet rigorous standards, thus fostering reliability and trust among our clients in the OEM and automotive manufacturing sectors."
    },
    {
      title: "Customer Commitment",
      description: "We prioritize a customer-first approach, tailoring our solutions to meet specific needs, and ensuring client satisfaction through continuous support and innovation in our offerings."
    },
    {
      title: "Quality Assurance",
      description: "Uncompromising Standards and Solutions in every fixture, gauge, and multi-gauging assembly we engineer."
    }
  ],
  automationPillars: [
    {
      title: "Enhanced Efficiency",
      description: "Our automation solutions significantly improve production efficiency by minimizing downtime and maximizing throughput, ensuring your manufacturing process is streamlined and cost-effective for optimal performance."
    },
    {
      title: "Intelligent Integration",
      description: "We focus on integrating advanced technologies that enhance precision and adaptability, allowing for seamless communication between systems and reducing the risk of errors throughout the production process."
    },
    {
      title: "Innovation in Automation",
      description: "The next level for your manufacturing — bringing automated precision gauging to production lines."
    }
  ],
  partnershipPillars: [
    {
      title: "Collaboration",
      description: "Our collaborative approach ensures tailored solutions that meet customer needs, enhancing efficiency and productivity in manufacturing processes."
    },
    {
      title: "Trust",
      description: "We prioritize trust and transparency in every relationship, fostering long-term partnerships that drive mutual success and growth."
    }
  ],
  customerBenefits: [
    {
      title: "Reduced Inspection Time",
      description: "Fast cycle times with multi-point simultaneous measurement and instant tolerance indication.",
      metric: "High Speed"
    },
    {
      title: "Higher Productivity",
      description: "Eliminates inspection bottlenecks on high-volume production and machining lines.",
      metric: "Streamlined"
    },
    {
      title: "Consistent Quality",
      description: "Removes operator subjectivity with repeatable precision pneumatic and electronic measurement.",
      metric: "Reliable"
    },
    {
      title: "Automation-Ready Inspection",
      description: "Standard RS-232, optional 24V relay outputs, and foot switch interfaces for seamless line integration.",
      metric: "Industry 4.0"
    },
    {
      title: "Strong Return on Investment",
      description: "Lower scrap rates, extended tool wear monitoring, and durable wear-resistant carbide contacts.",
      metric: "High Value"
    }
  ],
  coreStrengths: [
    "Automated multi gauging expertise",
    "OEM & automation-ready solutions",
    "Custom-built systems",
    "Strong service & technical support",
    "Competitive and value-driven pricing"
  ]
};
