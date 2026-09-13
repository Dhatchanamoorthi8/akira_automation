--
-- AKIRA AUTOMATION — PRODUCTION PRODUCT SEED
-- Generated programmatically by scripts/migrate-products.cjs
--
BEGIN;

-- Product 1: Air Plug Gauge to Check ID Bore
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Air Plug Gauge to Check ID Bore',
  'air-plug-gauge',
  'Air Gauging',
  'air-gauging',
  'Precision Internal Diameter & Bore Measurement with Setting Rings',
  'AKIRA Air Plug Gauges are high-precision non-contact pneumatic gauges engineered to inspect inside diameters (ID), taper, and ovality across high-volume precision manufacturing. Sourced with hard chrome plating for extreme durability and supplied for through, blind, and step bore applications.',
  'AKIRA Air Plug Gauges are high-precision non-contact pneumatic gauges engineered to inspect inside diameters (ID), taper, and ovality across high-volume precision manufacturing. Sourced with hard chrome plating for extreme durability and supplied for through, blind, and step bore applications.',
  ARRAY['"Range: 2 mm to 200 mm"','"Supplied for through bore / blind bore / step bore"','"Adjustable depth collars for checking specific depths"','"Hard chrome plated gauging surface for extended tool life"','"Requires two setting rings for precise comparative calibration"']::text[],
  '{"Diameter Range":"2 mm to 200 mm","Bore Applications":"Through bore, Blind bore, Step bore","Surface Treatment":"Hard chrome plated","Depth Control":"Adjustable depth collars available","Master Requirements":"Two setting rings required (Double Master Calibration)","Principle":"Pneumatic back-pressure differential measurement","Wear Resistance":"High-wear resistant hard chrome plating"}'::jsonb,
  ARRAY['"Can be supplied for through bore / blind bore applications"','"Adjustable depth collars can be provided for checking a specific depth"','"Standard measurement range: 2 mm to 200 mm"','"Hard chrome plated construction for long life"','"Precision manufactured to partner with AKIRA display units"','"Two setting rings ensure precise comparative zero and span setting"']::text[],
  ARRAY['"Automotive engine cylinder and liner bore inspection"','"Precision bushing, sleeve, and bearing ID checks"','"Through bore, blind bore, and step bore quality control"','"Hydraulic valves, pumps, and pneumatic actuators"']::text[],
  ARRAY['"air-ring-gauge"','"air-gauge-display-unit"','"air-electronics-tri-colour-display"','"engine-block-liner-multigauging-station"']::text[],
  NULL,
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'products/air-plug-gauge/primary.webp',
  '/assets/products/air-plug-gauge.webp',
  'Air Plug Gauge to Check ID Bore',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 2: Air Calliper Gauge to Check OD
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'Air Calliper Gauge to Check OD',
  'air-calliper-gauge',
  'Air Gauging',
  'air-gauging',
  'Snap Gauge with Air Jet Fixed in Carbide Tip for External Diameters',
  'AKIRA Air Calliper Gauges provide rapid, high-accuracy external diameter (OD) measurement. Built as a snap gauge configuration with precision air measuring jets embedded directly within tungsten carbide tips for ultimate durability and minimal friction wear.',
  'AKIRA Air Calliper Gauges provide rapid, high-accuracy external diameter (OD) measurement. Built as a snap gauge configuration with precision air measuring jets embedded directly within tungsten carbide tips for ultimate durability and minimal friction wear.',
  ARRAY['"Range: 10 mm to 180 mm Middle"','"Two setting masters required for setup"','"Offered with Snap Gauge with jet fixed in Carbide tip"','"Non-contact pneumatic measurement protects polished shafts"','"Custom configured per customer unit specification"']::text[],
  '{"Diameter Range":"10 mm to 180 mm Middle","Measuring Contact":"Snap Gauge with air jet fixed in Carbide tip","Master Requirements":"Two setting masters required","Unit Specification":"Custom built to specified display / column unit requirement","Measurement Principle":"Non-contact pneumatic differential pressure","Wear Points":"Carbide tipped contact surfaces"}'::jsonb,
  ARRAY['"Offered with Snap Gauge with jet fixed in Carbide tip"','"Range: 10 mm to 180 mm Middle"','"Two setting masters required for quick zero-setting"','"Protects precision ground surfaces from contact scratching"','"Immediate reading on AKIRA Air Column or Digital Display Units"','"Customer must specify the unit for which Air snap gauge is required"']::text[],
  ARRAY['"Crankshaft, camshaft, and transmission shaft OD inspection"','"Precision cylindrical pins, plungers, and turned parts"','"In-process and final inspection on shop floor machining lines"']::text[],
  ARRAY['"air-plug-gauge"','"air-ring-gauge"','"air-gauge-display-unit"','"electronic-calliper-gauge"']::text[],
  NULL,
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'products/air-calliper-gauge/primary.webp',
  '/assets/products/air-calliper-gauge.webp',
  'Air Calliper Gauge to Check OD',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 3: Air Ring Gauge to Check OD
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000003',
  'Air Ring Gauge to Check OD',
  'air-ring-gauge',
  'Air Gauging',
  'air-gauging',
  'Two Jet & Three Jet Air Ring Gauges for OD, Taper, Ovality & Lobing',
  'AKIRA Air Ring Gauges are precision non-contact inspection tools designed for checking outside diameters, taper, and ovality. Available in both Two-Jet configurations for diametrical checks and Three-Jet configurations @ 120 degrees for detecting complex 3-lobe polygonal form errors.',
  'AKIRA Air Ring Gauges are precision non-contact inspection tools designed for checking outside diameters, taper, and ovality. Available in both Two-Jet configurations for diametrical checks and Three-Jet configurations @ 120 degrees for detecting complex 3-lobe polygonal form errors.',
  ARRAY['"Two Jet Air Ring Gauge: Outside diameter, Taper & Ovality inspection"','"Three Jet Air Ring Gauge: Detecting Lobing effect @ 120 Degrees"','"Can be supplied with Tungsten Carbide wear rings on request"','"Air Ring gauge above dia. 150 mm available on request"','"Non-destructive, self-cleaning pneumatic operation"']::text[],
  '{"Jet Configurations":"Two Jet (180°) or Three Jet (120°)","Inspection Parameters":"Outside Diameter (OD), Taper, Ovality, and Lobing","Wear Ring Options":"Tungsten Carbide wear rings available on request","Large Diameter Options":"Above Dia. 150 mm available on request","Masters":"Calibrated setting plug masters","Operation":"Self-cleaning pneumatic air purge"}'::jsonb,
  ARRAY['"Two Jet Air Ring Gauge to check outside diameter, Taper & Ovality"','"Three jet Air Ring Gauge for detecting Lobing effect @ 120 Degrees"','"Can be supplied with Tungsten Carbide wear rings on request"','"Air Ring gauge - above dia. 150 mm available on request"','"High repeatability and swift response when paired with AKIRA display units"','"Ideal for roundness and straightness verification of cylindrical shafts"']::text[],
  ARRAY['"Automotive piston pins, valve spools, and hydraulic plungers"','"Precision shafts, fuel injection needles, and transmission gears"','"Detection of 3-point lobing errors caused by centerless grinding"']::text[],
  ARRAY['"air-plug-gauge"','"air-calliper-gauge"','"air-gauge-display-unit"']::text[],
  NULL,
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000003',
  'products/air-ring-gauge/primary.webp',
  '/assets/products/air-ring-gauge.webp',
  'Air Ring Gauge to Check OD',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 4: Electronic Calliper Gauge for OD (2 Point / 3 Point)
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'Electronic Calliper Gauge for OD (2 Point / 3 Point)',
  'electronic-calliper-gauge',
  'Electronic Gauging',
  'electronic-gauging',
  'Direct Contact Precision Electronic Snap Gauges for Shop Floor OD Checking',
  'AKIRA Electronic Calliper Gauges and Electronic Snap Gauges provide rapid, high-resolution electronic measurement for outside diameters. Engineered with robust inductive/LVDT probes in 2-point and 3-point configurations to verify diameters and concentricity on precision machined shafts.',
  'AKIRA Electronic Calliper Gauges and Electronic Snap Gauges provide rapid, high-resolution electronic measurement for outside diameters. Engineered with robust inductive/LVDT probes in 2-point and 3-point configurations to verify diameters and concentricity on precision machined shafts.',
  ARRAY['"Electronic Calliper Gauge for OD measurement"','"2 Point / 3 Point measurement configurations"','"Custom sizes including standard models up to Dia. 64 mm and beyond"','"Rigid ergonomic handles for effortless operator handling"','"Direct interface with AKIRA Tri-Colour DRO and multi-channel units"']::text[],
  '{"Measurement System":"High-precision electronic inductive / LVDT probe","Geometry":"2-Point diametral / 3-Point multi-point contact","Supported Range":"Custom manufactured for specified workpiece diameters (e.g. Ø 64 mm)","Output":"Electronic signal to DRO / Tri-Colour Digital Display","Construction":"Hardened alloy steel body with carbide contact anvils","Handle":"Ergonomic knurled grip handle"}'::jsonb,
  ARRAY['"Available in 2 Point and 3 Point configurations for OD inspection"','"High repeatability in demanding shop floor production environments"','"Direct electronic readout avoids parallax error"','"Instant tolerance feedback via paired AKIRA Digital Display Units"','"Built with high-wear carbide anvils for long operational life"']::text[],
  ARRAY['"Automotive shafts, axles, and gearbox journals"','"Precision turned components requiring instant digital inspection"','"Workpieces where shop floor compressed air is unavailable or dry contact is preferred"']::text[],
  ARRAY['"air-calliper-gauge"','"tri-colour-digital-display-unit"','"camshaft-multigauging-station"']::text[],
  NULL,
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'products/electronic-calliper-gauge/primary.webp',
  '/assets/products/electronic-calliper-gauge-set.webp',
  'Electronic Calliper Gauge for OD (2 Point / 3 Point)',
  0,
  true
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'products/electronic-calliper-gauge/secondary-1.webp',
  '/assets/products/electronic-snap-gauge-64.webp',
  'Electronic Calliper Gauge for OD (2 Point / 3 Point) - Accessory View 1',
  1,
  false
) ON CONFLICT DO NOTHING;

