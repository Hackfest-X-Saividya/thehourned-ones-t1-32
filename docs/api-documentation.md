# AI Crime Scene Sketch Generator — API Reference

## Table of Contents
1. [Overview](#overview)
2. [Base URL & Authentication](#authentication)
3. [Case Management Endpoints](#case-management)
4. [Image Generation Endpoints](#image-generation)
5. [Image Editing & Mask Inpainting](#image-editing)
6. [Image History & Versioning](#image-history)
7. [Audit Logging & Security](#audit-logging)
8. [Error Codes](#error-codes)

---

## 1. Overview
The **AI Crime Scene Sketch Generator API** powers interactive forensic witness interviews and suspect composite sketch generation. Built on **Cloudflare Workers**, **Cloudflare D1**, **Cloudflare R2**, and **Workers AI**, it provides:
- Multiple candidate sketch generation from witness descriptions.
- Region-specific facial editing using inpainting masks.
- Exact unselected pixel preservation via compositing.
- Complete revision memory tree (`parentImageId` lineage).
- Version comparison and restoration.
- Private R2 image streaming with case-level authorization.
- Immutable append-only audit trail.

---

## 2. Authentication
Requests authenticate via:
- `Authorization: Bearer <token_or_user_id>`
- Development headers: `x-user-id`, `x-user-role`, `x-user-email`

Standard Roles:
- `investigator`: Creates cases, generates candidate sketches, applies edits, restores versions for assigned cases.
- `lead_investigator`: Supervision access across cases, views case and global audit logs.
- `admin`: Full administrative access to all cases, settings, and logs.
- `analyst`: Read-only access to assigned forensic cases.

---

## 3. Case Management Endpoints

### `POST /api/cases`
Creates a new forensic case.
- **Request Body (JSON):**
  - `title` *(string, required)*: Case or suspect title (3-200 characters).
  - `caseNumber` *(string, optional)*: Official department case number (e.g. `CR-2026-0849`).
  - `description` *(string, optional)*: Initial witness statement or suspect description.
  - `incidentDate` *(string, optional)*: Incident timestamp.
  - `assignedInvestigatorId` *(string, optional)*: Assigned officer (defaults to authenticated user).
- **Response (201 Created):**
  ```json
  {
    "status": "success",
    "data": {
      "id": "case_9f81a7b2c3d4",
      "caseNumber": "CR-2026-0849",
      "title": "Downtown Jewelry Robbery Suspect",
      "description": "Witness describes adult male, 30s, sharp jawline",
      "status": "open",
      "assignedInvestigatorId": "usr_investigator_1",
      "createdAt": "2026-10-28T10:00:00Z",
      "updatedAt": "2026-10-28T10:00:00Z"
    }
  }
  ```

### `GET /api/cases`
Lists cases accessible to the authenticated investigator.
- **Query Parameters:**
  - `status` *(string, optional)*: `open`, `active_investigation`, `cold_case`, `closed`.
  - `search` *(string, optional)*: Search across title, case number, or description.
  - `limit` *(integer, default 20)*: Pagination limit.
  - `offset` *(integer, default 0)*: Pagination offset.

### `GET /api/cases/:caseId`
Retrieves case details and currently active sketch ID.
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "id": "case_sample_001",
      "caseNumber": "CR-2026-0042",
      "title": "Downtown Jewelry Robbery Suspect",
      "status": "active_investigation",
      "activeImageId": "img_7890abcd",
      "assignedInvestigatorId": "usr_investigator_1"
    }
  }
  ```

---

## 4. Image Generation Endpoints

### `POST /api/generations`
Accepts a witness description prompt, model selection, and candidate count. Generates images, stores them in R2, records metadata in D1, and returns displayable authenticated image endpoints.
- **Request Body (JSON):**
  - `caseId` *(string, required)*: The target case ID.
  - `prompt` *(string, required)*: Forensic facial description (e.g., "Caucasian male, mid 30s, sharp nose, hooded eyelids").
  - `negativePrompt` *(string, optional)*: Unwanted attributes (defaults to photographic/cartoon suppression).
  - `modelName` *(string, optional)*: Defaults to `@cf/stabilityai/stable-diffusion-xl-base-1.0`.
  - `numCandidates` *(integer, optional, 1-4, default 1)*: Number of candidate variations.
  - `parameters` *(object, optional)*: Optional inference settings (`seed`, `guidanceScale`, `numInferenceSteps`).
- **Response (201 Created):**
  ```json
  {
    "status": "success",
    "data": {
      "generationId": "gen_8192a837c4e1",
      "caseId": "case_sample_001",
      "prompt": "Caucasian male, mid 30s, sharp nose",
      "modelName": "@cf/stabilityai/stable-diffusion-xl-base-1.0",
      "totalCandidates": 3,
      "candidates": [
        {
          "id": "img_e1f2a3b4",
          "caseId": "case_sample_001",
          "generationId": "gen_8192a837c4e1",
          "version": 1,
          "isActive": false,
          "status": "candidate",
          "imageUrl": "/api/images/img_e1f2a3b4/file",
          "fileSizeBytes": 24890,
          "createdAt": "2026-10-28T10:05:00Z"
        }
      ]
    }
  }
  ```

---

## 5. Image Editing & Mask Inpainting

### `POST /api/images/:imageId/edits`
Applies targeted facial edits using inpainting. Unselected pixels outside the mask are strictly preserved through compositing. Creates a new version linked to the parent image without overwriting historical sketches.
- **Request Body (JSON):**
  - `prompt` *(string, required)*: Modification instruction (e.g. "Make jawline sharper and more angular").
  - `facialRegions` *(array of strings, required)*: Anatomical target regions (`["jawline", "chin"]`, `["eyes"]`, `["nose"]`, `["hair"]`, `["mouth"]`, etc.).
  - `mask` *(string, required)*: Edit mask as Base64 data URI or raw Base64 string.
  - `modelName` *(string, optional)*: Defaults to `@cf/runwayml/stable-diffusion-v1-5-inpainting`.
  - `parameters` *(object, optional)*: `preserveBackground: true`, `guidanceScale`, etc.
- **Response (201 Created):**
  ```json
  {
    "status": "success",
    "data": {
      "id": "img_v2_998877",
      "caseId": "case_sample_001",
      "parentImageId": "img_e1f2a3b4",
      "version": 2,
      "isActive": true,
      "status": "accepted",
      "prompt": "Caucasian male, mid 30s, sharp nose",
      "editInstruction": "Make jawline sharper and more angular",
      "facialRegions": ["jawline", "chin"],
      "imageUrl": "/api/images/img_v2_998877/file",
      "maskUrl": "/api/images/img_v2_998877/mask",
      "createdAt": "2026-10-28T10:10:00Z"
    }
  }
  ```

---

## 6. Image History & Versioning

### `GET /api/cases/:caseId/versions`
Retrieves chronological version history for a case, including parent-child revision lineages, prompt changes, and modified regions.

### `GET /api/images/:imageId`
Retrieves complete metadata for an image and populates its direct parent version details.

### `GET /api/images/:imageId/file`
Streams the private image binary from Cloudflare R2 after validating case authorization.
- Returns `image/png` with `ETag` and `Cache-Control: private`.

### `GET /api/images/:imageId/mask`
Streams the edit mask binary from Cloudflare R2.

### `POST /api/images/:imageId/select`
Designates a candidate sketch as the accepted primary composite sketch for the case.

### `POST /api/images/:imageId/restore`
Restores an earlier image version as the active case composite without deleting subsequent revisions. Logs `IMAGE_RESTORE` in the audit trail.

### `GET /api/images/:imageId/compare/:otherImageId`
Compares two sketch versions returning differential changes in prompt, edit instructions, and affected facial regions.

### `POST /api/images/:imageId/export`
Prepares a sketch for courtroom export or bulletin distribution, recording an immutable `IMAGE_EXPORT` audit log.

---

## 7. Audit Logging & Security

### `GET /api/cases/:caseId/audit`
Retrieves the complete audit trail for an authorized case.
- Logged fields:
  - `id`: Unique audit event ID (`aud_...`).
  - `caseId`: Case reference.
  - `requestId`: Traceable request identifier (`req_...`).
  - `userId`: Officer/Investigator ID.
  - `userEmail` & `userRole`.
  - `action`: `CASE_CREATE`, `CASE_VIEW`, `IMAGE_GENERATE`, `IMAGE_SELECT`, `IMAGE_EDIT`, `IMAGE_RESTORE`, `IMAGE_EXPORT`, `UNAUTHORIZED_ACCESS`, `AUDIT_VIEW`.
  - `resourceType` & `resourceId`.
  - `status`: `SUCCESS` or `FAILURE`.
  - `timestamp`: ISO timestamp.
  - `details`: Metadata context.

### Security Guarantees:
- **Immutability:** Audit records are append-only. Modification and deletion endpoints are strictly rejected with `405 Method Not Allowed`.
- **Private R2:** No public bucket URLs or credentials exposed.
- **Case Authorization:** Every access attempt is authorized; unauthorized requests are rejected with `403 Forbidden` and logged in the audit trail.
- **Rate Limiting:** Sliding window limiter protects against resource abuse.

---

## 8. Error Codes

| HTTP Status | Code | Description |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Request payload failed schema validation |
| `401` | `UNAUTHORIZED` | Missing or invalid authentication token |
| `403` | `FORBIDDEN` | User is not authorized to access this case or resource |
| `404` | `CASE_NOT_FOUND` / `IMAGE_NOT_FOUND` | Specified case or image ID does not exist |
| `405` | `METHOD_NOT_ALLOWED` | Attempted modification of immutable resources (audit logs) |
| `429` | `RATE_LIMIT_EXCEEDED` | Request frequency exceeds allowed threshold |
| `500` | `INTERNAL_SERVER_ERROR` | Unexpected server failure |

