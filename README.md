# Grist Widgets — Durabilité des bétons

Custom widgets Grist pour l'analyse de durabilité des bétons en milieu marin.
Hébergés sur **GitHub Pages**, utilisables directement dans [Grist](https://grist.numerique.gouv.fr).

## Widgets disponibles

| Widget | Fichier | Description |
|--------|---------|-------------|
| **Saisie** | `data-entry.html` | Formulaires de saisie : sources, sites, liants, granulats, formulations, matériaux, essais, résultats |
| **Éditeur** | `editor.html` | Édition d'un matériau et de ses mesures (lié à MATERIAL) |
| **Analyse Fick** | `fick-analysis.html` | Fitting profils Cl⁻ (scipy) ou saisie directe Dapp, calcul durée de vie |
| **Analyse Carbonatation** | `carbonation-analysis.html` | Fitting K_carb (x = K·√t) ou saisie directe, calcul durée de vie |
| **Profils chlorures** | `profil-chlorure.html` | Comparaison des profils Cl⁻ de toutes les mesures |
| **Dashboard Comparatif** | `dashboard.html` | Box plots Dapp, scatter E/L vs Dapp, comparaison durées de vie |
| **Carte des Sites** | `site-map.html` | Carte Leaflet des sites d'exposition avec indicateurs Dapp |
| **Export** | `export.html` | Export CSV à plat des profils et formulations |

## Utilisation dans Grist

1. Dans votre document Grist, ajoutez un widget **Custom** (personnalisé)
2. Dans l'URL du widget, collez :
   ```
   https://<votre-org>.github.io/grist-durabilite-widgets/<nom-widget>.html
   ```
3. Réglez l'accès sur **"Full document access"** (nécessaire pour l'API REST)

### Configuration par widget

| Widget | Select By | Accès tables |
|--------|-----------|--------------|
| **Saisie** | Aucun | R/W : toutes les tables |
| **Éditeur** | Lier à **MATERIAL** | R/W : MATERIAL et tables liées, MEASUREMENT, SCALAR, CURVE |
| **Analyse Fick** | Lier à **MEASUREMENT** | R : CURVE, DATA_CURVE, SCALAR, MATERIAL, MIX_DESIGN… / W : SCALAR, TEST |
| **Analyse Carbonatation** | Lier à **MEASUREMENT** | R : MEASUREMENT, TEST, SCALAR, CURVE, DATA_CURVE, MATERIAL… / W : SCALAR — la série profondeur/temps regroupe toutes les mesures de carbonatation du matériau (un point par mesure) |
| **Profils chlorures** | Aucun (lecture globale) | R : MEASUREMENT, CURVE, DATA_CURVE, SCALAR, MATERIAL, MIX_DESIGN, BINDER, SITE… |
| **Dashboard** | Aucun (lecture globale) | R : SCALAR, MEASUREMENT, MATERIAL, MIX_DESIGN, EXPOSURE, SOURCE |
| **Carte** | Aucun (lecture globale) | R : SITE, MATERIAL, MEASUREMENT, SCALAR |
| **Export** | Aucun (lecture globale) | R : toutes les tables |

## Schéma de données (15 tables, v2.5)

```
SOURCE ─────────────────────────────────┐
                                        ▼
SITE ──────────┐                  MEASUREMENT ──→ SCALAR (0..n : D, Cs, mean_depth…)
EXPOSURE ──────┤                   ▲       │
MIX_DESIGN ────┼──→ MATERIAL ──────┘       └──→ CURVE (0..n) ──→ DATA_CURVE (points x, y)
CURING_COND. ──┘                   TEST ──→ MEASUREMENT

MIX_DESIGN ←── MIX_DESIGN_BINDER ──→ BINDER
MIX_DESIGN ←── MIX_DESIGN_AGGREGATE ──→ AGGREGATE
```

### Vocabulaires contrôlés

Les valeurs des colonnes Choice sont définies une seule fois dans `GristHelpers.ENUMS`. Les listes de liants, d'essais, d'adjuvants et de paramètres SCALAR (`GristHelpers.SCALAR_PARAMETERS`, avec unité par défaut et libellé correspondant) ont été enrichies à partir des vocabulaires du [RILEM Metadata Tool](https://huggingface.co/spaces/raviapatel/rilem-metadata-tool).

### Auto-provisioning

Les widgets **créent automatiquement** les tables et colonnes manquantes à l'initialisation via `GristHelpers.ensureSchema()`. Il suffit d'ouvrir un widget dans un document Grist vide — le schéma complet (15 tables) sera provisionné. Sur un document existant, `ensureSchema()` ajoute aussi les nouveaux choix aux colonnes Choice (les choix ajoutés manuellement sont conservés) et migre les valeurs renommées (`GristHelpers.VALUE_RENAMES`, ex. `MEB` → `SEM`).

Le schéma complet est défini dans `assets/grist-helpers.js` (`GristHelpers.SCHEMA`).

## Architecture technique

```
Navigateur de l'utilisateur
│
├── Grist (iframe du document)
│   └── Custom Widget (iframe)
│       ├── grist-plugin-api.js      ← CDN docs.getgrist.com
│       ├── Pyodide v0.26             ← CDN jsdelivr (fick + carbonation)
│       │   └── numpy + scipy (WASM)
│       ├── Plotly.js v2.35           ← CDN plot.ly (fick, carbonation, profils, dashboard)
│       └── Leaflet v1.9.4           ← CDN unpkg (site-map uniquement)
```

**Aucun serveur requis.** Tout s'exécute côté client dans le navigateur.

## Performances

- **Fick / Carbonatation - Premier chargement** : ~15-20s (téléchargement Pyodide + scipy WASM, mis en cache ensuite)
- **Fick / Carbonatation - Chargements suivants** : ~3-5s (cache navigateur)
- **Fitting** : < 1s pour un profil typique
- **Dashboard / Carte** : < 2s (pas de Pyodide)

## Développement local

```bash
# Cloner le repo
git clone https://github.com/<votre-org>/grist-durabilite-widgets.git
cd grist-durabilite-widgets

# Servir localement
python3 -m http.server 8080
# ou
npx serve .

# Utiliser http://localhost:8080/<widget>.html comme URL widget dans Grist
```

## Structure du repo

```
grist-durabilite-widgets/
├── README.md
├── CLAUDE.md                        ← Guide pour Claude Code
├── .nojekyll                        ← Désactive Jekyll sur GitHub Pages
├── index.html                       ← Page d'accueil / catalogue
├── data-entry.html                  ← Widget : saisie des données
├── editor.html                      ← Widget : édition d'un matériau
├── fick-analysis.html               ← Widget : analyse Fick (chlorures)
├── carbonation-analysis.html        ← Widget : analyse carbonatation
├── profil-chlorure.html             ← Widget : comparaison des profils Cl⁻
├── dashboard.html                   ← Widget : dashboard comparatif
├── site-map.html                    ← Widget : carte Leaflet des sites
├── export.html                      ← Widget : export CSV
└── assets/
    ├── shared-styles.css            ← CSS partagé (variables, composants)
    └── grist-helpers.js             ← Utilitaires JS Grist (SCHEMA, API, etc.)
```

## Contexte

Projet développé dans le cadre de la recherche sur la durabilité des bétons en milieu marin au **CEREMA Méditerranée**. L'objectif est d'étudier le comportement des bétons à base de substitutions cimentaires (cendres volantes, laitier, fumée de silice, métakaolin, zéolithe) face à la pénétration des chlorures et la carbonatation, à travers une revue systématique de la littérature scientifique.

## Licence

MIT
