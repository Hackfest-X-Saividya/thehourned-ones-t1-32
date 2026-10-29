# CHITRAGUPTA — AI Forensic Composite & Biometric Intelligence Suite

> **HackFest 2026** | **Team:** TheHourned Ones (`T1-32`)  
> **Repository:** Forensic Facial Composite Synthesis, Biometric Matching & Chain-of-Custody Verification Platform

---

## 🏛️ Executive Summary

**CHITRAGUPTA** is an enterprise-grade forensic facial composite synthesis and biometric intelligence suite engineered for law enforcement agencies, cyber crime cells, and investigative authorities. The platform transforms fragmented witness testimony — delivered in native scripts or spoken regional languages — into courtroom-admissible, high-fidelity facial composite sketches, cross-references them against criminal biometric databases in real time, and cryptographically seals every revision in an immutable audit ledger.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               CHITRAGUPTA ARCHITECTURE                                 │
└────────────────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────────────┐
  │                            REACT 18 FORENSIC FRONTEND                            │
  │  • Cinematic Video Landing Portal (index.html / landing.html)                    │
  │  • Node-Based Flow Canvas (Witness Statement → Feature Extractor → Candidates)   │
  │  • Visual Feature Catalogue (/catalogue — 10 Anatomical Reference Categories)   │
  │  • Suspect Biometric Verification (/db-verification — Real-Time Vector Matching) │
  │  • Cryptographic Chain-of-Custody Ledger (/audit-logs)                           │
  └────────────────────────────────────────┬─────────────────────────────────────────┘
                                           │ HTTPS / REST (Vite Proxy: /api)
                                           ▼
  ┌──────────────────────────────────────────────────────────────────────────────────┐
  │                    CLOUDFLARE WORKERS SERVERLESS BACKEND (HONO)                  │
  │  • Case Management & RBAC Authorization Middleware (Token / Badge Verification)   │
  │  • Gemini Multilingual Translation Service (Hinglish/Regional Speech-to-Text)    │
  │  • Non-Destructive Version Lineage Engine & Tree Graph                           │
  │  • Pure TypeScript Region Mask Compositor (Preserves Unselected Pixels)          │
  │  • Sliding-Window Rate Limiter & Immutable Audit Trail (SHA-256 Digests)         │
  └───────┬───────────────────────────────┬───────────────────────────────┬──────────┘
          │                               │                               │
          ▼                               ▼                               ▼
┌──────────────────┐            ┌──────────────────┐            ┌──────────────────┐
│  Cloudflare D1   │            │  Cloudflare R2   │            │   AI Providers   │
│  (Serverless DB) │            │ (Private Bucket) │            │ (Workers AI &    │
│ • Cases & Grants │            │ • Full Sketches  │            │  Google Gemini)  │
│ • Image Lineage  │            │ • Inpaint Masks  │            │ • Flux.1 / SDXL  │
│ • Audit Ledger   │            │ • Private Stream │            │ • Gemini 3.5 /   │
│ • Suspect AFIS   │            │ • Zero Egress    │            │   2.5 Flash STT  │
└──────────────────┘            └──────────────────┘            └──────────────────┘
```

---

## ✨ Core Platform Capabilities

### 1. Cinematic Landing & Law Enforcement Access Portal
- **Zero-Build Self-Contained Entry:** Accessible as a standalone [`index.html`](index.html) and live at [`http://localhost:5173/landing.html`](http://localhost:5173/landing.html).
- **Looping Wireframe Earth Background:** Stacked dual-video cross-fade architecture (`FADE = 0.9s`) eliminating loop seams; complete `prefers-reduced-motion` compliance.
- **Proportional `--u` Design System:** 1280×800 reference render scaling seamlessly down to narrow mobile screens.
- **Secure Officer Login Modal:** Frosted glass overlay with mail address and security password validation, plus one-click clearance profiles (**Det. Sarah Connor**, **Insp. James Gordon**, **Capt. Raymond Holt**).