-- Product 5: AKIRA Air Gauge Display Unit
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000005',
  'AKIRA Air Gauge Display Unit',
  'air-gauge-display-unit',
  'Air Gauging',
  'air-gauging',
  'High Pressure Metrology Display Column with Built-in Precision Regulator',
  'The AKIRA Air Gauge Display Unit is a high-pressure pneumatic metrology column designed for fast, accurate inspection of bore size, taper, and ovality in a single setup. Features a built-in high-precision pressure regulator, system pressure check gauge, and self-cleaning air flow.',
  'The AKIRA Air Gauge Display Unit is a high-pressure pneumatic metrology column designed for fast, accurate inspection of bore size, taper, and ovality in a single setup. Features a built-in high-precision pressure regulator, system pressure check gauge, and self-cleaning air flow.',
  ARRAY['"High pressure system: High speed of response & self-cleaning gauging area"','"Accurate reading of size, taper, and ovality at a time"','"Non-contact gauging ensures long life due to minimal frictional wear"','"Two Setting Masters ensure correct magnification of reading at all times"','"System Pressure Check Gauge monitors regulated 3 bar (45 psi) line"','"Minimum line pressure required: 4.5 bars (67 psi)"']::text[],
  '{"Operating System":"High pressure pneumatic system","Regulated System Pressure":"3 bars (45 psi) regulated by built-in precision regulator","Minimum Line Pressure":"4.5 bars (67 psi)","Calibration Masters":"Two Setting Masters for precise magnification adjustment","Indicator Type":"Precision high-amplification dial indicator (0.001 mm LC)","Gauging Method":"Non-contact pneumatic back-pressure","Maintenance Features":"Self-cleaning gauging area purges chips and coolant"}'::jsonb,
  ARRAY['"High pressure system ensures rapid needle response without damping lag"','"Self cleaning of gauging area ensures accurate reading of size, taper and ovality at a time"','"Non-contact Gauging guarantees long life due to minimal frictional wear"','"Two Setting Masters ensure correct magnification of reading at all times"','"System Pressure Check Gauge provides constant verification on system pressure (3 bars / 45 psi)"','"Built-in industrial grade pressure regulator ensures immunity from shop floor line fluctuations"','"Compact, heavy-duty industrial blue housing engineered for workshop reliability"']::text[],
  ARRAY['"Benchtop bore and shaft inspection alongside machining centers"','"Pairing with Air Plug Gauges, Air Ring Gauges, and Air Snap Gauges"','"Zero-wear metrology in wet, oily, or coolant-sprayed machining environments"']::text[],
  ARRAY['"air-plug-gauge"','"air-ring-gauge"','"air-calliper-gauge"','"tri-colour-digital-display-unit"']::text[],
  NULL,
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000005',
  'products/air-gauge-display-unit/primary.webp',
  '/assets/products/air-gauge-display-unit.webp',
  'AKIRA Air Gauge Display Unit',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 6: Air Electronics Tri-Colour Digital Display Unit (B.D.)
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000006',
  'Air Electronics Tri-Colour Digital Display Unit (B.D.)',
  'air-electronics-tri-colour-display',
  'Digital Display Units',
  'digital-displays',
  'Integrated Pneumatic-to-Electronic Digital Display with Built-in Air Dryer',
  'The AKIRA Air Electronics Tri-Colour Digital Display Unit (B.D.) integrates precision pneumatic gauging transducers with a modern 6-digit 7-segment tri-colour LED readout. Built with an internal auto-drain filter and air dryer unit, offering complete digital SPC connectivity.',
  'The AKIRA Air Electronics Tri-Colour Digital Display Unit (B.D.) integrates precision pneumatic gauging transducers with a modern 6-digit 7-segment tri-colour LED readout. Built with an internal auto-drain filter and air dryer unit, offering complete digital SPC connectivity.',
  ARRAY['"Channels: Single Channel pneumatic-electronic unit"','"Measuring Range: ± 0.080 µm with 1 µm resolution"','"Built-in Auto Drain Filter with Air Dryer"','"1\" 6-Digit 7-Segment Tri Colour Display"','"Double Master Calibration Facility"','"RS-232 Interface standard and Foot Switch facility"']::text[],
  '{"Channels":"Single Channel","Measuring Range":"± 0.080 µm","Resolution":"1 µm","Measurement Mode":"Absolute / Comparative Measurement","Auto Calibration":"Auto Calibration Facility included","Calibration Masters":"Double Master Calibration Facility","PC Connectivity":"RS-232 Interface Standard & Foot Switch Facility","Units":"MM and Inch Measurement","Reading Dynamics":"Static / Dynamic Reading","Power Supply":"230 Volt AC Power Supply","Numeric Display":"1\" 6 Digit and 7 Segment Tri Colour Display","Air Conditioning":"Auto Drain Filter with Air Dryer built-in","Data Storage (Optional)":"Reading Data Storage Facility up to 10,000 readings","Relay Output (Optional)":"Relay Output Facility","Buzzer Output (Optional)":"Buzzer Output Facility"}'::jsonb,
  ARRAY['"Single Channel precision pneumatic-to-electronic transducer"','"Tri-colour display shifts colour dynamically based on component tolerance status"','"Auto drain filter with air dryer preserves internal sensors from moisture and oil"','"Standard RS-232 serial communication with external PC / SPC systems"','"Optional foot switch for hands-free operator data logging"','"Capable of both static dimensional checking and dynamic min/max readings"']::text[],
  ARRAY['"Precision bore and OD inspection with digital SPC data logging"','"Automotive powertrain and fuel injection component grading"','"100% production line inspection with tri-colour visual tolerance verdict"']::text[],
  ARRAY['"tri-colour-digital-display-unit"','"two-channel-tri-colour-display"','"air-plug-gauge"']::text[],
  '/assets/products/air-electronics-specs.webp',
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000006',
  'products/air-electronics-tri-colour-display/primary.webp',
  '/assets/products/air-electronics-display.webp',
  'Air Electronics Tri-Colour Digital Display Unit (B.D.)',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 7: Tri-Colour Digital Display Unit
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000007',
  'Tri-Colour Digital Display Unit',
  'tri-colour-digital-display-unit',
  'Digital Display Units',
  'digital-displays',
  'High-Resolution 0.1 µm Metrology DRO with Tri-Colour Status LED',
  'AKIRA Tri-Colour Digital Display Unit is a versatile shop floor readout unit available in single and double channel configurations. Features ultra-fine 0.1 µm resolution, a bright 1/2" 6-digit display, and an independent Tri-colour LED for instant GO / NO-GO component status.',
  'AKIRA Tri-Colour Digital Display Unit is a versatile shop floor readout unit available in single and double channel configurations. Features ultra-fine 0.1 µm resolution, a bright 1/2" 6-digit display, and an independent Tri-colour LED for instant GO / NO-GO component status.',
  ARRAY['"Channels: Single Channel & Double Channel"','"Measuring Range: ± 0.2 MM and ± 1 MM"','"Ultra-Fine Resolution: 0.1 µm and 1 µm"','"Status LED: One Tri-colour LED for component status"','"Single and Double Master Calibration Facility"','"RS-232 Interface Standard and Foot Switch facility"']::text[],
  '{"Channels":"Single Channel & Double Channel","Measuring Range":"± 0.2 MM and ± 1 MM","Resolution":"0.1 µm and 1 µm","Measurement Mode":"Absolute / Comparative Measurement","Auto Calibration":"Auto Calibration Facility","Calibration Facility":"Single and Double Master Calibration Facility","Component Status":"One Tri colour LED for Component status","PC Connectivity":"RS-232 Interface Standard & Foot Switch Facility","Units":"MM and Inch Measurement","Reading Dynamics":"Static / Dynamic Reading","Power Supply":"230 Volt AC Power Supply","Numeric Display":"1/2\" 6 Digit and 7 Segment Tri Colour Display","Data Storage (Optional)":"Reading Data Storage Facility up to 10,000 readings","Relay Output (Optional)":"Relay Output Facility","Buzzer Output (Optional)":"Buzzer Output Facility"}'::jsonb,
  ARRAY['"Dual range capability: ± 0.2 mm for micro-precision and ± 1 mm for broader tolerances"','"Selectable 0.1 µm or 1 µm display resolution"','"One Tri-colour LED gives operators immediate visual feedback (Green=OK, Yellow=Rework, Red=Reject)"','"Single and Double Master calibration modes for rapid daily shop floor mastering"','"Standard RS-232 output for direct connection to PC and SPC software"','"Benchtop stand mountable for comfortable ergonomic inspection"']::text[],
  ARRAY['"Benchtop dimensional verification of automotive parts"','"Electronic snap gauge and probe readout"','"Standards laboratory and shop-floor comparative gauging"']::text[],
  ARRAY['"air-electronics-tri-colour-display"','"two-channel-tri-colour-display"','"memory-module-unit"']::text[],
  '/assets/products/tri-colour-specs.webp',
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000007',
  'products/tri-colour-digital-display-unit/primary.webp',
  '/assets/products/tri-colour-display-stand.webp',
  'Tri-Colour Digital Display Unit',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 8: Two Channel Two Display Tri Colour Digital Display Unit
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000008',
  'Two Channel Two Display Tri Colour Digital Display Unit',
  'two-channel-tri-colour-display',
  'Digital Display Units',
  'digital-displays',
  'Simultaneous 2-Channel Metrology DRO with Dedicated Numeric Windows & Ports',
  'AKIRA Two Channel Two Display Tri Colour Digital Display Unit features two independent 6-digit numeric display windows (DIA1 and DIA2) and dual pneumatic ports (D1, D2). Allows simultaneous multi-point or multi-feature inspection on a single compact station.',
  'AKIRA Two Channel Two Display Tri Colour Digital Display Unit features two independent 6-digit numeric display windows (DIA1 and DIA2) and dual pneumatic ports (D1, D2). Allows simultaneous multi-point or multi-feature inspection on a single compact station.',
  ARRAY['"Channels: Two Channel Two Display (DIA1 & DIA2)"','"Measuring Range: ± 0.080 µm with 1 µm resolution"','"Auto Drain Filter with Air Dryer built-in"','"Double Master Calibration Facility"','"Dual pneumatic quick-connect ports (D1, D2)"','"RS-232 PC interface standard with optional 10,000 reading storage"']::text[],
  '{"Channels":"Two Channel Two Display","Measuring Range":"± 0.080 µm","Resolution":"1 µm","Displays":"Dual 1/2\" 6 Digit and 7 Segment Tri Colour Displays","Measurement Mode":"Absolute / Comparative Measurement","Auto Calibration":"Auto Calibration Facility","Calibration Facility":"Double Master Calibration Facility","PC Connectivity":"RS-232 Interface Standard & Foot Switch Facility","Units":"MM and Inch Measurement","Reading Dynamics":"Static / Dynamic Reading","Power Supply":"230 Volt AC Power Supply","Air Conditioning":"Auto Drain Filter with Air Dryer built-in","Data Storage (Optional)":"Reading Data Storage Facility up to 10,000 readings","Relay Output (Optional)":"Relay Output Facility","Buzzer Output (Optional)":"Buzzer Output Facility"}'::jsonb,
  ARRAY['"Two Channel Two Display architecture enables simultaneous two-point checking without channel switching"','"Independent DIA1 and DIA2 front panel display windows"','"Dual quick-connect pneumatic input fittings (D1, D2)"','"Built-in auto drain filter and air dryer protecting internal sensors"','"RS-232 output for dual-channel SPC data collection"','"Optional relay and buzzer outputs for PLC line automation"']::text[],
  ARRAY['"Simultaneous top & bottom bore diameter checking"','"Simultaneous OD and length inspection"','"Taper and ovality calculation across dual planes"']::text[],
  ARRAY['"three-channel-tri-colour-display"','"four-channel-tri-colour-display"','"air-plug-gauge"']::text[],
  '/assets/products/two-channel-specs.webp',
  NULL,
  false,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000008',
  'products/two-channel-tri-colour-display/primary.webp',
  '/assets/products/two-channel-display.webp',
  'Two Channel Two Display Tri Colour Digital Display Unit',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 9: Three Channel Three Display Tri Colour Digital Display Unit
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000009',
  'Three Channel Three Display Tri Colour Digital Display Unit',
  'three-channel-tri-colour-display',
  'Digital Display Units',
  'digital-displays',
  'Simultaneous 3-Channel Readout with Triple Display Windows (DIA1, DIA2, DIA3)',
  'AKIRA Three Channel Three Display Tri Colour Digital Display Unit features three dedicated display screens (DIA1, DIA2, DIA3) and three front pneumatic ports (D1, D2, D3). Sized specifically for three-plane bore inspection, multi-journal shafts, and stepped components.',
  'AKIRA Three Channel Three Display Tri Colour Digital Display Unit features three dedicated display screens (DIA1, DIA2, DIA3) and three front pneumatic ports (D1, D2, D3). Sized specifically for three-plane bore inspection, multi-journal shafts, and stepped components.',
  ARRAY['"Channels: Three Channel Three Display (DIA1, DIA2, DIA3)"','"Measuring Range: ± 0.080 µm with 1 µm resolution"','"Three pneumatic input fittings (D1, D2, D3)"','"Auto Drain Filter with Air Dryer built-in"','"Double Master Calibration Facility"','"RS-232 Output, Foot Switch, and optional 10,000 reading storage"']::text[],
  '{"Channels":"Three Channel Three Display","Measuring Range":"± 0.080 µm","Resolution":"1 µm","Displays":"Triple 1/2\" 6 Digit and 7 Segment Tri Colour Displays","Measurement Mode":"Absolute / Comparative Measurement","Auto Calibration":"Auto Calibration Facility","Calibration Facility":"Double Master Calibration Facility","PC Connectivity":"RS-232 Interface Standard & Foot Switch Facility","Units":"MM and Inch Measurement","Reading Dynamics":"Static / Dynamic Reading","Power Supply":"230 Volt AC Power Supply","Air Conditioning":"Auto Drain Filter with Air Dryer built-in","Data Storage (Optional)":"Reading Data Storage Facility up to 10,000 readings","Relay Output (Optional)":"Relay Output Facility","Buzzer Output (Optional)":"Buzzer Output Facility"}'::jsonb,
  ARRAY['"Three Channel Three Display configuration displays three parameters at a glance"','"Three independent pneumatic input ports for direct tool connection"','"Auto calibration with double master setting rings/plugs"','"Auto drain filter and air dryer built into chassis"','"Individual tolerance status indicators for each channel"','"RS-232 serial communication for automated test benches"']::text[],
  ARRAY['"Three-level cylinder bore inspection (Top, Middle, Bottom)"','"Three-journal camshaft and crankshaft OD checking"','"Complex multi-stepped shaft inspection"']::text[],
  ARRAY['"two-channel-tri-colour-display"','"four-channel-tri-colour-display"','"engine-block-liner-multigauging-station"']::text[],
  '/assets/products/three-channel-specs.webp',
  NULL,
  false,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000009',
  'products/three-channel-tri-colour-display/primary.webp',
  '/assets/products/three-channel-display.webp',
  'Three Channel Three Display Tri Colour Digital Display Unit',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 10: Auto Selection with Air Server Tri Colour Digital Display Unit
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000010',
  'Auto Selection with Air Server Tri Colour Digital Display Unit',
  'auto-selection-air-server-display',
  'Digital Display Units',
  'digital-displays',
  'Smart 4-Channel Pneumatic Switching with Energy-Saving Air Saver',
  'AKIRA Auto Selection with Air Server Tri Colour Digital Display Unit is an intelligent four-channel, single-display metrology unit. Features an integrated Air Saver with auto-selection diameter technology that activates airflow only when a tool is engaged, drastically cutting compressed air consumption.',
  'AKIRA Auto Selection with Air Server Tri Colour Digital Display Unit is an intelligent four-channel, single-display metrology unit. Features an integrated Air Saver with auto-selection diameter technology that activates airflow only when a tool is engaged, drastically cutting compressed air consumption.',
  ARRAY['"Channels: Four Channel One Display (D1, D2, D3, D4 inputs)"','"Air Saver with Auto Selection Diameter"','"Measuring Range: ± 0.080 µm with 1 µm resolution"','"Auto Drain Filter with Air Dryer built-in"','"Double Master Calibration Facility"','"RS-232 Interface standard and Foot Switch facility"']::text[],
  '{"Channels":"Four Channel One Display","Air Economy":"Air Saver with Auto Selection Diameter","Measuring Range":"± 0.080 µm","Resolution":"1 µm","Display":"1/2\" 6 Digit and 7 Segment Tri Colour Display","Measurement Mode":"Absolute / Comparative Measurement","Auto Calibration":"Auto Calibration Facility","Calibration Facility":"Double Master Calibration Facility","PC Connectivity":"RS-232 Interface Standard & Foot Switch Facility","Units":"MM and Inch Measurement","Reading Dynamics":"Static / Dynamic Reading","Power Supply":"230 Volt AC Power Supply","Air Conditioning":"Auto Drain Filter with Air Dryer built-in","Data Storage (Optional)":"Reading Data Storage Facility up to 10,000 readings","Relay Output (Optional)":"Relay Output Facility","Buzzer Output (Optional)":"Buzzer Output Facility"}'::jsonb,
  ARRAY['"Four Channel One Display design automatically detects and reads whichever of the 4 tools is engaged"','"Air Saver technology cuts compressed air usage during idle periods between measurements"','"Auto drain filter with air dryer built into unit"','"Double master calibration facility ensures swift calibration across all 4 ports"','"RS-232 interface for full digital traceability"','"Optional relay and buzzer outputs"']::text[],
  ARRAY['"Multi-tool gauging stations where an operator uses multiple air plugs or rings sequentially"','"Energy-conscious manufacturing plants seeking to reduce compressed air utility costs"','"High-throughput multi-feature inspection benches"']::text[],
  ARRAY['"four-channel-tri-colour-display"','"air-plug-gauge"','"air-ring-gauge"']::text[],
  '/assets/products/auto-selection-specs.webp',
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000010',
  'products/auto-selection-air-server-display/primary.webp',
  '/assets/products/auto-selection-display.webp',
  'Auto Selection with Air Server Tri Colour Digital Display Unit',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 11: Four Channel Four Display Tri Colour Digital Display Unit
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000011',
  'Four Channel Four Display Tri Colour Digital Display Unit',
  'four-channel-tri-colour-display',
  'Digital Display Units',
  'digital-displays',
  'Comprehensive 4-Channel Multi-Gauging DRO with 4 Independent Screens',
  'AKIRA Four Channel Four Display Tri Colour Digital Display Unit provides complete simultaneous inspection across four independent channels (DIA1, DIA2, DIA3, DIA4) with four pneumatic quick-connect ports (D1 to D4). Engineered for complex multi-point automated gauging stations.',
  'AKIRA Four Channel Four Display Tri Colour Digital Display Unit provides complete simultaneous inspection across four independent channels (DIA1, DIA2, DIA3, DIA4) with four pneumatic quick-connect ports (D1 to D4). Engineered for complex multi-point automated gauging stations.',
  ARRAY['"Channels: Four Channel Four Display (DIA1, DIA2, DIA3, DIA4)"','"Measuring Range: ± 0.080 µm with 1 µm resolution"','"Four pneumatic quick-connect ports (D1, D2, D3, D4)"','"Auto Drain Filter with Air Dryer built-in"','"Double Master Calibration Facility"','"RS-232 Interface, Foot Switch, and optional 10,000 reading storage"']::text[],
  '{"Channels":"Four Channel Four Display","Measuring Range":"± 0.080 µm","Resolution":"1 µm","Displays":"Quad 1/2\" 6 Digit and 7 Segment Tri Colour Displays","Measurement Mode":"Absolute / Comparative Measurement","Auto Calibration":"Auto Calibration Facility","Calibration Facility":"Double Master Calibration Facility","PC Connectivity":"RS-232 Interface Standard & Foot Switch Facility","Units":"MM and Inch Measurement","Reading Dynamics":"Static / Dynamic Reading","Power Supply":"230 Volt AC Power Supply","Air Conditioning":"Auto Drain Filter with Air Dryer built-in","Data Storage (Optional)":"Reading Data Storage Facility up to 10,000 readings","Relay Output (Optional)":"Relay Output Facility","Buzzer Output (Optional)":"Buzzer Output Facility"}'::jsonb,
  ARRAY['"Quad display windows show 4 dimensions simultaneously without toggling"','"Four dedicated pneumatic ports for multi-jet tooling arrays"','"Independent tri-colour tolerance status for all 4 channels"','"Internal auto drain filter and air dryer unit for industrial reliability"','"RS-232 port for streaming 4-channel measurement packets to host PC"','"Double master calibration across all 4 channels"']::text[],
  ARRAY['"Automated multi-gauging fixtures on transfer lines"','"Simultaneous 4-journal shaft inspection"','"Engine cylinder multi-level diametrical and ovality checks"']::text[],
  ARRAY['"auto-selection-air-server-display"','"engine-block-liner-multigauging-station"','"camshaft-multigauging-station"']::text[],
  '/assets/products/four-channel-specs.webp',
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000011',
  'products/four-channel-tri-colour-display/primary.webp',
  '/assets/products/four-channel-display.webp',
  'Four Channel Four Display Tri Colour Digital Display Unit',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 12: AKIRA Memory Module Unit
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000012',
  'AKIRA Memory Module Unit',
  'memory-module-unit',
  'Memory & Data Systems',
  'memory-data',
  'Dedicated 10,000 Reading Industrial Metrology Data Logger with Excel Export',
  'The AKIRA Memory Module Unit is an industrial digital logging hardware unit that bridges AKIRA Electronic DRO and Tri-Colour Display Units with host PCs and statistical process control (SPC) software. Stores up to 10,000 readings with date & time stamps and exports directly to Microsoft Excel.',
  'The AKIRA Memory Module Unit is an industrial digital logging hardware unit that bridges AKIRA Electronic DRO and Tri-Colour Display Units with host PCs and statistical process control (SPC) software. Stores up to 10,000 readings with date & time stamps and exports directly to Microsoft Excel.',
  ARRAY['"RS-232 Connectivity with Electronic DRO Type Unit"','"USB Connectivity with PC"','"10,000 Reading Storage Capacity"','"Memory Full LED indication"','"Time & Date Stamp with each recorded reading"','"Saved reading opened in Excel file when connected to PC"','"Compatible with any available SPC software (e.g. MINITAB)"','"Data modification possible with Excel file"']::text[],
  '{"Gauge Interface":"RS-232 Connectivity with Electronic DRO Type Unit","PC Interface":"USB Connectivity with PC","Storage Capacity":"10,000 Reading Storage Capacity","Status Indicator":"Memory Full LED indication","Data Timestamp":"Time & Date Stamp with each of recorded reading","File Format":"Saved reading will be opened in Excel File when connected to PC","SPC Compatibility":"Data can be saved in PC & used with any available SPC software (e.g. MINITAB)","Data Processing":"Data modification possible with Excel file"}'::jsonb,
  ARRAY['"RS-232 Connectivity with Electronic DRO Type Unit"','"USB Connectivity with PC for instant plug-and-play communication"','"10,000 Reading Storage Capacity eliminates need for constant PC presence on the shop floor"','"Memory Full LED indication warns operator before memory buffer overflows"','"Time & Date Stamp recorded with every measurement point for 100% audit traceability"','"Saved Reading will be Opened in Excel File when connected to PC"','"Data Can be Saved in PC & can be Used with any of the available SPC Software (FOR e.g. MINITAB)"','"Data Modification possible with Excel File"']::text[],
  ARRAY['"Shop-floor statistical quality audits and Cp/Cpk studies"','"Offline data collection in remote machining cells without dedicated PCs"','"Direct integration with Minitab, Excel, and enterprise SPC platforms"']::text[],
  ARRAY['"tri-colour-digital-display-unit"','"engine-block-liner-multigauging-station"','"camshaft-multigauging-station"']::text[],
  NULL,
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000012',
  'products/memory-module-unit/primary.webp',
  '/assets/products/memory-module-unit.webp',
  'AKIRA Memory Module Unit',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 13: Engine Block Liner Bore Multigauging Station
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000013',
  'Engine Block Liner Bore Multigauging Station',
  'engine-block-liner-multigauging-station',
  'Multigauging Stations',
  'multigauging',
  '6 Liner ID Dia Measurement in X & Y Axes at 3 Levels with 12-Jet Air Plug',
  'The AKIRA Engine Block Liner Bore Multigauging Station is a specialized multi-gauging metrology system engineered to inspect cylinder liner bores across multiple planes simultaneously. Utilizes a suspended 12-jet special air plug gauge, special 3-level master setting rings, and dual 3-channel tri-colour displays to check X and Y axes across 3 levels in a single ergonomic stroke.',
  'The AKIRA Engine Block Liner Bore Multigauging Station is a specialized multi-gauging metrology system engineered to inspect cylinder liner bores across multiple planes simultaneously. Utilizes a suspended 12-jet special air plug gauge, special 3-level master setting rings, and dual 3-channel tri-colour displays to check X and Y axes across 3 levels in a single ergonomic stroke.',
  ARRAY['"Tri-Color Six digit display system"','"6 LINER ID DIA Measurement in X Axis at 3 Levels & Y Axis at 3 Levels"','"Suspended type 12 JET Special Air Plug Gauge"','"Special 3 Level Master Settings Rings for setting of 3 Dia in X & Y Axis"','"Absolute / Comparative Measurement with Auto calibration facility"','"Metric / Inch & Static / Dynamic measurement modes"','"RS 232 Output and Optional 24V Relay Output"']::text[],
  '{"Display System":"Tri-Color Six digit display (Dual 3-channel units for X & Y axes)","Measurement Scope":"6 LINER ID DIA Measurement in X Axis at 3 Levels & Y Axis at 3 Levels","Tooling Type":"Suspended type 12 JET Special Air Plug Gauge","Calibration Masters":"Special 3 Level Master Settings Rings for Setting of 3 Dia X & Y Axis","Measurement Modes":"Absolute / Comparative Measurement","Calibration":"Auto calibration Facility","Units":"Metric / Inch Measurement","Measurement Dynamics":"Static / Dynamic measurement","Data Output":"RS 232 Output","Control Output":"Relay Output 24 V (Optional)","Status Indication":"Tricolour LED for component tolerance status"}'::jsonb,
  ARRAY['"Simultaneous 6-diameter liner bore measurement across X and Y axes at Top, Middle, and Bottom levels"','"Suspended type 12 JET Special Air Plug Gauge ensures frictionless, balanced entry into heavy engine blocks"','"Special 3-Level Master Setting Rings allow rapid, single-step mastering of all 3 levels in both axes"','"Tri-colour LED indicator provides immediate component tolerance status (Accept/Rework/Reject)"','"Auto calibration facility simplifies shift changeovers"','"RS-232 serial communication streams full multi-point dimensional data to host SPC computer"','"Optional 24V relay output triggers automation gates or error-proofing interlocks"']::text[],
  ARRAY['"Automotive engine cylinder block liner bore final quality inspection"','"Taper, ovality, and hourglass/barrel bore defect detection"','"High-volume engine manufacturing and assembly plants"']::text[],
  ARRAY['"camshaft-multigauging-station"','"three-channel-tri-colour-display"','"air-plug-gauge"','"memory-module-unit"']::text[],
  NULL,
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000013',
  'products/engine-block-liner-multigauging-station/primary.webp',
  '/assets/multigauging/engine-block-liner-station.webp',
  'Engine Block Liner Bore Multigauging Station',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 14: Camshaft Dia Multigauging Station
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000014',
  'Camshaft Dia Multigauging Station',
  'camshaft-multigauging-station',
  'Multigauging Stations',
  'multigauging',
  'Simultaneous 6 OD Dia Inspection Bench with Dual Tri-Colour Displays & CAD Fixture',
  'The AKIRA Camshaft Dia Multigauging Station is a turnkey multi-point dimensional inspection bench custom-engineered for automotive camshaft manufacturing. Inspects 6 outside diameters (OD) simultaneously with tri-colour 6-digit displays, auto calibration, and optional 24V automation relay outputs.',
  'The AKIRA Camshaft Dia Multigauging Station is a turnkey multi-point dimensional inspection bench custom-engineered for automotive camshaft manufacturing. Inspects 6 outside diameters (OD) simultaneously with tri-colour 6-digit displays, auto calibration, and optional 24V automation relay outputs.',
  ARRAY['"Tri-Color Six digit display units"','"6 OD DIA Measurement performed simultaneously"','"Absolute / Comparative Measurement modes"','"Auto calibration facility for fast master setting"','"Metric / Inch & Static / Dynamic measurement"','"RS 232 Output and Optional 24V Relay Output"','"Tricolour LED for component tolerance status"','"Ideal for Camshaft DIA Measurement"']::text[],
  '{"Display System":"Tri-Color Six digit display (Dual 3-channel display configuration)","Measurement Scope":"6 OD DIA Measurement","Application Target":"Ideal for Camshaft DIA Measurement","Measurement Modes":"Absolute / Comparative Measurement","Calibration":"Auto calibration Facility","Units":"Metric / Inch Measurement","Measurement Dynamics":"Static / Dynamic measurement","Data Output":"RS 232 Output","Automation Interface":"Relay Output 24 V (Optional)","Status Feedback":"Tricolour LED for component tolerance status","Fixture Design":"Precision V-block / mandrel clamping fixture with multi-point gauging blocks"}'::jsonb,
  ARRAY['"Simultaneous measurement of 6 bearing journals / ODs on a finished or ground camshaft"','"Tri-Color Six digit display allows operators to see all 6 diameters at once"','"Tricolour LED indicators deliver instant visual feedback on component tolerance"','"Auto calibration facility ensures rapid zeroing with setting masters"','"RS 232 Output for seamless line-side data transmission and SPC archiving"','"Optional 24 V relay output enables automatic part stamping or conveyor gating"','"Static and dynamic measurement modes allow runout and ovality checks during rotation"']::text[],
  ARRAY['"Automotive camshaft manufacturing and quality audit cells"','"Bearing journal diameter, taper, and runout inspection"','"OEM powertrain production lines"']::text[],
  ARRAY['"engine-block-liner-multigauging-station"','"three-channel-tri-colour-display"','"electronic-calliper-gauge"']::text[],
  NULL,
  '/assets/multigauging/camshaft-fixture-cad.webp',
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000014',
  'products/camshaft-multigauging-station/primary.webp',
  '/assets/multigauging/camshaft-multigauging-station.webp',
  'Camshaft Dia Multigauging Station',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 15: Instruments & Measuring Equipment
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000015',
  'Instruments & Measuring Equipment',
  'instruments-measuring-equipment',
  'Measuring Instruments',
  'instruments',
  'All Type of Instruments: Coating Thickness, Slip Gauges, Magnetic Stands, Calipers & Balances',
  'AKIRA AUTOMATION supplies all types of standard precision measuring instruments, calibration standards, and metrology accessories. Sourced to deliver dependable accuracy across shop-floor and standards room environments.',
  'AKIRA AUTOMATION supplies all types of standard precision measuring instruments, calibration standards, and metrology accessories. Sourced to deliver dependable accuracy across shop-floor and standards room environments.',
  ARRAY['"All type of Instruments, coating thickness, Slip gauge, magnetic stands etc."','"Digital Coating Thickness Gauge (60-140 rdg/min, IP54, 100,000 memory, C1/C2 probes)"','"Portable Leeb Hardness Tester with calibrated test block"','"Precision Digital Analytical & Industrial Weighing Scale"','"Absolute Digimatic Vernier Calipers (IP67)"','"Magnetic Stands with fine adjustment and articulated arms"','"Precision Metric Slip Gauge Sets in fitted wooden cases"','"Precision Pin Gauge Sets in graduated cases"']::text[],
  '{"Instrument Coverage":"All type of Instruments, coating thickness, Slip gauge, magnetic stands etc.","Coating Thickness Gauge":"Accuracy ±2%, up to 9mm (355 mils), 60-140 readings/min, IP54, 100k memory, USB & Bluetooth","Hardness Testing":"Portable Leeb Hardness Tester with calibrated test block (e.g. 791 HLD)","Weighing Systems":"Digital precision weighing scale with tare, print, and leveling bubble","Dimensional Calipers":"Absolute Digimatic IP67 Electronic Calipers","Magnetic Bases":"Switchable magnetic base with articulated red/black adjustment arms","Calibration Standards":"Fitted wooden boxed Metric Slip Gauge and Cylindrical Pin Gauge sets"}'::jsonb,
  ARRAY['"Complete one-stop provision of metrology laboratory and workshop measuring equipment"','"Digital coating thickness gauges with dual probes for ferrous and non-ferrous substrates"','"Leeb portable hardness testers for rapid hardness verification on large castings and forgings"','"High-precision slip gauge blocks providing unbroken traceability to standards"','"Heavy-duty magnetic bases for dial gauges and lever indicators"','"Robust digital calipers engineered for oily and harsh workshop conditions"']::text[],
  ARRAY['"Metrology laboratories and quality control inspection rooms"','"Surface treatment, electroplating, and paint coating inspection"','"Heat treatment hardness verification"','"Shop floor calibration and setup verification"']::text[],
  ARRAY['"special-gauges-fixtures"','"air-plug-gauge"','"tri-colour-digital-display-unit"']::text[],
  NULL,
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000015',
  'products/instruments-measuring-equipment/primary.webp',
  '/assets/company/inspection-workbench.webp',
  'Instruments & Measuring Equipment',
  0,
  true
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000015',
  'products/instruments-measuring-equipment/secondary-1.webp',
  '/assets/instruments/coating-thickness-gauge.webp',
  'Instruments & Measuring Equipment - Accessory View 1',
  1,
  false
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000015',
  'products/instruments-measuring-equipment/secondary-2.webp',
  '/assets/instruments/hardness-tester.webp',
  'Instruments & Measuring Equipment - Accessory View 2',
  2,
  false
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000015',
  'products/instruments-measuring-equipment/secondary-3.webp',
  '/assets/instruments/precision-scale.webp',
  'Instruments & Measuring Equipment - Accessory View 3',
  3,
  false
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000015',
  'products/instruments-measuring-equipment/secondary-4.webp',
  '/assets/instruments/digital-vernier-caliper.webp',
  'Instruments & Measuring Equipment - Accessory View 4',
  4,
  false
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000015',
  'products/instruments-measuring-equipment/secondary-5.webp',
  '/assets/instruments/magnetic-stand-blue.webp',
  'Instruments & Measuring Equipment - Accessory View 5',
  5,
  false
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000015',
  'products/instruments-measuring-equipment/secondary-6.webp',
  '/assets/instruments/magnetic-stand-red.webp',
  'Instruments & Measuring Equipment - Accessory View 6',
  6,
  false
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000015',
  'products/instruments-measuring-equipment/secondary-7.webp',
  '/assets/instruments/slip-gauge-set.webp',
  'Instruments & Measuring Equipment - Accessory View 7',
  7,
  false
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000015',
  'products/instruments-measuring-equipment/secondary-8.webp',
  '/assets/instruments/pin-gauge-set.webp',
  'Instruments & Measuring Equipment - Accessory View 8',
  8,
  false
) ON CONFLICT DO NOTHING;

