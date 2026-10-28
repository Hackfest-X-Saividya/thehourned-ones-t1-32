# AI Crime Scene Sketch Generator — Backend API

Official HackFest 2026 repository for team **TheHourned Ones (T1-32)**.  
**Part 2 — Backend Development Assignment**

---

## 🏛️ Architecture Overview

The backend API connects the React frontend, forensic AI models, secure object storage, and relational database:

- **Runtime:** [Cloudflare Workers](https://workers.cloudflare.com/) (Serverless TypeScript powered by [Hono](https://hono.dev/))
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/) (Serverless SQLite for cases, image revisions, and immutable audit logs)
- **Object Storage:** [Cloudflare R2](https://developers.cloudflare.com/r2/) (Private zero-egress bucket for composite sketches and inpainting masks)
- **AI Models:** [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) (`@cf/stabilityai/stable-diffusion-xl-base-1.0` and `@cf/runwayml/stable-diffusion-v1-5-inpainting`) with external model adapters and local mock fallback

```
┌─────────────────┐       HTTPS / JSON       ┌───────────────────────────────┐
│  React Frontend │ ◄──────────────────────► │  Cloudflare Workers (Hono API)│
└─────────────────┘                          └──────────────┬────────────────┘
                                                            │
                     ┌──────────────────────────────────────┼──────────────────────────────────────┐
                     ▼                                      ▼                                      ▼
        ┌─────────────────────────┐            ┌─────────────────────────┐            ┌─────────────────────────┐
        │      Cloudflare D1      │            │      Cloudflare R2      │            │   Cloudflare Workers AI │
        │  • Cases & Access Grants│            │  • Sketches (PNG)       │            │  • Text-to-Sketch (SDXL)│
        │  • Revision Lineage     │            │  • Inpainting Masks     │            │  • Region Inpainting    │
        │  • Immutable Audit Logs │            │  • Private Streaming    │            │  • Pure TS Compositor   │
        └─────────────────────────┘            └─────────────────────────┘            └─────────────────────────┘
```

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- **Node.js:** v20+ or v24+
- **npm** or **pnpm**
- **Cloudflare Wrangler CLI:** v4.150+

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Automated Tests
All 6 test suites verify case management, candidate generation, mask editing with compositing, version restoration, R2 streaming, rate limiting, and immutable audit logging:
```bash
npm test
```

### 4. Run D1 Database Migrations Locally
```bash
# Apply initial schema (tables, foreign keys, indexes)
npm run d1:migrate:local

# Seed test investigators and sample case
npm run d1:seed:local
```

### 5. Start Local Worker Dev Server
```bash
npm run dev
```
The API server starts at `http://localhost:8787`.

---

## 🛡️ Key Features & Assignment Requirements

### Task 1 — API Endpoints
| Area | Method | Endpoint | Description |
|---|---|---|---|
| **Case Management** | `POST` | `/api/cases` | Create a forensic case |
| | `GET` | `/api/cases` | List cases accessible to current investigator |
| | `GET` | `/api/cases/:caseId` | Fetch case details and active sketch |
| **Image Generation** | `POST` | `/api/generations` | Generate candidate sketches (1-4) stored in R2 & D1 |
| **Image Editing** | `POST` | `/api/images/:imageId/edits` | Region-specific inpainting with mask & compositing |
| **Image History** | `GET` | `/api/cases/:caseId/versions` | Retrieve version lineage and revision tree |
| | `GET` | `/api/images/:imageId` | Fetch metadata and direct parent version |
| | `POST` | `/api/images/:imageId/select` | Select candidate as primary active sketch |
| | `POST` | `/api/images/:imageId/restore` | Restore previous revision as active sketch |
| | `GET` | `/api/images/:imageId/compare/:otherId` | Side-by-side differential comparison |
| | `POST` | `/api/images/:imageId/export` | Courtroom export with audit logging |
| **Image Streaming** | `GET` | `/api/images/:imageId/file` | Authenticated private R2 sketch streaming |
| | `GET` | `/api/images/:imageId/mask` | Authenticated private R2 mask streaming |
| **Audit Logs** | `GET` | `/api/cases/:caseId/audit` | Case-level audit history (append-only) |
| | `GET` | `/api/audit` | Global audit inspection (lead investigator/admin) |

### Task 2 — Image Revision Memory
- Every image revision records:
  - `id` and `parentImageId`
  - Original prompt and specific `editInstruction`
  - Targeted `facialRegions` (`jawline`, `eyes`, `nose`, `hair`, `mouth`, etc.) and `r2MaskKey`
  - Model name, inference settings, seed
  - R2 object key, creator, and timestamp
- **Non-destructive versioning:** Earlier sketches are never overwritten. Every edit increments version and creates a new node in the revision tree.
- Prior to editing, relevant revision context is retrieved and passed to the model adapter.

### Task 3 — Security & Authorization
- **Private R2 Storage:** Bucket has no public read access. Images and masks are served via authenticated Worker endpoints that verify case permissions.
- **Case-Level Access Control:** Only assigned investigators, lead investigators, admins, or users with explicit `case_access` grants may access images or case metadata.
- **Unauthorized Access Detection:** Failed attempts trigger `UNAUTHORIZED_ACCESS` audit records with user and IP context.
- **Immutable Audit Trail:** Audit logs are strictly append-only. Modification and deletion attempts are blocked with `405 Method Not Allowed`.
- **Rate Limiting:** Sliding-window rate limiter prevents API abuse.
- **Input Validation:** Strict Zod schema validation on all inputs, candidate counts, image formats, and base64 masks.

### Task 4 & 5 — AI Adapters & Compositing
- **Workers AI Adapter:** Direct integration with Cloudflare Workers AI SDXL and SD Inpainting.
- **External AI Adapter:** Compatible with OpenAI DALL-E and standard external REST models.
- **Mock AI Adapter:** Pure TypeScript forensic pencil sketch generator for local development and offline environments without Cloudflare credentials.
- **Pixel Compositing:** Unselected pixels are strictly preserved through mask compositing, eliminating unintentional background shifts from inpainting models.

---

## 📂 Repository Structure

```
.
├── src/
│   ├── index.ts                      # Cloudflare Worker entrypoint & Hono router
│   ├── types/
│   │   └── index.ts                  # Type definitions & Cloudflare Env bindings
│   ├── routes/
│   │   ├── cases.ts                  # Case management & access endpoints
│   │   ├── generations.ts            # Candidate sketch generation endpoints
│   │   ├── images.ts                 # Region edits, streaming, restoration, diff
│   │   └── audit.ts                  # Audit trail retrieval & protection
│   ├── services/
│   │   ├── case.service.ts           # Case CRUD & authorization engine
│   │   ├── image.service.ts          # Revision orchestrator & selection
│   │   ├── audit.service.ts          # Immutable D1 audit log engine
│   │   ├── storage/
│   │   │   └── r2.service.ts         # Cloudflare R2 bucket integration
│   │   └── ai/
│   │       ├── adapter.interface.ts  # Unified AI provider interface
│   │       ├── ai.factory.ts         # Adapter selector
│   │       ├── workers-ai.adapter.ts # Cloudflare Workers AI SDXL / Inpainting
│   │       ├── external-ai.adapter.ts# OpenAI / external model adapter
│   │       ├── mock-ai.adapter.ts    # Pure TS forensic sketch generator
│   │       └── compositor.ts         # Mask compositing & unselected pixel preservation
│   ├── middleware/
│   │   ├── auth.ts                   # Bearer token & test user middleware
│   │   ├── error-handler.ts          # Standardized error envelope
│   │   └── rate-limiter.ts           # Sliding window rate limiter
│   └── utils/
│       ├── crypto.ts                 # Cryptographic IDs and SHA-256 digests
│       └── validation.ts             # Zod validation schemas
├── migrations/
│   ├── 0001_initial_schema.sql       # D1 database schema
│   └── 0002_seed_data.sql            # Seed test investigators & sample case
├── tests/
│   ├── cases.test.ts                 # Case CRUD & authorization tests
│   ├── generations.test.ts           # Candidate generation & R2 upload tests
│   ├── edits.test.ts                 # Region mask inpainting & revision tests
│   ├── versions-restore.test.ts      # Selection, restore & comparison tests
│   ├── audit.test.ts                 # Audit trail & immutability tests
│   └── security.test.ts              # Rate limiting & private R2 security tests
├── docs/
│   ├── openapi.yaml                  # OpenAPI 3.1 specification
│   ├── api-documentation.md          # Complete API reference
│   └── integration-contract.md       # Frontend integration guide
├── examples/
│   ├── api-requests.http             # VS Code / JetBrains HTTP client requests
│   └── curl-examples.sh              # Runnable cURL workflow script
├── wrangler.jsonc                    # Cloudflare Workers configuration
├── package.json                      # Project dependencies & scripts
└── tsconfig.json                     # TypeScript compiler configuration
```

---

## ☁️ Cloudflare Deployment

### 1. Create D1 Database and R2 Bucket on Cloudflare
```bash
# Create D1 database
npx wrangler d1 create crime-sketch-db

# Create R2 bucket
npx wrangler r2 bucket create crime-scene-sketches
```

### 2. Update `wrangler.jsonc` with your D1 `database_id`
Replace `00000000-0000-0000-0000-000000000000` with the ID output by the command above.

### 3. Run Remote Migrations
```bash
npm run d1:migrate:remote
```

### 4. Deploy to Cloudflare Workers
```bash
npm run deploy
```

---

## 🧪 Verification & Definition of Done

To verify all requirements are satisfied:
```bash
npm run typecheck
npm test
```
All 19 test cases pass, confirming:
1. Submitting a prompt generates candidate images saved to R2 and D1.
2. Image metadata and parent linkage are correctly retrieved.
3. Editing through a mask preserves unselected pixels and creates a new linked revision.
4. Earlier versions can be restored as active sketches.
5. Corresponding audit events are recorded immutably.
