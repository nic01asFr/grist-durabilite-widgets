# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Custom Grist widgets for concrete durability analysis in marine environments, developed at CEREMA Méditerranée. Each widget is a standalone HTML file deployed via GitHub Pages and embedded as an iframe in Grist documents (grist.numerique.gouv.fr).

**Language:** English (UI, comments, variable names, documentation).

## Development

No build step, no package manager, no bundler. Widgets are plain HTML files with inline JS and shared assets.

```bash
# Serve locally
python3 -m http.server 8080
# or
npx serve .

# Then use http://localhost:8080/<widget>.html as the widget URL in Grist
```

Deployment: push to `main` → GitHub Pages publishes automatically. The `.nojekyll` file disables Jekyll processing.

## Architecture

Each widget is a self-contained `.html` file that runs entirely client-side in the browser. No backend server.

### Shared code (`assets/`)
- `shared-styles.css` — CSS custom properties (`:root` variables), base reset, shared components (`.card`, `.header`, `.status`, `.info-grid`, `.btn`, `.log`, `.tabs`, `.filter-bar`, `.mode-selector`)
- `grist-helpers.js` — `GristHelpers` namespace:
  - Schema: `SCHEMA` (18 table definitions, creation order matters for Ref columns), `ENUMS` (allowed values of Choice columns), `ENUM_LABELS` + `enumLabel(value)` (display labels for enum values; stored values unchanged), `SCALAR_PARAMETERS` (dictionary of `SCALAR.name` values with default unit + RILEM label), `VALUE_RENAMES` (stored values renamed across versions), `ensureSchema()`, one-shot data migrations `_runMigrations()` (version stored in SCHEMA_INFO, `SCHEMA_VERSION`)
  - Context: `measurementContext(meas, maps)` + `contextMaps()` — site/exposure of a measurement through its PLACEMENT (falls back on legacy MATERIAL columns in non-migrated documents); `measurementCode(meas, labels)` — campaign code to display; `materialName()`, `placementName()` — generated names
  - Binders: `CEMENT_LABELS`, `SCM_LABELS`, `isCement(type)`, `binderSignature(binders)` (e.g. "Portland + FA + SF")
  - Binder families (two-level mix choice): `BINDER_FAMILIES`, `binderFamily(binders)` (classified by the nature of additions ≥ 5 % of the binder, not by EN 197 class; blended cements by the CEM class read in their name), `mixComposition()`, `mixCompositionLabel()` (e.g. "FA 25 %"), `suggestMixName(binders, wb)`
  - Data access: `fetchAllRecords(table)`, `createRecord(table, fields)`, `updateRecord()`, `bulkCreateRecords()`, `bulkRemoveRecords()`, `joinScalarData()`, `joinCurvePoints()`, `joinChlorideProfiles()` (both joins take optional `placements` and `labels`, and return `placement`, `site`, `code`, `displayName`)
  - UI: `log()`, `setStatus()`, `plotlyDarkLayout()`, `plotlyDarkAxis()`, `formatDapp()`, `formatKcarb()`, `formatDureeVie()`

### Grist integration pattern (all widgets follow this):
1. Load `grist-plugin-api.js` from CDN + `assets/grist-helpers.js`
2. Call `grist.ready({ requiredAccess: 'full' })` to register
3. Call `await GristHelpers.ensureSchema()` — auto-creates missing tables and columns, applies `VALUE_RENAMES` to existing records, runs pending data migrations, and syncs Choice columns with `ENUMS` (Text → Choice conversion, missing choices added, user-added choices kept)
4. For linked widgets: listen via `grist.onRecord(callback)`
5. For global widgets: read all data via `GristHelpers.fetchAllRecords(tableName)`
6. Write results via `GristHelpers.createRecord(tableName, fields)`

### External dependencies (all loaded from CDNs, no local copies):
- **Grist Plugin API** — `docs.getgrist.com/grist-plugin-api.js` (all widgets)
- **Pyodide v0.26.4** — Python WASM runtime for scipy/numpy (fick-analysis, carbonation-analysis)
- **Plotly.js v2.35.0** — Interactive charts (fick-analysis, carbonation-analysis, profil-chlorure, dashboard)
- **Leaflet v1.9.4** — Map tiles and markers (site-map only)
- **SheetJS v0.18.5** — Reads .xlsx/.xls/.ods files for curve/profile import (data-entry only, loaded on demand from cdnjs)
- **Crossref REST API** — DOI → bibliographic metadata (data-entry only, `api.crossref.org`, no key)
- **Open-Meteo** — historical weather (ERA5, `archive-api.open-meteo.com`) and marine (`marine-api.open-meteo.com`, sea temperature only for recent years), no key, free for non-commercial use; wrapped by `GristHelpers.fetchClimate()`

