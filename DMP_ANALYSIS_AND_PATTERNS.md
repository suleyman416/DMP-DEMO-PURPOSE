> **Reference Document** for the `muradaghazade/DMP-DEMO-PURPOSE` repository.  
> Compiled on: September 11, 2026.  
> Covers modules: **Demand Planning** (`:8123`), **Sourcing** (`:8124`), & **Contract** (`:8125`).

---

## 1. Executive Summary & Design Vision

**DMP (Digital Material Purchasing)** is an enterprise supply-chain and procurement platform prototype built specifically for industrial **MRO (Maintenance, Repair, and Operations)** material master data governance and tender execution.

Despite being created as an iterative "vibecoded" prototype, the application displays exceptional enterprise fidelity. It avoids placeholder mocks or superficial UI shortcuts, implementing end-to-end operational logic, standard taxonomies, and multi-persona workflows:

* **Zero-Build, Native Web Architecture**: Pure HTML5, CSS3, vanilla ES6+ JavaScript, and Python 3 standard library HTTP servers. Zero `npm`, zero build tooling, zero runtime compilation lag.
* **Domain Rigor**: Strictly complies with industrial MRO description standards (`NOUN,QUALIFIER:IDENTIFIER`), real UNSPSC commodity classifications, Spec 10 catalog attributes, SAP ERP valuation classes, and legally binding sealed-bid dual-envelope procurement rules.
* **Self-Contained Data & Offline Resilience**: LocalStorage acting as an instant client cache, synchronized atomically to disk with rolling backups, plus a static snapshot fallback (`state-snapshot.js`) that boots full demo data even without a server.

---

## 2. High-Level Architecture & Interaction Diagram

```
                              ┌─────────────────────────────────────────────────┐
                              │            Web Browser / Client UI              │
                              └────────┬───────────────────────────────┬────────┘
                                       │                               │
                        HTTP :8123     │                               │    HTTP :8124
                                       ▼                               ▼
                 ┌───────────────────────────┐                   ┌───────────────────────────┐
                 │      Demand Planning      │   Cart Handoff    │          Sourcing         │
                 │   (Material Master & MDM) ├──────────────────►│     (RFx & Negotiations)  │
                 └─────────────┬─────────────┘   /api/handoff    └─────────────┬─────────────┘
                               │                                               │
                               ▼                                               ▼
                      demand_planning/data/                           sourcing/data/
                      ├── state.json (Atomic)                         ├── state.json (Atomic)
                      └── backups/ (Last 30)                          ├── backups/ (Last 30)
                                                                      └── handoffs/
                                                                               │
                                                                     Launch    │ ?handoff=<id>
                                                                               ▼
                                                                 ┌───────────────────────────┐
                                                                 │       bid-eval.html       │
                                                                 │   (Award & Saving Tool)   │
                                                                 └───────────────────────────┘
```

---

## 3. Module Breakdown

### 3.1. Demand Planning (`demand_planning/` — Default Port: 8123)

* **Directory Structure**:
  * `server.py`: Python `ThreadingHTTPServer` providing atomic persistence at `/api/state` and an authenticated reverse proxy for the e-catalogue AI service at `/api/ai/*`.
  * `index.html`: Application shell with header, drawer, notification panel, modal, and toast roots.
  * `css/styles.css`: Complete styling tokens, layout grids, cards, tables, badges, and animations.
  * `js/store.js`: Central state container with localStorage write-through, debounced server sync, version migrations, and stale-write guard.
  * `js/seed.js`: Reference datasets (valuation classes, material groups, plants, users, initial catalog).
  * `js/spec10.js`: Spec 10 industrial dataset containing verbatim attributes for standard commodities.
  * `js/workflow.js`: Multi-stage approval state machines for 8 request types.
  * `js/ai.js` & `ai-remote.js`: MRO standard description engine and AI attribute extraction.
  * `js/spreadsheet.js`: Zero-dependency `.xlsx` and `.csv` stream parser.
  * `js/i18n.js`: Real-time bilingual DOM translation (English / Azerbaijani).
  * `js/views/`:
    * `master.js`: Material Master catalog search, filters, cards/table view, cart actions.
    * `item.js`: Multi-tab item view (Overview, Attributes, Storage Locations, Inventory, Docs, Changelog).
    * `request-form.js`: Multi-step form for new materials, amendments, plant extensions, and categories.
    * `request-detail.js`: Visual approval pipeline with Approve, Reject, Return, Delegate, and SAP steps.
    * `inbox.js`: Role-scoped work queue.
    * `cart.js`: Shopping cart view and 1-click RFx migration.
    * `bulk.js`: Client-side spreadsheet batch ingestion and AI attribute tagging.
    * `categories.js`: UNSPSC dynamic attribute catalog management.
    * `manufacturers.js`: Manufacturer master list.
    * `users.js`: User identity and plant access management.
    * `items-report.js`: Custom reporting and data export.
    * `sap-log.js`: Simulated RFC/IDOC communication log with SAP ERP.
    * `dashboard.js`: KPI cards, SLA cycle times, and spend analytics.