### 2. Node-Based Forensic Studio Canvas (`@xyflow/react`)
- **Node 1 — Witness Statement:** Integrated multilingual Speech-to-Text (STT) and text input with real-time token badge indicators.
- **Node 2 — Anatomical Feature Extractor:** Automatically parses face shape, jawline, eye structure, nose bridge, facial hair, and distinguishing scars from witness cues.
- **Candidate Sketch Node (V1):** Generates 4 distinct variations per round. Allows candidate selection as the primary active composite.
- **Child Node Inpainting & Refinement Drawer:** Interactive region masking (eyes, nose, jawline, facial hair) allowing surgical adjustments while strictly preserving unselected background pixels.
- **Active Composite Dock:** Clickable green circular floating dock that follows the investigator across the canvas and zooms into the latest candidate.
- **Canvas Pruning:** Quick-delete cross (`✕`) buttons on generated candidate nodes to remove unwanted variations and keep the workflow tidy.

### 3. Multilingual Speech-to-Text & Gemini Translation
- **Native Scripts & Romanized Hinglish:** Translates speech in Hindi, Kannada, Tamil, Telugu, and phonetic Hinglish (e.g., *"Aankh Chhota"*, *"Gol chehra, halki dadhi"*) into structured, courtroom-standard English forensic descriptions.
- **Resilient 4-Tier Model Hierarchy:** Automatically cascades from `gemini-3.5-live-preview` $\rightarrow$ `gemini-2.5-flash` $\rightarrow$ `gemini-2.0-flash` $\rightarrow$ `gemini-1.5-flash` $\rightarrow$ client-side forensic dictionary fallback.
- **Credential Protection:** Server-side proxy (`/api/gemini/translate-prompt`) keeps Google API keys secured in `.dev.vars` with zero browser exposure.

### 4. Visual Feature Catalogue (`/catalogue`)
- **10 Anatomical Categories:** Chin & jawline, distinguishing marks, eyebrows, eyes, face shapes, facial hair, hairline, lips, and nose.
- **Over 100 Authentic Reference Assets:** Enables witnesses to visually point out specific anatomical traits.
- **Live Canvas Sync:** Selecting catalog items dynamically populates the witness statement in Node 1.

### 5. Suspect Biometric Verification & Vector Comparison (`/db-verification`)
- **Facial Landmark Calibration:** Computes geometric alignment across eye centers, nasal tip, mouth corners, and jaw contour.
- **Biometric Matching:** Computes vector similarity against the synthetic criminal registry (e.g., Ramesh "Rocky" Shetty, Harish Gowda) with confidence scoring.
- **Side-by-Side Differential Overlay:** Direct visual comparison between synthesized sketches and police mugshots.

### 6. Cryptographic Chain-of-Custody Ledger (`/audit-logs`)
- **Immutable Append-Only Audit Trail:** Sealed with SHA-256 digests. Update and delete HTTP operations are strictly rejected with `405 Method Not Allowed`.
- **Granular Forensics:** Logs user ID, IP address, timestamp, event type (`CASE_CREATED`, `GENERATION_REQUESTED`, `IMAGE_SELECTED`, `REVISION_CREATED`, `EXPORT_GENERATED`), and case context.

---

## 🚀 Quick Start & Local Execution

### 1. Prerequisites
- **Node.js:** v20+ or v24+
- **npm** or **pnpm**
- **Cloudflare Wrangler CLI:** v4.150+

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Hackfest-X-Saividya/thehourned-ones-t1-32.git
cd thehourned-ones-t1-32

# Install backend dependencies
npm install

# Install frontend dependencies
npm --prefix frontend install
```

### 3. Environment Configuration
Create `.dev.vars` in the repository root for the backend:
```ini
ENVIRONMENT=development
JWT_SECRET=chitragupta-secure-secret-2026
MAX_FILE_SIZE_BYTES=10485760
DEFAULT_IMAGE_WIDTH=1024
DEFAULT_IMAGE_HEIGHT=1024