### Grist table schema (18 tables, v3)

Generic architecture: a MATERIAL (a mix design cured in a given way — what was made) has 0..n PLACEMENTs (where and how it was exposed, from when); it is tested in MEASUREMENTs, attached to a placement or to none (laboratory test); each measurement stores 0..n SCALAR results and 0..n CURVEs (points in DATA_CURVE). Campaign codes (the names a material has in a lab campaign or a paper) are LABEL rows, never the material name. Always read site/exposure through `measurementContext()`, never from MATERIAL. `[enum]` = Choice column whose values come from `GristHelpers.ENUMS`.

**Context:**
- **SOURCE**: `title`, `authors`, `doi`, `url`, `year`, `journal`, `notes`, `designation`, `source_type` [source_type] (publication, lab_campaign…)
- **SITE**: `latitude`, `longitude`, `country_region`
- **EXPOSURE**: `exposure_type` [exposure_type], `exposure_nature` [exposure_nature], `wetting_duration_pct`, `drying_duration_pct`

**Constituents and mix design:**
- **BINDER**: `name`, `binder_type` [binder_type], `density_kg_m3`, `specific_surface`, `loss_on_ignition`, Bogue phases `C3S`, `C2S`, `C3A`, `C4AF`, `Gp`, oxides `SiO2`, `Al2O3`, `Fe2O3`, `CaO`, `MgO`, `SO3`, `K2O`, `Na2O`, `notes`
- **AGGREGATE**: `name`, `aggregate_type` [aggregate_type], `size_min_mm`, `size_max_mm`, `density_kg_m3`, `water_absorption_pct`, `notes`
- **MIX_DESIGN**: `name` (optional, suggested from the composition e.g. `FA25-0.45`), `material_type` [material_type], `water_type` [water_type], `water_content_kg`, `global_warming_performance_kg_eq_m3`, `wc_ratio`, `wl_ratio`, `admix_type` [admix_type], `adjuvant_content`, `entrained_air`
- **MIX_DESIGN_BINDER**: `id_mix_design` (Ref→MIX_DESIGN), `id_binder` (Ref→BINDER), `content_kg_m3`
- **MIX_DESIGN_AGGREGATE**: `id_mix_design` (Ref→MIX_DESIGN), `id_aggregate` (Ref→AGGREGATE), `content_kg_m3`
- **CURING_CONDITION**: `temperature_c`, `humidity_pct`, `wind_protection`, `solar_protection`, `curing_method` [curing_method], `curing_duration_days`, `standard_name`

**Material, tests and results:**
- **MATERIAL**: `id_mix_design` (Ref→MIX_DESIGN), `id_curing_condition` (Ref→CURING_CONDITION), `manufacturing_date`, `demolding_date`, `name` (generated: mix name · curing). Legacy v2.5 columns kept read-only: `id_site`, `id_exposure`, `exposure_start_date`, `material_type`
- **PLACEMENT**: `id_material` (Ref→MATERIAL), `id_site` (Ref→SITE), `id_exposure` (Ref→EXPOSURE), `exposure_start_date` (climate period start), `exposure_end_date`, `name` (generated: site · condition · from date), `notes`
- **LABEL**: `label` (campaign code), `id_source` (Ref→SOURCE: campaign where the code is used), `id_material` (Ref→MATERIAL), `id_placement` (Ref→PLACEMENT, when the code designates the material in one exposure), `notes`
- **TEST**: `name` [test_name], `standard_name`, `experiment_duration`, `test_type` [test_type]
- **MEASUREMENT**: `id_material` (Ref→MATERIAL), `id_placement` (Ref→PLACEMENT, empty = laboratory test), `specimen_id`, `id_source` (Ref→SOURCE), `id_test` (Ref→TEST), `sample_type` [sample_type], `sample_dimensions` [sample_dimensions], `preparation_date`, `result_date`, `sample_mass_g`, `operator`
- **SCALAR**: `id_measurement` (Ref→MEASUREMENT), `name` [scalar_name], `value`, `unit`, `is_derived`, `notes`
- **CURVE**: `id_measurement` (Ref→MEASUREMENT), `x_name`, `y_name`, `x_unit`, `y_unit`, `notes`
- **DATA_CURVE**: `id_curve` (Ref→CURVE), `x`, `y`
- **SCHEMA_INFO**: `key`, `value` — `version` drives one-shot migrations (v2.5 → v3: one PLACEMENT per exposed material, former material names → LABEL, generated names)

### Vocabularies