* **Sequential Approval Workflow**:
  $$\text{Requester} \longrightarrow \text{Accounting} \longrightarrow \text{Requester Approval} \longrightarrow \text{Technical SME} \longrightarrow \text{MDM Specialist} \longrightarrow \text{SAP System Auto-Step}$$
  * *Automated SAP Step*: Requests reaching the system stage auto-advance, triggering a simulated RFC call that generates an 8-digit SAP ID (e.g. `12010758`) and writes an entry to the SAP integration audit log.
  * *MRP Inventory Gate*: Materials configured with MRP (MRP Type $\neq$ `ND`) automatically append an extra post-SAP stage assigned to the **Inventory team**.

* **MRO Description Standard**:
  * **Short Description**: `NOUN,QUALIFIER:IDENTIFIER` (e.g. `BEARING,BALL:6307-2RS1`).
  * **Long Description**: `<shortDesc> SPEC,SPEC,...,MFR:X,MPN:Y` (e.g. `BEARING,BALL:6307-2RS1 DEEP GROOVE,BORE:35MM,OD:80MM,MFR:SKF,MPN:6307-2RS1`).

---

### 3.2. Sourcing (`sourcing/` — Default Port: 8124)

* **Directory Structure**:
  * `server.py`: Static HTTP server, atomic state persistence (`/api/state`), cross-module cart handoff receiver (`/api/handoff`), and child-process supervisor for Demand Planning.
  * `index.html`: Sourcing app shell.
  * `bid-eval.html`: Completely self-contained analytical suite (includes embedded WOFF2 font and client-side scenario math).
  * `js/store.js`: Sourcing application state and migrations.
  * `js/workflow.js`: Sealed-bid and dual-envelope business rules, quote resolution, and negotiation logic.
  * `js/views/`:
    * `rfx-list.js`: Active tender event dashboard with phase badges (`Draft`, `Open`, `Closed`, `Awarded`).
    * `rfx-form.js`: Tender authoring (manual, CSV/Excel template import, or DP cart handoff).
    * `rfx-detail.js`: Dual-envelope evaluation tabs, price comparison matrix, and awarding controls.
    * `supplier-response.js`: Supplier bidding portal (line quotes, ALT substitute offers, file attachments).
    * `suppliers.js`: Vendor directory with competency categories.

* **Strict Dual-Envelope Procurement Law**:
  1. **Sealed Bids**: Bids are locked; buyers cannot view offer contents until the submission deadline expires.
  2. **Technical Envelope (CAM — Category Manager / Tech SME)**:
     * Evaluates technical answers, ISO certifications, and datasheets.
     * Prices are strictly obscured.
     * Evaluator assigns a strict **Qualified** or **Disqualified** verdict.
  3. **Commercial Envelope (PROC — Procurement Specialist)**:
     * Unlocks pricing, currencies, Incoterms, lead times, MOQ, and lot sizes.
     * **Gating Rule**: PROC cannot award lines until all bids have a CAM technical verdict.
     * **Award Rule**: Only technically qualified suppliers can be awarded contracts.

* **Negotiations & Embedded Bid-Evaluation Tool (`bid-eval.html`)**:
  * In the commercial view, clicking **"⚖ Evaluate your Bids"** serializes the RFx and launches `bid-eval.html?handoff=<id>`.
  * The tool computes single vs. split-award scenarios, identifies savings opportunities, and stages negotiation targets.
  * Staged negotiations are written to a shared `localStorage` outbox (`dmp_sourcing_neg_outbox`), which Sourcing consumes live to update the RFx state and notify suppliers.

---

## 4. Key Cross-Cutting Engineering Patterns

