import { Industry } from '../types';

export const industries: Industry[] = [
  {
    id: "automotive-oems",
    slug: "automotive-oems",
    name: "Automotive OEMs",
    description: "Akira Precision Automation LLP supports automotive original equipment manufacturers with high-precision automated multi-gauging stations, cylinder liner bore inspection systems, and camshaft inspection fixtures tailored to stringent vehicle manufacturing standards.",
    image: "/assets/hero/hero-lab-gauging.webp",
    iconName: "Car",
    keyApplications: [
      "Engine cylinder block liner ID bore measurement across X & Y axes",
      "Camshaft bearing journal and OD multi-point inspection",
      "Crankcase, crankshaft, and transmission housing quality verification",
      "Line-side automated multi-gauging with RS-232 and 24V relay outputs"
    ],
    gaugingRelevance: "Automotive OEMs demand 100% inspection reliability and zero tolerance for defect escapes. Akira Precision Automation LLP's automated multi-gauging stations provide rapid, repeatable, and traceable measurement directly on the production floor."
  },
  {
    id: "tier-1-suppliers",
    slug: "tier-1-suppliers",
    name: "Tier-1 Suppliers",
    description: "Supplying major automotive systems requires uncompromising precision and statistical process control. AKIRA equips Tier-1 component manufacturers with air gauging tooling, electronic snap gauges, and memory module logging systems.",
    image: "/assets/multigauging/camshaft-multigauging-station.webp",
    iconName: "Boxes",
    keyApplications: [
      "High-volume piston pin, valve spool, and hydraulic plunger inspection",
      "Transmission shaft OD, taper, ovality, and 120° 3-point lobing detection",
      "Steering rack, knuckle, and suspension component inspection",
      "Statistical quality control with direct Excel and Minitab export"
    ],
    gaugingRelevance: "Tier-1 suppliers operate under stringent OEM Cp/Cpk benchmarks. AKIRA Tri-Colour Digital Display Units deliver instant visual feedback, while our Memory Module captures 10,000 readings for comprehensive quality audits."
  },
  {
    id: "tier-2-suppliers",
    slug: "tier-2-suppliers",
    name: "Tier-2 Suppliers",
    description: "Akira Precision Automation LLP empowers Tier-2 machining, turning, and stamping facilities with rugged, cost-effective air plug gauges, air ring gauges, attribute gauges, and standard measuring instruments that ensure full compliance with Tier-1 drawing specifications.",
    image: "/assets/solutions/air-gauging-inspection.webp",
    iconName: "Cog",
    keyApplications: [
      "Precision CNC lathe turned part OD and ID verification",
      "Carbide-tipped air snap gauge checking on grinding lines",
      "GO / NO-GO attribute gauging for high-speed sorting",
      "Standard shop-floor calipers, micrometers, and magnetic stands"
    ],
    gaugingRelevance: "Tier-2 machine shops require durable, wear-resistant gauging that survives abrasive coolant and metal swarf. Our hard chrome and tungsten carbide wear treatments maximize gauge longevity."
  },
  {
    id: "automation-builders",
    slug: "automation-builders",
    name: "Automation Machine Builders",
    description: "Akira Precision Automation LLP works closely with automation integrators and special purpose machine (SPM) builders to supply automation-ready gauging probes, multi-channel display units, and pneumatic air servers that interface directly with PLC automation lines.",
    image: "/assets/solutions/fixture-multi-bore.webp",
    iconName: "Bot",
    keyApplications: [
      "Integration of 2-channel, 3-channel, and 4-channel tri-colour DROs into automated robotic cells",
      "Auto Selection with Air Server systems reducing line-side compressed air consumption",
      "24V relay outputs for automated sorting gates and reject bins",
      "Custom pneumatic and electronic gauging tooling for custom SPMs"
    ],
    gaugingRelevance: "Automation integrators require dependable hardware with standard serial communication, remote foot switch triggers, and relay control signals. AKIRA display units are purposefully designed for intelligent integration."
  },
  {
    id: "general-precision-engineering",
    slug: "general-precision-engineering",
    name: "General & Precision Engineering",
    description: "Across aerospace, hydraulics, defense, valve manufacturing, and heavy engineering, Akira Precision Automation LLP provides custom-built special fixtures, air gauge display units, and standards calibration equipment that maintain micron-level accuracy.",
    image: "/assets/company/inspection-workbench.webp",
    iconName: "Cpu",
    keyApplications: [
      "Hydraulic valve body, manifold, and actuator bore inspection",
      "Heavy engineering shaft alignment and bearing housing checks",
      "Slip gauge blocks and pin gauge sets for standards room calibration",
      "Custom workholding and multi-pin inspection fixtures for complex geometries"
    ],
    gaugingRelevance: "Precision engineering demands adaptable, versatile tooling. AKIRA custom fixture capability ensures that unique datum structures and complex tolerances are accurately verified."
  }
];