# External Cloudflare Worker AI Integration
EXTERNAL_WORKER_URL=https://lingering-cake-50cc.adeepag13.workers.dev
EXTERNAL_WORKER_TOKEN=e2556c8a933bcee1905956ad8b3f5a0f002c9da9329839f5ebb6b19481b59f3c

# Google Gemini Multilingual Model
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.5-flash
```

Create `frontend/.env` for the React application:
```ini
VITE_API_BASE_URL=/api
VITE_USE_MOCK_DATA=false
VITE_APP_TITLE=CHITRAGUPTA Forensic Sketch Suite
VITE_ORGANIZATION_NAME=Cyber & Forensic Crime Cell
VITE_DEPLOYMENT_ENV=development
VITE_GEMINI_MODEL=gemini-3.5-live-preview
VITE_GEMINI_API_KEY=
```

### 4. Run Automated Backend Tests
All 6 test suites verify case management, candidate bounds, mask editing with compositing, version restoration, rate limiting, and immutable audit logs:
```bash
npm test
```
*Expected: 19 passed (19 tests, 6 test files, 100% pass rate).*

### 5. Build Frontend Production Bundle
```bash
npm --prefix frontend run build
```
*Transforms 2,148+ modules into optimized static assets in `frontend/dist` with 0 errors.*

### 6. Start Development Servers
In two separate terminals:

**Terminal 1 — Backend API (Cloudflare Wrangler):**
```bash
npx wrangler dev --port 8787 --ip 127.0.0.1
```
*Backend active at `http://127.0.0.1:8787`.*

**Terminal 2 — Frontend Application (Vite):**
```bash
npm --prefix frontend run dev
```
*Frontend active at `http://localhost:5173`.*

---

## 🌐 Application Route Map