### 4.1. Dual Persistence & Stale-Write Guard
* Every mutation executes through `Store.set(draft => { ... })`.
* State is immediately saved to `localStorage` for instant navigation.
* A debounced timer (400ms) sends `POST /api/state` to Python.
* `server.py` writes to `state.json.tmp` and performs an atomic `os.replace()`, preserving the previous version in `data/backups/state-YYYYMMDD-HHMM.json` (keeps the last 30 backups).
* **Stale-Write Guard**: State objects carry `__savedAt`. If an outdated tab attempts to save older data over newer changes, the server rejects it with `HTTP 409 Conflict`.
* **Tab Resynchronization**: Tabs listen to `window.addEventListener('storage')` and re-fetch from `/api/state` on `visibilitychange` focus. Tab unloads flush the latest state via `navigator.sendBeacon()`.

### 4.2. Stateless Cross-Module Handoff Protocol (`/api/handoff`)
To decouple modules without a shared database:
1. Module A makes a `POST` request to Module B's `/api/handoff` with a JSON payload.
2. Module B saves the file as `data/handoffs/h<timestamp>.json` and returns `{ ok: true, id: "h..." }`.
3. Module A navigates the browser to Module B with `?handoff=<id>`.
4. Module B reads and consumes the payload once upon mounting.

### 4.3. Dependency-Free Spreadsheet Engine (`spreadsheet.js`)
* Ingests `.xlsx` files without SheetJS or external bundles.
* Uses the browser's native `DecompressionStream('deflate-raw')` API to decompress the ZIP container in memory.
* Parses worksheet XML entries (`sheetData > row > c`) using `DOMParser`.
* Automatically detects CSV delimiters (comma, semicolon, tab) by analyzing the frequency of characters on the first row.

### 4.4. Real-Time In-DOM Internationalization (`i18n.js`)
* Views are authored exclusively in standard English.
* When Azerbaijani (`az`) is selected, `I18N.apply()` traverses all DOM text nodes, button contents, `placeholder`, and `title` attributes, translating them via exact and sub-phrase dictionaries.
* Switching back to English triggers a clean re-render of the current route.

---

## 5. Pre-Seeded Datasets & Demo Personas

### 5.1. Demand Planning Personas (Port 8123)
* `John Simpson`: Requester (Plants 1700, 1004, 3000)
* `Leyla Mammadova`: Technical SME (Plants 1700, 3000)
* `Rashad Aliyev`: Accounting (Valuation classes, Plant 3000)
* `Nigar Huseynova`: MDM Specialist (Master data approvals, Plants 1700, 3100, 3200)
* `Elvin Qasimov`: Central team (System administrator, all plants)
* `Aysel Karimova`: Inventory team (MRP & storage parameters, Plant 1700)

### 5.2. Sourcing Personas (Port 8124)
* **Customer Side**:
  * `John Simpson` (`u_proc`): Procurement Specialist (Commercial Envelope & Awards)
  * `Aysel Karimova` (`u_cam`): Category Manager (Technical Envelope & Qualification)
* **Supplier Side**:
  * `Rashad Aliyev` (`u_sup1`): Baku Industrial Supplies LLC
  * `Leyla Hasanova` (`u_sup2`): Caspian Tech Services
  * `Marco Rossi` (`u_sup3`): Global MRO Trading FZE

### 5.3. Pre-Seeded Demonstration State
* **Demand Planning**: 44 mastered Spec 10 items, 111 workflow requests, 300 role-scoped notifications, and **8 pre-loaded cart items** ready for RFx migration.
* **Sourcing**: 4 RFx events (including `RFQ-20260830-61139` with submitted quotes and real base64 PDF certificates).

---

## 6. Impeccable Design System Integration

The project has been equipped with the **Impeccable** design skill and CLI engine (`v4.0.0` / Darwin arm64) located at `.gemini/skills/impeccable/`.

### Available Design Capabilities
* `impeccable detect [target]`: Scans HTML/CSS for anti-patterns and AI styling tells.
* `/impeccable init`: Initializes and documents project design context in `PRODUCT.md`.
* `/impeccable document`: Reverse-engineers CSS rules into a structured `DESIGN.md`.
* `/impeccable audit`: Runs automated audits across accessibility (contrast, ARIA), responsiveness, and performance.
* `/impeccable polish`: Refines typographic rhythm, spacing, elevation, and micro-interactions.

---

## 7. How to Run the Complete DMP Platform

All three modules are automatically managed and booted with a single command from the project root:

```bash
python3 sourcing/server.py
```

* **Contract Module**: `http://127.0.0.1:8125` (Auto-spawned companion process)
* **Sourcing Module**: `http://127.0.0.1:8124` (Master supervisor server)
* **Demand Planning Module**: `http://127.0.0.1:8123` (Auto-spawned companion process)
