// =========================================================================
// GristHelpers — Utilitaires partagés pour les widgets durabilité
// Schéma v2.0 — 11 tables (architecture générique)
// =========================================================================
const GristHelpers = {

  // =========================================================================
  // SCHEMA — Définition complète des 11 tables
  // =========================================================================
  SCHEMA: {

    // --- Sites géographiques ---
    SITE: {
      columns: [
        { id: 'latitude',       fields: { type: 'Numeric', label: 'Latitude' } },
        { id: 'longitude',      fields: { type: 'Numeric', label: 'Longitude' } },
        { id: 'country_region', fields: { type: 'Text',    label: 'Pays / Région' } },
      ]
    },

    // --- Conditions d'exposition ---
    EXPOSURE: {
      columns: [
        { id: 'exposure_type',        fields: { type: 'Choice',  label: "Type d'exposition",  widgetOptions: '{"choices":["laboratory","in-situ"]}' } },
        { id: 'exposure_nature',      fields: { type: 'Choice',  label: "Nature d'exposition", widgetOptions: '{"choices":["atmospheric","spray","splash","tidal","submerged"]}' } },
        { id: 'wetting_duration_pct', fields: { type: 'Numeric', label: 'Mouillage (%)' } },
        { id: 'drying_duration_pct',  fields: { type: 'Numeric', label: 'Séchage (%)' } },
      ]
    },

    // --- Références bibliographiques ---
    SOURCE: {
      columns: [
        { id: 'title',       fields: { type: 'Text', label: 'Titre' } },
        { id: 'authors',     fields: { type: 'Text', label: 'Auteurs' } },
        { id: 'doi',         fields: { type: 'Text', label: 'DOI' } },
        { id: 'url',         fields: { type: 'Text', label: 'URL' } },
        { id: 'year',        fields: { type: 'Int',  label: 'Année' } },
        { id: 'journal',     fields: { type: 'Text', label: 'Revue' } },
        { id: 'notes',       fields: { type: 'Text', label: 'Notes' } },
        { id: 'designation', fields: { type: 'Text', label: 'Désignation' } },
      ]
    },

    // --- Liants : ciments, additions minérales ---
    BINDER: {
      columns: [
        { id: 'name',             fields: { type: 'Text',    label: 'Nom' } },
        { id: 'binder_type',      fields: { type: 'Choice',  label: 'Type liant', widgetOptions: '{"choices":["portland_cement","blended_cement","fly_ash","slag","silica_fume","limestone_filler","natural_pozzolan","other"]}' } },
        { id: 'density_kg_m3',    fields: { type: 'Numeric', label: 'Masse volumique (kg/m³)' } },
        { id: 'specific_surface', fields: { type: 'Numeric', label: 'Finesse Blaine (cm²/g)' } },
        { id: 'loss_on_ignition', fields: { type: 'Numeric', label: 'PAF (%)' } },
        // Composition Bogue
        { id: 'C3S',              fields: { type: 'Numeric', label: 'C₃S (%)' } },
        { id: 'C2S',              fields: { type: 'Numeric', label: 'C₂S (%)' } },
        { id: 'C3A',              fields: { type: 'Numeric', label: 'C₃A (%)' } },
        { id: 'C4AF',             fields: { type: 'Numeric', label: 'C₄AF (%)' } },
        // Composition oxyde
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

    // --- Granulats : sables, graviers ---
    AGGREGATE: {
      columns: [
        { id: 'name',                 fields: { type: 'Text',    label: 'Nom' } },
        { id: 'aggregate_type',       fields: { type: 'Choice',  label: 'Type granulat', widgetOptions: '{"choices":["sand","gravel","crushed_stone","lightweight","recycled"]}' } },
        { id: 'size_min_mm',          fields: { type: 'Numeric', label: 'D min (mm)' } },
        { id: 'size_max_mm',          fields: { type: 'Numeric', label: 'D max (mm)' } },
        { id: 'density_kg_m3',        fields: { type: 'Numeric', label: 'Masse volumique (kg/m³)' } },
        { id: 'water_absorption_pct', fields: { type: 'Numeric', label: 'Absorption eau (%)' } },
        { id: 'notes',                fields: { type: 'Text',    label: 'Notes' } },
      ]
    },

    // --- Formulation du béton ---
    MIX_DESIGN: {
      columns: [
        { id: 'id_binder_cement',                    fields: { type: 'Ref:BINDER',    label: 'Ciment' } },
        { id: 'cement_content_kg',                   fields: { type: 'Numeric',       label: 'Ciment (kg/m³)' } },
        { id: 'id_binder_scm',                       fields: { type: 'Ref:BINDER',    label: 'Addition minérale' } },
        { id: 'scm_content_kg',                      fields: { type: 'Numeric',       label: 'Addition (kg/m³)' } },
        { id: 'water_type',                          fields: { type: 'Choice',        label: "Type d'eau", widgetOptions: '{"choices":["tap_water","pure_water","sea_water"]}' } },
        { id: 'water_content_kg',                    fields: { type: 'Numeric',       label: 'Eau (kg/m³)' } },
        { id: 'id_aggregate',                        fields: { type: 'Ref:AGGREGATE', label: 'Granulat' } },
        { id: 'aggregate_content_kg',                fields: { type: 'Numeric',       label: 'Granulats (kg/m³)' } },
        { id: 'global_warming_performance_kg_eq_m3', fields: { type: 'Numeric',       label: 'GWP (kg éq. CO₂/m³)' } },
        { id: 'wc_ratio',                            fields: { type: 'Numeric',       label: 'E/C' } },
        { id: 'admix_type',                          fields: { type: 'Text',          label: 'Type adjuvant' } },
        { id: 'adjuvant_content',                    fields: { type: 'Numeric',       label: 'Adjuvant (kg/m³)' } },
        { id: 'entrained_air',                       fields: { type: 'Numeric',       label: 'Air entraîné (%)' } },
      ]
    },

    // --- Conditions de cure ---
    CURING_CONDITION: {
      columns: [
        { id: 'temperature_c',    fields: { type: 'Numeric', label: 'Température (°C)' } },
        { id: 'humidity_pct',     fields: { type: 'Numeric', label: 'Humidité (%)' } },
        { id: 'wind_protection',  fields: { type: 'Bool',    label: 'Protection vent' } },
        { id: 'solar_protection', fields: { type: 'Bool',    label: 'Protection solaire' } },
        { id: 'curing_method',    fields: { type: 'Choice',  label: 'Méthode de cure', widgetOptions: '{"choices":["water_spraying","wet_covering","curing_compounds","forms_left_in_place","wet_curing","water_immersion"]}' } },
        { id: 'standard_name',    fields: { type: 'Text',    label: 'Norme' } },
      ]
    },

    // --- Définition des tests (indépendant du matériau) ---
    TEST: {
      columns: [
        { id: 'name',                fields: { type: 'Choice',  label: 'Propriété mesurée', widgetOptions: '{"choices":["calorimetry","carbonation","cl_profil","diffusivity","Rc","gas_permeability","sorptivity","porosity","total_porosity","resistivity","org_density"]}' } },
        { id: 'standard_name',       fields: { type: 'Text',    label: 'Norme' } },
        { id: 'experiment_duration', fields: { type: 'Numeric', label: "Durée d'essai (jours)" } },
        { id: 'test_type',           fields: { type: 'Choice',  label: "Type d'essai", widgetOptions: '{"choices":["natural","accelerated","total_cl","free_cl"]}' } },
      ]
    },

    // --- Matériau cimentaire étudié ---
    MATERIAL: {
      columns: [
        { id: 'id_site',             fields: { type: 'Ref:SITE',             label: 'Site' } },
        { id: 'id_exposure',         fields: { type: 'Ref:EXPOSURE',         label: 'Exposition' } },
        { id: 'id_mix_design',       fields: { type: 'Ref:MIX_DESIGN',       label: 'Formulation' } },
        { id: 'id_curing_condition', fields: { type: 'Ref:CURING_CONDITION', label: 'Cure' } },
        { id: 'manufacturing_date',  fields: { type: 'Date',                 label: 'Date fabrication' } },
        { id: 'demolding_date',      fields: { type: 'Date',                 label: 'Date décoffrage' } },
        { id: 'name',                fields: { type: 'Text',                 label: 'Nom' } },
        { id: 'material_type',       fields: { type: 'Choice',               label: 'Type matériau', widgetOptions: '{"choices":["cement_paste","mortar","concrete"]}' } },
      ]
    },

    // --- Campagne de mesure sur un matériau ---
    MEASUREMENT: {
      columns: [
        { id: 'id_material',       fields: { type: 'Ref:MATERIAL', label: 'Matériau' } },
        { id: 'sample_type',       fields: { type: 'Choice',       label: "Type d'échantillon", widgetOptions: '{"choices":["laboratory_sample","bridge_pier"]}' } },
        { id: 'id_source',         fields: { type: 'Ref:SOURCE',   label: 'Source' } },
        { id: 'preparation_date',  fields: { type: 'Date',         label: 'Date préparation' } },
        { id: 'sample_mass_g',     fields: { type: 'Numeric',      label: 'Masse (g)' } },
        { id: 'sample_dimensions', fields: { type: 'Text',         label: 'Dimensions' } },
      ]
    },

    // --- Résultat d'un test (scalaire ou courbe) ---
    RESULT: {
      columns: [
        { id: 'id_measurement', fields: { type: 'Ref:MEASUREMENT', label: 'Mesure' } },
        { id: 'id_test',        fields: { type: 'Ref:TEST',        label: 'Test' } },
        { id: 'result_date',    fields: { type: 'Date',            label: 'Date résultat' } },
        { id: 'result_type',    fields: { type: 'Choice',          label: 'Type résultat', widgetOptions: '{"choices":["scalar","curve"]}' } },
        { id: 'name',           fields: { type: 'Text',            label: 'Valeur / Nom' } },
        { id: 'unit',           fields: { type: 'Text',            label: 'Unité' } },
        { id: 'operator',       fields: { type: 'Text',            label: 'Opérateur' } },
      ]
    },

    // --- Métadonnées d'une courbe ---
    CURVE: {
      columns: [
        { id: 'id_result', fields: { type: 'Ref:RESULT', label: 'Résultat' } },
        { id: 'x_name',    fields: { type: 'Text',       label: 'Axe X' } },
        { id: 'y_name',    fields: { type: 'Text',       label: 'Axe Y' } },
        { id: 'x_unit',    fields: { type: 'Text',       label: 'Unité X' } },
        { id: 'y_unit',    fields: { type: 'Text',       label: 'Unité Y' } },
      ]
    },

    // --- Points de données d'une courbe ---
    DATA_CURVE: {
      columns: [
        { id: 'id_curve', fields: { type: 'Ref:CURVE', label: 'Courbe' } },
        { id: 'x',        fields: { type: 'Numeric',   label: 'X' } },
        { id: 'y',        fields: { type: 'Numeric',   label: 'Y' } },
      ]
    },
  },

  // =========================================================================
  // ENUMS — Valeurs autorisées pour les colonnes Choice (miroir des ENUMs SQL)
  // =========================================================================
  ENUMS: {
    exposure_type:   ['laboratory', 'in-situ'],
    exposure_nature: ['atmospheric', 'spray', 'splash', 'tidal', 'submerged'],
    material_type:   ['cement_paste', 'mortar', 'concrete'],
    water_type:      ['tap_water', 'pure_water', 'sea_water'],
    curing_method:   ['water_spraying', 'wet_covering', 'curing_compounds', 'forms_left_in_place', 'wet_curing', 'water_immersion'],
    sample_type:     ['laboratory_sample', 'bridge_pier'],
    test_name:       ['calorimetry', 'carbonation', 'cl_profil', 'diffusivity', 'Rc', 'gas_permeability', 'sorptivity', 'porosity', 'total_porosity', 'resistivity', 'org_density'],
    test_type:       ['natural', 'accelerated', 'total_cl', 'free_cl'],
    result_type:     ['scalar', 'curve'],
    binder_type:     ['portland_cement', 'blended_cement', 'fly_ash', 'slag', 'silica_fume', 'limestone_filler', 'natural_pozzolan', 'other'],
    aggregate_type:  ['sand', 'gravel', 'crushed_stone', 'lightweight', 'recycled'],
  },

  // =========================================================================
  // ENSURE SCHEMA — Crée tables + colonnes manquantes à l'initialisation
  // Utilise l'API postMessage (pas de CORS, pas de REST API)
  // =========================================================================
  async ensureSchema() {
    const log = GristHelpers.log;
    log('Vérification du schéma Grist (11 tables)…');

    try {
      // Lire les métadonnées en parallèle
      const [metaTables, metaCols] = await Promise.all([
        grist.docApi.fetchTable('_grist_Tables'),
        grist.docApi.fetchTable('_grist_Tables_column'),
      ]);
      const existingTables = new Set(metaTables.tableId);

      // Index rowId → nom de table pour les colonnes
      const tableRowIdToName = {};
      metaTables.id.forEach((rowId, i) => {
        tableRowIdToName[rowId] = metaTables.tableId[i];
      });
      const existingColumns = {};
      metaCols.parentId.forEach((parentRowId, i) => {
        const tableName = tableRowIdToName[parentRowId];
        if (tableName) {
          if (!existingColumns[tableName]) existingColumns[tableName] = new Set();
          existingColumns[tableName].add(metaCols.colId[i]);
        }
      });

      let created = 0, updated = 0;

      for (const [tableName, tableDef] of Object.entries(GristHelpers.SCHEMA)) {

        if (!existingTables.has(tableName)) {
          // Créer la table avec toutes ses colonnes via applyUserActions
          log(`Création de la table ${tableName}…`);
          const cols = tableDef.columns.map(c => ({ id: c.id, ...c.fields }));
          await grist.docApi.applyUserActions([['AddTable', tableName, cols]]);
          log(`Table ${tableName} créée ✓ (${cols.length} colonnes)`, 'ok');
          created++;

        } else {
          // Table existe — vérifier les colonnes manquantes
          const existingColSet = existingColumns[tableName] || new Set();
          const missingCols = tableDef.columns.filter(c => !existingColSet.has(c.id));

          if (missingCols.length > 0) {
            log(`Ajout de ${missingCols.length} colonne(s) à ${tableName}…`);
            const actions = missingCols.map(c => ['AddColumn', tableName, c.id, c.fields]);
            await grist.docApi.applyUserActions(actions);
            log(`${tableName} : +${missingCols.length} colonne(s) ✓`, 'ok');
            updated++;
          }
        }
      }

      log(`Schéma vérifié ✓ (${created} tables créées, ${updated} tables mises à jour)`, 'ok');
    } catch (err) {
      log('Erreur vérification schéma : ' + err.message, 'err');
    }
  },

  // =========================================================================
  // LOGGING
  // =========================================================================
  log(msg, cls = '') {
    const el = document.getElementById('log');
    if (!el) return;
    const time = new Date().toLocaleTimeString('fr-FR', {
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
    const textEl = document.getElementById('status-text');
    const statusEl = document.getElementById('status');
    if (textEl) textEl.textContent = text;
    if (statusEl) statusEl.className = 'status ' + state;
  },

  // =========================================================================
  // GRIST API — Lecture (postMessage, pas de CORS)
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
  // GRIST API — Écriture (postMessage, pas de CORS)
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
  // JOINTURES — result ← measurement ← material + test
  // Retourne chaque résultat enrichi de sa mesure, son matériau et son test.
  // =========================================================================
  joinResultData(results, measurements, materials, tests) {
    const measureMap  = new Map(measurements.map(m => [m.id, m.fields]));
    const materialMap = new Map(materials.map(m => [m.id, m.fields]));
    const testMap     = new Map(tests.map(t => [t.id, t.fields]));
    return results
      .filter(r => measureMap.has(r.fields.id_measurement))
      .map(r => {
        const measure  = measureMap.get(r.fields.id_measurement);
        const material = measure ? materialMap.get(measure.id_material) : null;
        const test     = testMap.get(r.fields.id_test);
        return {
          ...r.fields,
          _id:         r.id,
          measurement: measure  || {},
          material:    material || {},
          test:        test     || {},
        };
      });
  },

  // =========================================================================
  // JOINTURES — data_curve ← curve ← result
  // Retourne chaque point enrichi des métadonnées de sa courbe et son résultat.
  // =========================================================================
  joinCurvePoints(dataPoints, curves, results) {
    const curveMap  = new Map(curves.map(c => [c.id, c.fields]));
    const resultMap = new Map(results.map(r => [r.id, r.fields]));
    return dataPoints
      .filter(p => curveMap.has(p.fields.id_curve))
      .map(p => {
        const curve  = curveMap.get(p.fields.id_curve);
        const result = curve ? resultMap.get(curve.id_result) : null;
        return {
          ...p.fields,
          _id:    p.id,
          curve:  curve  || {},
          result: result || {},
        };
      });
  },

  // =========================================================================
  // PLOTLY — Thème sombre
  // =========================================================================
  plotlyDarkLayout(overrides = {}) {
    return Object.assign({
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: '#0f172a',
      font: { color: '#94a3b8', family: '-apple-system, sans-serif', size: 12 },
      margin: { t: 30, r: 20, b: 50, l: 60 },
      legend: {
        bgcolor: 'rgba(30,41,59,0.9)',
        bordercolor: '#334155',
        borderwidth: 1,
        font: { size: 11 }
      },
      hovermode: 'closest'
    }, overrides);
  },

  plotlyDarkAxis(title) {
    return {
      title: title,
      gridcolor: '#1e293b',
      zerolinecolor: '#334155',
      titlefont: { size: 13 }
    };
  },

  // =========================================================================
  // FORMATAGE
  // =========================================================================
  formatDapp(dapp) {
    return dapp != null ? dapp.toExponential(2) : '—';
  },

  formatKcarb(kcarb) {
    if (kcarb == null) return '—';
    // Conversion mm/√jour → mm/√an pour affichage
    const kAn = kcarb * Math.sqrt(365.25);
    return kAn.toFixed(2) + ' mm/√an';
  },

  formatDureeVie(ans) {
    if (ans == null || ans < 0) return '∞';
    return ans.toFixed(1) + ' ans';
  }
};