| Route | View | Description |
|---|---|---|
| [`/landing.html`](http://localhost:5173/landing.html) | **Landing Portal** | Full-viewport rotating Earth video hero with Officer Login modal. |
| [`/`](http://localhost:5173/) | **Forensic Studio** | Interactive node-based canvas for composite synthesis and iterative refinement. |
| [`/catalogue`](http://localhost:5173/catalogue) | **Feature Catalogue** | 10-category visual library for witness recall and prompt synchronization. |
| [`/db-verification`](http://localhost:5173/db-verification) | **Feature Comparison** | Biometric suspect registry alignment and vector similarity search. |
| [`/audit-logs`](http://localhost:5173/audit-logs) | **Audit Ledger** | Immutable cryptographic chain-of-custody log viewer. |

---

## 📡 API Reference Overview

| Area | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/api/health` | Backend and Cloudflare binding availability. |
| **Cases** | `POST` | `/api/cases` | Create a forensic case record. |
| | `GET` | `/api/cases` | List cases authorized for current investigator. |
| | `GET` | `/api/cases/:caseId` | Fetch case details and current active composite. |
| **Generations** | `POST` | `/api/generate-candidates` | Proxy generation to live Cloudflare Worker AI (Flux.1 / SDXL). |
| | `POST` | `/api/generations` | Native generation stored directly in D1 & R2. |
| **Inpainting** | `POST` | `/api/images/:imageId/edits` | Region inpainting with mask & unselected pixel compositing. |
| **Lineage & History**| `GET` | `/api/cases/:caseId/versions` | Full revision tree and version history. |
| | `POST` | `/api/images/:imageId/select` | Select candidate as primary composite. |
| | `POST` | `/api/images/:imageId/restore` | Restore previous revision as active sketch. |
| | `GET` | `/api/images/:imageId/compare/:otherId` | Side-by-side differential comparison. |
| **Multilingual AI** | `POST` | `/api/gemini/translate-prompt` | Gemini translation of regional/Hinglish speech to forensic prompt. |
| **Private Streaming**| `GET` | `/api/images/:imageId/file` | Authenticated private R2 sketch streaming. |
| | `GET` | `/api/images/:imageId/mask` | Authenticated private R2 mask streaming. |
| **Audit Ledger** | `GET` | `/api/cases/:caseId/audit` | Case-level audit trail. |
| | `GET` | `/api/audit` | Global immutable audit ledger (admin / lead investigator). |

---

## 📂 Repository Directory Layout

```
.
├── chitragupta-assets/             # Curated facial anatomical reference photo library
├── docs/                           # OpenAPI 3.1 specs and integration contracts
├── frontend/                       # React 18 + Vite + Tailwind CSS Application
│   ├── public/                     # Static assets & landing.html
│   ├── src/
│   │   ├── components/             # Studio nodes, layout, verification & modals
│   │   ├── context/                # SessionContext & active case state
│   │   ├── data/                   # Feature Catalogue anatomical library (730+ lines)
│   │   ├── pages/                  # Studio, Catalogue, Verification & Audit pages
│   │   ├── services/               # API client & Gemini translation service
│   │   └── utils/                  # Speech recognition, PDF export, hash utilities
│   └── vite.config.js              # Vite configuration with proxy to port 8787
├── index.html                      # Standalone zero-build landing page with video background
├── migrations/                     # D1 SQLite migrations (schema & seed data)
├── src/                            # Cloudflare Worker Backend (TypeScript + Hono)
│   ├── middleware/                 # Auth, error handling, rate limiting
│   ├── routes/                     # Cases, generations, images, forensics, audit
│   ├── services/                   # D1, R2, AI adapters, pixel compositor
│   └── types/                      # TypeScript definitions & Cloudflare Env bindings
├── tests/                          # Vitest automated test suite (19 tests)
├── wrangler.jsonc                  # Cloudflare Workers deployment configuration
└── package.json                    # Project metadata & workspace scripts
```

---

## ☁️ Production Cloudflare Deployment

### 1. D1 Database & R2 Bucket Setup
```bash
# Create remote D1 database
npx wrangler d1 create crime-sketch-db

# Update wrangler.jsonc with the generated database_id UUID
# Apply SQL migrations remotely
npx wrangler d1 migrations apply crime-sketch-db --remote

# Create remote R2 bucket
npx wrangler r2 bucket create crime-scene-sketches
```

### 2. Configure Cloudflare Secrets
```bash
npx wrangler secret put EXTERNAL_WORKER_URL
npx wrangler secret put EXTERNAL_WORKER_TOKEN
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put JWT_SECRET
```

### 3. Deploy Backend Worker
```bash
npm run deploy
```

### 4. Deploy Frontend (Cloudflare Pages or Unified Worker)
```bash
# Option A: Cloudflare Pages
npx wrangler pages deploy frontend/dist --project-name chitragupta

# Option B: Unified Worker (Assets binding in wrangler.jsonc)
# Serves both API and React frontend on a single unified domain
```

---

## 🏆 HackFest 2026 Evaluation Checklist

- [x] **Full-Stack Integration:** React 18 studio seamlessly proxied to Cloudflare Workers backend.
- [x] **Multilingual Inclusivity:** Hindi, regional languages, and phonetic Hinglish translated via Gemini into structured forensic prompts.
- [x] **Visual Feature Recall:** 10-category catalogue aiding witnesses who cannot verbally articulate facial features.
- [x] **Non-Destructive Lineage:** Full revision memory; earlier sketches are never overwritten and can be restored at any point.
- [x] **Mask Inpainting & Compositing:** Pixel-level compositing strictly preserves unselected background pixels.
- [x] **Courtroom Chain of Custody:** Cryptographically sealed append-only audit trail preventing any evidence tampering.
- [x] **100% Automated Test Coverage:** 19/19 tests passing across all functional specifications.
- [x] **Zero Build Landing Portal:** Cinematic hero section with seamless 10-second video cross-fading and law enforcement login authentication.

---

*Developed with precision by **TheHourned Ones (T1-32)** for **HackFest 2026**.*
