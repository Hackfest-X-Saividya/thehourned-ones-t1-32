# Frontend & Backend Integration Contract
**Project:** AI Crime Scene Sketch Generator  
**Backend:** Cloudflare Workers + D1 + R2 + Workers AI  
**Frontend:** React / TypeScript / Vite  

---

## 1. Authentication & Headers

Every request from the React frontend must include one of the following identification methods:

### Recommended: Bearer Token
```http
Authorization: Bearer usr_investigator_1
```
Or with custom JWT tokens.

### Fast Development / Prototyping Headers
```http
x-user-id: usr_investigator_1
x-user-role: investigator
x-user-email: sconnor@forensics.pd.gov
```

### Pre-configured Test Users
| User ID | Name | Role | Access Level |
|---|---|---|---|
| `usr_investigator_1` | Detective Sarah Connor | `investigator` | Assigned investigator for sample case `case_sample_001` |
| `usr_lead_1` | Inspector James Gordon | `lead_investigator` | Full access to all cases and global audit logs |
| `usr_analyst_1` | Analyst Chloe Decker | `analyst` | Read-only access to granted cases |
| `usr_admin_1` | Captain Raymond Holt | `admin` | Full administrative access |

---

## 2. Standard Response Envelope

All API endpoints return a uniform JSON envelope:

### Success Response
```json
{
  "status": "success",
  "data": { ... },
  "pagination": {
    "total": 42,
    "limit": 20,
    "offset": 0
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Human readable error description",
    "requestId": "req_84f913d80a91",
    "details": [
      {
        "field": "prompt",
        "message": "String must contain at least 3 character(s)"
      }
    ]
  }
}
```

---

## 3. Image Access Security
- Internal R2 credentials and unrestricted bucket URLs are **never** exposed to the client.
- Images are retrieved via authenticated proxy endpoints:
  - Image Binary: `GET /api/images/:imageId/file`
  - Edit Mask Binary: `GET /api/images/:imageId/mask`
- The backend checks case-level authorization before serving the binary data.
- Standard caching (`ETag` and `Cache-Control: private, max-age=3600`) is enabled.

---

## 4. Key Workflows & Request Payloads

### A. Case Creation
`POST /api/cases`
```json
{
  "title": "East Bank Armed Robbery Suspect",
  "caseNumber": "CR-2026-0491",
  "description": "Witness saw male, mid 30s, scar across left cheek, baseball cap",
  "incidentDate": "2026-10-28T09:30:00Z"
}
```

### B. Generate Candidate Sketches
`POST /api/generations`
```json
{
  "caseId": "case_sample_001",
  "prompt": "Forensic sketch of male suspect in mid-30s, sharp angular jawline, narrow eyes, hooded jacket",
  "negativePrompt": "photograph, cartoon, anime, 3d render",
  "modelName": "@cf/stabilityai/stable-diffusion-xl-base-1.0",
  "numCandidates": 3,
  "parameters": {
    "guidanceScale": 7.5,
    "numInferenceSteps": 30
  }
}
```
**Response:**
```json
{
  "status": "success",
  "data": {
    "generationId": "gen_8192a837c4e1",
    "caseId": "case_sample_001",
    "totalCandidates": 3,
    "candidates": [
      {
        "id": "img_f901a2b3",
        "version": 1,
        "status": "candidate",
        "imageUrl": "/api/images/img_f901a2b3/file"
      }
    ]
  }
}
```

### C. Select Active Candidate
`POST /api/images/:imageId/select`
Sets the selected candidate as the active sketch for the case.

### D. Region-Specific Inpainting Edit
`POST /api/images/:imageId/edits`
- Mask should be sent as a Base64 data URL (`data:image/png;base64,...`) or raw Base64.
- `facialRegions`: array of targeted anatomical regions (`"eyes"`, `"jawline"`, `"nose"`, `"mouth"`, `"hair"`, `"cheeks"`, `"eyebrows"`, `"chin"`, `"facial_hair"`, etc.).
- Compositor preserves all unselected pixels outside the mask.

```json
{
  "prompt": "Make the jawline much sharper, more angular and square",
  "facialRegions": ["jawline", "chin"],
  "mask": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "modelName": "@cf/runwayml/stable-diffusion-v1-5-inpainting",
  "parameters": {
    "preserveBackground": true
  }
}
```

### E. Revision History Tree
`GET /api/cases/:caseId/versions`
Returns the chronological and parent-child linked lineage of all revisions, including:
- Version numbers (`1`, `2`, `3`...)
- Parent image references (`parentImageId`)
- Facial regions modified
- Edit instructions
- Timestamps and investigator ID

### F. Restoring an Earlier Version
`POST /api/images/:imageId/restore`
If a witness prefers an earlier revision, restoring it marks it as active without losing subsequent edits.

### G. Audit Trail
`GET /api/cases/:caseId/audit`
Returns immutable audit logs tracking case access, generations, selections, edits, restorations, and exports.

