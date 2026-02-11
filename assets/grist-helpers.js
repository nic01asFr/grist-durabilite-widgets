// =========================================================================
// GristHelpers — Utilitaires partagés pour les widgets durabilité
// Schéma v1.1 — 13 tables (10 commanditaire + SITE, CHLORIDE_ANALYSIS, CARBONATION_ANALYSIS)
// =========================================================================
const GristHelpers = {

  // =========================================================================
  // SCHEMA — Définition complète des 13 tables
  // =========================================================================
  SCHEMA: {

    // --- Données bibliographiques ---
    SOURCE: {
      columns: [
        { id: 'authors',   fields: { type: 'Text',    label: 'Auteurs' } },
        { id: 'title',     fields: { type: 'Text',    label: 'Titre' } },
        { id: 'journal',   fields: { type: 'Text',    label: 'Revue' } },
        { id: 'year',      fields: { type: 'Int',     label: 'Année' } },
        { id: 'doi',       fields: { type: 'Text',    label: 'DOI' } },
        { id: 'url',       fields: { type: 'Text',    label: 'URL' } },
        { id: 'notes',     fields: { type: 'Text',    label: 'Notes' } },
      ]
    },

    // --- Formulation béton ---
    CONCRETE_MIX: {
      columns: [
        { id: 'source_id',              fields: { type: 'Ref:SOURCE',       label: 'Source' } },
        { id: 'mix_name',               fields: { type: 'Text',             label: 'Nom du mélange' } },
        { id: 'cement_type',            fields: { type: 'Text',             label: 'Type de ciment' } },
        { id: 'total_binder_kg_m3',     fields: { type: 'Numeric',          label: 'Liant total (kg/m³)' } },
        { id: 'w_b_ratio',              fields: { type: 'Numeric',          label: 'E/L' } },
        { id: 'water_content_kg_m3',    fields: { type: 'Numeric',          label: 'Eau (kg/m³)' } },
        { id: 'admixture_type',         fields: { type: 'Text',             label: 'Type adjuvant' } },
        { id: 'admixture_dosage_pct',   fields: { type: 'Numeric',          label: 'Dosage adjuvant (%)' } },
        { id: 'air_content_pct',        fields: { type: 'Numeric',          label: 'Air entraîné (%)' } },
        { id: 'slump_mm',               fields: { type: 'Numeric',          label: 'Affaissement (mm)' } },
        { id: 'curing_condition',       fields: { type: 'Text',             label: 'Condition de cure' } },
        { id: 'curing_time_days',       fields: { type: 'Numeric',          label: 'Durée cure (jours)' } },
      ]
    },

    // --- Granulats (N lignes par béton) ---
    AGGREGATES: {
      columns: [
        { id: 'concrete_id',    fields: { type: 'Ref:CONCRETE_MIX', label: 'Béton' } },
        { id: 'size_min_mm',    fields: { type: 'Numeric',          label: 'Taille min (mm)' } },
        { id: 'size_max_mm',    fields: { type: 'Numeric',          label: 'Taille max (mm)' } },
        { id: 'content_kg_m3',  fields: { type: 'Numeric',          label: 'Dosage (kg/m³)' } },
        { id: 'aggregate_type', fields: { type: 'Text',             label: 'Type granulat' } },
      ]
    },

    // --- Composition du liant (N lignes par béton) ---
    BINDER_COMPOSITION: {
      columns: [
        { id: 'concrete_id',    fields: { type: 'Ref:CONCRETE_MIX', label: 'Béton' } },
        { id: 'component_name', fields: { type: 'Text',             label: 'Composant' } },
        { id: 'content_pct',    fields: { type: 'Numeric',          label: 'Teneur (%)' } },
        { id: 'basis',          fields: { type: 'Text',             label: 'Base de calcul' } },
      ]
    },

    // --- Caractérisation ciment (phases Bogue, etc.) ---
    CEMENT_CHARACTERIZATION: {
      columns: [
        { id: 'concrete_id', fields: { type: 'Ref:CONCRETE_MIX', label: 'Béton' } },
        { id: 'phase_name',  fields: { type: 'Text',             label: 'Phase' } },
        { id: 'value_pct',   fields: { type: 'Numeric',          label: 'Valeur (%)' } },
        { id: 'method',      fields: { type: 'Text',             label: 'Méthode' } },
      ]
    },

    // --- Propriétés matériau (EAV : résistance, porosité, etc.) ---
    MATERIAL_PROPERTIES: {
      columns: [
        { id: 'concrete_id',   fields: { type: 'Ref:CONCRETE_MIX', label: 'Béton' } },
        { id: 'property_name', fields: { type: 'Text',             label: 'Propriété' } },
        { id: 'value',         fields: { type: 'Numeric',          label: 'Valeur' } },
        { id: 'unit',          fields: { type: 'Text',             label: 'Unité' } },
        { id: 'test_age_days', fields: { type: 'Numeric',          label: 'Âge essai (jours)' } },
      ]
    },

    // --- Sites géographiques ---
    SITE: {
      columns: [
        { id: 'site_name',    fields: { type: 'Text',    label: 'Nom du site' } },
        { id: 'latitude',     fields: { type: 'Numeric',  label: 'Latitude' } },
        { id: 'longitude',    fields: { type: 'Numeric',  label: 'Longitude' } },
        { id: 'country',      fields: { type: 'Text',    label: 'Pays' } },
        { id: 'climate_zone', fields: { type: 'Text',    label: 'Zone climatique' } },
      ]
    },

    // --- Protocoles chlorures ---
    CHLORIDE_PROTOCOL: {
      columns: [
        { id: 'concrete_id',        fields: { type: 'Ref:CONCRETE_MIX', label: 'Béton' } },
        { id: 'site_id',            fields: { type: 'Ref:SITE',         label: 'Site' } },
        { id: 'exposure_regime',    fields: { type: 'Text',             label: 'Régime exposition' } },
        { id: 'concentration_value', fields: { type: 'Numeric',         label: 'Concentration' } },
        { id: 'concentration_unit', fields: { type: 'Text',             label: 'Unité concentration' } },
        { id: 'temp_c',             fields: { type: 'Numeric',          label: 'Température (°C)' } },
      ]
    },

    // --- Résultats chlorures (profils) ---
    CHLORIDE_RESULTS: {
      columns: [
        { id: 'chl_protocol_id',           fields: { type: 'Ref:CHLORIDE_PROTOCOL', label: 'Protocole Cl⁻' } },
        { id: 'time_days',                 fields: { type: 'Numeric',               label: 'Temps (jours)' } },
        { id: 'depth_mm',                  fields: { type: 'Numeric',               label: 'Profondeur (mm)' } },
        { id: 'chloride_content_pct_binder', fields: { type: 'Numeric',             label: 'Cl⁻ (% liant)' } },
      ]
    },

    // --- Analyses chlorures (résultats fitting / saisie directe) ---
    CHLORIDE_ANALYSIS: {
      columns: [
        { id: 'chl_protocol_id',  fields: { type: 'Ref:CHLORIDE_PROTOCOL', label: 'Protocole Cl⁻' } },
        { id: 'Dapp',             fields: { type: 'Numeric',               label: 'Dapp (m²/s)' } },
        { id: 'Cs',               fields: { type: 'Numeric',               label: 'Cs (% liant)' } },
        { id: 'R2',               fields: { type: 'Numeric',               label: 'R²' } },
        { id: 'RMSE',             fields: { type: 'Numeric',               label: 'RMSE' } },
        { id: 'seuil_cl',         fields: { type: 'Numeric',               label: 'Seuil Cl⁻' } },
        { id: 'enrobage_mm',      fields: { type: 'Numeric',               label: 'Enrobage (mm)' } },
        { id: 'duree_vie_ans',    fields: { type: 'Numeric',               label: 'Durée de vie (ans)' } },
        { id: 'profondeur_crit_mm', fields: { type: 'Numeric',             label: 'Prof. critique (mm)' } },
        { id: 'source_dapp',      fields: { type: 'Text',                  label: 'Source Dapp' } },
        { id: 'date_calcul',      fields: { type: 'DateTime:Europe/Paris', label: 'Date calcul' } },
        { id: 'statut',           fields: { type: 'Text',                  label: 'Statut' } },
      ]
    },

    // --- Protocoles carbonatation ---
    CARBONATION_PROTOCOL: {
      columns: [
        { id: 'concrete_id',   fields: { type: 'Ref:CONCRETE_MIX', label: 'Béton' } },
        { id: 'site_id',       fields: { type: 'Ref:SITE',         label: 'Site' } },
        { id: 'exposure_type', fields: { type: 'Text',             label: 'Type exposition' } },
        { id: 'co2_pct',       fields: { type: 'Numeric',          label: 'CO₂ (%)' } },
        { id: 'rh_pct',        fields: { type: 'Numeric',          label: 'HR (%)' } },
        { id: 'temp_c',        fields: { type: 'Numeric',          label: 'Température (°C)' } },
      ]
    },

    // --- Résultats carbonatation (profondeurs) ---
    CARBONATION_RESULTS: {
      columns: [
        { id: 'carb_protocol_id', fields: { type: 'Ref:CARBONATION_PROTOCOL', label: 'Protocole carbo.' } },
        { id: 'time_days',        fields: { type: 'Numeric',                  label: 'Temps (jours)' } },
        { id: 'depth_mm',         fields: { type: 'Numeric',                  label: 'Profondeur (mm)' } },
      ]
    },

    // --- Analyses carbonatation (résultats fitting / saisie directe) ---
    CARBONATION_ANALYSIS: {
      columns: [
        { id: 'carb_protocol_id', fields: { type: 'Ref:CARBONATION_PROTOCOL', label: 'Protocole carbo.' } },
        { id: 'K_carb',           fields: { type: 'Numeric',                  label: 'K_carb (mm/√jour)' } },
        { id: 'R2',               fields: { type: 'Numeric',                  label: 'R²' } },
        { id: 'RMSE',             fields: { type: 'Numeric',                  label: 'RMSE' } },
        { id: 'seuil_carb_mm',    fields: { type: 'Numeric',                  label: 'Seuil carbo. (mm)' } },
        { id: 'enrobage_mm',      fields: { type: 'Numeric',                  label: 'Enrobage (mm)' } },
        { id: 'duree_vie_ans',    fields: { type: 'Numeric',                  label: 'Durée de vie (ans)' } },
        { id: 'date_calcul',      fields: { type: 'DateTime:Europe/Paris',    label: 'Date calcul' } },
        { id: 'statut',           fields: { type: 'Text',                     label: 'Statut' } },
      ]
    },
  },

  // =========================================================================
  // ENSURE SCHEMA — Crée tables + colonnes manquantes à l'initialisation
  // Utilise l'API postMessage (pas de CORS, pas de REST API)
  // =========================================================================
  async ensureSchema() {
    const log = GristHelpers.log;
    log('Vérification du schéma Grist (13 tables)…');

    try {
      // Lire les métadonnées Grist via postMessage (pas de CORS)
      const metaTables = await grist.docApi.fetchTable('_grist_Tables');
      const existingTables = new Set(metaTables.tableId);

      // Index rowId → nom de table pour les colonnes
      const tableRowIdToName = {};
      metaTables.id.forEach((rowId, i) => {
        tableRowIdToName[rowId] = metaTables.tableId[i];
      });

      // Lire les colonnes existantes
      const metaCols = await grist.docApi.fetchTable('_grist_Tables_column');
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
  // JOINTURES — Chlorures : CHLORIDE_ANALYSIS ← PROTOCOL ← MIX
  // =========================================================================
  joinChlorideData(analyses, protocols, mixes) {
    const protoMap = new Map(protocols.map(p => [p.id, p.fields]));
    const mixMap = new Map(mixes.map(m => [m.id, m.fields]));
    return analyses
      .filter(a => protoMap.has(a.fields.chl_protocol_id))
      .map(a => {
        const proto = protoMap.get(a.fields.chl_protocol_id);
        const mix = proto ? mixMap.get(proto.concrete_id) : null;
        return {
          ...a.fields,
          _id: a.id,
          protocol: proto || {},
          mix: mix || {}
        };
      });
  },

  // =========================================================================
  // JOINTURES — Carbonatation : CARBONATION_ANALYSIS ← PROTOCOL ← MIX
  // =========================================================================
  joinCarbonatationData(analyses, protocols, mixes) {
    const protoMap = new Map(protocols.map(p => [p.id, p.fields]));
    const mixMap = new Map(mixes.map(m => [m.id, m.fields]));
    return analyses
      .filter(a => protoMap.has(a.fields.carb_protocol_id))
      .map(a => {
        const proto = protoMap.get(a.fields.carb_protocol_id);
        const mix = proto ? mixMap.get(proto.concrete_id) : null;
        return {
          ...a.fields,
          _id: a.id,
          protocol: proto || {},
          mix: mix || {}
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
