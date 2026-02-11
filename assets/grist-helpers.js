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
  // =========================================================================
  async ensureSchema() {
    const log = GristHelpers.log;
    log('Vérification du schéma Grist (13 tables)…');

    try {
      const tokenInfo = await grist.docApi.getAccessToken({ readOnly: false });
      const baseUrl = tokenInfo.baseUrl;
      const headers = {
        'Authorization': `Bearer ${tokenInfo.token}`,
        'Content-Type': 'application/json'
      };

      // 1. Lister les tables existantes
      const tablesResp = await fetch(`${baseUrl}/tables`, { headers });
      if (!tablesResp.ok) throw new Error('Impossible de lister les tables : ' + tablesResp.status);
      const tablesData = await tablesResp.json();
      const existingTables = new Set(tablesData.tables.map(t => t.id));

      let created = 0, updated = 0;

      for (const [tableName, tableDef] of Object.entries(GristHelpers.SCHEMA)) {

        if (!existingTables.has(tableName)) {
          // Créer la table avec toutes ses colonnes
          log(`Création de la table ${tableName}…`);
          const createResp = await fetch(`${baseUrl}/tables`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              tables: [{
                id: tableName,
                columns: tableDef.columns
              }]
            })
          });
          if (!createResp.ok) {
            const err = await createResp.text();
            log(`Erreur création table ${tableName} : ${err}`, 'err');
            continue;
          }
          log(`Table ${tableName} créée ✓ (${tableDef.columns.length} colonnes)`, 'ok');
          created++;

        } else {
          // Table existe — vérifier les colonnes manquantes
          const colsResp = await fetch(`${baseUrl}/tables/${tableName}/columns`, { headers });
          if (!colsResp.ok) {
            log(`Impossible de lire les colonnes de ${tableName}`, 'warn');
            continue;
          }
          const colsData = await colsResp.json();
          const existingCols = new Set(colsData.columns.map(c => c.id));

          const missingCols = tableDef.columns.filter(c => !existingCols.has(c.id));

          if (missingCols.length > 0) {
            log(`Ajout de ${missingCols.length} colonne(s) à ${tableName}…`);
            const addResp = await fetch(`${baseUrl}/tables/${tableName}/columns`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ columns: missingCols })
            });
            if (!addResp.ok) {
              const err = await addResp.text();
              log(`Erreur ajout colonnes ${tableName} : ${err}`, 'err');
              continue;
            }
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
  // GRIST REST API — Lecture
  // =========================================================================
  async fetchAllRecords(tableName) {
    const tokenInfo = await grist.docApi.getAccessToken({ readOnly: true });
    const resp = await fetch(
      `${tokenInfo.baseUrl}/tables/${tableName}/records`,
      { headers: { 'Authorization': `Bearer ${tokenInfo.token}` } }
    );
    if (!resp.ok) {
      throw new Error(`API Grist ${tableName} : ${resp.status}`);
    }
    const data = await resp.json();
    return data.records;
  },

  // =========================================================================
  // GRIST REST API — Écriture
  // =========================================================================
  async createRecord(tableName, fields) {
    const tokenInfo = await grist.docApi.getAccessToken({ readOnly: false });
    const resp = await fetch(
      `${tokenInfo.baseUrl}/tables/${tableName}/records`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenInfo.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ records: [{ fields }] })
      }
    );
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Sauvegarde ${tableName} : ${resp.status} — ${errText}`);
    }
    return (await resp.json()).records[0];
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
