# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Custom Grist widgets for concrete durability analysis in marine environments, developed at CEREMA Méditerranée. Each widget is a standalone HTML file deployed via GitHub Pages and embedded as an iframe in Grist documents (grist.numerique.gouv.fr).

**Language:** French (UI, comments, variable names, documentation).

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
- `grist-helpers.js` — `GristHelpers` namespace: `SCHEMA` (13 table definitions), `ensureSchema()` (auto-creates missing tables/columns), `log()`, `setStatus()`, `fetchAllRecords(table)`, `createRecord(table, fields)`, `joinChlorideData()`, `joinCarbonatationData()`, `plotlyDarkLayout()`, `plotlyDarkAxis()`, `formatDapp()`, `formatKcarb()`, `formatDureeVie()`

### Grist integration pattern (all widgets follow this):
1. Load `grist-plugin-api.js` from CDN + `assets/grist-helpers.js`
2. Call `grist.ready({ requiredAccess: 'full' })` to register
3. Call `await GristHelpers.ensureSchema()` — auto-creates missing tables and columns
4. For linked widgets: listen via `grist.onRecord(callback)`
5. For global widgets: read all data via `GristHelpers.fetchAllRecords(tableName)`
6. Write results via `GristHelpers.createRecord(tableName, fields)`

### External dependencies (all loaded from CDNs, no local copies):
- **Grist Plugin API** — `docs.getgrist.com/grist-plugin-api.js` (all widgets)
- **Pyodide v0.26.4** — Python WASM runtime for scipy/numpy (fick-analysis, carbonation-analysis)
- **Plotly.js v2.35.0** — Interactive charts (fick-analysis, carbonation-analysis, dashboard)
- **Leaflet v1.9.4** — Map tiles and markers (site-map only)

### Grist table schema (13 tables, v1.1):

**Data tables (from commanditaire):**
- **SOURCE**: `authors`, `title`, `journal`, `year`, `doi`, `url`, `notes`
- **CONCRETE_MIX**: `source_id` (Ref→SOURCE), `mix_name`, `cement_type`, `total_binder_kg_m3`, `w_b_ratio`, `water_content_kg_m3`, `admixture_type`, `admixture_dosage_pct`, `air_content_pct`, `slump_mm`, `curing_condition`, `curing_time_days`
- **AGGREGATES**: `concrete_id` (Ref→CONCRETE_MIX), `size_min_mm`, `size_max_mm`, `content_kg_m3`, `aggregate_type`
- **BINDER_COMPOSITION**: `concrete_id` (Ref→CONCRETE_MIX), `component_name`, `content_pct`, `basis`
- **CEMENT_CHARACTERIZATION**: `concrete_id` (Ref→CONCRETE_MIX), `phase_name`, `value_pct`, `method`
- **MATERIAL_PROPERTIES**: `concrete_id` (Ref→CONCRETE_MIX), `property_name`, `value`, `unit`, `test_age_days`
- **CHLORIDE_PROTOCOL**: `concrete_id` (Ref→CONCRETE_MIX), `site_id` (Ref→SITE), `exposure_regime`, `concentration_value`, `concentration_unit`, `temp_c`
- **CHLORIDE_RESULTS**: `chl_protocol_id` (Ref→CHLORIDE_PROTOCOL), `time_days`, `depth_mm`, `chloride_content_pct_binder`
- **CARBONATION_PROTOCOL**: `concrete_id` (Ref→CONCRETE_MIX), `site_id` (Ref→SITE), `exposure_type`, `co2_pct`, `rh_pct`, `temp_c`
- **CARBONATION_RESULTS**: `carb_protocol_id` (Ref→CARBONATION_PROTOCOL), `time_days`, `depth_mm`

**Added tables (for widgets):**
- **SITE**: `site_name`, `latitude`, `longitude`, `country`, `climate_zone`
- **CHLORIDE_ANALYSIS**: `chl_protocol_id` (Ref→CHLORIDE_PROTOCOL), `Dapp`, `Cs`, `R2`, `RMSE`, `seuil_cl`, `enrobage_mm`, `duree_vie_ans`, `profondeur_crit_mm`, `source_dapp`, `date_calcul`, `statut`
- **CARBONATION_ANALYSIS**: `carb_protocol_id` (Ref→CARBONATION_PROTOCOL), `K_carb`, `R2`, `RMSE`, `seuil_carb_mm`, `enrobage_mm`, `duree_vie_ans`, `date_calcul`, `statut`

## Widgets

| Widget | File | Grist link | Tables | Libs |
|--------|------|------------|--------|------|
| Analyse Fick | `fick-analysis.html` | Select By CHLORIDE_PROTOCOL | R: CHLORIDE_RESULTS, CONCRETE_MIX / W: CHLORIDE_ANALYSIS | Pyodide, Plotly |
| Analyse Carbonatation | `carbonation-analysis.html` | Select By CARBONATION_PROTOCOL | R: CARBONATION_RESULTS, CONCRETE_MIX / W: CARBONATION_ANALYSIS | Pyodide, Plotly |
| Dashboard | `dashboard.html` | None (reads all) | R: CHLORIDE_ANALYSIS, CHLORIDE_PROTOCOL, CONCRETE_MIX | Plotly |
| Carte | `site-map.html` | None (reads all) | R: SITE, CHLORIDE_PROTOCOL, CHLORIDE_ANALYSIS, CONCRETE_MIX | Leaflet |

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
