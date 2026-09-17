import { Solution } from '../types';

export const solutions: Solution[] = [
  {
    id: "multigauging",
    slug: "multigauging",
    title: "Multi Gauging Solutions",
    shortDescription: "Advanced automated multi-gauging systems delivering unmatched accuracy, efficiency, and multi-point inspection for OEM and automotive manufacturing.",
    fullDescription: "Our multigauging systems deliver unmatched accuracy and efficiency, enhancing your manufacturing process with innovative solutions tailored for OEM and automotive industries. Engineered to measure multiple dimensions, taper, runout, and ovality simultaneously in a single cycle.",
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
    supportedProducts: ["engine-block-liner-multigauging-station", "camshaft-multigauging-station", "three-channel-tri-colour-display", "four-channel-tri-colour-display"],
    applications: [
      "Engine block cylinder liner bore inspection",
      "Camshaft and crankshaft multi-journal diameter checks",
      "Transmission gears, shafts, and planetary assemblies",
      "Automated inspection transfer lines"
    ]
  },
  {
    id: "air-gauging",
    slug: "air-gauging",
    title: "Air Gauging",
    shortDescription: "Precision non-contact measurement using high-pressure compressed air technology, delivering high speed of response and self-cleaning operation.",
    fullDescription: "Air gauging ensures high precision in measurements by leveraging advanced air technology for reliable results. Suitable for multiple industries, enhancing production efficiency with non-contact, frictionless dimensional inspection.",
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
    ]
  },
  {
    id: "fixtures",
    slug: "fixtures",
    title: "Precision Fixtures & Tooling",
    shortDescription: "Tailored fixtures designed for unique manufacturing requirements, built with flexible designs and rugged durability.",
    fullDescription: "Precision-engineered solutions for every need. Custom tailored fixtures designed for unique manufacturing requirements, offering flexible designs that adapt to different applications and engineered to withstand rigorous manufacturing environments.",
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
    ]
  },
  {
    id: "electronic-gauging",
    slug: "electronic-gauging",
    title: "Electronic Gauges",
    shortDescription: "Electronic measurement solutions for OD, bore, and multi-dimensional inspection with direct DRO and SPC connectivity.",
    fullDescription: "AKIRA Electronic Gauges provide high-resolution direct-contact measurement for outside diameters and dimensional features. Utilizing 2-point and 3-point contact geometries, these gauges feed real-time micron-accurate signals directly into AKIRA Tri-Colour Digital Display Units.",
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
