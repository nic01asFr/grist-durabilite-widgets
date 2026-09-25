// =========================================================================
// GristHelpers — Shared utilities for durability widgets
// Schema v3 — 18 tables (generic architecture)
// v3:   MATERIAL = cast material (mix design + curing); PLACEMENT = its exposure
//       (site + exposure condition + start date), 0..n per material; LABEL =
//       campaign codes of a material/placement; SOURCE.source_type; migration
//       from v2.5 in _migrateToV3() (run once, tracked in SCHEMA_INFO)
// v2.5: vocabularies enriched from the RILEM metadata tool (binders, tests,
//       admixtures, SCALAR parameters); MEB/DRX renamed SEM/XRD
// Results: SCALAR (scalars 0..n) + CURVE+DATA_CURVE (curves 0..n)
//          directly linked to MEASUREMENT (no RESULT table)
// Aggregates by fraction: MIX_DESIGN_AGGREGATE (junction table)
// =========================================================================
const GristHelpers = {

  // =========================================================================
  // SCHEMA — Complete definition of the tables (creation order matters: a Ref
  // column must point to a table defined above it)
  // =========================================================================
  SCHEMA: {

    // --- Geographic sites ---
    SITE: {
      columns: [
        { id: 'latitude',       fields: { type: 'Numeric', label: 'Latitude' } },
        { id: 'longitude',      fields: { type: 'Numeric',    label: 'Longitude' } },
        { id: 'country_region', fields: { type: 'Text',    label: 'Country / Region' } },
      ]
    },

    // --- Exposure conditions ---
    EXPOSURE: {
      columns: [
        { id: 'exposure_type',        enum: 'exposure_type', fields: { type: 'Choice',  label: 'Exposure type' } },
        { id: 'exposure_nature',      enum: 'exposure_nature', fields: { type: 'Choice',  label: 'Exposure nature' } },
        { id: 'wetting_duration_pct', fields: { type: 'Numeric', label: 'Wetting (%)' } },
        { id: 'drying_duration_pct',  fields: { type: 'Numeric', label: 'Drying (%)' } },
      ]
    },

    // --- Bibliographic references ---
    SOURCE: {
      columns: [
        { id: 'title',       fields: { type: 'Text', label: 'Title' } },
        { id: 'authors',     fields: { type: 'Text', label: 'Authors' } },
        { id: 'doi',         fields: { type: 'Text', label: 'DOI' } },
        { id: 'url',         fields: { type: 'Text', label: 'URL' } },
        { id: 'year',        fields: { type: 'Int',  label: 'Year' } },
        { id: 'journal',     fields: { type: 'Text', label: 'Journal' } },
        { id: 'notes',       fields: { type: 'Text', label: 'Notes' } },
        { id: 'designation', fields: { type: 'Text', label: 'Designation' } },
        { id: 'source_type', enum: 'source_type', fields: { type: 'Choice', label: 'Source type' } },
      ]
    },

    // --- Binders: cements, mineral additions ---
    BINDER: {
      columns: [
        { id: 'name',             fields: { type: 'Text',    label: 'Name' } },
        { id: 'binder_type',      enum: 'binder_type', fields: { type: 'Choice',  label: 'Binder type' } },
        { id: 'density_kg_m3',    fields: { type: 'Numeric', label: 'Density (kg/m³)' } },
        { id: 'specific_surface', fields: { type: 'Numeric', label: 'Blaine fineness (cm²/g)' } },
        { id: 'loss_on_ignition', fields: { type: 'Numeric', label: 'LOI (%)' } },
        // Bogue composition
        { id: 'C3S',              fields: { type: 'Numeric', label: 'C₃S (%)' } },
        { id: 'C2S',              fields: { type: 'Numeric', label: 'C₂S (%)' } },
        { id: 'C3A',              fields: { type: 'Numeric', label: 'C₃A (%)' } },
        { id: 'C4AF',             fields: { type: 'Numeric', label: 'C₄AF (%)' } },
        { id: 'Gp',               fields: { type: 'Numeric', label: 'Gypsum (%)' } },
        // Oxide composition
        { id: 'SiO2',             fields: { type: 'Numeric', label: 'SiO₂ (%)' } },
        { id: 'Al2O3',            fields: { type: 'Numeric', label: 'Al₂O₃ (%)' } },
        { id: 'Fe2O3',            fields: { type: 'Numeric', label: 'Fe₂O₃ (%)' } },
        { id: 'CaO',              fields: { type: 'Numeric', label: 'CaO (%)' } },
        { id: 'MgO',              fields: { type: 'Numeric', label: 'MgO (%)' } },
        { id: 'SO3',              fields: { type: 'Numeric', label: 'SO₃ (%)' } },
        { id: 'K2O',              fields: { type: 'Numeric', label: 'K₂O (%)' } },
        { id: 'Na2O',             fields: { type: 'Numeric', label: 'Na₂O (%)' } },
        { id: 'notes',            fields: { type: 'Text',    label: 'Notes' } },
      ]
    },

    // --- Aggregates: sands, gravels ---
    AGGREGATE: {
      columns: [
        { id: 'name',                 fields: { type: 'Text',    label: 'Name' } },
        { id: 'aggregate_type',       enum: 'aggregate_type', fields: { type: 'Choice',  label: 'Aggregate type' } },
        { id: 'size_min_mm',          fields: { type: 'Numeric', label: 'D min (mm)' } },
        { id: 'size_max_mm',          fields: { type: 'Numeric', label: 'D max (mm)' } },
        { id: 'density_kg_m3',        fields: { type: 'Numeric', label: 'Density (kg/m³)' } },
        { id: 'water_absorption_pct', fields: { type: 'Numeric', label: 'Water absorption (%)' } },
        { id: 'notes',                fields: { type: 'Text',    label: 'Notes' } },
      ]
    },

    // --- Concrete mix design ---
    MIX_DESIGN: {
      columns: [
        { id: 'name',                                fields: { type: 'Text',    label: 'Name' } },
        { id: 'material_type',                       enum: 'material_type', fields: { type: 'Choice', label: 'Material type' } },
        { id: 'water_type',                          enum: 'water_type', fields: { type: 'Choice',  label: 'Water type' } },
        { id: 'water_content_kg',                    fields: { type: 'Numeric', label: 'Water (kg/m³)' } },
        { id: 'global_warming_performance_kg_eq_m3', fields: { type: 'Numeric', label: 'GWP (kg CO₂-eq/m³)' } },
        { id: 'wc_ratio',                            fields: { type: 'Numeric', label: 'w/c' } },
        { id: 'wl_ratio',                            fields: { type: 'Numeric', label: 'w/b' } },
        { id: 'admix_type',                          enum: 'admix_type', fields: { type: 'Choice',  label: 'Admixture type' } },
        { id: 'adjuvant_content',                    fields: { type: 'Numeric', label: 'Admixture (kg/m³)' } },
        { id: 'entrained_air',                       fields: { type: 'Numeric', label: 'Entrained air (%)' } },
      ]
    },

    // --- Binder ↔ mix design links (1 binder = 1 row) ---
    MIX_DESIGN_BINDER: {
      columns: [
        { id: 'id_mix_design', fields: { type: 'Ref:MIX_DESIGN', label: 'Mix design' } },
        { id: 'id_binder',     fields: { type: 'Ref:BINDER',     label: 'Binder' } },
        { id: 'content_kg_m3', fields: { type: 'Numeric',        label: 'Content (kg/m³)' } },
      ]
    },

    // --- Aggregate ↔ mix design links (1 fraction = 1 row) ---
    MIX_DESIGN_AGGREGATE: {
      columns: [
        { id: 'id_mix_design', fields: { type: 'Ref:MIX_DESIGN',  label: 'Mix design' } },
        { id: 'id_aggregate',  fields: { type: 'Ref:AGGREGATE',   label: 'Aggregate' } },
        { id: 'content_kg_m3', fields: { type: 'Numeric',         label: 'Content (kg/m³)' } },
      ]
    },

    // --- Curing conditions ---
    CURING_CONDITION: {
      columns: [
        { id: 'temperature_c',        fields: { type: 'Numeric', label: 'Temperature (°C)' } },
        { id: 'humidity_pct',         fields: { type: 'Numeric', label: 'Humidity (%)' } },
        { id: 'wind_protection',      fields: { type: 'Bool',    label: 'Wind protection' } },
        { id: 'solar_protection',     fields: { type: 'Bool',    label: 'Solar protection' } },
        { id: 'curing_method',        enum: 'curing_method', fields: { type: 'Choice',  label: 'Curing method' } },
        { id: 'curing_duration_days', fields: { type: 'Numeric', label: 'Curing duration (days)' } },
        { id: 'standard_name',        fields: { type: 'Text',    label: 'Standard' } },
      ]
    },

    // --- Test definitions (independent of material) ---
    // id_test: the test type is set at campaign creation
    TEST: {
      columns: [
        { id: 'name',                enum: 'test_name', fields: { type: 'Choice',  label: 'Measured property' } },
        { id: 'standard_name',       fields: { type: 'Text',    label: 'Standard' } },
        { id: 'experiment_duration', fields: { type: 'Numeric', label: 'Test duration (days)' } },
        { id: 'test_type',           enum: 'test_type', fields: { type: 'Choice',  label: 'Test type' } },
      ]
    },

    // --- Cast material: a mix design, cured in a given way (what was made) ---
    // name: descriptive, generated (mix name · curing). Campaign codes live in LABEL.
    // Legacy v2.5 columns (read-only, superseded): id_site, id_exposure,
    // exposure_start_date → PLACEMENT; material_type → MIX_DESIGN.material_type
    MATERIAL: {
      columns: [
        { id: 'id_mix_design',       fields: { type: 'Ref:MIX_DESIGN',       label: 'Mix design' } },
        { id: 'id_curing_condition', fields: { type: 'Ref:CURING_CONDITION', label: 'Curing' } },
        { id: 'manufacturing_date',  fields: { type: 'Date',                 label: 'Manufacturing date' } },
        { id: 'demolding_date',      fields: { type: 'Date',                 label: 'Demolding date' } },
        { id: 'name',                fields: { type: 'Text',                 label: 'Name' } },
        { id: 'id_site',             legacy: true, fields: { type: 'Ref:SITE',     label: 'Site (legacy)' } },
        { id: 'id_exposure',         legacy: true, fields: { type: 'Ref:EXPOSURE', label: 'Exposure (legacy)' } },
        { id: 'exposure_start_date', legacy: true, fields: { type: 'Date',         label: 'Exposure start date (legacy)' } },
        { id: 'material_type',       legacy: true, enum: 'material_type', fields: { type: 'Choice', label: 'Material type (legacy)' } },
      ]
    },

    // --- Exposure of a material: where and how it was exposed, from when (0..n per material) ---
    PLACEMENT: {
      columns: [
        { id: 'id_material',         fields: { type: 'Ref:MATERIAL', label: 'Material' } },
        { id: 'id_site',             fields: { type: 'Ref:SITE',     label: 'Site' } },
        { id: 'id_exposure',         fields: { type: 'Ref:EXPOSURE', label: 'Exposure condition' } },
        { id: 'exposure_start_date', fields: { type: 'Date',         label: 'Exposure start date' } },
        { id: 'exposure_end_date',   fields: { type: 'Date',         label: 'Exposure end date' } },
        { id: 'name',                fields: { type: 'Text',         label: 'Name' } },
        { id: 'notes',               fields: { type: 'Text',         label: 'Notes' } },
      ]
    },

    // --- Campaign codes: the name a material (or a material in a given exposure) has in a campaign ---
    LABEL: {
      columns: [
        { id: 'label',        fields: { type: 'Text',          label: 'Code' } },
        { id: 'id_source',    fields: { type: 'Ref:SOURCE',    label: 'Campaign / source' } },
        { id: 'id_material',  fields: { type: 'Ref:MATERIAL',  label: 'Material' } },
        { id: 'id_placement', fields: { type: 'Ref:PLACEMENT', label: 'Exposure (optional)' } },
        { id: 'notes',        fields: { type: 'Text',          label: 'Notes' } },
      ]
    },

    // --- Measurement campaign (who/what/when) ---
    MEASUREMENT: {
      columns: [
        { id: 'id_material',       fields: { type: 'Ref:MATERIAL', label: 'Material' } },
        { id: 'id_placement',      fields: { type: 'Ref:PLACEMENT', label: 'Exposure (empty: laboratory test)' } },
        { id: 'specimen_id',       fields: { type: 'Text',         label: 'Specimen ID' } },
        { id: 'id_source',         fields: { type: 'Ref:SOURCE',   label: 'Source' } },
        { id: 'id_test',           fields: { type: 'Ref:TEST',     label: 'Test' } },
        { id: 'sample_type',       enum: 'sample_type', fields: { type: 'Choice',       label: 'Sample type' } },
        { id: 'sample_dimensions', enum: 'sample_dimensions', fields: { type: 'Choice',       label: 'Sample dimensions' } },
        { id: 'preparation_date',  fields: { type: 'Date',         label: 'Preparation date' } },
        { id: 'result_date',       fields: { type: 'Date',         label: 'Result date' } },
        { id: 'sample_mass_g',     fields: { type: 'Numeric',      label: 'Mass (g)' } },
        { id: 'operator',          fields: { type: 'Text',         label: 'Operator' } },
      ]
    },

    // --- Scalar results (0..n per MEASUREMENT) ---
    // Examples: name='D' (m²/s), name='Cs' (%), name='mean_depth' (mm), name='depth_1' (mm)
    SCALAR: {
      columns: [
        { id: 'id_measurement', fields: { type: 'Ref:MEASUREMENT', label: 'Measurement' } },
        { id: 'name',           enum: 'scalar_name', fields: { type: 'Choice',          label: 'Parameter name' } },
        { id: 'value',          fields: { type: 'Numeric',         label: 'Value' } },
        { id: 'unit',           fields: { type: 'Text',            label: 'Unit' } },
        { id: 'is_derived',     fields: { type: 'Bool',            label: 'Derived (computed)' } },
        { id: 'notes',          fields: { type: 'Text',            label: 'Notes' } },
      ]
    },

    // --- Curve results (0..n per MEASUREMENT) ---
    CURVE: {
      columns: [
        { id: 'id_measurement', fields: { type: 'Ref:MEASUREMENT', label: 'Measurement' } },
        { id: 'x_name',         fields: { type: 'Text',            label: 'X axis' } },
        { id: 'y_name',         fields: { type: 'Text',            label: 'Y axis' } },
        { id: 'x_unit',         fields: { type: 'Text',            label: 'Unit X' } },
        { id: 'y_unit',         fields: { type: 'Text',            label: 'Unit Y' } },
        { id: 'notes',          fields: { type: 'Text',            label: 'Notes' } },
      ]
    },

    // --- Data points of a curve ---
    DATA_CURVE: {
      columns: [
        { id: 'id_curve', fields: { type: 'Ref:CURVE', label: 'Curve' } },
        { id: 'x',        fields: { type: 'Numeric',   label: 'X' } },
        { id: 'y',        fields: { type: 'Numeric',   label: 'Y' } },
      ]
    },

    // --- Schema version of the document (drives one-shot migrations) ---
    SCHEMA_INFO: {
      columns: [
        { id: 'key',   fields: { type: 'Text', label: 'Key' } },
        { id: 'value', fields: { type: 'Text', label: 'Value' } },
      ]
    },
  },

  // =========================================================================
  // ENUMS — Allowed values for Choice columns
  // =========================================================================
  ENUMS: {
    source_type:        ['publication', 'lab_campaign', 'report', 'thesis', 'other'],
    exposure_type:      ['laboratory', 'in-situ'],
    exposure_nature:    ['atmospheric', 'spray', 'splash', 'tidal', 'submerged'],
    material_type:      ['cement_paste', 'mortar', 'concrete'],
    water_type:         ['tap_water', 'pure_water', 'sea_water'],
    curing_method:      ['water_spraying', 'wet_covering', 'curing_compounds', 'forms_left_in_place', 'wet_curing', 'water_immersion'],
    sample_type:        ['laboratory_sample', 'bridge_pier'],
    sample_dimensions:  ['cylinder_100x200','cylinder_110x220','cylinder_150x300','cylinder_160x320','cube_100','cube_150','cube_200','prism_40x40x160','prism_70x70x280','prism_100x100x400','powder','other'],
    // Additions from RILEM "Experiments" vocabulary: MIP, EDS, NMR, water_permeability,
    // corrosion_*, rcpt, freeze_thaw, sulfate_resistance, ASR
    test_name:          ['calorimetry', 'carbonation', 'cl_profil', 'diffusivity', 'Rc', 'gas_permeability', 'water_permeability', 'sorptivity', 'porosity', 'total_porosity', 'resistivity', 'rcpt', 'corrosion_potential', 'corrosion_rate', 'freeze_thaw', 'sulfate_resistance', 'ASR', 'org_density', 'SEM', 'XRD', 'EDS', 'MIP', 'NMR'],
    test_type:          ['natural', 'accelerated', 'total_cl', 'free_cl'],
    // Additions from RILEM "Materials" vocabulary: CAC, CSA, alkali-activated, calcined clay, RHA, glass powder
    binder_type:        ['portland_cement', 'blended_cement', 'calcium_aluminate_cement', 'csa_cement', 'alkali_activated', 'fly_ash', 'slag', 'silica_fume', 'limestone_filler', 'natural_pozzolan', 'metakaolin', 'calcined_clay', 'zeolite', 'rice_husk_ash', 'glass_powder', 'other'],
    aggregate_type:     ['sand', 'gravel', 'crushed_stone', 'lightweight', 'recycled'],
    // From RILEM "Chemical Admixture" vocabulary
    admix_type:         ['superplasticizer', 'plasticizer', 'accelerator', 'retarder', 'air_entraining', 'hydrophobic', 'other'],
    // scalar_name is derived from SCALAR_PARAMETERS below
  },

  // =========================================================================
  // ENUM_LABELS — Display labels for ENUMS values (stored values are unchanged)
  // Values not listed here are humanized by enumLabel(): "wet_curing" → "Wet curing".
  // =========================================================================
  ENUM_LABELS: {
    lab_campaign:             'Laboratory campaign (unpublished)',
    'in-situ':                'In situ',
    cl_profil:                'Chloride profile',
    diffusivity:              'Chloride diffusivity',
    Rc:                       'Compressive strength (Rc)',
    rcpt:                     'RCPT (rapid chloride permeability)',
    ASR:                      'Alkali–silica reaction (ASR)',
    freeze_thaw:              'Freeze–thaw',
    org_density:              'Density',
    SEM:                      'SEM (scanning electron microscopy)',
    XRD:                      'XRD (X-ray diffraction)',
    EDS:                      'EDS (energy-dispersive spectroscopy)',
    MIP:                      'MIP (mercury intrusion porosimetry)',
    NMR:                      'NMR (nuclear magnetic resonance)',
    total_cl:                 'Total chloride',
    free_cl:                  'Free chloride',
    csa_cement:               'CSA cement',
    calcium_aluminate_cement: 'Calcium aluminate cement (CAC)',
    alkali_activated:         'Alkali-activated binder',
    rice_husk_ash:            'Rice husk ash (RHA)',
    air_entraining:           'Air-entraining agent',
    powder:                   'Powder',
  },

  // "cylinder_110x220" → "Cylinder Ø110 × 220 mm", "prism_40x40x160" → "Prism 40 × 40 × 160 mm"
  enumLabel(value) {
    if (value == null || value === '') return '';
    const v = String(value);
    if (Object.prototype.hasOwnProperty.call(GristHelpers.ENUM_LABELS, v)) return GristHelpers.ENUM_LABELS[v];
    const dims = v.match(/^(cylinder|cube|prism)_(\d+(?:x\d+)*)$/);
    if (dims) {
      const sizes = dims[2].split('x').join(' × ');
      const shape = dims[1][0].toUpperCase() + dims[1].slice(1);
      return `${shape} ${dims[1] === 'cylinder' ? 'Ø' : ''}${sizes} mm`;
    }
    const s = v.replace(/_/g, ' ');
    return s[0].toUpperCase() + s.slice(1);
  },

  // =========================================================================
  // SCALAR_PARAMETERS — Dictionary of SCALAR.name values
  // unit: default unit; rilem: matching RILEM "Data_Categories" label (null if none)
  // Names already written by widgets (D, Dapp, Cs, duree_vie_ans…) must stay unchanged.
  // =========================================================================
  SCALAR_PARAMETERS: {
    // Chlorides
    D:                          { unit: 'm²/s',     rilem: 'Chloride diffusion coefficient' },
    Dapp:                       { unit: 'm²/s',     rilem: 'Chloride diffusion coefficient' },
    Cs:                         { unit: '%',        rilem: null },
    chloride_penetration_depth: { unit: 'mm',       rilem: 'Chloride penetration depth' },
    chloride_threshold:         { unit: '%',        rilem: 'Chloride threshold level' },
    chloride_binding_capacity:  { unit: 'mol/kg',   rilem: 'Chloride binding capacity' },
    free_chloride:              { unit: 'mol/L',    rilem: 'Free chloride ion concentration' },
    rcpt_charge:                { unit: 'C',        rilem: 'Chloride penetration' },
    // Carbonation
    mean_depth:                 { unit: 'mm',       rilem: 'Carbonation depth' },
    carbonation_rate_coeff:     { unit: 'mm/yr^0.5', rilem: 'Carbonation rate coefficient' },
    // Corrosion / service life
    duree_vie_ans:              { unit: 'yr',       rilem: 'Time to corrosion initiation' },
    profondeur_crit:            { unit: 'mm',       rilem: null },
    cover_depth:                { unit: 'mm',       rilem: null },
    corrosion_rate:             { unit: 'µA/cm²',   rilem: 'Corrosion rate' },
    corrosion_potential:        { unit: 'mV',       rilem: 'Corrosion potential' },
    // Transport / porosity
    electrical_resistivity:     { unit: 'Ω·m',      rilem: 'Electrical resistivity' },
    surface_resistivity:        { unit: 'kΩ·cm',    rilem: 'Surface resistivity' },
    sorptivity:                 { unit: 'mm/min^0.5', rilem: 'Sorptivity' },
    water_absorption:           { unit: '%',        rilem: 'Water absorption' },
    gas_permeability:           { unit: 'm²',       rilem: 'Gas permeability' },
    water_permeability:         { unit: 'm/s',      rilem: 'Water permeability' },
    oxygen_diffusion_coeff:     { unit: 'm²/s',     rilem: 'Oxygen diffusion coefficient' },
    porosity:                   { unit: '%',        rilem: 'Porosity' },
    degree_of_saturation:       { unit: '%',        rilem: 'Degree of saturation' },
    // Mechanical
    Rc:                         { unit: 'MPa',      rilem: 'Compressive strength' },
    // Fit quality / metadata
    R2:                         { unit: '',         rilem: null },
    RMSE:                       { unit: '',         rilem: null },
    source_dapp:                { unit: '',         rilem: null },
    source_kcarb:               { unit: '',         rilem: null },
    exposure_duration:          { unit: 'yr',       rilem: null },  // read as years unless unit is days
    // Site climate over the exposure period (derived from Open-Meteo, see fetchClimate)
    mean_temperature:           { unit: '°C',       rilem: null },
    mean_rh:                    { unit: '%',        rilem: null },
    time_of_wetness:            { unit: 'd/yr',     rilem: null },  // days with precipitation ≥ 2.5 mm (fib Bulletin 34)
    annual_precipitation:       { unit: 'mm/yr',    rilem: null },
    mean_sea_temperature:       { unit: '°C',       rilem: null },
    // File references (SEM, XRD, EDS, NMR)
    sem_file:                   { unit: 'file_ref', rilem: 'SEM analysis' },
    xrd_file:                   { unit: 'file_ref', rilem: 'XRD peak intensity' },
    eds_file:                   { unit: 'file_ref', rilem: null },
    nmr_file:                   { unit: 'file_ref', rilem: null },
  },

  // =========================================================================
  // VALUE_RENAMES — Stored values renamed across schema versions
  // Applied to existing records by ensureSchema(); old values are dropped from choices.
  // =========================================================================
  VALUE_RENAMES: {
    TEST:   { name: { MEB: 'SEM', DRX: 'XRD' } },
    SCALAR: { name: { meb_file: 'sem_file', drx_file: 'xrd_file' } },
  },

  // =========================================================================
  // BINDER CLASSIFICATION — main cements vs. SCMs (used for mix labels)
  // =========================================================================
  CEMENT_LABELS: {
    portland_cement:          'Portland',
    blended_cement:           'Portland',
    calcium_aluminate_cement: 'CAC',
    csa_cement:               'CSA',
    alkali_activated:         'AAM',
  },

  SCM_LABELS: {
    fly_ash:          'FA',
    silica_fume:      'SF',
    slag:             'Slag',
    metakaolin:       'MK',
    calcined_clay:    'CC',
    limestone_filler: 'Limestone',
    natural_pozzolan: 'Pozzolan',
    zeolite:          'Zeolite',
    rice_husk_ash:    'RHA',
    glass_powder:     'GP',
    other:            'Other',
  },

  isCement(binderType) {
    return Object.prototype.hasOwnProperty.call(GristHelpers.CEMENT_LABELS, binderType);
  },

  // e.g. "Portland + FA + SF", "CAC only"
  binderSignature(binders) {
    if (!binders || binders.length === 0) return 'Unknown';
    const cem  = binders.find(b => GristHelpers.isCement(b.binder_type));
    const base = cem ? GristHelpers.CEMENT_LABELS[cem.binder_type] : 'Portland';
    const scms = binders.filter(b => !GristHelpers.isCement(b.binder_type));
    if (scms.length === 0) return base + ' only';
    return base + ' + ' + scms.map(b => GristHelpers.SCM_LABELS[b.binder_type] || b.binder_type).join(' + ');
  },

  // =========================================================================
  // BINDER FAMILIES — two-level choice of a mix design (family → mix)
  // Classified by the nature of the additions, not by EN 197 class: the clinker
  // share needed for an EN 197 class is rarely known precisely.
  // =========================================================================
  // SCM binder_type → addition category used for the family
  SCM_CATEGORY: {
    limestone_filler: 'LS', fly_ash: 'FA', slag: 'S', silica_fume: 'SF',
    metakaolin: 'CC', calcined_clay: 'CC',
    natural_pozzolan: 'PZ', zeolite: 'PZ', rice_husk_ash: 'PZ', glass_powder: 'PZ',
    other: 'OT',
  },
  SCM_MIN_SHARE: 0.05,  // additions below 5 % of the binder are minor components

  // Families in display order. Blended cements get one family per CEM class (see binderFamily).
  BINDER_FAMILIES: [
    { key: 'cem1',         label: 'CEM I (Portland only)' },
    { key: 'limestone',    label: 'Portland + limestone' },
    { key: 'fly_ash',      label: 'Portland + fly ash' },
    { key: 'slag',         label: 'Portland + slag' },
    { key: 'silica_fume',  label: 'Portland + silica fume' },
    { key: 'pozzolan',     label: 'Portland + pozzolan / metakaolin / calcined clay' },
    { key: 'lc3',          label: 'LC3 (calcined clay + limestone)' },
    { key: 'ternary',      label: 'Ternary and other blends' },
    { key: 'blended',      label: 'Blended cement' },
    { key: 'non_portland', label: 'Non-Portland (CAC, CSA, alkali-activated)' },
    { key: 'unknown',      label: 'No binder' },
  ],

  // binders: [{ binder_type, name, content_kg_m3 }]
  // Returns { total, scms: [{ category, label, share }], scmShare } — shares are null when contents are missing.
  mixComposition(binders) {
    const total = binders.reduce((t, b) => t + (b.content_kg_m3 || 0), 0);
    const known = total > 0 && binders.every(b => b.content_kg_m3 != null);
    const byLabel = new Map();
    binders.filter(b => !GristHelpers.isCement(b.binder_type)).forEach(b => {
      const label = GristHelpers.SCM_LABELS[b.binder_type] || GristHelpers.enumLabel(b.binder_type) || '?';
      const cur = byLabel.get(label) || { category: GristHelpers.SCM_CATEGORY[b.binder_type] || 'OT', label, content: 0 };
      cur.content += b.content_kg_m3 || 0;
      byLabel.set(label, cur);
    });
    const scms = [...byLabel.values()].map(x => ({ category: x.category, label: x.label, share: known ? x.content / total : null }));
    const scmShare = known ? scms.reduce((t, x) => t + x.share, 0) : null;
    return { total, scms, scmShare };
  },

  // Returns { key, label, order } — key is unique per family (blended cements: 'blended:CEM III').
  binderFamily(binders) {
    const F = GristHelpers.BINDER_FAMILIES;
    const fam = (key, label) => {
      const base = key.split(':')[0];
      return { key, label: label || F.find(f => f.key === base).label, order: F.findIndex(f => f.key === base) };
    };
    if (!binders || binders.length === 0) return fam('unknown');

    const types = binders.map(b => b.binder_type);
    const blended = binders.find(b => b.binder_type === 'blended_cement');
    if (blended) {
      const m = String(blended.name || '').match(/CEM\s*(VI|V|IV|III|II|I)(?![A-Z])/i);
      const cls = m ? `CEM ${m[1].toUpperCase()}` : null;
      return fam(`blended:${cls || '?'}`, `Blended cement — ${cls || 'class not specified'}`);
    }
    const hasPortland = types.includes('portland_cement');
    const otherCement = types.some(t => GristHelpers.isCement(t) && t !== 'portland_cement');
    if (otherCement) return fam(hasPortland ? 'ternary' : 'non_portland');

    const { scms } = GristHelpers.mixComposition(binders);
    // Unknown shares: every addition counts; known shares: minor components are ignored.
    const cats = new Set(scms.filter(x => x.share == null || x.share >= GristHelpers.SCM_MIN_SHARE).map(x => x.category));
    if (cats.size === 0) return fam('cem1');
    const only = (...c) => cats.size === c.length && c.every(x => cats.has(x));
    if (only('LS'))       return fam('limestone');
    if (only('FA'))       return fam('fly_ash');
    if (only('S'))        return fam('slag');
    if (only('SF'))       return fam('silica_fume');
    if (only('CC') || only('PZ') || only('CC', 'PZ')) return fam('pozzolan');
    if (only('CC', 'LS')) return fam('lc3');
    return fam('ternary');
  },

  // Short composition text, e.g. "FA 25 %", "S 50 % + LS 5 %", "CEM III/A 42.5 N"
  mixCompositionLabel(binders) {
    if (!binders || binders.length === 0) return 'No binder';
    const blended = binders.find(b => b.binder_type === 'blended_cement');
    const { scms } = GristHelpers.mixComposition(binders);
    const parts = scms.map(x => (x.share != null ? `${x.label} ${Math.round(x.share * 100)} %` : x.label));
    if (blended) return [blended.name || 'Blended cement', ...parts].join(' + ');
    const nonPortland = binders.filter(b => GristHelpers.isCement(b.binder_type) && b.binder_type !== 'portland_cement');
    const cements = nonPortland.map(b => GristHelpers.CEMENT_LABELS[b.binder_type]);
    return [...cements, ...parts].join(' + ') || 'Portland only';
  },

  // Suggested mix name, e.g. "FA25-0.45", "S50-LS5-0.40", "CEMI-0.50"
  suggestMixName(binders, wb) {
    if (!binders || binders.length === 0) return '';
    const CODES = { Limestone: 'LS', Slag: 'S', Pozzolan: 'PZ', Zeolite: 'Z', Other: 'X' };
    const blended = binders.find(b => b.binder_type === 'blended_cement');
    const { scms } = GristHelpers.mixComposition(binders);
    const parts = scms.map(x => `${CODES[x.label] || x.label.replace(/\s+/g, '')}${x.share != null ? Math.round(x.share * 100) : ''}`);
    const nonPortland = binders
      .filter(b => GristHelpers.isCement(b.binder_type) && !['portland_cement', 'blended_cement'].includes(b.binder_type))
      .map(b => GristHelpers.CEMENT_LABELS[b.binder_type]);
    const head = blended ? String(blended.name || 'Blended').replace(/\s+/g, '')
      : (parts.length || nonPortland.length ? '' : 'CEMI');
    return [head, ...nonPortland, ...parts, wb != null && wb > 0 ? wb.toFixed(2) : null].filter(Boolean).join('-');
  },

  // =========================================================================
  // ENSURE SCHEMA — Creates missing tables + columns on initialization
  // =========================================================================
  async ensureSchema() {
    const log = GristHelpers.log;
    log(`Checking Grist schema (${Object.keys(GristHelpers.SCHEMA).length} tables)…`);

    try {
      const [metaTables, metaCols] = await Promise.all([
        grist.docApi.fetchTable('_grist_Tables'),
        grist.docApi.fetchTable('_grist_Tables_column'),
      ]);
      const existingTables = new Set(metaTables.tableId);

      const tableRowIdToName = {};
      metaTables.id.forEach((rowId, i) => { tableRowIdToName[rowId] = metaTables.tableId[i]; });

      // tableName → colId → { type, widgetOptions }
      const existingColumns = {};
      metaCols.parentId.forEach((parentRowId, i) => {
        const tableName = tableRowIdToName[parentRowId];
        if (tableName) {
          if (!existingColumns[tableName]) existingColumns[tableName] = {};
          existingColumns[tableName][metaCols.colId[i]] = {
            type:          metaCols.type[i],
            widgetOptions: metaCols.widgetOptions[i],
          };
        }
      });

      let created = 0, updated = 0;

      for (const [tableName, tableDef] of Object.entries(GristHelpers.SCHEMA)) {
        if (!existingTables.has(tableName)) {
          log(`Creating table ${tableName}…`);
          const cols = tableDef.columns.map(c => ({ id: c.id, ...c.fields }));
          await grist.docApi.applyUserActions([['AddTable', tableName, cols]]);
          log(`Table ${tableName} created ✓ (${cols.length} columns)`, 'ok');
          created++;
        } else {
          const existingCols = existingColumns[tableName] || {};
          const missingCols = tableDef.columns.filter(c => !existingCols[c.id]);
          if (missingCols.length > 0) {
            log(`Adding ${missingCols.length} column(s) to ${tableName}…`);
            const actions = missingCols.map(c => ['AddColumn', tableName, c.id, c.fields]);
            await grist.docApi.applyUserActions(actions);
            log(`${tableName}: +${missingCols.length} column(s) ✓`, 'ok');
            updated++;
          }
          await GristHelpers._renameValues(tableName, existingCols);
          if (await GristHelpers._syncChoices(tableName, tableDef, existingCols)) updated++;
        }
      }

      log(`Schema verified ✓ (${created} tables created, ${updated} tables updated)`, 'ok');
      await GristHelpers._runMigrations();
    } catch (err) {
      log('Schema verification error: ' + err.message, 'err');
    }
  },

  // Rewrites stored values listed in VALUE_RENAMES (e.g. TEST.name 'MEB' → 'SEM')
  async _renameValues(tableName, existingCols) {
    const renames = GristHelpers.VALUE_RENAMES[tableName];
    if (!renames) return;
    const cols = Object.keys(renames).filter(colId => existingCols[colId]);
    if (cols.length === 0) return;

    const data = await grist.docApi.fetchTable(tableName);
    const actions = [];
    for (const colId of cols) {
      const map = renames[colId];
      const ids = [], vals = [];
      (data[colId] || []).forEach((v, i) => {
        if (Object.prototype.hasOwnProperty.call(map, v)) { ids.push(data.id[i]); vals.push(map[v]); }
      });
      if (ids.length > 0) {
        actions.push(['BulkUpdateRecord', tableName, ids, { [colId]: vals }]);
        GristHelpers.log(`${tableName}.${colId}: ${ids.length} value(s) renamed (${Object.entries(map).map(([a, b]) => a + '→' + b).join(', ')})`, 'ok');
      }
    }
    if (actions.length > 0) await grist.docApi.applyUserActions(actions);
  },

  // Brings Choice columns in line with ENUMS: converts Text → Choice and adds
  // missing choices. Choices added by users are kept; renamed old values are dropped.
  // Returns true if the table was modified.
  async _syncChoices(tableName, tableDef, existingCols) {
    const actions = [];
    let tableData = null;

    for (const c of tableDef.columns) {
      if (!c.enum) continue;
      const existing = existingCols[c.id];
      if (!existing) continue;  // just created with the right options
      if (existing.type !== 'Choice' && existing.type !== 'Text') continue;  // never touch other types

      let opts = {};
      try { opts = JSON.parse(existing.widgetOptions || '{}') || {}; } catch (e) { opts = {}; }
      const current  = existing.type === 'Choice' ? (opts.choices || []) : [];
      const dropped  = new Set(Object.keys((GristHelpers.VALUE_RENAMES[tableName] || {})[c.id] || {}));
      const choices  = [...GristHelpers.ENUMS[c.enum]];
      const extra    = current.filter(v => !choices.includes(v) && !dropped.has(v));

      // Text → Choice: keep values already typed so they do not show as invalid
      if (existing.type === 'Text') {
        if (!tableData) tableData = await grist.docApi.fetchTable(tableName);
        for (const v of (tableData[c.id] || [])) {
          if (typeof v === 'string' && v && !choices.includes(v) && !extra.includes(v) && !dropped.has(v)) extra.push(v);
        }
      }
      const merged = [...choices, ...extra];

      const unchanged = existing.type === 'Choice' &&
        merged.length === current.length && merged.every(v => current.includes(v));
      if (unchanged) continue;

      const fields = { widgetOptions: JSON.stringify({ ...opts, choices: merged }) };
      if (existing.type === 'Text') fields.type = 'Choice';
      actions.push(['ModifyColumn', tableName, c.id, fields]);
      GristHelpers.log(`${tableName}.${c.id}: ${existing.type === 'Text' ? 'converted to Choice, ' : ''}${merged.length} choice(s)`, 'ok');
    }

    if (actions.length === 0) return false;
    await grist.docApi.applyUserActions(actions);
    return true;
  },

  // =========================================================================
  // LOGGING
  // =========================================================================
  log(msg, cls = '') {
    const el = document.getElementById('log');
    if (!el) return;
    const time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    const span = cls ? `<span class="${cls}">${msg}</span>` : msg;
    el.innerHTML += `[${time}] ${span}\n`;
    el.scrollTop = el.scrollHeight;
  },

  // =========================================================================
  // STATUS INDICATOR
  // =========================================================================
  setStatus(text, state = '') {
    const textEl  = document.getElementById('status-text');
    const statusEl = document.getElementById('status');
    if (textEl)   textEl.textContent = text;
    if (statusEl) statusEl.className = 'status ' + state;
  },

  // =========================================================================
  // GRIST API — Read
  // =========================================================================
  async fetchAllRecords(tableName) {
    const tableData = await grist.docApi.fetchTable(tableName);
    const ids = tableData.id;
    const colNames = Object.keys(tableData).filter(
      k => k !== 'id' && k !== 'manualSort' && !k.startsWith('gristHelper_')
    );
    return ids.map((id, idx) => ({
      id,
      fields: Object.fromEntries(colNames.map(col => [col, tableData[col][idx]]))
    }));
  },

  // =========================================================================
  // MIGRATIONS — one-shot data migrations, tracked in SCHEMA_INFO (key 'version')
  // =========================================================================
  SCHEMA_VERSION: 3,

  async _runMigrations() {
    const log = GristHelpers.log;
    const info = await GristHelpers.fetchAllRecords('SCHEMA_INFO');
    const row = info.find(r => r.fields.key === 'version');
    const version = parseInt(row?.fields.value) || 0;
    if (version >= GristHelpers.SCHEMA_VERSION) return;
    try {
      if (version < 3) await GristHelpers._migrateToV3();
      const fields = { key: 'version', value: String(GristHelpers.SCHEMA_VERSION) };
      if (row) await GristHelpers.updateRecord('SCHEMA_INFO', row.id, fields);
      else await GristHelpers.createRecord('SCHEMA_INFO', fields);
      log(`Document migrated to schema v${GristHelpers.SCHEMA_VERSION} ✓`, 'ok');
    } catch (err) {
      // Version not recorded: the migration will be retried next time (each step is idempotent)
      log('Migration error: ' + err.message, 'err');
    }
  },

  // v2.5 → v3: MATERIAL (mix + curing + site + exposure) is split into
  // MATERIAL (mix + curing) and PLACEMENT (site + exposure + start date).
  // - each material with a site, an exposure or an exposure start date gets one placement,
  //   and its measurements are attached to it;
  // - the former material name becomes a campaign code (LABEL), attached to the source
  //   most used by its measurements; the material gets a descriptive generated name;
  // - mix designs get a generated name and the material type of their materials.
  // Legacy MATERIAL columns are left untouched.
  async _migrateToV3() {
    const log = GristHelpers.log;
    const T = GristHelpers.fetchAllRecords;
    const [materials, measurements, mixes, mixBinders, binders, curings, sites, exposures, placements, labels] =
      await Promise.all(['MATERIAL', 'MEASUREMENT', 'MIX_DESIGN', 'MIX_DESIGN_BINDER', 'BINDER',
        'CURING_CONDITION', 'SITE', 'EXPOSURE', 'PLACEMENT', 'LABEL'].map(t => T(t)));
    const byId = recs => new Map(recs.map(r => [r.id, r.fields]));
    const binderById = byId(binders), curingById = byId(curings), siteById = byId(sites), expoById = byId(exposures);

    // 1. Mix designs: generated name, material type inherited from their materials
    const mixName = new Map();
    const mixUpdates = { ids: [], name: [], material_type: [] };
    for (const mix of mixes) {
      const bs = mixBinders.filter(r => r.fields.id_mix_design === mix.id).map(r => ({
        binder_type:   binderById.get(r.fields.id_binder)?.binder_type,
        name:          binderById.get(r.fields.id_binder)?.name,
        content_kg_m3: r.fields.content_kg_m3 || null,
      }));
      const name = mix.fields.name || GristHelpers.suggestMixName(bs, mix.fields.wl_ratio || null) || `Mix #${mix.id}`;
      mixName.set(mix.id, name);
      const types = [...new Set(materials.filter(m => m.fields.id_mix_design === mix.id)
        .map(m => m.fields.material_type).filter(Boolean))];
      const type = mix.fields.material_type || (types.length === 1 ? types[0] : '');
      if (name !== mix.fields.name || type !== (mix.fields.material_type || '')) {
        mixUpdates.ids.push(mix.id); mixUpdates.name.push(name); mixUpdates.material_type.push(type);
      }
    }

    // 2. One placement per exposed material (skipped if the material already has one)
    const toPlace = materials.filter(m =>
      (m.fields.id_site || m.fields.id_exposure || m.fields.exposure_start_date)
      && !placements.some(p => p.fields.id_material === m.id));
    let newPlacementIds = [];
    if (toPlace.length) {
      const res = await grist.docApi.applyUserActions([['BulkAddRecord', 'PLACEMENT', toPlace.map(() => null), {
        id_material:         toPlace.map(m => m.id),
        id_site:             toPlace.map(m => m.fields.id_site || 0),
        id_exposure:         toPlace.map(m => m.fields.id_exposure || 0),
        exposure_start_date: toPlace.map(m => m.fields.exposure_start_date || null),
        name:                toPlace.map(m => GristHelpers.placementName(
          siteById.get(m.fields.id_site), expoById.get(m.fields.id_exposure), m.fields.exposure_start_date)),
      }]]);
      newPlacementIds = res.retValues[0];
    }
    const placementOf = new Map(toPlace.map((m, i) => [m.id, newPlacementIds[i]]));

    // 3. Measurements of those materials → their placement
    const measIds = [], measPlacement = [];
    measurements.forEach(r => {
      const pid = placementOf.get(r.fields.id_material);
      if (pid && !r.fields.id_placement) { measIds.push(r.id); measPlacement.push(pid); }
    });

    // 4. Former names → campaign codes; descriptive material names
    const newLabels = { label: [], id_source: [], id_material: [], id_placement: [] };
    const matUpdates = { ids: [], name: [] };
    for (const m of materials) {
      const oldName = (m.fields.name || '').trim();
      const hasLabel = labels.some(l => l.fields.id_material === m.id && l.fields.label === oldName);
      if (oldName && !hasLabel) {
        const counts = new Map();
        measurements.filter(r => r.fields.id_material === m.id && r.fields.id_source)
          .forEach(r => counts.set(r.fields.id_source, (counts.get(r.fields.id_source) || 0) + 1));
        const source = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] || 0;
        newLabels.label.push(oldName);
        newLabels.id_source.push(source);
        newLabels.id_material.push(m.id);
        newLabels.id_placement.push(placementOf.get(m.id) || 0);
      }
      const desc = GristHelpers.materialName(mixName.get(m.fields.id_mix_design), curingById.get(m.fields.id_curing_condition));
      if (desc !== oldName) { matUpdates.ids.push(m.id); matUpdates.name.push(desc); }
    }

    const actions = [];
    if (mixUpdates.ids.length) actions.push(['BulkUpdateRecord', 'MIX_DESIGN', mixUpdates.ids,
      { name: mixUpdates.name, material_type: mixUpdates.material_type }]);
    if (measIds.length) actions.push(['BulkUpdateRecord', 'MEASUREMENT', measIds, { id_placement: measPlacement }]);
    if (newLabels.label.length) actions.push(['BulkAddRecord', 'LABEL', newLabels.label.map(() => null), newLabels]);
    if (matUpdates.ids.length) actions.push(['BulkUpdateRecord', 'MATERIAL', matUpdates.ids, { name: matUpdates.name }]);
    if (actions.length) await grist.docApi.applyUserActions(actions);

    log(`Migration v3: ${toPlace.length} exposure(s) created, ${measIds.length} measurement(s) attached, ` +
        `${newLabels.label.length} campaign code(s), ${matUpdates.ids.length} material name(s), ` +
        `${mixUpdates.ids.length} mix design(s) updated`, 'ok');
  },

  // =========================================================================
  // NAMES & CONTEXT — generated names, and where/how a measurement was exposed
  // =========================================================================
  // "FA25-0.45 · wet curing 28 d"
  materialName(mixName, curing) {
    const cure = curing
      ? [GristHelpers.enumLabel(curing.curing_method).toLowerCase(),
         curing.curing_duration_days ? `${curing.curing_duration_days} d` : '',
         curing.temperature_c != null && curing.temperature_c !== '' ? `${curing.temperature_c} °C` : '',
        ].filter(Boolean).join(' ')
      : '';
    return [mixName || 'Unnamed mix', cure || 'curing not specified'].join(' · ');
  },

  // "France — Marseille · Tidal · from 2019-03-29"
  placementName(site, exposure, startSec) {
    const where = site?.country_region
      || (site?.latitude != null ? `${site.latitude.toFixed(2)}, ${site.longitude?.toFixed(2)}` : 'Site not specified');
    const how = GristHelpers.enumLabel(exposure?.exposure_nature) || GristHelpers.enumLabel(exposure?.exposure_type);
    const from = startSec ? `from ${new Date(startSec * 1000).toISOString().slice(0, 10)}` : '';
    return [where, how, from].filter(Boolean).join(' · ');
  },

  // Where and how a measurement was exposed: its placement, or — for documents not yet
  // migrated — the legacy site/exposure of its material. maps: { materials, placements,
  // sites, exposures } as Map(id → fields). Returns { material, placement, site, exposure,
  // siteId, exposureId, exposureStart } (null when unknown; placement null for laboratory tests).
  measurementContext(meas, maps) {
    const material  = maps.materials.get(meas.id_material) || null;
    const placement = meas.id_placement ? maps.placements.get(meas.id_placement) || null : null;
    const src = placement || (maps.placements.size ? null : material) || {};
    return {
      material, placement,
      site:          maps.sites.get(src.id_site) || null,
      exposure:      maps.exposures.get(src.id_exposure) || null,
      siteId:        src.id_site || null,
      exposureId:    src.id_exposure || null,
      exposureStart: src.exposure_start_date || null,
    };
  },

  // =========================================================================
  // GRIST API — Write
  // =========================================================================
  async createRecord(tableName, fields) {
    const result = await grist.docApi.applyUserActions([
      ['AddRecord', tableName, null, fields]
    ]);
    return { id: result.retValues[0] };
  },

  async updateRecord(tableName, rowId, fields) {
    await grist.docApi.applyUserActions([
      ['UpdateRecord', tableName, rowId, fields]
    ]);
  },

  async bulkCreateRecords(tableName, recordsArray) {
    const actions = recordsArray.map(fields => ['AddRecord', tableName, null, fields]);
    const result = await grist.docApi.applyUserActions(actions);
    return result.retValues.map(id => ({ id }));
  },

  async bulkRemoveRecords(tableName, rowIds) {
    if (rowIds.length === 0) return;
    await grist.docApi.applyUserActions([['BulkRemoveRecord', tableName, rowIds]]);
  },

  // =========================================================================
  // CLIMATE — site weather over an exposure period (Open-Meteo, no API key)
  // Historical: ERA5 reanalysis (daily, since 1940). Marine: sea surface
  // temperature, only available for recent years (coverage is reported).
  // =========================================================================
  CLIMATE_SCALARS: ['mean_temperature', 'mean_rh', 'time_of_wetness', 'annual_precipitation', 'mean_sea_temperature'],
  CLIMATE_MIN_COVERAGE: 0.8,  // share of days with data required to keep an indicator

  // start / end: 'YYYY-MM-DD'. Returns { grid, days, years, coverage, indicators, daily, monthly }.
  // indicators values are null when coverage is below CLIMATE_MIN_COVERAGE.
  // daily / monthly: aligned series { time, T, Tmin, Tmax, RH, P, wind, sea } (null where missing);
  // monthly P is the monthly total, the others are monthly means of the daily values.
  async fetchClimate({ lat, lon, start, end, marine = false }) {
    const q = (base, params) => fetch(`${base}?${new URLSearchParams(params)}`).then(async r => {
      if (!r.ok) throw new Error(`Open-Meteo HTTP ${r.status}: ${(await r.text()).slice(0, 120)}`);
      return r.json();
    });
    const common = { latitude: lat, longitude: lon, start_date: start, end_date: end, timezone: 'GMT' };
    const [land, sea] = await Promise.all([
      q('https://archive-api.open-meteo.com/v1/archive',
        { ...common, daily: 'temperature_2m_mean,temperature_2m_min,temperature_2m_max,relative_humidity_2m_mean,precipitation_sum,wind_speed_10m_mean' }),
      marine
        ? q('https://marine-api.open-meteo.com/v1/marine', { ...common, daily: 'sea_surface_temperature_mean' })
            .catch(() => null)  // marine data is optional: never block the land indicators
        : Promise.resolve(null),
    ]);

    const d = land.daily;
    const days = d.time.length;
    const years = days / 365.25;
    const valid = arr => (arr || []).filter(v => v != null);
    const mean = arr => { const v = valid(arr); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
    const cov  = arr => days ? valid(arr).length / days : 0;
    const keep = (value, c) => (c >= GristHelpers.CLIMATE_MIN_COVERAGE ? value : null);
    const round = (v, n) => (v == null ? null : Math.round(v * 10 ** n) / 10 ** n);

    const P = d.precipitation_sum;
    const coverage = {
      temperature:   cov(d.temperature_2m_mean),
      rh:            cov(d.relative_humidity_2m_mean),
      precipitation: cov(P),
      sea:           sea ? cov(sea.daily.sea_surface_temperature_mean) : 0,
    };
    // Rates per year are computed over the days that have data.
    const pYears = valid(P).length / 365.25;
    const indicators = {
      mean_temperature:     keep(round(mean(d.temperature_2m_mean), 1), coverage.temperature),
      mean_rh:              keep(round(mean(d.relative_humidity_2m_mean), 1), coverage.rh),
      time_of_wetness:      keep(pYears ? round(valid(P).filter(v => v >= 2.5).length / pYears, 1) : null, coverage.precipitation),
      annual_precipitation: keep(pYears ? round(valid(P).reduce((a, b) => a + b, 0) / pYears, 0) : null, coverage.precipitation),
      mean_sea_temperature: sea ? keep(round(mean(sea.daily.sea_surface_temperature_mean), 1), coverage.sea) : null,
    };

    // Sea data aligned on the land dates
    const seaByDate = new Map();
    if (sea) sea.daily.time.forEach((t, i) => seaByDate.set(t, sea.daily.sea_surface_temperature_mean[i]));
    const daily = {
      time: d.time,
      T:    d.temperature_2m_mean,
      Tmin: d.temperature_2m_min,
      Tmax: d.temperature_2m_max,
      RH:   d.relative_humidity_2m_mean,
      P,
      wind: d.wind_speed_10m_mean,
      sea:  d.time.map(t => seaByDate.get(t) ?? null),
    };

    // Monthly aggregation (means; precipitation = total over the days with data)
    const keys = ['T', 'Tmin', 'Tmax', 'RH', 'P', 'wind', 'sea'];
    const groups = new Map();
    d.time.forEach((t, i) => {
      const k = t.slice(0, 7);
      if (!groups.has(k)) groups.set(k, Object.fromEntries(keys.map(x => [x, []])));
      keys.forEach(x => groups.get(k)[x].push(daily[x][i]));
    });
    const monthly = { time: [...groups.keys()].map(k => `${k}-15`) };
    keys.forEach(x => {
      monthly[x] = [...groups.values()].map(g => (x === 'P'
        ? (valid(g.P).length ? valid(g.P).reduce((a, b) => a + b, 0) : null)
        : mean(g[x])));
    });

    return {
      grid: { lat: land.latitude, lon: land.longitude, elevation: land.elevation },
      days, years, coverage, indicators, daily, monthly,
    };
  },

  // =========================================================================
  // JOINS — scalar ← measurement ← material + test + source
  // Returns each scalar enriched with its measurement, material, test
  // and bibliographic source.
  // =========================================================================
  // Campaign code shown for a measurement: the code of its exposure, else a code of its material;
  // among several, the one of the measurement's source. labels: LABEL fields (array).
  measurementCode(meas, labels) {
    const ofMat = (labels || []).filter(l => l.id_material === meas.id_material && l.label);
    const pick = list => list.find(l => l.id_source && l.id_source === meas.id_source) || list[0];
    const hit = (meas.id_placement && pick(ofMat.filter(l => l.id_placement === meas.id_placement)))
      || pick(ofMat.filter(l => !l.id_placement)) || pick(ofMat);
    return hit ? hit.label : '';
  },

  // Maps used by measurementContext(), built once per join
  contextMaps(materials, placements = [], sites = [], exposures = []) {
    const toMap = recs => new Map((recs || []).map(r => [r.id, r.fields]));
    return { materials: toMap(materials), placements: toMap(placements), sites: toMap(sites), exposures: toMap(exposures) };
  },

  // Each scalar with its measurement, material, placement (null: lab test), site, exposure, test, source, mix.
  // placements/sites are optional: without them the legacy MATERIAL site/exposure is used.
  // Adds code (campaign code, see measurementCode) and displayName (code, else material name).
  joinScalarData(scalars, measurements, materials, tests, sources, mixes, exposures, sites = [], placements = [], labels = []) {
    const labelFields = labels.map(l => l.fields);
    const measureMap  = new Map(measurements.map(m => [m.id, m.fields]));
    const testMap     = new Map(tests.map(t => [t.id, t.fields]));
    const sourceMap   = new Map(sources.map(s => [s.id, s.fields]));
    const mixMap      = new Map((mixes || []).map(m => [m.id, m.fields]));
    const maps        = GristHelpers.contextMaps(materials, placements, sites, exposures);

    return scalars
      .filter(s => measureMap.has(s.fields.id_measurement))
      .map(s => {
        const measure  = measureMap.get(s.fields.id_measurement) || {};
        const ctx      = GristHelpers.measurementContext(measure, maps);
        const material = ctx.material || {};
        const test     = testMap.get(measure.id_test)            || {};
        const source   = sourceMap.get(measure.id_source)        || {};
        const mix      = mixMap.get(material.id_mix_design)      || {};
        return {
          ...s.fields,
          _id:         s.id,
          measurement: measure,
          material,
          placement:   ctx.placement,
          code:        GristHelpers.measurementCode(measure, labelFields),
          displayName: GristHelpers.measurementCode(measure, labelFields) || material.name || '',
          test,
          source,
          mix,
          exposure:    ctx.exposure || {},
          site:        ctx.site     || {},
        };
      });
  },

  // =========================================================================
  // JOINS — data_curve ← curve ← measurement ← material
  // =========================================================================
  joinCurvePoints(dataPoints, curves, measurements, materials) {
    const curveMap    = new Map(curves.map(c => [c.id, c.fields]));
    const measureMap  = new Map(measurements.map(m => [m.id, m.fields]));
    const materialMap = new Map(materials.map(m => [m.id, m.fields]));

    return dataPoints
      .filter(p => curveMap.has(p.fields.id_curve))
      .map(p => {
        const curve    = curveMap.get(p.fields.id_curve)           || {};
        const measure  = measureMap.get(curve.id_measurement)      || {};
        const material = materialMap.get(measure.id_material)      || {};
        return {
          ...p.fields,
          _id:      p.id,
          curve,
          measurement: measure,
          material,
        };
      });
  },

  // =========================================================================
  // JOINS — complete chloride profiles
  // DATA_CURVE ← CURVE ← MEASUREMENT ← MATERIAL
  //   ← MIX_DESIGN ← MIX_DESIGN_BINDER ← BINDER
  //   ← EXPOSURE, SITE, SOURCE, SCALAR
  // Returns an array of enriched profiles, sorted by increasing depth.
  // =========================================================================
  joinChlorideProfiles(dataPoints, curves, measurements, materials,
                       mixDesigns, mixBinders, binders,
                       exposures, sites, sources, scalars,
                       curingConditions = [], placements = [], labels = []) {
    const labelFields = labels.map(l => l.fields);
    const measureMap  = new Map(measurements.map(m     => [m.id, m.fields]));
    const mixMap      = new Map(mixDesigns.map(m       => [m.id, m.fields]));
    const maps        = GristHelpers.contextMaps(materials, placements, sites, exposures);
    const sourceMap   = new Map(sources.map(s          => [s.id, s.fields]));
    const binderMap   = new Map(binders.map(b          => [b.id, b.fields]));
    const curingMap   = new Map(curingConditions.map(c => [c.id, c.fields]));

    // Index scalars by measurement_id → { name: value }
    const scalByMeas = new Map();
    scalars.forEach(s => {
      const mid = s.fields.id_measurement;
      if (!scalByMeas.has(mid)) scalByMeas.set(mid, {});
      scalByMeas.get(mid)[s.fields.name] = s.fields.value;
    });

    // Index binders by mix_design_id → [{...binder, content_kg_m3}]
    const bindersByMix = new Map();
    mixBinders.forEach(mb => {
      const mid = mb.fields.id_mix_design;
      if (!bindersByMix.has(mid)) bindersByMix.set(mid, []);
      const b = binderMap.get(mb.fields.id_binder) || {};
      bindersByMix.get(mid).push({ ...b, content_kg_m3: mb.fields.content_kg_m3 });
    });

    // Group points by curve_id
    const ptsByCurve = new Map();
    dataPoints.forEach(p => {
      const cid = p.fields.id_curve;
      if (!ptsByCurve.has(cid)) ptsByCurve.set(cid, []);
      ptsByCurve.get(cid).push({ x: p.fields.x, y: p.fields.y });
    });

    return curves
      .map(c => {
        const cf     = c.fields;
        const meas   = measureMap.get(cf.id_measurement)       || {};
        const ctx    = GristHelpers.measurementContext(meas, maps);
        const mat    = ctx.material                             || {};
        const mix    = mixMap.get(mat.id_mix_design)            || {};
        const expo   = ctx.exposure                             || {};
        const site   = ctx.site                                 || {};
        const src    = sourceMap.get(meas.id_source)            || {};
        const sc     = scalByMeas.get(cf.id_measurement)        || {};
        const bList  = bindersByMix.get(mat.id_mix_design)      || [];
        const curing = curingMap.get(mat.id_curing_condition)   || {};
        const pts    = (ptsByCurve.get(c.id) || []).sort((a, b) => a.x - b.x);
        if (pts.length === 0) return null;
        return {
          curve_id: c.id,
          x_name: cf.x_name, y_name: cf.y_name,
          x_unit: cf.x_unit, y_unit: cf.y_unit,
          points: pts,
          measurement: meas,
          material:    mat,
          placement:   ctx.placement,
          exposureStart: ctx.exposureStart,
          code:        GristHelpers.measurementCode(meas, labelFields),
          displayName: GristHelpers.measurementCode(meas, labelFields) || mat.name || '',
          mix,
          exposure:    expo,
          site,
          source:      src,
          binders:     bList,
          scalars:     sc,
          curing,
        };
      })
      .filter(Boolean);
  },

  // =========================================================================
  // PLOTLY — Light theme
  // =========================================================================
  plotlyDarkLayout(overrides = {}) {
    return Object.assign({
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor:  '#f8fafc',
      font:   { color: '#475569', family: '-apple-system, sans-serif', size: 12 },
      margin: { t: 30, r: 20, b: 50, l: 60 },
      legend: {
        bgcolor:     'rgba(255,255,255,0.9)',
        bordercolor: '#e2e8f0',
        borderwidth: 1,
        font: { size: 11 }
      },
      hovermode: 'closest'
    }, overrides);
  },

  plotlyDarkAxis(title) {
    return {
      title,
      gridcolor:     '#e2e8f0',
      zerolinecolor: '#cbd5e1',
      titlefont:     { size: 13 }
    };
  },

  // =========================================================================
  // FORMATTING
  // =========================================================================
  formatDapp(dapp) {
    return dapp != null ? dapp.toExponential(2) : '—';
  },

  formatKcarb(kcarb) {
    if (kcarb == null) return '—';
    const kAn = kcarb * Math.sqrt(365.25);
    return kAn.toFixed(2) + ' mm/√yr';
  },

  formatDureeVie(ans) {
    if (ans == null || ans < 0) return '∞';
    return ans.toFixed(1) + ' yr';
  }
};

// Derived enums + Choice options: SCHEMA columns reference ENUMS by key (`enum`)
// so the two can never drift apart.
GristHelpers.ENUMS.scalar_name = Object.keys(GristHelpers.SCALAR_PARAMETERS);
for (const tableDef of Object.values(GristHelpers.SCHEMA)) {
  for (const c of tableDef.columns) {
    if (c.enum) c.fields.widgetOptions = JSON.stringify({ choices: GristHelpers.ENUMS[c.enum] });
  }
}
