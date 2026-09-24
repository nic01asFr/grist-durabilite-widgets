// =========================================================================
// GristHelpers — Shared utilities for durability widgets
// Schema v2.5 — 15 tables, 13 enums (generic architecture)
// v2.5: vocabularies enriched from the RILEM metadata tool (binders, tests,
//       admixtures, SCALAR parameters); MEB/DRX renamed SEM/XRD
// Results: SCALAR (scalars 0..n) + CURVE+DATA_CURVE (curves 0..n)
//          directly linked to MEASUREMENT (no RESULT table)
// Aggregates by fraction: MIX_DESIGN_AGGREGATE (junction table)
// =========================================================================
const GristHelpers = {

  // =========================================================================
  // SCHEMA — Complete definition of 15 tables
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

    // --- Cementitious material under study ---
    MATERIAL: {
      columns: [
        { id: 'id_site',             fields: { type: 'Ref:SITE',             label: 'Site' } },
        { id: 'id_exposure',         fields: { type: 'Ref:EXPOSURE',         label: 'Exposure' } },
        { id: 'id_mix_design',       fields: { type: 'Ref:MIX_DESIGN',       label: 'Mix design' } },
        { id: 'id_curing_condition', fields: { type: 'Ref:CURING_CONDITION', label: 'Curing' } },
        { id: 'manufacturing_date',  fields: { type: 'Date',                 label: 'Manufacturing date' } },
        { id: 'demolding_date',      fields: { type: 'Date',                 label: 'Demolding date' } },
        { id: 'name',                fields: { type: 'Text',                 label: 'Name' } },
        { id: 'material_type',       enum: 'material_type', fields: { type: 'Choice',               label: 'Material type' } },
      ]
    },

    // --- Measurement campaign (who/what/when) ---
    MEASUREMENT: {
      columns: [
        { id: 'id_material',       fields: { type: 'Ref:MATERIAL', label: 'Material' } },
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
  },

  // =========================================================================
  // ENUMS — Allowed values for Choice columns
  // =========================================================================
  ENUMS: {
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
  // ENSURE SCHEMA — Creates missing tables + columns on initialization
  // =========================================================================
  async ensureSchema() {
    const log = GristHelpers.log;
    log('Checking Grist schema (15 tables)…');

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

  // =========================================================================
  // JOINS — scalar ← measurement ← material + test + source
  // Returns each scalar enriched with its measurement, material, test
  // and bibliographic source.
  // =========================================================================
  joinScalarData(scalars, measurements, materials, tests, sources, mixes, exposures) {
    const measureMap  = new Map(measurements.map(m => [m.id, m.fields]));
    const materialMap = new Map(materials.map(m => [m.id, m.fields]));
    const testMap     = new Map(tests.map(t => [t.id, t.fields]));
    const sourceMap   = new Map(sources.map(s => [s.id, s.fields]));
    const mixMap      = new Map((mixes || []).map(m => [m.id, m.fields]));
    const exposureMap = new Map((exposures || []).map(e => [e.id, e.fields]));

    return scalars
      .filter(s => measureMap.has(s.fields.id_measurement))
      .map(s => {
        const measure  = measureMap.get(s.fields.id_measurement) || {};
        const material = materialMap.get(measure.id_material)    || {};
        const test     = testMap.get(measure.id_test)            || {};
        const source   = sourceMap.get(measure.id_source)        || {};
        const mix      = mixMap.get(material.id_mix_design)      || {};
        const exposure = exposureMap.get(material.id_exposure)   || {};
        return {
          ...s.fields,
          _id:         s.id,
          measurement: measure,
          material,
          test,
          source,
          mix,
          exposure,
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
                       curingConditions = []) {
    const measureMap  = new Map(measurements.map(m     => [m.id, m.fields]));
    const materialMap = new Map(materials.map(m        => [m.id, m.fields]));
    const mixMap      = new Map(mixDesigns.map(m       => [m.id, m.fields]));
    const exposureMap = new Map(exposures.map(e        => [e.id, e.fields]));
    const siteMap     = new Map(sites.map(s            => [s.id, s.fields]));
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
        const mat    = materialMap.get(meas.id_material)        || {};
        const mix    = mixMap.get(mat.id_mix_design)            || {};
        const expo   = exposureMap.get(mat.id_exposure)         || {};
        const site   = siteMap.get(mat.id_site)                 || {};
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
