import { Solution } from '../types';

export const solutions: Solution[] = [
  {
    id: "multigauging",
    slug: "multigauging",
    title: "Multi Gauging Solutions",
    shortDescription: "Advanced automated multi-gauging systems delivering unmatched accuracy, efficiency, and multi-point inspection for OEM and automotive manufacturing.",
    fullDescription: "Our multigauging systems deliver unmatched accuracy and efficiency, enhancing your manufacturing process with innovative solutions tailored for OEM and automotive industries. Engineered to measure multiple dimensions, taper, runout, and ovality simultaneously in a single cycle.",
    aiOverviewPassage: "Automated multi-gauging systems are turnkey industrial metrology stations engineered to inspect multiple critical dimensions of complex manufactured components simultaneously in a single cycle of under 15 seconds. Designed specifically for automotive engine blocks, cylinder liners, camshafts, and transmission shafts, these stations combine pneumatic air gauging nozzles and high-speed electronic LVDT inductive probes. A single multi-gauging fixture measures inside diameters, outside diameters, taper, concentricity, perpendicularity, and dynamic runout simultaneously, eliminating operator error and manual inspection bottlenecks. Each station features 6-digit tri-colour digital display columns or industrial touchscreens that provide instantaneous Green (Accept), Yellow (Rework), and Red (Reject) tolerance decisions. Equipped with standard RS-232 serial telemetry, Ethernet/IP, and 24V PLC relay outputs, AKIRA multi-gauging stations integrate seamlessly with ABB, Fanuc, and Kuka robotic loading cells, streaming real-time measurement telemetry into shop-floor Statistical Process Control (SPC) databases.",
    tldr: "Automated multi-gauging stations inspect 10+ critical workpiece dimensions—including bore diameters, runout, taper, and ovality—simultaneously in under 15 seconds. Featuring sub-micron repeatability (≤ 0.5 µm), tri-colour tolerance displays, and RS-232/PLC automation interfaces, they eliminate manual inspection bottlenecks in automotive engine and transmission lines.",
    iconName: "Cpu",
    image: "/assets/multigauging/multigauging-showcase.webp",
    features: [
      "Advanced precision engineered for OEM and automotive production lines",
      "Simultaneous multi-parameter measurement (ID, OD, taper, concentricity, ovality)",
      "Tri-colour 6-digit display units with automated Accept/Rework/Reject tolerance status",
      "Single-cycle inspection drastically reducing cycle times and eliminating operator subjectivity",
      "Standard RS-232 and optional 24V relay outputs for full automation cell integration",
      "Custom setting master rings and plugs for rapid auto-calibration"
    ],
    supportedProducts: ["camshaft-multigauging-station", "engine-block-liner-multigauging-station"],
    applications: [
      "Automotive engine cylinder blocks and liners",
      "Camshafts, crankshafts, and transmission output shafts",
      "Connecting rods (Big-End and Small-End simultaneous check)",
      "Brake discs, hubs, and precision steering knuckles"
    ],
    faqs: [
      {
        question: "What is an automated multi-gauging system?",
        answer: "An automated multi-gauging system is an integrated metrology station that inspects 10 or more dimensions—such as bore diameter, runout, ovality, taper, and perpendicularity—simultaneously in under 15 seconds, eliminating manual inspection bottlenecks in automotive manufacturing."
      },
      {
        question: "How does a multi-gauging station integrate with robotic automation cells?",
        answer: "AKIRA multi-gauging stations provide standard RS-232 serial communication, Ethernet/IP, and 24V PLC opto-isolated relay outputs that interface directly with ABB, Fanuc, and Kuka robot controllers for automatic part loading, inspection triggering, and Accept/Rework/Reject sorting."
      },
      {
        question: "What is the typical measurement repeatability of AKIRA multi-gauging fixtures?",
        answer: "AKIRA multi-gauging systems achieve sub-micron comparator repeatability (≤ 0.5 µm) under controlled 20°C ambient cleanroom conditions, with 100% pre-dispatch Gage R&R verification guaranteeing process capability."
      },
      {
        question: "What is the calibration frequency for automated multi-gauging setting masters?",
        answer: "AKIRA recommends calibrating setting masters every 6 to 12 months or every 100,000 cycles under ISO/IEC 17025 accredited laboratory conditions. For daily shop-floor verification, master rings and plugs should be checked once per shift to offset ambient thermal expansion."
      }
    ],
    comparisonTable: {
      caption: "Metrology Comparison: Automated Multi-Gauging vs. Traditional Inspection",
      headers: ["Inspection Parameter", "Automated Multi-Gauging", "Manual Bench Gauging", "Coordinate Measuring Machine (CMM)"],
      rows: [
        ["Cycle Time", "< 15 seconds (Simultaneous)", "2 to 5 minutes (Sequential)", "10 to 25 minutes"],
        ["Operator Influence", "Zero (Automated / Pneumatic Clamping)", "High (Operator technique & feel)", "Low (Programmed path)"],
        ["Shop-Floor Integration", "Line-side 100% In-Line Inspection", "Offline Sampling Check", "Offline Quality Lab Only"],
        ["Data Export & SPC", "Real-Time RS-232 / PLC / USB", "Manual Logging / Clipboard", "Batch Report Output"]
      ]
    },
    standardsCompliance: [
      "ISO/IEC 17025:2017 Calibration Traceability",
      "DIN 2250-C Setting Master Verification",
      "AIAG MSA 4th Edition (Gage R&R < 10%)",
      "IS 3455:1971 Tolerances for Limit Gauges"
    ],
    caseStudies: [
      {
        title: "Automotive Engine Block Cylinder Liner: 100% In-Line Inspection",
        industry: "Automotive OEM Powertrain Machining",
        challenge: "Manual bore micrometer checks required 4 minutes per block, creating a production bottleneck on a 120-part-per-hour transfer line and risking operator measurement bias.",
        solution: "Deployed an AKIRA turnkey 12-jet suspended multi-gauging station with dual 3-channel tri-colour displays checking X and Y axes across 3 depths simultaneously.",
        result: "Inspection cycle time slashed to under 15 seconds. Process capability Cpk increased from 1.22 to 1.68 with zero defect escapes to final engine assembly.",
        metrics: ["Cycle Time: 4 min -> 15 sec", "Cpk Improvement: 1.22 -> 1.68", "Defect Escapes: 0 PPM", "Gage R&R: 6.8%"]
      }
    ]
  },
  {
    id: "air-gauging",
    slug: "air-gauging",
    title: "Air Gauging",
    shortDescription: "Precision non-contact measurement using high-pressure compressed air technology, delivering high speed of response and self-cleaning operation.",
    fullDescription: "Air gauging ensures high precision in measurements by leveraging advanced air technology for reliable results. Suitable for multiple industries, enhancing production efficiency with non-contact, frictionless dimensional inspection.",
    aiOverviewPassage: "Air gauging is a high-precision non-contact metrology method that measures workpiece dimensions by evaluating the differential back-pressure of regulated compressed air. Operating between 3 and 4 bar (45 psi), clean compressed air escapes through calibrated sapphire or hardened tool steel nozzles positioned against the workpiece surface. The diametrical clearance between the nozzle and the part restricts airflow escape; this restriction generates proportional back-pressure changes that high-resolution electronic transducers convert to linear dimensions with 0.1 µm resolution. Because the escaping air cushion maintains continuous separation between the gauge and the component, air gauging eliminates friction wear and surface scratching on polished, honed, or ground parts. It is exceptionally well-suited for hostile shop-floor machining environments because the high-velocity air jet automatically clears away residual cutting fluids, coolant, and micro-chips from the measuring zone before measurement takes place.",
    tldr: "Pneumatic air gauging utilizes high-velocity compressed air back-pressure (3–4 bar) to deliver non-contact, frictionless dimensional inspection with 0.1 µm resolution. Its continuous air cushion prevents surface scratching on ground parts, while the escaping air stream automatically cleans away cutting oil, coolant, and chips in wet machining environments.",
    iconName: "Wind",
    image: "/assets/solutions/air-gauging-inspection.webp",
    features: [
      "Accurate Measurement: Leveraging advanced air technology for reliable, repeatable results",
      "Innovative Technology: High-pressure system with self-cleaning gauging area",
      "Versatile Applications: Suitable for multiple industries, enhancing production efficiency",
      "Non-contact gauging guarantees long life due to minimal frictional wear",
      "Two setting masters ensure correct magnification of reading at all times",
      "System pressure check gauge provides constant check on regulated 3 bar (45 psi) line"
    ],
    supportedProducts: ["air-plug-gauge", "air-calliper-gauge", "air-ring-gauge", "air-gauge-display-unit"],
    applications: [
      "High-precision bore diameter, taper, and ovality inspection",
      "External diameter (OD) and lobing inspection at 120°",
      "Wet, oily, or coolant-sprayed machining environments where mechanical probes jam",
      "Automotive cylinders, bushings, sleeves, and ground shafts"
    ],
    faqs: [
      {
        question: "How does air gauging measure dimensions without physical contact?",
        answer: "Air gauging utilizes the pneumatic back-pressure differential principle. Regulated compressed air at 3 to 4 bar is discharged through calibrated nozzles against the workpiece surface. The clearance variation alters the airflow escape rate, creating proportional back-pressure shifts translated into 0.1 µm linear readings without touching the part."
      },
      {
        question: "Why are two setting master rings required for air gauge calibration?",
        answer: "Air gauging is a comparative measurement technique requiring two setting masters (Minimum and Maximum) to calibrate both the zero datum and the linear magnification span. This double-master calibration ensures linear accuracy across the entire measuring range per ISO/IEC 17025 standards."
      },
      {
        question: "Can air gauging work in wet or oily machining environments?",
        answer: "Yes. The high-velocity pressurized air stream acts as a self-cleaning mechanism, actively blowing away residual coolant, cutting oil, and micro-chips from the workpiece measuring area, preventing the probe jamming common with mechanical dial indicators."
      },
      {
        question: "What air supply quality is required for pneumatic air gauges?",
        answer: "Air gauging systems require clean, dry, oil-free compressed air at 3.0 to 4.0 bar (45–60 psi) filtered through an air filter regulator unit (FRL) down to 0.01 µm to prevent moisture or oil particulates from affecting calibrated nozzle back-pressure."
      }
    ],
    comparisonTable: {
      caption: "Metrology Comparison: Pneumatic Air Gauging vs. Mechanical and Electronic Methods",
      headers: ["Feature", "Pneumatic Air Gauging", "Mechanical Dial Indicators", "Electronic LVDT Probes"],
      rows: [
        ["Measurement Principle", "Non-Contact Back-Pressure", "Direct Mechanical Contact", "Direct Inductive Contact"],
        ["Resolution", "0.1 µm (0.0001 mm)", "1.0 µm to 10.0 µm", "0.1 µm (0.0001 mm)"],
        ["Coolant / Oil Resistance", "Self-Cleaning (Immune to Coolant)", "Prone to Jamming & Sludge", "Requires Protective Rubber Boot"],
        ["Part Scratch Risk", "Zero (Air Film Cushion)", "Moderate (Spherical Anvil Contact)", "Moderate (Carbide Tip Contact)"]
      ]
    },
    standardsCompliance: [
      "ISO/IEC 17025:2017 Accredited Double-Master Traceability",
      "DIN 2250-C Grade Quality Rings",
      "IS 919 / ISO 286 Fit & Tolerance System",
      "BS 4311 Precision Gauge Blocks"
    ],
    caseStudies: [
      {
        title: "Tier-1 Transmission Shaft: 3-Lobe Lobing & Taper Verification",
        industry: "Precision Transmission & Gearbox Components",
        challenge: "Centerless grinding operations were generating undetected 3-lobe polygonal form errors that passed 2-point snap gauges but caused bearing premature failure.",
        solution: "Implemented an AKIRA 3-jet air ring gauge (@ 120° nozzle spacing) with tungsten carbide wear rings coupled to a high-speed digital air-electronic display.",
        result: "Instantaneous identification of centerless grinding chatter and lobing. Scrap rates reduced by 84% within the first 60 days of shop-floor operation.",
        metrics: ["Form Error Detection: 100%", "Scrap Reduction: 84%", "Measurement Speed: 2.5 sec", "Tool Life: > 500,000 cycles"]
      }
    ]
  },
  {
    id: "fixtures",
    slug: "fixtures",
    title: "Precision Fixtures & Tooling",
    shortDescription: "Tailored fixtures designed for unique manufacturing requirements, built with flexible designs and rugged durability.",
    fullDescription: "Precision-engineered solutions for every need. Custom tailored fixtures designed for unique manufacturing requirements, offering flexible designs that adapt to different applications and engineered to withstand rigorous manufacturing environments.",
    aiOverviewPassage: "Precision inspection fixtures and tooling are dedicated quality-control holding and measurement assemblies engineered to verify the geometric accuracy of complex manufactured workpieces. Designed directly from customer 2D component drawings and 3D CAD models, AKIRA fixtures utilize high-grade tool steel (HCHCr and OHNS) hardened to 60–62 HRC and cryogenically stabilized for lifelong dimensional integrity. Workpieces are located against precision ground datum pins and resting pads using manual toggle or pneumatic cylinder clamps, ensuring repeatable part orientation without introducing mechanical deformation. Modular mounting brackets support dial test indicators, pneumatic air nozzles, and electronic LVDT inductive probes for multi-point dimensional checking on shop-floor machining lines. Every AKIRA fixture undergoes comprehensive Coordinate Measuring Machine (CMM) verification prior to dispatch, with complete inspection reports and Gage Repeatability and Reproducibility (Gage R&R) studies provided for automotive OEM audit compliance.",
    tldr: "AKIRA precision inspection fixtures provide rigid, repeatable component work-holding for multi-point dimensional checking on production lines. Built from cryogenic-stabilized HCHCr/OHNS tool steel hardened to 60–62 HRC, each custom fixture undergoes 100% CMM verification and delivers Gage R&R under 10% for automotive OEM audit compliance.",
    iconName: "Layers",
    image: "/assets/solutions/fixture-multi-bore.webp",
    features: [
      "Customization: Tailored fixtures designed for unique workpiece geometries and manufacturing requirements",
      "Versatility: Flexible designs that adapt to different component variants and applications",
      "Durability: Engineered with hardened alloys to withstand rigorous manufacturing environments",
      "Ergonomic clamping mechanisms ensuring repeatable datum location without component distortion",
      "Modular mounting for dial indicators, air nozzles, and electronic inductive probes",
      "Complete manufacturing, inspection, and CMM-verified accuracy"
    ],
    supportedProducts: ["special-gauges-fixtures", "camshaft-multigauging-station"],
    applications: [
      "Machined casting work-holding and multi-point dimensional inspection",
      "Crankcase, cylinder head, and gearbox housing checking",
      "Shop-floor line-side quality verification stations",
      "Assembly jigs and verification fixtures"
    ],
    faqs: [
      {
        question: "What materials and hardening treatments are used in AKIRA inspection fixtures?",
        answer: "AKIRA fixtures are constructed from premium tool steels including High Carbon High Chromium (HCHCr) and Oil Hardened Non-Shrinking (OHNS) steels, heat-treated and hardened to 60–62 HRC with sub-zero cryogenic stabilization to prevent long-term dimensional drift."
      },
      {
        question: "How is Gage R&R compliance verified for custom fixtures?",
        answer: "Every fixture undergoes 100% Coordinate Measuring Machine (CMM) dimensional verification and a rigorous Gage Repeatability and Reproducibility (Gage R&R) study with 10 parts, 3 operators, and 3 trials, guaranteeing a total Gage R&R of under 10% for critical automotive dimensions."
      },
      {
        question: "How are component datum points established for complex castings?",
        answer: "AKIRA fixtures locate workpieces using the classic 3-2-1 principle with precision-ground rest pads and diamond/round locating pins aligned to the primary machining datums specified on the customer's 2D/3D component drawings."
      },
      {
        question: "What is the typical manufacturing and validation lead time for custom fixtures?",
        answer: "Custom inspection fixtures typically take 3 to 6 weeks from CAD design sign-off through CNC machining, cryogenic heat treatment, Coordinate Measuring Machine (CMM) verification, and Gage R&R sign-off with customer master parts."
      }
    ],
    standardsCompliance: [
      "ISO 1101 Geometrical Tolerancing (GD&T)",
      "DIN 7168 General Tolerances for Linear and Angular Dimensions",
      "ASME B89.4.19 CMM Verification Standards",
      "AIAG MSA 4th Edition Gage R&R Standards"
    ]
  },
  {
    id: "electronic-gauging",
    slug: "electronic-gauging",
    title: "Electronic Gauges",
    shortDescription: "Electronic measurement solutions for OD, bore, and multi-dimensional inspection with direct DRO and SPC connectivity.",
    fullDescription: "AKIRA Electronic Gauges provide high-resolution direct-contact measurement for outside diameters and dimensional features. Utilizing 2-point and 3-point contact geometries, these gauges feed real-time micron-accurate signals directly into AKIRA Tri-Colour Digital Display Units.",
    aiOverviewPassage: "Electronic gauging systems are high-speed comparative metrology instruments that utilize Linear Variable Differential Transformer (LVDT) inductive probes and precision electronic transducers to deliver sub-micron dimensional measurement. Unlike manual mechanical micrometers, electronic gauges convert minute physical displacements into linear voltage differentials, feeding real-time digital telemetry into multi-channel digital readout columns and statistical software. Available in 2-point and 3-point contact configurations with tungsten carbide or ruby contact anvils, electronic caliper gauges deliver exceptional abrasion resistance on high-throughput CNC turning lines. AKIRA electronic gauging units feature integrated tri-colour status indicators (Green for Accept, Yellow for Rework, Red for Reject), foot-switch measurement triggering, and RS-232 / USB output for automatic data logging into shop-floor SPC systems.",
    tldr: "AKIRA electronic gauging systems utilize high-resolution LVDT inductive probes and digital caliper gauges to provide instantaneous sub-micron dimensional feedback. Integrated with tri-colour display columns and RS-232/USB data interfaces, they enable automated Statistical Process Control (SPC) and real-time pass/fail sorting on CNC turning and grinding cells.",
    iconName: "Gauge",
    image: "/assets/products/electronic-calliper-gauge-set.webp",
    features: [
      "2-Point and 3-Point configuration options for external diameter checks",
      "High-resolution electronic inductive and LVDT probe technology",
      "Instant tolerance feedback via paired Tri-Colour Digital Display Units",
      "Hardened carbide contact points for extreme abrasion resistance",
      "Seamless integration with AKIRA Memory Module Unit and SPC software"
    ],
    supportedProducts: ["electronic-calliper-gauge", "tri-colour-digital-display-unit", "memory-module-unit"],
    applications: [
      "Precision turned components and ground cylindrical pins",
      "Automotive shafts, axles, and gearbox journals",
      "Dry inspection environments requiring direct electronic readout"
    ],
    faqs: [
      {
        question: "What is the advantage of LVDT electronic gauging over mechanical indicators?",
        answer: "LVDT inductive electronic gauges provide 0.1 µm resolution, instantaneous digital telemetry, zero mechanical backlash, and direct connectivity to RS-232 / USB data loggers for automated Statistical Process Control (SPC) charting without human transcription errors."
      },
      {
        question: "Can electronic caliper gauges check out-of-roundness?",
        answer: "Yes. By utilizing 3-point contact configurations with precision carbide anvils, electronic caliper gauges can detect circularity deviations, taper, and runout across ground shafts and precision turned components."
      },
      {
        question: "How do electronic gauges compare with air gauges for bore measurement?",
        answer: "While air gauges excel in hostile, coolant-flooded environments and soft materials due to their non-contact air cushion, electronic gauges with LVDT probes offer wider measuring spans (up to ±2.0 mm) and direct multi-channel digital synchronization for dry turned components."
      },
      {
        question: "What communication protocols do AKIRA electronic display units support?",
        answer: "AKIRA digital display units and Tri-Colour columns feature RS-232 serial interfaces, USB virtual COM ports, and optional Modbus TCP / 24V PLC opto-isolated outputs for direct integration with plant SCADA and industrial SPC software."
      }
    ],
    standardsCompliance: [
      "DIN 878 & DIN 2270 Dial and Inductive Comparator Standards",
      "ISO 14253-1 Decision Rules for Proving Conformance",
      "IS 919 Fit & Limit System",
      "IEC 60529 IP65 Environmental Protection"
    ]
  },
  {
    id: "air-plug-gauges",
    slug: "air-plug-gauges",
    title: "Air Plug Gauges",
    shortDescription: "Precision ID and bore inspection for through bore, blind bore, and step bore applications from 2 mm to 200 mm.",
    fullDescription: "Can be supplied for through bore, blind bore, and step bore applications. Features hard chrome plated gauging surfaces, optional adjustable depth collars, and requires two setting rings for precision calibration.",
    iconName: "CircleDot",
    image: "/assets/products/air-plug-gauge.webp",
    features: [
      "Range from 2 mm to 200 mm",
      "Supplied for through bore / blind bore / step bore applications",
      "Adjustable depth collars can be provided for checking a specific depth",
      "Hard chrome plated construction ensures long operating life",
      "Two setting rings required for exact comparative calibration"
    ],
    supportedProducts: ["air-plug-gauge", "air-gauge-display-unit", "air-electronics-tri-colour-display"],
    applications: [
      "Automotive cylinder liners, sleeves, and bearing bushings",
      "Precision valve bodies and hydraulic manifolds",
      "Connecting rod big-end and small-end bores"
    ]
  },
  {
    id: "air-ring-gauges",
    slug: "air-ring-gauges",
    title: "Air Ring Gauges",
    shortDescription: "High-precision outside diameter, taper, ovality, and 3-point lobing inspection tooling with optional carbide wear rings.",
    fullDescription: "Two Jet Air Ring Gauges to check outside diameter, taper, and ovality. Three Jet Air Ring Gauges for detecting lobing effect at 120 degrees. Can be supplied with tungsten carbide wear rings on request, with diameters above 150 mm available on request.",
    iconName: "Disc",
    image: "/assets/products/air-ring-gauge.webp",
    features: [
      "Two Jet configuration for outside diameter, taper, and ovality",
      "Three Jet configuration for detecting lobing effect @ 120 degrees",
      "Can be supplied with Tungsten Carbide wear rings on request",
      "Diameters above 150 mm available on custom request",
      "Non-contact pneumatic airflow protecting ultra-finish workpiece journals"
    ],
    supportedProducts: ["air-ring-gauge", "air-gauge-display-unit"],
    applications: [
      "Piston pins, plungers, and steering shafts",
      "Centerless ground shafts susceptible to 3-point lobing errors",
      "Precision ground automotive spindles"
    ]
  },
  {
    id: "attribute-gauges",
    slug: "attribute-gauges",
    title: "Attribute Gauges",
    shortDescription: "Fast, reliable GO / NO-GO physical inspection tooling designed for robust shop-floor manufacturing verification.",
    fullDescription: "AKIRA Attribute Gauges provide rapid, foolproof pass/fail inspection on high-volume production lines. Engineered to strict dimensional standards to verify critical boundary limits without complex electronic setup.",
    iconName: "CheckCircle2",
    image: "/assets/fixtures/workholding-inspection-fixture.webp",
    features: [
      "Foolproof GO / NO-GO attribute inspection",
      "Precision ground and stabilized gauge steel with carbide wear options",
      "Clear marking of limits, serial numbers, and gauge identification",
      "Eliminates operator calculation errors on fast-paced production lines"
    ],
    supportedProducts: ["special-gauges-fixtures", "air-calliper-gauge"],
    applications: [
      "100% production line screening",
      "Incoming quality control and raw material receiving inspection",
      "Automotive stamping and fastener checking"
    ]
  },
  {
    id: "plug-gauges",
    slug: "plug-gauges",
    title: "Plug Gauges",
    shortDescription: "Precision mechanical dimensional checking for internal diameters, splines, and keyways.",
    fullDescription: "AKIRA Plug Gauges deliver dependable dimensional verification for inside diameters. Sourced in hardened tool steel and tungsten carbide, ensuring dependable wear characteristics and unbroken traceability.",
    iconName: "Crosshair",
    image: "/assets/instruments/pin-gauge-set.webp",
    features: [
      "Single-ended and double-ended GO / NO-GO configurations",
      "Hardened steel or tungsten carbide options for high wear cycles",
      "Knurled hexagonal or cylindrical handles for secure grip",
      "Ground and lapped to high precision metrology standards"
    ],
    supportedProducts: ["instruments-measuring-equipment"],
    applications: [
      "Threaded and plain bore checking",
      "Machining centers and tapping operations",
      "Assembly line hole size verification"
    ]
  },
  {
    id: "snap-gauges",
    slug: "snap-gauges",
    title: "Snap Gauges",
    shortDescription: "Robust production inspection solutions for rapid outside diameter checking.",
    fullDescription: "AKIRA Snap Gauges are engineered for fast, reliable OD checking on lathe turnings, cylindrical grinding, and shaft production lines. Available in adjustable and fixed configurations with carbide-faced anvils.",
    iconName: "Maximize2",
    image: "/assets/products/air-calliper-gauge.webp",
    features: [
      "Rigid C-frame design minimizing thermal expansion and flexure",
      "Carbide tipped anvils for exceptional wear resistance",
      "Rapid slide-on verification without removing parts from machine chucks",
      "Custom designs engineered for specific shaft journals"
    ],
    supportedProducts: ["air-calliper-gauge", "electronic-calliper-gauge"],
    applications: [
      "Shaft turned diameters and ground journal checking",
      "In-machine inspection during lathe and cylindrical grinding cycles"
    ]
  },
  {
    id: "ring-gauges",
    slug: "ring-gauges",
    title: "Ring Gauges",
    shortDescription: "Precision setting rings and cylindrical master rings for zero setting and external diameter inspection.",
    fullDescription: "AKIRA Plain Ring Gauges serve as master standards for setting air plug gauges, internal bore micrometers, and comparative dial indicators. Manufactured with stabilized alloy steel and precision lapped.",
    iconName: "Circle",
    image: "/assets/products/air-ring-gauge.webp",
    features: [
      "Precision lapped internal bores for master calibration setting",
      "Sub-zero treated alloy steel ensuring dimensional stability over time",
      "Etched with calibrated actual sizes for immediate DRO compensation",
      "Available as single units or paired setting master sets"
    ],
    supportedProducts: ["air-plug-gauge", "engine-block-liner-multigauging-station"],
    applications: [
      "Master setting rings for air gauging and electronic bore gauges",
      "Cylindrical master standards in metrology calibration rooms"
    ]
  },
  {
    id: "special-gauges",
    slug: "special-gauges",
    title: "Special Gauges & Custom Fixtures",
    shortDescription: "Customized engineering solutions tailored to complex geometric profiles, datum structures, and multi-feature parts.",
    fullDescription: "Akira Precision Automation LLP specializes in all types of special gauges and fixtures. Designed to inspect intricate automotive and industrial components where standard gauges cannot reach.",
    iconName: "Wrench",
    image: "/assets/fixtures/multi-pin-gauging-fixture.webp",
    features: [
      "Custom multi-pin dimensional checking for intricate datum schemes",
      "Integrated dial indicator, LVDT probe, or pneumatic jet mountings",
      "Built to withstand harsh manufacturing and coolant environments",
      "Custom clamping to avoid workpiece distortion"
    ],
    supportedProducts: ["special-gauges-fixtures"],
    applications: [
      "Automotive complex castings and aluminum transmission components",
      "Multi-hole center-to-center distance checking",
      "Stepped shaft profile and flange perpendicularity verification"
    ]
  },
  {
    id: "assembly-work-holding",
    slug: "assembly-work-holding",
    title: "Assembly & Work Holding",
    shortDescription: "Manufacturing support solutions, precision work-holding fixtures, and assembly tooling.",
    fullDescription: "Akira Precision Automation LLP provides comprehensive assembly and work-holding solutions that maintain workpiece rigidity and datum alignment during precision assembly and inspection operations.",
    iconName: "Anchor",
    image: "/assets/solutions/fixture-precision-spindle.webp",
    features: [
      "Work-holding solutions designed to eliminate part deflection",
      "Ergonomic quick-clamping toggle and pneumatic clamp designs",
      "Precision ground datum blocks and locators",
      "Engineered to improve operator safety, speed, and repeatability"
    ],
    supportedProducts: ["special-gauges-fixtures", "camshaft-multigauging-station"],
    applications: [
      "Powertrain component sub-assembly benches",
      "Component clamping during precision measurement",
      "Welding, press-fitting, and torque verification fixtures"
    ]
  }
];
