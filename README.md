# CHITRAGUPTA // AI Forensic Facial Composite & Verification Suite

> **Official HackFest 2026 Repository for Team TheHourned Ones (T1-32)**  
> **Author Account:** [vaishnavis1603-blip](https://github.com/vaishnavis1603-blip) | **Author Email:** `vaishnavis1603@gmail.com`

---

## 1. Overview & Architecture

**CHITRAGUPTA** is a high-security forensic investigation desktop web application designed for criminal investigation departments, forensic sketch artists, and cyber cells. It converts cognitive witness testimony into structured facial features, renders evolutionary candidate composites across an interactive node graph, performs dual-metric comparison against synthetic criminal records, and maintains an immutable SHA-256 cryptographic proof-of-custody audit ledger.

```
                           +----------------------------------------+
                           |   Cognitive Witness Interview (Audio)  |
                           |    (English / Hindi / Kannada STT)     |
                           +-------------------+--------------------+
                                               |
                                               v
                           +----------------------------------------+
                           | Multilingual Witness Prompt Node (Web) |
                           +-------------------+--------------------+
                                               |
                                               v
                           +----------------------------------------+
                           |  Llama-3.2 Feature Extractor + Guards  |
                           | (Face, Jaw, Eyes, Nose, Hair, Marks)   |
                           +-------------------+--------------------+
                                               |
                                               v
                           +----------------------------------------+
                           | Candidate Composite Sketch Nodes (v1)  |
                           |   [React Flow Graph @xyflow/react]     |
                           +-------------------+--------------------+
                                               |
                     +-------------------------+-------------------------+
                     |                                                   |
                     v                                                   v
      +-----------------------------+                     +-----------------------------+
      |  Branch / Refinement Nodes  |                     |  Finalize Target Composite  |
      |   (v2, v3... Feature Delta) |                     |  (Locks Image & Attributes) |
      +-----------------------------+                     +--------------+--------------+
                                                                         |
                                               +-------------------------+-------------------------+
                                               |                                                   |
                                               v                                                   v
                                +-----------------------------+                     +-----------------------------+
                                |  Dual-Metric Criminal DB    |                     |  Cryptographic Audit Ledger |
                                |  Comparison (/db-verify)    |                     |   SHA-256 Hash Chained Logs |
                                +-----------------------------+                     +-----------------------------+
```

---

## 2. Core Modules & Webpages

### Page 1 — Image Generation Studio (`/`)
* **Interactive Forensic Graph Canvas (`@xyflow/react`):** Node-based workflow visually connecting witness prompt inputs, feature extractor nodes, candidate sketches, and branched refinements.
* **Multilingual Input & Speech Support:** Full support for **English (`en-IN`)**, **Hindi (`hi-IN`)**, and **Kannada (`kn-IN`)** with browser-native Web Speech API Speech-to-Text (STT) and Text-to-Speech (TTS) read-aloud.
* **Structured Anatomical Breakdown:** Automatically parses jawline, eye morphology, nasal bridge, facial hair, distinguishing marks, and estimated age.
* **Evolutionary Version History:** Each child branch records parent-version references, iteration index ($v1 \to v2 \to v3$), timestamps, and change descriptions.
* **Interactive Tooling:** Side-by-side version comparison modal, session gallery drawer, instant PNG composite export, and court-admissible PDF dossier generator.

### Page 2 — Feature Comparison (`/db-verification`)
* **Finalized Suspect Preview:** Locks the selected query composite with descriptive feature tags and image digest.
* **Dual-Metric Forensic Matching Engine:**
  * **60% Weight:** Biometric vector similarity ($512\text{-d}$ embedding distance simulation).
  * **40% Weight:** Structured anatomical trait alignment (evaluates exact trait matches).
* **Verdict Classification:**
  * $\ge 75\%$: **Existing Criminal Record Found** (high confidence alert).
  * $50\% - 74\%$: **Partial / Possible Match**.
  * $< 50\%$: **No Existing Record in Database (New Suspect)**.
* **Filtering & Side-by-Side Inspection:** Search by name, FIR number, crime category, or custody status. Includes full trait comparison matrix.
* **Responsible AI Guardrail:** Explicitly flags mock records as **synthetic demonstration data** and highlights that similarity scores are investigative aids, not biometric proof of identity or guilt.

### Page 3 — Cryptographic Audit Ledger (`/audit-logs`)
* **Proof-of-Custody Logging:** Every action (session init, sketch generation, refinement, finalization, DB query, PDF export) is chained into an immutable SHA-256 block ledger.
* **Cryptographic Block Chaining:**
  $$\text{currHash} = \text{SHA-256}(\text{blockIndex} \parallel \text{sessionId} \parallel \text{memberId} \parallel \text{action} \parallel \text{imageId} \parallel \text{timestamp} \parallel \text{prevHash})$$
* **Chain Integrity Verification:** Includes a live **"Verify Chain Cryptography"** auditor that recalculates all digests in real time.
* **Tamper Simulation & Recovery:** Built-in interactive test control to simulate block tampering and demonstrate instant cryptographic detection and restoration.

---

## 3. Project File Structure

```text
thehourned-ones-t1-32/
├── package.json                             # Root scripts (delegates to frontend)
├── .gitignore                               # Node modules & build artifacts ignored
├── README.md                                # Full architecture, guide & API contract
│
└── frontend/
    ├── .env                                 # Active frontend environment config
    ├── .env.example                         # Example environment template
    ├── index.html                           # App entry HTML & Google Fonts
    ├── package.json                         # Dependencies & Vite build scripts
    ├── vite.config.js                       # Vite bundler config with optimized chunks
    ├── tailwind.config.js                   # Custom forensic dark navy theme
    ├── postcss.config.js                    # PostCSS plugins
    │
    └── src/
        ├── main.jsx                         # React 18 DOM mount
        ├── App.jsx                          # Router configuration & root provider
        ├── index.css                        # Tailwind directives & React Flow theme
        │
        ├── context/
        │   └── SessionContext.jsx           # Global session, officer, image & audit state
        │
        ├── services/
        │   ├── api.js                       # Centralized API service with mock fallback
        │   └── mockCriminalDb.js            # Synthetic criminal registry & scoring engine
        │
        ├── utils/
        │   ├── hashUtils.js                 # SubtleCrypto SHA-256 & chain verification
        │   ├── pdfExport.js                 # jsPDF court dossier export
        │   └── speech.js                    # Multilingual Web Speech API (STT & TTS)
        │
        ├── components/
        │   ├── common/
        │   │   ├── Badge.jsx                # Reusable status badges
        │   │   ├── Button.jsx               # Reusable forensic buttons
        │   │   ├── Modal.jsx                # Accessible modal dialog
        │   │   └── Toast.jsx                # Notification alert system
        │   │
        │   ├── layout/
        │   │   ├── Navbar.jsx               # Navigation bar & officer badge
        │   │   ├── SessionBanner.jsx        # Active case & finalized thumbnail bar
        │   │   └── Footer.jsx               # Legal disclaimers & build version
        │   │
        │   ├── studio/                      # WEBPAGE 1: Studio components
        │   │   ├── FlowCanvas.jsx           # React Flow (@xyflow/react) graph canvas
        │   │   ├── PromptNode.jsx           # Node 1: Multilingual prompt + STT/TTS
        │   │   ├── FeatureExtractorNode.jsx # Node 2: Extracted anatomical features
        │   │   ├── CandidateSketchNode.jsx  # Node 3+: Composite sketch card
        │   │   ├── RefinementDrawer.jsx     # Feature-specific refinement drawer
        │   │   ├── VersionComparisonModal.jsx# Version trait delta comparison
        │   │   ├── SessionGalleryDrawer.jsx # Session iterations archive
        │   │   └── PdfExportModal.jsx       # Dossier PDF export modal
        │   │
        │   ├── verification/                # WEBPAGE 2: DB Verification components
        │   │   ├── FinalizedSuspectPanel.jsx# Left panel: Finalized query composite
        │   │   ├── DbSearchControls.jsx     # Filter, search & threshold controls
        │   │   ├── CriminalMatchCard.jsx    # Scored criminal match card
        │   │   └── FeatureComparisonModal.jsx# Side-by-side feature comparison modal
        │   │
        │   └── audit/                       # WEBPAGE 3: Blockchain Audit components
        │       ├── BlockchainStatusHeader.jsx# Integrity badge & verification runner
        │       ├── AuditLogTable.jsx        # Filterable, paginated audit log table
        │       └── BlockHashInspector.jsx   # Cryptographic payload inspector
        │
        └── pages/
            ├── ImageGenStudioPage.jsx       # Webpage 1: Studio Workspace
            ├── DbVerificationPage.jsx       # Webpage 2: Criminal DB Verification
            └── AuditLogsPage.jsx            # Webpage 3: Cryptographic Audit Ledger
```

---

## 4. Getting Started & Commands

### Prerequisites
* **Node.js:** v18.0.0 or later (Tested on Node v24)
* **npm:** v9.0.0 or later (Tested on npm v11)

### Installation
From the root workspace directory, navigate to `frontend` and install dependencies:

```bash
cd frontend
npm install
```

### Running Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

### Running Production Build
```bash
npm run build
```
Build output is optimized and verified into `frontend/dist/`.

### Previewing Production Build
```bash
npm run preview
```

---

## 5. Configuration & Mock/Live Switching

Environment configuration is managed in `frontend/.env` (modeled after `frontend/.env.example`).

```env
# Centralized API service target (FastAPI backend)
VITE_API_BASE_URL=http://localhost:8000/api

# Switchable Mock Adapter
# Set to 'true' for standalone evaluation, hackathon judging, or demo mode
# Set to 'false' to route requests to the live FastAPI backend
VITE_USE_MOCK_DATA=true

# Application Metadata
VITE_APP_TITLE=CHITRAGUPTA Forensic Sketch Suite
VITE_ORGANIZATION_NAME=Cyber & Forensic Crime Cell
VITE_DEPLOYMENT_ENV=development
```

> **Automatic Fallback:** Even when `VITE_USE_MOCK_DATA=false`, if the FastAPI backend is not running or network connectivity fails, the centralized API client automatically falls back to the high-fidelity mock adapter with simulated processing latency, ensuring uninterrupted demonstration.

---

## 6. Documented Backend API Contracts (FastAPI)

The frontend's centralized API service in `frontend/src/services/api.js` targets the following FastAPI REST endpoints:

### 1. `POST /api/extract-features`
Extracts structured anatomical facial features from natural language witness descriptions.

* **Request Body:**
  ```json
  {
    "prompt": "Male, early 30s, sharp square jawline, deep-set almond eyes, 3-day stubble",
    "language": "en-IN"
  }
  ```
* **Response Body (`200 OK`):**
  ```json
  {
    "faceShape": "Angular Oval",
    "jawline": "Sharp Square",
    "eyes": "Deep-set Almond",
    "nose": "Straight Narrow Bridge",
    "facialHair": "3-Day Heavy Stubble",
    "marks": "Scar on Left Eyebrow",
    "ageRange": "28-35"
  }
  ```

### 2. `POST /api/generate-sketch`
Generates a new composite sketch image with structured metadata.

* **Request Body:**
  ```json
  {
    "prompt": "Male, sharp jawline, deep set almond eyes",
    "language": "en-IN",
    "seed": 1042,
    "parentId": null,
    "iteration": 1
  }
  ```
* **Response Body (`200 OK`):**
  ```json
  {
    "imageId": "IMG-SKETCH-1042",
    "imageUrl": "https://image.pollinations.ai/prompt/forensic...",
    "prompt": "Male, sharp jawline, deep set almond eyes",
    "seed": 1042,
    "iteration": 1,
    "parentId": null,
    "createdAt": "2026-10-28T10:00:00.000Z",
    "imageHash": "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    "confidenceScore": 94.2,
    "features": { ... }
  }
  ```

### 3. `GET /api/criminal-records`
Queries the criminal database with filters.

* **Query Parameters:** `search`, `crimeCategory`, `status`, `minScore`
* **Response Body (`200 OK`):**
  ```json
  [
    {
      "suspectId": "CRIM-KA-2026-0912",
      "fullName": "Ramesh \"Rocky\" Shetty",
      "alias": "Rocky Bhai",
      "firNumber": "FIR-BLR-2024-882",
      "crimeCategory": "Armed Robbery & Extortion",
      "status": "ACTIVE_WARRANT",
      "baseVectorSimilarity": 91.4,
      "features": { ... }
    }
  ]
  ```

### 4. `POST /api/verify-db`
Executes dual-metric verification of a finalized composite against stored records.

* **Request Body:**
  ```json
  {
    "imageId": "IMG-SKETCH-1042",
    "features": {
      "faceShape": "Angular Oval",
      "jawline": "Sharp Square",
      "eyes": "Deep-set Almond",
      "nose": "Straight Narrow Bridge",
      "facialHair": "3-Day Heavy Stubble",
      "marks": "Scar on Left Eyebrow"
    }
  }
  ```
* **Response Body (`200 OK`):**
  ```json
  {
    "queryImageId": "IMG-SKETCH-1042",
    "evaluatedRecordsCount": 5,
    "topMatch": {
      "suspectId": "CRIM-KA-2026-0912",
      "fullName": "Ramesh \"Rocky\" Shetty",
      "combinedScore": 88.8,
      "vectorSimilarity": 91.4,
      "featureScore": 83.3,
      "matchedTraits": ["faceShape", "jawline", "eyes", "nose", "facialHair"]
    },
    "matches": [ ... ]
  }
  ```

---

## 7. Responsible AI & Legal Disclaimer

* **Investigative Aid Only:** Facial composites produced by CHITRAGUPTA are artificial reconstructions based solely on human cognitive recall. They are **not** photographic evidence, certified biometric identity matches, or conclusive proof of criminality.
* **Demonstration Registry:** All criminal records, FIR numbers, mugshots, and scores in Webpage 2 are synthetic demonstration artifacts. No active police database or citizen PII is accessed or exposed.
