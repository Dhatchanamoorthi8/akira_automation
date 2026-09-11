import { ProductCategory, ProductSummary } from '../types';

export const productCategories: ProductCategory[] = [
  { slug: "all", name: "All Products" },
  { slug: "air-gauging", name: "Air Gauging" },
  { slug: "electronic-gauging", name: "Electronic Gauging" },
  { slug: "digital-displays", name: "Digital Display Units" },
  { slug: "memory-data", name: "Memory & Data Systems" },
  { slug: "multigauging", name: "Multigauging Stations" },
  { slug: "instruments", name: "Measuring Instruments" },
  { slug: "fixtures", name: "Special Gauges & Fixtures" },
];

export const productSummaries: ProductSummary[] = [
  {
    id: "air-plug-gauge",
    slug: "air-plug-gauge",
    title: "Air Plug Gauge to Check ID Bore",
    category: "Air Gauging",
    categorySlug: "air-gauging",
    tagline: "Precision Internal Diameter & Bore Measurement with Setting Rings",
    image: "/assets/products/air-plug-gauge.webp",
    description: "AKIRA Air Plug Gauges are high-precision non-contact pneumatic gauges engineered to inspect inside diameters (ID), taper, and ovality across high-volume precision manufacturing. Sourced with hard chrome plating for extreme durability and supplied for through, blind, and step bore applications.",
    highlights: [
      "Range: 2 mm to 200 mm",
      "Supplied for through bore / blind bore / step bore",
      "Adjustable depth collars for checking specific depths",
      "Hard chrome plated gauging surface for extended tool life",
      "Requires two setting rings for precise comparative calibration"
    ],
    isFeatured: true
  },
  {
    id: "air-calliper-gauge",
    slug: "air-calliper-gauge",
    title: "Air Calliper Gauge to Check OD",
    category: "Air Gauging",
    categorySlug: "air-gauging",
    tagline: "Snap Gauge with Air Jet Fixed in Carbide Tip for External Diameters",
    image: "/assets/products/air-calliper-gauge.webp",
    description: "AKIRA Air Calliper Gauges provide rapid, high-accuracy external diameter (OD) measurement. Built as a snap gauge configuration with precision air measuring jets embedded directly within tungsten carbide tips for ultimate durability and minimal friction wear.",
    highlights: [
      "Range: 10 mm to 180 mm Middle",
      "Two setting masters required for setup",
      "Offered with Snap Gauge with jet fixed in Carbide tip",
      "Non-contact pneumatic measurement protects polished shafts",
      "Custom configured per customer unit specification"
    ],
    isFeatured: true
  },
  {
    id: "air-ring-gauge",
    slug: "air-ring-gauge",
    title: "Air Ring Gauge to Check OD",
    category: "Air Gauging",
    categorySlug: "air-gauging",
    tagline: "Two Jet & Three Jet Air Ring Gauges for OD, Taper, Ovality & Lobing",
    image: "/assets/products/air-ring-gauge.webp",
    description: "AKIRA Air Ring Gauges are precision non-contact inspection tools designed for checking outside diameters, taper, and ovality. Available in both Two-Jet configurations for diametrical checks and Three-Jet configurations @ 120 degrees for detecting complex 3-lobe polygonal form errors.",
    highlights: [
      "Two Jet Air Ring Gauge: Outside diameter, Taper & Ovality inspection",
      "Three Jet Air Ring Gauge: Detecting Lobing effect @ 120 Degrees",
      "Can be supplied with Tungsten Carbide wear rings on request",
      "Air Ring gauge above dia. 150 mm available on request",
      "Non-destructive, self-cleaning pneumatic operation"
    ],
    isFeatured: true
  },
  {
    id: "electronic-calliper-gauge",
    slug: "electronic-calliper-gauge",
    title: "Electronic Calliper Gauge for OD (2 Point / 3 Point)",
    category: "Electronic Gauging",
    categorySlug: "electronic-gauging",
    tagline: "Direct Contact Precision Electronic Snap Gauges for Shop Floor OD Checking",
    image: "/assets/products/electronic-calliper-gauge-set.webp",
    description: "AKIRA Electronic Calliper Gauges and Electronic Snap Gauges provide rapid, high-resolution electronic measurement for outside diameters. Engineered with robust inductive/LVDT probes in 2-point and 3-point configurations to verify diameters and concentricity on precision machined shafts.",
    highlights: [
      "Electronic Calliper Gauge for OD measurement",
      "2 Point / 3 Point measurement configurations",
      "Custom sizes including standard models up to Dia. 64 mm and beyond",
      "Rigid ergonomic handles for effortless operator handling",
      "Direct interface with AKIRA Tri-Colour DRO and multi-channel units"
    ],
    isFeatured: true
  },
  {
    id: "air-gauge-display-unit",
    slug: "air-gauge-display-unit",
    title: "AKIRA Air Gauge Display Unit",
    category: "Air Gauging",
    categorySlug: "air-gauging",
    tagline: "High Pressure Metrology Display Column with Built-in Precision Regulator",
    image: "/assets/products/air-gauge-display-unit.webp",
    description: "The AKIRA Air Gauge Display Unit is a high-pressure pneumatic metrology column designed for fast, accurate inspection of bore size, taper, and ovality in a single setup. Features a built-in high-precision pressure regulator, system pressure check gauge, and self-cleaning air flow.",
    highlights: [
      "High pressure system: High speed of response & self-cleaning gauging area",
      "Accurate reading of size, taper, and ovality at a time",
      "Non-contact gauging ensures long life due to minimal frictional wear",
      "Two Setting Masters ensure correct magnification of reading at all times",
      "System Pressure Check Gauge monitors regulated 3 bar (45 psi) line",
      "Minimum line pressure required: 4.5 bars (67 psi)"
    ],
    isFeatured: true
  },
  {
    id: "air-electronics-tri-colour-display",
    slug: "air-electronics-tri-colour-display",
    title: "Air Electronics Tri-Colour Digital Display Unit (B.D.)",
    category: "Digital Display Units",
    categorySlug: "digital-displays",
    tagline: "Integrated Pneumatic-to-Electronic Digital Display with Built-in Air Dryer",
    image: "/assets/products/air-electronics-display.webp",
    description: "The AKIRA Air Electronics Tri-Colour Digital Display Unit (B.D.) integrates precision pneumatic gauging transducers with a modern 6-digit 7-segment tri-colour LED readout. Built with an internal auto-drain filter and air dryer unit, offering complete digital SPC connectivity.",
    highlights: [
      "Channels: Single Channel pneumatic-electronic unit",
      "Measuring Range: ± 0.080 µm with 1 µm resolution",
      "Built-in Auto Drain Filter with Air Dryer",
      "1\" 6-Digit 7-Segment Tri Colour Display",
      "Double Master Calibration Facility",
      "RS-232 Interface standard and Foot Switch facility"
    ],
    isFeatured: true
  },
  {
    id: "tri-colour-digital-display-unit",
    slug: "tri-colour-digital-display-unit",
    title: "Tri-Colour Digital Display Unit",
    category: "Digital Display Units",
    categorySlug: "digital-displays",
    tagline: "High-Resolution 0.1 µm Metrology DRO with Tri-Colour Status LED",
    image: "/assets/products/tri-colour-display-stand.webp",
    description: "AKIRA Tri-Colour Digital Display Unit is a versatile shop floor readout unit available in single and double channel configurations. Features ultra-fine 0.1 µm resolution, a bright 1/2\" 6-digit display, and an independent Tri-colour LED for instant GO / NO-GO component status.",
    highlights: [
      "Channels: Single Channel & Double Channel",
      "Measuring Range: ± 0.2 MM and ± 1 MM",
      "Ultra-Fine Resolution: 0.1 µm and 1 µm",
      "Status LED: One Tri-colour LED for component status",
      "Single and Double Master Calibration Facility",
      "RS-232 Interface Standard and Foot Switch facility"
    ],
    isFeatured: true
  },
  {
    id: "two-channel-tri-colour-display",
    slug: "two-channel-tri-colour-display",
    title: "Two Channel Two Display Tri Colour Digital Display Unit",
    category: "Digital Display Units",
    categorySlug: "digital-displays",
    tagline: "Simultaneous 2-Channel Metrology DRO with Dedicated Numeric Windows & Ports",
    image: "/assets/products/two-channel-display.webp",
    description: "AKIRA Two Channel Two Display Tri Colour Digital Display Unit features two independent 6-digit numeric display windows (DIA1 and DIA2) and dual pneumatic ports (D1, D2). Allows simultaneous multi-point or multi-feature inspection on a single compact station.",
    highlights: [
      "Channels: Two Channel Two Display (DIA1 & DIA2)",
      "Measuring Range: ± 0.080 µm with 1 µm resolution",
      "Auto Drain Filter with Air Dryer built-in",
      "Double Master Calibration Facility",
      "Dual pneumatic quick-connect ports (D1, D2)",
      "RS-232 PC interface standard with optional 10,000 reading storage"
    ],
    isFeatured: false
  },
  {
    id: "three-channel-tri-colour-display",
    slug: "three-channel-tri-colour-display",
    title: "Three Channel Three Display Tri Colour Digital Display Unit",
    category: "Digital Display Units",
    categorySlug: "digital-displays",
    tagline: "Simultaneous 3-Channel Readout with Triple Display Windows (DIA1, DIA2, DIA3)",
    image: "/assets/products/three-channel-display.webp",
    description: "AKIRA Three Channel Three Display Tri Colour Digital Display Unit features three dedicated display screens (DIA1, DIA2, DIA3) and three front pneumatic ports (D1, D2, D3). Sized specifically for three-plane bore inspection, multi-journal shafts, and stepped components.",
    highlights: [
      "Channels: Three Channel Three Display (DIA1, DIA2, DIA3)",
      "Measuring Range: ± 0.080 µm with 1 µm resolution",
      "Three pneumatic input fittings (D1, D2, D3)",
      "Auto Drain Filter with Air Dryer built-in",
      "Double Master Calibration Facility",
      "RS-232 Output, Foot Switch, and optional 10,000 reading storage"
    ],
    isFeatured: false
  },
  {
    id: "auto-selection-air-server-display",
    slug: "auto-selection-air-server-display",
    title: "Auto Selection with Air Server Tri Colour Digital Display Unit",
    category: "Digital Display Units",
    categorySlug: "digital-displays",
    tagline: "Smart 4-Channel Pneumatic Switching with Energy-Saving Air Saver",
    image: "/assets/products/auto-selection-display.webp",
    description: "AKIRA Auto Selection with Air Server Tri Colour Digital Display Unit is an intelligent four-channel, single-display metrology unit. Features an integrated Air Saver with auto-selection diameter technology that activates airflow only when a tool is engaged, drastically cutting compressed air consumption.",
    highlights: [
      "Channels: Four Channel One Display (D1, D2, D3, D4 inputs)",
      "Air Saver with Auto Selection Diameter",
      "Measuring Range: ± 0.080 µm with 1 µm resolution",
      "Auto Drain Filter with Air Dryer built-in",
      "Double Master Calibration Facility",
      "RS-232 Interface standard and Foot Switch facility"
    ],
    isFeatured: true
  },
  {
    id: "four-channel-tri-colour-display",
    slug: "four-channel-tri-colour-display",
    title: "Four Channel Four Display Tri Colour Digital Display Unit",
    category: "Digital Display Units",
    categorySlug: "digital-displays",
    tagline: "Comprehensive 4-Channel Multi-Gauging DRO with 4 Independent Screens",
    image: "/assets/products/four-channel-display.webp",
    description: "AKIRA Four Channel Four Display Tri Colour Digital Display Unit provides complete simultaneous inspection across four independent channels (DIA1, DIA2, DIA3, DIA4) with four pneumatic quick-connect ports (D1 to D4). Engineered for complex multi-point automated gauging stations.",
    highlights: [
      "Channels: Four Channel Four Display (DIA1, DIA2, DIA3, DIA4)",
      "Measuring Range: ± 0.080 µm with 1 µm resolution",
      "Four pneumatic quick-connect ports (D1, D2, D3, D4)",
      "Auto Drain Filter with Air Dryer built-in",
      "Double Master Calibration Facility",
      "RS-232 Interface, Foot Switch, and optional 10,000 reading storage"
    ],
    isFeatured: true
  },
  {
    id: "memory-module-unit",
    slug: "memory-module-unit",
    title: "AKIRA Memory Module Unit",
    category: "Memory & Data Systems",
    categorySlug: "memory-data",
    tagline: "Dedicated 10,000 Reading Industrial Metrology Data Logger with Excel Export",
    image: "/assets/products/memory-module-unit.webp",
    description: "The AKIRA Memory Module Unit is an industrial digital logging hardware unit that bridges AKIRA Electronic DRO and Tri-Colour Display Units with host PCs and statistical process control (SPC) software. Stores up to 10,000 readings with date & time stamps and exports directly to Microsoft Excel.",
    highlights: [
      "RS-232 Connectivity with Electronic DRO Type Unit",
      "USB Connectivity with PC",
      "10,000 Reading Storage Capacity",
      "Memory Full LED indication",
      "Time & Date Stamp with each recorded reading",
      "Saved reading opened in Excel file when connected to PC",
      "Compatible with any available SPC software (e.g. MINITAB)",
      "Data modification possible with Excel file"
    ],
    isFeatured: true
  },
  {
    id: "engine-block-liner-multigauging-station",
    slug: "engine-block-liner-multigauging-station",
    title: "Engine Block Liner Bore Multigauging Station",
    category: "Multigauging Stations",
    categorySlug: "multigauging",
    tagline: "6 Liner ID Dia Measurement in X & Y Axes at 3 Levels with 12-Jet Air Plug",
    image: "/assets/multigauging/engine-block-liner-station.webp",
    description: "The AKIRA Engine Block Liner Bore Multigauging Station is a specialized multi-gauging metrology system engineered to inspect cylinder liner bores across multiple planes simultaneously. Utilizes a suspended 12-jet special air plug gauge, special 3-level master setting rings, and dual 3-channel tri-colour displays to check X and Y axes across 3 levels in a single ergonomic stroke.",
    highlights: [
      "Tri-Color Six digit display system",
      "6 LINER ID DIA Measurement in X Axis at 3 Levels & Y Axis at 3 Levels",
      "Suspended type 12 JET Special Air Plug Gauge",
      "Special 3 Level Master Settings Rings for setting of 3 Dia in X & Y Axis",
      "Absolute / Comparative Measurement with Auto calibration facility",
      "Metric / Inch & Static / Dynamic measurement modes",
      "RS 232 Output and Optional 24V Relay Output"
    ],
    isFeatured: true
  },
  {
    id: "camshaft-multigauging-station",
    slug: "camshaft-multigauging-station",
    title: "Camshaft Dia Multigauging Station",
    category: "Multigauging Stations",
    categorySlug: "multigauging",
    tagline: "Simultaneous 6 OD Dia Inspection Bench with Dual Tri-Colour Displays & CAD Fixture",
    image: "/assets/multigauging/camshaft-multigauging-station.webp",
    description: "The AKIRA Camshaft Dia Multigauging Station is a turnkey multi-point dimensional inspection bench custom-engineered for automotive camshaft manufacturing. Inspects 6 outside diameters (OD) simultaneously with tri-colour 6-digit displays, auto calibration, and optional 24V automation relay outputs.",
    highlights: [
      "Tri-Color Six digit display units",
      "6 OD DIA Measurement performed simultaneously",
      "Absolute / Comparative Measurement modes",
      "Auto calibration facility for fast master setting",
      "Metric / Inch & Static / Dynamic measurement",
      "RS 232 Output and Optional 24V Relay Output",
      "Tricolour LED for component tolerance status",
      "Ideal for Camshaft DIA Measurement"
    ],
    isFeatured: true
  },
  {
    id: "instruments-measuring-equipment",
    slug: "instruments-measuring-equipment",
    title: "Instruments & Measuring Equipment",
    category: "Measuring Instruments",
    categorySlug: "instruments",
    tagline: "All Type of Instruments: Coating Thickness, Slip Gauges, Magnetic Stands, Calipers & Balances",
    image: "/assets/company/inspection-workbench.webp",
    description: "AKIRA AUTOMATION supplies all types of standard precision measuring instruments, calibration standards, and metrology accessories. Sourced to deliver dependable accuracy across shop-floor and standards room environments.",
    highlights: [
      "All type of Instruments, coating thickness, Slip gauge, magnetic stands etc.",
      "Digital Coating Thickness Gauge (60-140 rdg/min, IP54, 100,000 memory, C1/C2 probes)",
      "Portable Leeb Hardness Tester with calibrated test block",
      "Precision Digital Analytical & Industrial Weighing Scale",
      "Absolute Digimatic Vernier Calipers (IP67)",
      "Magnetic Stands with fine adjustment and articulated arms",
      "Precision Metric Slip Gauge Sets in fitted wooden cases",
      "Precision Pin Gauge Sets in graduated cases"
    ],
    isFeatured: true
  },
  {
    id: "special-gauges-fixtures",
    slug: "special-gauges-fixtures",
    title: "All Type of Special Gauges & Fixtures",
    category: "Special Gauges & Fixtures",
    categorySlug: "fixtures",
    tagline: "Custom-Engineered Precision Gauging, Workholding & Multi-Feature Inspection Fixtures",
    image: "/assets/fixtures/multi-pin-gauging-fixture.webp",
    description: "AKIRA AUTOMATION specializes in custom-built inspection fixtures, assembly tooling, and workholding solutions tailored to complex workpiece geometries. Designed and manufactured to withstand rigorous shop-floor production conditions while delivering repeatable micron-level accuracy.",
    highlights: [
      "All type of special gauges & Fixtures",
      "Custom multi-pin dimensional inspection fixtures",
      "Work-holding and dedicated casting inspection fixtures",
      "Tailored fixtures for unique manufacturing requirements",
      "Flexible designs that adapt to different applications",
      "Engineered to withstand rigorous manufacturing environments"
    ],
    isFeatured: true
  }
];
