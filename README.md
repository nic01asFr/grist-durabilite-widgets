# Grist Widgets — Durabilité des bétons

Custom widgets Grist pour l'analyse de durabilité des bétons en milieu marin.
Hébergés sur **GitHub Pages**, utilisables directement dans [Grist](https://grist.numerique.gouv.fr).

## Widgets disponibles

| Widget | Fichier | Description |
|--------|---------|-------------|
| **Analyse Fick** | `fick-analysis.html` | Fitting profils Cl⁻ (scipy) ou saisie directe Dapp, calcul durée de vie |
| **Analyse Carbonatation** | `carbonation-analysis.html` | Fitting K_carb (x = K·√t) ou saisie directe, calcul durée de vie |
| **Dashboard Comparatif** | `dashboard.html` | Box plots Dapp, scatter E/L vs Dapp, comparaison durées de vie |
| **Carte des Sites** | `site-map.html` | Carte Leaflet des sites d'exposition avec indicateurs Dapp |

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
| **Analyse Fick** | Lier à **CHLORIDE_PROTOCOL** | R: CHLORIDE_RESULTS, CONCRETE_MIX / W: CHLORIDE_ANALYSIS |
| **Analyse Carbonatation** | Lier à **CARBONATION_PROTOCOL** | R: CARBONATION_RESULTS, CONCRETE_MIX / W: CARBONATION_ANALYSIS |
| **Dashboard** | Aucun (lecture globale) | R: CHLORIDE_ANALYSIS, CHLORIDE_PROTOCOL, CONCRETE_MIX |
| **Carte** | Aucun (lecture globale) | R: SITE, CHLORIDE_PROTOCOL, CHLORIDE_ANALYSIS, CONCRETE_MIX |

## Schéma de données (13 tables, v1.1)

```
SOURCE ──→ CONCRETE_MIX ──→ CHLORIDE_PROTOCOL ──→ CHLORIDE_RESULTS
               │                    │
               │                    └──→ CHLORIDE_ANALYSIS (widget Fick)
               │
               ├──→ CARBONATION_PROTOCOL ──→ CARBONATION_RESULTS
               │              │
               │              └──→ CARBONATION_ANALYSIS (widget Carbo)
               │
               ├──→ AGGREGATES
               ├──→ BINDER_COMPOSITION
               ├──→ CEMENT_CHARACTERIZATION
               └──→ MATERIAL_PROPERTIES

SITE ←── (ref) CHLORIDE_PROTOCOL, CARBONATION_PROTOCOL
```

### Auto-provisioning

Les widgets **créent automatiquement** les tables et colonnes manquantes à l'initialisation via `GristHelpers.ensureSchema()`. Il suffit d'ouvrir un widget dans un document Grist vide — le schéma complet (13 tables) sera provisionné.

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
│       ├── Plotly.js v2.35           ← CDN plot.ly (fick, carbonation, dashboard)
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
├── fick-analysis.html               ← Widget : analyse Fick (chlorures)
├── carbonation-analysis.html        ← Widget : analyse carbonatation
├── dashboard.html                   ← Widget : dashboard comparatif
├── site-map.html                    ← Widget : carte Leaflet des sites
└── assets/
    ├── shared-styles.css            ← CSS partagé (variables, composants)
    └── grist-helpers.js             ← Utilitaires JS Grist (SCHEMA, API, etc.)
```

## Contexte

Projet développé dans le cadre de la recherche sur la durabilité des bétons en milieu marin au **CEREMA Méditerranée**. L'objectif est d'étudier le comportement des bétons à base de substitutions cimentaires (cendres volantes, laitier, fumée de silice, métakaolin, zéolithe) face à la pénétration des chlorures et la carbonatation, à travers une revue systématique de la littérature scientifique.

## Licence

MIT
