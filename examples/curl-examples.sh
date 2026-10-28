#!/usr/bin/env bash
# AI Crime Scene Sketch Generator - Example cURL Commands

BASE_URL="http://localhost:8787"
USER_ID="usr_investigator_1"

echo "=== 1. Health Check ==="
curl -s -X GET "${BASE_URL}/api/health" | jq .

echo -e "\n=== 2. Create Case ==="
CREATE_CASE_RES=$(curl -s -X POST "${BASE_URL}/api/cases" \
  -H "Content-Type: application/json" \
  -H "x-user-id: ${USER_ID}" \
  -d '{
    "title": "East District Burglary",
    "caseNumber": "CR-2026-9901",
    "description": "Suspect seen fleeing crime scene at midnight, male mid-20s, beanie hat, pointed nose",
    "incidentDate": "2026-10-28T00:00:00Z"
  }')
echo "${CREATE_CASE_RES}" | jq .
CASE_ID=$(echo "${CREATE_CASE_RES}" | jq -r '.data.id')

echo -e "\n=== 3. Generate Candidate Sketches ==="
GEN_RES=$(curl -s -X POST "${BASE_URL}/api/generations" \
  -H "Content-Type: application/json" \
  -H "x-user-id: ${USER_ID}" \
  -d "{
    \"caseId\": \"${CASE_ID}\",
    \"prompt\": \"Pencil forensic sketch of male in his 20s, sharp nose, hooded jacket\",
    \"numCandidates\": 2
  }")
echo "${GEN_RES}" | jq .
IMG_ID=$(echo "${GEN_RES}" | jq -r '.data.candidates[0].id')

echo -e "\n=== 4. Edit Sketch Facial Region (Jawline) ==="
# 1x1 transparent/white pixel mask
MASK_B64="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
EDIT_RES=$(curl -s -X POST "${BASE_URL}/api/images/${IMG_ID}/edits" \
  -H "Content-Type: application/json" \
  -H "x-user-id: ${USER_ID}" \
  -d "{
    \"prompt\": \"Widen jawline and add short stubble\",
    \"facialRegions\": [\"jawline\", \"facial_hair\"],
    \"mask\": \"${MASK_B64}\"
  }")
echo "${EDIT_RES}" | jq .
EDIT_IMG_ID=$(echo "${EDIT_RES}" | jq -r '.data.id')

echo -e "\n=== 5. Fetch Revision Lineage ==="
curl -s -X GET "${BASE_URL}/api/cases/${CASE_ID}/versions" \
  -H "x-user-id: ${USER_ID}" | jq .

echo -e "\n=== 6. Restore Earlier Version ==="
curl -s -X POST "${BASE_URL}/api/images/${IMG_ID}/restore" \
  -H "x-user-id: ${USER_ID}" | jq .

echo -e "\n=== 7. Fetch Case Audit Trail ==="
curl -s -X GET "${BASE_URL}/api/cases/${CASE_ID}/audit" \
  -H "x-user-id: ${USER_ID}" | jq .