-- Product 16: All Type of Special Gauges & Fixtures
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000016',
  'All Type of Special Gauges & Fixtures',
  'special-gauges-fixtures',
  'Special Gauges & Fixtures',
  'fixtures',
  'Custom-Engineered Precision Gauging, Workholding & Multi-Feature Inspection Fixtures',
  'AKIRA AUTOMATION specializes in custom-built inspection fixtures, assembly tooling, and workholding solutions tailored to complex workpiece geometries. Designed and manufactured to withstand rigorous shop-floor production conditions while delivering repeatable micron-level accuracy.',
  'AKIRA AUTOMATION specializes in custom-built inspection fixtures, assembly tooling, and workholding solutions tailored to complex workpiece geometries. Designed and manufactured to withstand rigorous shop-floor production conditions while delivering repeatable micron-level accuracy.',
  ARRAY['"All type of special gauges & Fixtures"','"Custom multi-pin dimensional inspection fixtures"','"Work-holding and dedicated casting inspection fixtures"','"Tailored fixtures for unique manufacturing requirements"','"Flexible designs that adapt to different applications"','"Engineered to withstand rigorous manufacturing environments"']::text[],
  '{"Product Category":"All type of special gauges & Fixtures","Design Principle":"Precision-engineered solutions tailored for unique manufacturing requirements","Key Pillars":"Customization, Versatility, and Durability","Fixture Materials":"Hardened tool steel, structural aluminum, carbide wear pads, precision ground datum plates","Inspection Capability":"Multi-point diameter, concentricity, perpendicularity, hole center distances, and step heights","Workpiece Compatibility":"Machined castings, forged automotive components, stamped housings, and precision turned parts"}'::jsonb,
  ARRAY['"Customization: Tailored fixtures designed specifically for customer component drawings"','"Versatility: Flexible designs that adapt to different workpiece variants and applications"','"Durability: Engineered to withstand rigorous manufacturing environments over years of service"','"Integrated locator pins, toggle clamps, and precision dial/probe mountings"','"Assembly and workholding solutions engineered to eliminate operator loading errors"','"Complete design, manufacturing, inspection, and commissioning support"']::text[],
  ARRAY['"Automotive transmission housings, cylinder heads, and brackets"','"Precision machined castings with multiple critical datum relationships"','"Dedicated line-side inspection fixtures for 100% component verification"']::text[],
  ARRAY['"engine-block-liner-multigauging-station"','"camshaft-multigauging-station"','"instruments-measuring-equipment"']::text[],
  NULL,
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000016',
  'products/special-gauges-fixtures/primary.webp',
  '/assets/fixtures/multi-pin-gauging-fixture.webp',
  'All Type of Special Gauges & Fixtures',
  0,
  true
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000016',
  'products/special-gauges-fixtures/secondary-1.webp',
  '/assets/fixtures/workholding-inspection-fixture.webp',
  'All Type of Special Gauges & Fixtures - Accessory View 1',
  1,
  false
) ON CONFLICT DO NOTHING;

COMMIT;