- Choice values are snake_case ids defined once in `GristHelpers.ENUMS`; `SCHEMA` columns reference them via `enum: '<key>'` (never inline `widgetOptions`). `ENUMS.scalar_name` is derived from `SCALAR_PARAMETERS`.
- Widgets never hard-code `<option>` lists for enums: fill selects from `ENUMS` and display `enumLabel(v)` (humanized by default; add an entry to `ENUM_LABELS` for acronyms or ambiguous ids).
- Binder types, test names, admixture types and SCALAR parameters were enriched from the RILEM metadata tool vocabularies (huggingface.co/spaces/raviapatel/rilem-metadata-tool): keep the matching RILEM label in `SCALAR_PARAMETERS[*].rilem` when adding a parameter.
- SCALAR names written or read by widgets (`D`, `Dapp`, `Cs`, `R2`, `RMSE`, `duree_vie_ans`, `profondeur_crit`, `source_dapp`, `carbonation_rate_coeff`, `cover_depth`, `source_kcarb`, `mean_depth`, `exposure_duration`, `<test>_file`, climate: `mean_temperature`, `mean_rh`, `time_of_wetness`, `annual_precipitation`, `mean_sea_temperature`) must not be renamed without adding an entry to `VALUE_RENAMES` and updating the widgets.
- To rename a stored value: change it in `ENUMS`/`SCALAR_PARAMETERS`, add `old → new` to `VALUE_RENAMES`, and update widget code; `ensureSchema()` migrates existing documents.

## Widgets

| Widget | File | Grist link | Tables | Libs |
|--------|------|------------|--------|------|
| Data Entry | `data-entry.html` | None | R/W: all context, constituent and result tables — 5-step wizard (Source → Material → Exposure → Measurement → Results); mix design and curing are building blocks of step 2, site and exposure condition of step 3; a selected material/exposure is shown read-only; binders/aggregates are created in dialogs; step 5 fetches the site climate over the exposure period and saves it as derived SCALARs (`CLIMATE_SCALARS`) | SheetJS (on demand) |
| Editor | `editor.html` | Select By MATERIAL | R: MATERIAL and related tables, PLACEMENT, LABEL, MEASUREMENT, SCALAR, CURVE / W: via `applyUserActions` — exposures and campaign codes of the material are editable; records shared with other materials/exposures (mix design, curing, site, exposure condition) carry a warning | — |
| Fick Analysis | `fick-analysis.html` | Select By MEASUREMENT | R: MEASUREMENT, CURVE, DATA_CURVE, SCALAR, MATERIAL, MIX_DESIGN(_BINDER), BINDER… / W: SCALAR, TEST | Pyodide, Plotly |
| Carbonation Analysis | `carbonation-analysis.html` | Select By MEASUREMENT | R: MEASUREMENT, TEST, SCALAR, CURVE, DATA_CURVE, MATERIAL, MIX_DESIGN, EXPOSURE / W: SCALAR — depth vs time series = one point per carbonation measurement of the selected material in the same exposure (same PLACEMENT, TEST name + test_type): depth from `mean_depth` (else mean of section curves), time from `exposure_duration` (else result − preparation date, else `t=<n> days` in curve notes) | Pyodide, Plotly |
| Chloride Profiles | `profil-chlorure.html` | None (reads all) | R: MEASUREMENT, CURVE, DATA_CURVE, SCALAR, MATERIAL, MIX_DESIGN(_BINDER), BINDER, SITE, SOURCE, TEST… | Plotly |
| Dashboard | `dashboard.html` | None (reads all) | R: SCALAR (`D`, `duree_vie_ans`), MEASUREMENT, MATERIAL, MIX_DESIGN, EXPOSURE, SOURCE | Plotly |
| Site Map | `site-map.html` | None (reads all) | R: SITE, PLACEMENT, MATERIAL, MEASUREMENT, SCALAR — materials are on a site through their exposures | Leaflet |
| Export | `export.html` | None (reads all) | R: all tables → CSV | — |

## Adding a New Widget

1. Create a new `.html` file at the repository root
2. Include shared deps: `<link rel="stylesheet" href="assets/shared-styles.css">`, `grist-plugin-api.js`, `assets/grist-helpers.js`
3. Follow the Grist integration pattern above
4. Add the widget entry to `index.html` (the catalog page)

## Conventions

- Dark theme with CSS custom properties defined in `assets/shared-styles.css`
- Card-based layout using shared component classes
- Status indicator: `.status` div with `.dot` + text, classes `ready`/`error`
- Logging via `GristHelpers.log(msg, cls)` rendered in a `.log` container
- Scientific computation runs in Pyodide, passing data via `pyodide.globals.set()` and `pyodide.runPython()` returning JSON
- All REST API calls go through `GristHelpers.fetchAllRecords()` / `GristHelpers.createRecord()`
