import { ServiceItem } from '../types';

export const servicesData: ServiceItem[] = [
  {
    id: "installation-commissioning",
    title: "Installation & Commissioning",
    description: "End-to-end on-site setup, pneumatic line regulation, electrical integration, and verification of multi-gauging stations and display units on customer shop floors.",
    iconName: "Wrench",
    details: [
      "On-site mounting and mechanical alignment of multi-gauging stations",
      "Pneumatic regulation to 3 bars (45 psi) regulated system pressure with 4.5 bars (67 psi) minimum line pressure",
      "Integration of auto-drain air filters and air dryer units to protect measurement transducers",
      "Electrical connection (230V AC) and RS-232 serial communication hookup to client PCs and SPC systems",
      "Master setting and trial repeatability testing with production components before sign-off"
    ]
  },
  {
    id: "operator-training",
    title: "Operator Training",
    description: "Hands-on training programs for machine operators, quality inspectors, and line supervisors to ensure proper handling, zero-setting, and routine maintenance.",
    iconName: "GraduationCap",
    details: [
      "Hands-on demonstration of single-master and double-master calibration routines",
      "Instruction on tri-colour LED tolerance status interpretation (Accept, Rework, Reject)",
      "Best practices for non-contact air gauge probe insertion to preserve hard chrome and carbide tooling",
      "Air Saver auto-selection operation and energy-efficient shop floor workflow",
      "Data logging procedures with the AKIRA Memory Module and Excel export"
    ]
  },
  {
    id: "calibration-technical-support",
    title: "Calibration & Technical Support",
    description: "Comprehensive technical support, master ring/plug reverification, transducer recalibration, and engineering consultation for custom gauging requirements.",
    iconName: "Compass",
    details: [
      "Re-verification and certification of setting master rings and setting master plugs",
      "Transducer sensitivity checking and zero/magnification recalibration for air display units",
      "Diagnostic support for pneumatic back-pressure regulation and air leakage troubleshooting",
      "Technical guidance on designing special fixtures for new workpiece component drawings",
      "Firmware and SPC interface consultation for automated test lines"
    ]
  },
  {
    id: "fast-service-response",
    title: "Fast Service Response",
    description: "Rapid technical assistance and field support to prevent production downtime and maintain line throughput.",
    iconName: "Zap",
    details: [
      "Direct technical hotline access to AKIRA AUTOMATION engineering specialists",
      "Prompt dispatch of service personnel for urgent shop-floor breakdowns",
      "Rapid turnaround on replacement air plug gauges, air ring gauges, and carbide wear tips",
      "Preventive maintenance scheduling for high-duty multi-gauging stations",
      "Customer-first commitment: 'We support beyond sales'"
    ]
  }
];
